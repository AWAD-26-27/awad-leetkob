import { createRequire } from 'node:module';
import treeSitter from '@vscode/tree-sitter-wasm';

const require = createRequire(import.meta.url);
await treeSitter.Parser.init();
const parser = new treeSitter.Parser();
parser.setLanguage(
  await treeSitter.Language.load(
    require.resolve('@vscode/tree-sitter-wasm/wasm/tree-sitter-cpp.wasm'),
  ),
);

function callName(node) {
  if (!node) return '';
  if (node.type === 'qualified_identifier') {
    const scope = node.childForFieldName('scope');
    const name = callName(node.childForFieldName('name'));
    return scope ? `${scope.text}::${name}` : name;
  }
  if (node.type === 'template_function') return node.childForFieldName('name').text;
  return node.text;
}

export async function evaluateSubmission({ constraints, code, options = {} }) {
  const lines = code.split(/\r\n|\n|\r/);
  const tree = parser.parse(lines.join('\n'));
  try {
    const calls = tree.rootNode.descendantsOfType('call_expression');
    const verdicts = constraints.map(({ id, text }) => {
      const names = [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
      if (/^Do not call\b/i.test(text.trim()) && names.length) {
        const call = calls.find((node) =>
          names.includes(callName(node.childForFieldName('function'))),
        );
        const line = call ? call.startPosition.row + 1 : null;
        return {
          constraint: id,
          verdict: line ? 'violation' : 'pass',
          evidence: line ? [{ line, text: lines[line - 1] }] : [],
          source: 'hard_rule',
        };
      }
      return {
        constraint: id,
        verdict: 'unsure',
        evidence: [],
        source:
          options.modelOff || process.env.MODEL_OFF === '1' ? 'model_off' : 'guardrail_fallback',
      };
    });
    return { verdicts, callLogs: [] };
  } finally {
    tree.delete();
  }
}
