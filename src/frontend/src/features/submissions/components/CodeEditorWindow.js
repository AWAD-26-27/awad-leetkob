import { h, useRef, useState } from '../../../lib/react.js';
import { EditorHeader } from './EditorHeader.js';
import { EditorLineGutter } from './EditorLineGutter.js';

const SAMPLE_CPP_CODE = `#include <iostream>
#include <vector>

int main() {
    int a, b;
    if (std::cin >> a >> b) {
        std::cout << (a + b) << "\\n";
    }
    return 0;
}
`;

const TEMPLATES = {
  default: SAMPLE_CPP_CODE,
  dynamicArray: `// Solution without <vector> (complies with C1 constraint)
#include <iostream>

int main() {
    int n;
    if (std::cin >> n) {
        int* arr = new int[n];
        for (int i = 0; i < n; ++i) std::cin >> arr[i];
        for (int i = 0; i < n; ++i) std::cout << arr[i] << " ";
        std::cout << "\\n";
        delete[] arr; // No memory leak (C2)
    }
    return 0;
}
`,
};

export function CodeEditorWindow({ onSubmit, submitting = false }) {
  const textareaRef = useRef(null);
  const codeRef = useRef(SAMPLE_CPP_CODE);
  const [lineCount, setLineCount] = useState(14);
  const [copied, setCopied] = useState(false);

  const handleInput = (e) => {
    const val = e.target.value;
    codeRef.current = val;
    const lines = (val.match(/\n/g) || []).length + 1;
    if (lines !== lineCount) setLineCount(Math.max(lines, 14));
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit(e);
  };

  const handleSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const sourceCode = textareaRef.current ? textareaRef.current.value : codeRef.current;
    if (onSubmit) onSubmit(sourceCode);
  };

  const handleCopy = () => {
    const text = textareaRef.current ? textareaRef.current.value : codeRef.current;
    if (typeof globalThis !== 'undefined' && globalThis.navigator?.clipboard?.writeText) {
      globalThis.navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadTemplate = (key) => {
    if (TEMPLATES[key] && textareaRef.current) {
      textareaRef.current.value = TEMPLATES[key];
      codeRef.current = TEMPLATES[key];
      const lines = (TEMPLATES[key].match(/\n/g) || []).length + 1;
      setLineCount(Math.max(lines, 14));
    }
  };

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return h(
    'div',
    {
      className: 'code-editor-container animate-fade-in',
      style: {
        backgroundColor: '#0b0f19',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        marginBottom: '24px',
      },
    },
    h(EditorHeader, {
      onCopy: handleCopy,
      copied,
      onLoadTemplate: handleLoadTemplate,
      onSubmit: handleSubmit,
      submitting,
    }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          minHeight: '280px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13.5px',
          lineHeight: '1.65',
          position: 'relative',
        },
      },
      h(EditorLineGutter, { lineNumbers }),
      h('textarea', {
        ref: textareaRef,
        defaultValue: SAMPLE_CPP_CODE,
        onInput: handleInput,
        onKeyDown: handleKeyDown,
        spellCheck: 'false',
        style: {
          flex: 1,
          padding: '16px 20px',
          backgroundColor: 'transparent',
          color: '#f8fafc',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'var(--font-mono)',
          fontSize: '13.5px',
          lineHeight: '1.65',
          whiteSpace: 'pre',
          overflowWrap: 'normal',
          overflowX: 'auto',
          caretColor: '#38bdf8',
        },
      }),
    ),
  );
}
