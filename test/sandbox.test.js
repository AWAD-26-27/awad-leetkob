import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { setTimeout as wait } from 'node:timers/promises';

let dockerAvailable = false;
try {
  execFileSync('docker', ['info'], { stdio: 'ignore' });
  dockerAvailable = true;
} catch {
  dockerAvailable = false;
}

const directory = mkdtempSync(join(tmpdir(), 'leetkob-sandbox-tests-'));
const canary = join(directory, 'sandbox-canary.h');
writeFileSync(canary, '// synthetic canary');
writeFileSync(
  join(directory, 'config.json'),
  JSON.stringify({ proxies: { default: { httpProxy: 'http://synthetic@proxy.invalid:9000' } } }),
);
process.env.DOCKER_CONFIG = directory;
process.env.GEMINI_API_KEY = 'synthetic-sandbox-canary';
after(() => {
  try {
    rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    // Windows file safety
  }
});

const { runSandbox } = await import('../src/sandbox.js');
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8' }).trim();
const sandboxIds = () => {
  if (!dockerAvailable) return [];
  return docker('ps', '-aq', '--filter', 'label=app=leetkob-cpp-sandbox')
    .split('\n')
    .filter(Boolean);
};

const dockerTest = (name, fn) =>
  test(name, { skip: !dockerAvailable && 'Docker daemon is not running' }, fn);

function runFixture(name, { limits, prefix = '', expectedOutput = '' } = {}) {
  const source = readFileSync(new URL(`./fixtures/sandbox/${name}.cpp`, import.meta.url), 'utf8');
  return runSandbox({ code: prefix + source, testCases: [{ input: '', expectedOutput }], limits });
}

async function observeSandbox(before) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const id = sandboxIds().find((candidate) => !before.has(candidate));
    if (id) return id;
    await wait(50);
  }
  throw new Error('The sandbox container did not appear');
}

dockerTest('01 no network namespace interfaces other than loopback', async () => {
  assert.equal((await runFixture('01-no-network')).verdict, 'Accepted');
});

dockerTest('02 CPU time stops a finite CPU workload before the wall deadline', async () => {
  const result = await runFixture('02-cpu-limit', { limits: { cpuTimeSeconds: 1 } });
  assert.equal(result.verdict, 'TLE');
  assert.equal(result.limit, undefined);
  assert.match(result.diagnostic, /started/);
});

dockerTest('03 wall time removes the entire running container', async () => {
  const before = new Set(sandboxIds());
  const [result, id] = await Promise.all([
    runFixture('03-wall-limit', { limits: { wallTimeMs: 3000 } }),
    observeSandbox(before),
  ]);
  assert.equal(result.verdict, 'TLE');
  assert.equal(result.limit, 'wall');
  assert.match(result.diagnostic, /started/);
  assert.ok(!sandboxIds().includes(id));
});

dockerTest(
  '04 memory is limited, swap is disabled, and the fixture reads its allocation',
  async () => {
    const result = await runFixture('04-memory-limit', { expectedOutput: String(270 * 1024 ** 2) });
    assert.equal(result.verdict, 'MLE');
  },
);

dockerTest('05 the kernel limits the sandbox to 64 processes', async () => {
  assert.equal((await runFixture('05-process-limit')).verdict, 'Accepted');
});

dockerTest('06 stdout and stderr share the same byte limit', async () => {
  const result = await runFixture('06-output-limit', { limits: { maxOutputBytes: 2048 } });
  assert.equal(result.verdict, 'OLE');
  assert.equal(result.limit, 'output');
});

dockerTest('07 the C++ program runs as non-root (UID 10001)', async () => {
  assert.equal((await runFixture('07-non-root')).verdict, 'Accepted');
});

dockerTest('08 sandbox has no host bind mounts and no Docker socket', async () => {
  const before = new Set(sandboxIds());
  const result = runFixture('08-no-host-mounts');
  const checkMounts = async () => {
    const id = await observeSandbox(before);
    const [mounts, binds] = JSON.parse(
      docker('inspect', '--format', '[{{json .Mounts}},{{json .HostConfig.Binds}}]', id),
    );
    assert.deepEqual(mounts, []);
    assert.deepEqual(binds ?? [], []);
  };
  const [outcome] = await Promise.all([result, checkMounts()]);
  assert.equal(outcome.verdict, 'Accepted');
});

dockerTest('09 the compiler and program cannot see host canaries', async () => {
  const before = new Set(sandboxIds());
  const result = runFixture('09-no-secrets', {
    prefix: `#define LEETKOB_TEST_CANARY ${JSON.stringify(canary)}\n`,
  });
  const checkConfig = async () => {
    const id = await observeSandbox(before);
    const env = JSON.parse(docker('inspect', '--format', '{{json .Config.Env}}', id));
    assert.ok(!env.some((value) => value.startsWith('GEMINI_API_KEY=')));
    assert.ok(env.includes('HTTP_PROXY='));
    assert.equal(docker('inspect', '--format', '{{.HostConfig.Privileged}}', id), 'false');
  };
  const [outcome] = await Promise.all([result, checkConfig()]);
  assert.equal(outcome.verdict, 'Accepted');
});
