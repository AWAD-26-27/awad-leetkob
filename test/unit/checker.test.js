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

test('ban lists recognize scoped names, imports, macro uses and C++ statements', async () => {
  const constraints = [
    { id: 'C1', text: 'Do not call `std::min`.' },
    { id: 'C2', text: 'Do not use `std::vector`.' },
    { id: 'C3', text: 'Do not use `for` or `goto`.' },
  ];
  const lines = [
    'namespace lib = std;',
    'using std::vector;',
    '#define EACH(x) for (int i : (x))',
    'int main() {',
    '  vector<int> a{1,2};',
    '  EACH(a) { lib /* C++; keep spaces */ :: min(0, 1); }  ',
    '}',
  ];
  const { verdicts, callLogs } = await evaluateSubmission({
    constraints,
    code: lines.join('\r\n'),
    options: { modelOff: true },
  });
  assert.deepEqual(
    verdicts,
    [6, 5, 6].map((line, index) => ({
      constraint: constraints[index].id,
      verdict: 'violation',
      evidence: [{ line, text: lines[line - 1] }],
      source: 'hard_rule',
    })),
  );
  assert.deepEqual(callLogs, []);
});

test('unused macros, comments, raw strings and shadowed imports are traps', async () => {
  const { verdicts } = await evaluateSubmission({
    constraints: [{ id: 'C1', text: 'Do not call `std::min`.' }],
    code: [
      '#define UNUSED(x) std::min(x, 0)',
      'using namespace std;',
      'int min(int a, int b) { return a < b ? a : b; }',
      'int main() {',
      '  const char* note = R"here(std::min(0, 1);)here";',
      '#if 0',
      '  std::min(0, 1);',
      '#endif',
      '  return min(0, 1); // std::min(0, 1)',
      '}',
    ].join('\n'),
    options: { modelOff: true },
  });
  assert.deepEqual(verdicts, [
    { constraint: 'C1', verdict: 'pass', evidence: [], source: 'hard_rule' },
  ]);
});
