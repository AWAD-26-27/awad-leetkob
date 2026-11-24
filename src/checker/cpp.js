import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let treeSitter = null;
let parser = null;

try {
  treeSitter = (await import('@vscode/tree-sitter-wasm')).default;
  if (treeSitter) {
    await treeSitter.Parser.init();
    parser = new treeSitter.Parser();
    parser.setLanguage(
      await treeSitter.Language.load(
        require.resolve('@vscode/tree-sitter-wasm/wasm/tree-sitter-cpp.wasm'),
      ),
    );
  }
} catch {
  // Tree-sitter WASM is not installed in local environment; fallback parser will be used
}

function createFallbackTree(source) {
  return {
    rootNode: {
      __fallback: true,
      source,
      descendantsOfType() {
        return [];
      },
    },
    delete() {},
  };
}

export function parseCpp(source) {
  if (parser) {
    return parser.parse(source);
  }
  return createFallbackTree(source);
}

const loopNames = {
  for_statement: 'for',
  for_range_loop: 'for',
  while_statement: 'while',
  do_statement: 'do',
  goto_statement: 'goto',
};

const scopes = new Set(['translation_unit', 'declaration_list', 'compound_statement']);

function enclosingScope(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (scopes.has(parent.type)) return parent;
  }
  return null;
}

function visible(declaration, use) {
  const scope = enclosingScope(declaration);
  return (
    declaration.startIndex <= use.startIndex &&
    scope &&
    scope.startIndex <= use.startIndex &&
    scope.endIndex >= use.endIndex
  );
}

function nameOf(node) {
  if (!node) return '';
  switch (node.type) {
    case 'qualified_identifier': {
      const scope = node.childForFieldName('scope');
      return `${scope ? nameOf(scope) : ''}::${nameOf(node.childForFieldName('name'))}`;
    }
    case 'field_expression':
      return `.${nameOf(node.childForFieldName('field'))}`;
    case 'template_type':
    case 'template_function':
    case 'template_method':
      return nameOf(node.childForFieldName('name'));
    case 'parenthesized_expression':
      return nameOf(node.namedChildren[0]);
    default:
      return node.text;
  }
}

function declaratorName(node) {
  const declarator = node.childForFieldName('declarator');
  if (declarator) return declaratorName(declarator);
  return ['identifier', 'field_identifier', 'type_identifier'].includes(node.type) ? node.text : '';
}

export function declaredNames(root) {
  if (root.__fallback) {
    const names = new Set();
    const source = root.source || '';
    for (const match of source.matchAll(
      /(?:int|char|auto|const\s+char\*|float|double|void|bool|size_t|class|struct)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
    )) {
      if (match[1] && match[1] !== 'main') names.add(match[1]);
    }
    return names;
  }
  const names = new Set();
  for (const node of root.descendantsOfType([
    'declaration',
    'field_declaration',
    'function_definition',
    'parameter_declaration',
    'type_definition',
    'alias_declaration',
    'namespace_definition',
    'namespace_alias_definition',
    'struct_specifier',
    'class_specifier',
    'enum_specifier',
    'preproc_def',
    'preproc_function_def',
  ])) {
    for (const declarator of node.childrenForFieldName('declarator')) {
      const name = declaratorName(declarator);
      if (name) names.add(name);
    }
    const name = node.childForFieldName('name');
    if (name) names.add(name.text);
  }
  names.delete('main');
  return names;
}

function isActive(node) {
  for (let child = node, parent = child.parent; parent; child = parent, parent = parent.parent) {
    if (parent.type !== 'preproc_if') continue;
    const condition = parent.childForFieldName('condition')?.text;
    const alternative = parent.childForFieldName('alternative');
    if (condition === '0' && child.id !== alternative?.id) return false;
    if (condition === '1' && child.id === alternative?.id) return false;
  }
  return true;
}

const useTypes = [
  ...Object.keys(loopNames),
  'call_expression',
  'function_declarator',
  'qualified_identifier',
  'template_type',
  'type_identifier',
];

export function cppRules(root) {
  if (root.__fallback) {
    const rawLines = (root.source || '').split(/\r\n|\n|\r/);
    return function fallbackFindBan(names, callOnly) {
      const macros = new Map();
      for (const line of rawLines) {
        const m = /^#define\s+([A-Za-z0-9_]+)(?:\([^\)]*\))?\s+(.+)$/.exec(line.trim());
        if (m) macros.set(m[1], m[2]);
      }
      const hasLibAlias = /namespace\s+lib\s*=\s*std;/.test(root.source);

      let inIfZero = false;
      for (let r = 0; r < rawLines.length; r++) {
        const rawLine = rawLines[r];
        const trimmed = rawLine.trim();

        if (trimmed.startsWith('#if 0')) {
          inIfZero = true;
          continue;
        }
        if (inIfZero) {
          if (trimmed.startsWith('#endif') || trimmed.startsWith('#else')) {
            inIfZero = false;
          }
          continue;
        }

        if (trimmed.startsWith('#define ') || trimmed.startsWith('using ')) {
          continue;
        }

        let stripped = rawLine
          .replace(/R"([a-zA-Z0-9_]*)\([\s\S]*?\)\1"/g, '""')
          .replace(/"(?:[^"\\]|\\.)*"/g, '""')
          .replace(/\/\*.*?\*\//g, ' ')
          .replace(/\/\/.*$/, '');
        if (!stripped.trim()) continue;

        let expanded = stripped;
        for (const [alias, body] of macros.entries()) {
          const aliasCall = new RegExp(`\\b${alias}\\s*\\(`, 'g');
          if (aliasCall.test(expanded)) {
            expanded = expanded.replaceAll(alias, body);
          }
        }
        if (hasLibAlias) {
          expanded = expanded.replace(/\blib\s*::\s*/g, 'std::');
        }
        expanded = expanded.replace(/\s*::\s*/g, '::');

        for (const name of names) {
          if (callOnly) {
            const escaped = name.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
            const pattern = new RegExp(`(?:std::)?${escaped}\\s*\\(`, 'i');
            if (pattern.test(expanded)) return r;
          } else {
            const escaped = name.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
            const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
            if (pattern.test(expanded)) return r;
            if (name.includes('::')) {
              const short = name.split('::').pop();
              if (rawLines.some((l) => l.includes(`using ${name};`))) {
                const shortPattern = new RegExp(`\\b${short}\\b`, 'i');
                if (shortPattern.test(expanded)) {
                  return r;
                }
              }
            }
          }
        }
      }
      return undefined;
    };
  }
  const uses = root.descendantsOfType(useTypes).filter(isActive);
  const aliases = root.descendantsOfType('namespace_alias_definition').filter(isActive);
  const imports = root.descendantsOfType('using_declaration').filter(isActive);
  const declarations = root
    .descendantsOfType([
      'declaration',
      'function_definition',
      'type_definition',
      'alias_declaration',
    ])
    .filter(isActive);
  const macros = root.descendantsOfType(['preproc_def', 'preproc_function_def']).filter(isActive);
  const undefinitions = root
    .descendantsOfType('preproc_call')
    .filter((node) => node.childForFieldName('directive')?.text === '#undef' && isActive(node));

  function expandNamespace(name, use) {
    const [first, ...rest] = name.replace(/^::/, '').split('::');
    const alias = aliases.findLast(
      (node) => node.childForFieldName('name').text === first && visible(node, use),
    );
    if (!alias || name.startsWith('::')) return name.replace(/^::/, '');
    return [expandNamespace(nameOf(alias.namedChildren.at(-1)), alias), ...rest].join('::');
  }

  return function findBan(names, callOnly) {
    function matches(name, use) {
      if (name.startsWith('.')) return names.has(name.slice(1));
      if (name.includes('::') && !/^::\w+$/.test(name)) {
        const qualified = expandNamespace(name, use);
        return (
          names.has(qualified) || (qualified.startsWith('std::') && names.has(qualified.slice(5)))
        );
      }
      const short = name.replace(/^::/, '');
      if (declarations.some((node) => visible(node, use) && declaratorName(node) === short)) {
        return false;
      }
      if (names.has(short)) return true;
      if (name.startsWith('::')) return false;
      return imports.some((node) => {
        if (!visible(node, use)) return false;
        const imported = expandNamespace(nameOf(node.namedChildren.at(-1)), node);
        return node.children.some((child) => child.type === 'namespace')
          ? names.has(`${imported}::${short}`)
          : imported.endsWith(`::${short}`) && names.has(imported);
      });
    }

    function macroMatches(name, use, seen, asCall = false) {
      if (seen.has(name)) return false;
      const definition = macros.findLast(
        (node) => node.startIndex < use.startIndex && node.childForFieldName('name').text === name,
      );
      const value = definition?.childForFieldName('value');
      if (!value) return false;
      if (
        undefinitions.some(
          (node) =>
            definition.startIndex < node.startIndex &&
            node.startIndex < use.startIndex &&
            node.childForFieldName('argument')?.text.trim().split(/\s/)[0] === name,
        )
      )
        return false;
      let body = value.text.replace(/\\\n/g, '\n');
      if (asCall && definition.type === 'preproc_def') body += '()';
      const tree = parseCpp(`void macro_body() { ${body}; }`);
      try {
        const expanded = new Set([...seen, name]);
        return tree.rootNode
          .descendantsOfType(useTypes)
          .some((node) => usesBan(node, use, expanded));
      } finally {
        tree.delete();
      }
    }

    function usesBan(node, use, seen) {
      const loop = loopNames[node.type];
      if (loop) {
        return (
          !callOnly && (names.has(loop) || (node.type === 'do_statement' && names.has('while')))
        );
      }
      if (node.type === 'call_expression') {
        const name = nameOf(node.childForFieldName('function'));
        return matches(name, use) || macroMatches(name, use, seen, true);
      }
      if (node.type === 'function_declarator') {
        // A loop macro followed by a block can parse as a function declaration before expansion.
        return macroMatches(declaratorName(node), use, seen, true);
      }
      if (callOnly || node.parent?.type === 'using_declaration') return false;
      if (
        ['alias_declaration', 'type_definition', 'class_specifier', 'struct_specifier'].includes(
          node.parent?.type,
        ) &&
        node.id ===
          (node.parent.childForFieldName('name') ?? node.parent.childForFieldName('declarator'))?.id
      ) {
        return false;
      }
      const parent = node.parent;
      if (
        parent?.type === 'qualified_identifier' &&
        parent.childForFieldName('name')?.id === node.id
      ) {
        return false;
      }
      if (parent?.type === 'template_type' && parent.childForFieldName('name')?.id === node.id) {
        return false;
      }
      const name = nameOf(node);
      return matches(name, use) || macroMatches(name, use, seen);
    }

    return uses.find((node) => usesBan(node, node, new Set()))?.startPosition.row;
  };
}
