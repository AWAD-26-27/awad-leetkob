import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { evaluateSubmission } from './index.js';

const [dataset, predictions, ...extra] = process.argv.slice(2);
const logFile = process.env.CHECKER_CALL_LOG;
if (
  !dataset ||
  !predictions ||
  extra.length ||
  (logFile && resolve(logFile) === resolve(predictions))
) {
  console.error('Usage: node src/checker/cli.js <dataset_dir> <predictions.jsonl>');
  process.exitCode = 2;
} else {
  await run(dataset, predictions, logFile);
}

function jsonl(rows) {
  return rows.map((row) => `${JSON.stringify(row)}\n`).join('');
}

async function run(dataset, predictions, logFile) {
  const rows = [];
  const logs = [];
  const maxCalls = Number(process.env.MAX_MODEL_CALLS_PER_LAB);
  const interval = Number(process.env.CHECKER_MODEL_INTERVAL_MS);
  const capturePrompt = Boolean(logFile && process.env.CHECKER_CAPTURE_PROMPT === '1');
  let nextCallAt = 0;
  const problems = (await readdir(join(dataset, 'problems'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const problem of problems) {
    const lab = join(dataset, 'problems', problem);
    const statement = await readFile(join(lab, 'statement.md'), 'utf8');
    const constraints = JSON.parse(await readFile(join(lab, 'constraints.json'), 'utf8'));
    const solutions = join(dataset, 'solutions', problem);
    const files = (await readdir(solutions)).filter((file) => file.endsWith('.cpp')).sort();
    let reserved = 0;
    const options = {
      capturePrompt,
      async reserveModelCall() {
        if (!Number.isSafeInteger(maxCalls) || reserved >= maxCalls) return false;
        reserved++;
        if (Number.isSafeInteger(interval) && interval > 0) {
          const delay = nextCallAt - Date.now();
          if (delay > 0) await wait(delay);
          nextCallAt = Date.now() + interval;
        }
        return true;
      },
    };
    for (const file of files) {
      const solution = `${problem}/${file.slice(0, -4)}`;
      const code = await readFile(join(solutions, file), 'utf8');
      const { verdicts, callLogs } = await evaluateSubmission({
        statement,
        constraints,
        code,
        options,
      });
      for (const { constraint, verdict, evidence } of verdicts) {
        rows.push({ solution, constraint, verdict, evidence });
      }
      if (logFile) logs.push(...callLogs.map((log) => ({ solution, ...log })));
    }
  }
  await writeFile(predictions, jsonl(rows), 'utf8');
  if (logFile) await writeFile(logFile, jsonl(logs), 'utf8');
}
