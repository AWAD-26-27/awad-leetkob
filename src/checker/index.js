import { cppRules, declaredNames, parseCpp } from './cpp.js';
import { createGeminiClient, judgeSemantic, sanitizeCode } from './model.js';

export async function evaluateSubmission({ statement, constraints, code, options = {} }) {
  const originalLines = code.split(/\r\n|\n|\r/);
  const normalized = originalLines.join('\n');
  const modelOff = options.modelOff || process.env.MODEL_OFF === '1';
  const callLogs = [];
  const tree = parseCpp(normalized);
  let verdicts;
  let privateNames;
  try {
    const findBan = cppRules(tree.rootNode);
    verdicts = constraints.map(({ id, text }) => {
      const ban = /^(Do not use|Do not call)\b/i.exec(text.trim());
      const names = new Set([...text.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim()));
      if (ban && names.size) {
        const row = findBan(names, ban[1].toLowerCase() === 'do not call');
        return {
          constraint: id,
          verdict: row === undefined ? 'pass' : 'violation',
          evidence: row === undefined ? [] : [{ line: row + 1, text: originalLines[row] }],
          source: 'hard_rule',
        };
      }
      return {
        constraint: id,
        verdict: 'unsure',
        evidence: [],
        source: modelOff ? 'model_off' : 'guardrail_fallback',
      };
    });
    if (!modelOff && verdicts.some(({ source }) => source !== 'hard_rule')) {
      privateNames = declaredNames(tree.rootNode);
    }
  } finally {
    tree.delete();
  }

  if (modelOff || verdicts.every(({ source }) => source === 'hard_rule')) {
    return { verdicts, callLogs };
  }
  const client = options.modelClient ?? createGeminiClient();
  if (!client) return { verdicts, callLogs };

  const sanitizedLines = sanitizeCode(normalized, privateNames).split('\n');
  for (const [index, constraint] of constraints.entries()) {
    if (verdicts[index].source === 'hard_rule') continue;
    if (options.reserveModelCall) {
      try {
        if (!(await options.reserveModelCall({ constraintId: constraint.id }))) continue;
      } catch {
        continue;
      }
    }
    const result = await judgeSemantic({
      statement,
      constraint,
      sanitizedLines,
      originalLines,
      client,
      options,
    });
    callLogs.push(result.log);
    if (result.verdict) verdicts[index] = result.verdict;
  }
  return { verdicts, callLogs };
}
