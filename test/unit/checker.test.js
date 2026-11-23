import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { evaluateSubmission } from '../../src/checker/index.js';

const fixture = JSON.parse(
  readFileSync(new URL('../fixtures/pa3-checker-handoff.json', import.meta.url), 'utf8'),
);

test('the offline worker handoff matches the shared C1/C2 fixture', async () => {
  const actual = await evaluateSubmission({ ...fixture.input, options: { modelOff: true } });
  assert.deepEqual(actual, fixture.expected);
});

test('comments and a local min function do not count as calls to std::min', async () => {
  const actual = await evaluateSubmission({
    ...fixture.input,
    code: 'int min(int x, int y) { return x < y ? x : y; }\nint main() { return min(0, 1); /* std::min(0, 1) */ }',
    options: { modelOff: true },
  });
  assert.deepEqual(actual.verdicts[0], {
    constraint: 'C1',
    verdict: 'pass',
    evidence: [],
    source: 'hard_rule',
  });
});
