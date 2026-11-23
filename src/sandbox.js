import { Buffer } from 'node:buffer';
import { execFile, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { clearTimeout } from 'node:timers';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const DEFAULT_IMAGE = 'leetkob-cpp-sandbox:latest';
const COMPILE_FAILED = 42;
const COMPILED = 1;
const DEFAULT_LIMITS = {
  cpuTimeSeconds: 3,
  wallTimeMs: 8000,
  maxOutputBytes: 64 * 1024,
};
const EMPTY_PROXY_ENV = ['HTTP_PROXY', 'HTTPS_PROXY', 'FTP_PROXY', 'NO_PROXY', 'ALL_PROXY'].flatMap(
  (name) => [`--env=${name}=`, `--env=${name.toLowerCase()}=`],
);

// Only Docker client configuration stays in the host process environment.
const dockerEnv = Object.fromEntries(
  [
    'PATH',
    'HOME',
    'DOCKER_HOST',
    'DOCKER_CONTEXT',
    'DOCKER_CONFIG',
    'DOCKER_TLS_VERIFY',
    'DOCKER_CERT_PATH',
    'SSH_AUTH_SOCK',
    'XDG_RUNTIME_DIR',
  ]
    .filter((name) => process.env[name] !== undefined)
    .map((name) => [name, process.env[name]]),
);

async function docker(args) {
  const { stdout } = await execFileAsync('docker', args, {
    env: dockerEnv,
    timeout: 5000,
    maxBuffer: 64 * 1024,
  });
  return stdout.trim();
}

const isMissing = (error) => /No such (container|object)/i.test(error.stderr ?? '');

async function removeContainer(name) {
  try {
    await docker(['rm', '-f', name]);
  } catch (error) {
    if (!isMissing(error)) throw error;
  }
}

async function terminateContainer(name) {
  try {
    await docker(['kill', name]);
  } catch (error) {
    if (!isMissing(error) && !/is not running/i.test(error.stderr ?? '')) throw error;
  } finally {
    await removeContainer(name);
  }
}

function containerArgs(name, sourceBytes, limits) {
  const image = process.env.SANDBOX_IMAGE || DEFAULT_IMAGE;
  if (image.startsWith('-')) throw new TypeError('Invalid SANDBOX_IMAGE');
  const { cpuTimeSeconds, wallTimeMs } = limits;
  return [
    'create',
    '--name',
    name,
    '--label',
    'app=leetkob-cpp-sandbox',
    '--pull=never',
    '--interactive',
    '--network=none',
    '--ipc=none',
    '--user=10001:10001',
    '--workdir=/work',
    '--read-only',
    '--tmpfs=/work:rw,exec,nosuid,nodev,size=64m,uid=10001,gid=10001,mode=0700',
    '--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=16m,uid=10001,gid=10001,mode=0700',
    '--memory=256m',
    '--memory-swap=256m',
    '--pids-limit=64',
    '--cpus=1',
    `--ulimit=cpu=${cpuTimeSeconds}:${cpuTimeSeconds + 1}`,
    '--ulimit=core=0:0',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--log-driver=none',
    // Docker can otherwise forward proxies from its client config, including credentials.
    ...EMPTY_PROXY_ENV,
    image,
    // The container also has a watchdog if the host worker disappears.
    `${(wallTimeMs + 2000) / 1000}s`,
    '/usr/local/bin/leetkob-run',
    String(sourceBytes),
  ];
}

function attach(name, payload, { wallTimeMs, maxOutputBytes }) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', ['start', '--attach', '--interactive', name], {
      env: dockerEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stdout = [];
    const stderr = [];
    let compiled = false;
    let readStdout = false;
    let capturedBytes = 0;
    let stop;

    const terminate = (verdict, error) => {
      if (stop) return;
      stop = { verdict, error };
      stop.cleanup = terminateContainer(name)
        .then(
          () => null,
          (cleanupError) => cleanupError,
        )
        .finally(() => child.kill());
    };
    const timer = setTimeout(() => terminate('TLE'), wallTimeMs);

    const capture = (chunks, chunk) => {
      if (stop) return;
      const remaining = maxOutputBytes - capturedBytes;
      chunks.push(chunk.subarray(0, remaining));
      capturedBytes += Math.min(chunk.length, remaining);
      if (chunk.length > remaining) terminate('OLE');
    };
    child.stdout.on('data', (chunk) => {
      if (!readStdout) {
        readStdout = true;
        compiled = chunk[0] === COMPILED;
        if (compiled) chunk = chunk.subarray(1);
      }
      capture(stdout, chunk);
    });
    child.stderr.on('data', (chunk) => capture(stderr, chunk));
    child.stdin.on('error', (error) => {
      if (error.code !== 'EPIPE' && error.code !== 'ERR_STREAM_DESTROYED') {
        terminate(null, error);
      }
    });
    child.on('error', (error) => terminate(null, error));
    child.on('close', async () => {
      clearTimeout(timer);
      const cleanupError = await stop?.cleanup;
      if (cleanupError || stop?.error) {
        reject(cleanupError || stop.error);
        return;
      }
      resolve({
        stopped: stop?.verdict,
        compiled,
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr),
      });
    });
    child.stdin.end(payload);
  });
}

function verdictFor(state, compiled, stdout, expectedOutput) {
  if (state.OOMKilled) return 'MLE';
  if (state.ExitCode === 152 || state.ExitCode === 137) return 'TLE';
  if (!compiled) {
    if (state.ExitCode === COMPILE_FAILED) return 'CE';
    throw new Error('Sandbox image did not reach the execution phase');
  }
  if (state.ExitCode !== 0) return 'RE';
  const normalize = (text) => text.replaceAll('\r\n', '\n').trimEnd();
  return normalize(stdout.toString('utf8')) === normalize(expectedOutput) ? 'Accepted' : 'WA';
}

async function runCase(source, { input, expectedOutput }, limits) {
  const name = `leetkob-cpp-${randomUUID()}`;
  const args = containerArgs(name, source.length, limits);
  let removed = false;
  try {
    await docker(args);
    const payload = Buffer.concat([source, Buffer.from(input)]);
    const { stopped, compiled, stdout, stderr } = await attach(name, payload, limits);
    if (stopped) {
      removed = true;
      return {
        verdict: stopped,
        limit: stopped === 'TLE' ? 'wall' : 'output',
        diagnostic: stderr.toString('utf8'),
      };
    }

    const state = JSON.parse(await docker(['inspect', '--format', '{{json .State}}', name]));
    if (state.Status !== 'exited' || state.Error)
      throw new Error('Sandbox container failed to run');
    return {
      verdict: verdictFor(state, compiled, stdout, expectedOutput),
      diagnostic: stderr.toString('utf8'),
    };
  } finally {
    if (!removed) await removeContainer(name);
  }
}

// Each test gets a fresh compile/run container with only its own input.
// Docker failures reject so the worker can retry the job separately from judge verdicts.
export async function runSandbox({ code, testCases, limits: overrides = {} }) {
  if (
    typeof code !== 'string' ||
    !Array.isArray(testCases) ||
    testCases.length === 0 ||
    testCases.some(
      (test) => typeof test?.input !== 'string' || typeof test.expectedOutput !== 'string',
    )
  ) {
    throw new TypeError(
      'Expected C++ code and at least one test with string input and expectedOutput',
    );
  }
  const limits = {};
  for (const [key, maximum] of Object.entries(DEFAULT_LIMITS)) {
    const value = overrides[key] ?? maximum;
    if (!Number.isInteger(value) || value < 1 || value > maximum) {
      throw new RangeError(`Invalid sandbox limit: ${key}`);
    }
    limits[key] = value;
  }

  const { MemoryLimit, SwapLimit, PidsLimit, CpuCfsQuota } = JSON.parse(
    await docker(['info', '--format', '{{json .}}']),
  );
  if (!MemoryLimit || !SwapLimit || !PidsLimit || !CpuCfsQuota) {
    throw new Error('Docker must support memory, swap, process and CPU limits');
  }

  const source = Buffer.from(code);
  for (const [index, test] of testCases.entries()) {
    const result = await runCase(source, test, limits);
    if (result.verdict !== 'Accepted') {
      return { ...result, testIndex: index + 1 };
    }
  }
  return { verdict: 'Accepted' };
}
