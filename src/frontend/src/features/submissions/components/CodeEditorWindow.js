import { h, useRef, useState } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

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
    if (lines !== lineCount) {
      setLineCount(Math.max(lines, 14));
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
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
    // macOS Header Bar
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          backgroundColor: '#070a10',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
      // Window Dots & File Tab
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h('span', {
          style: {
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff5f56',
            display: 'inline-block',
            boxShadow: '0 0 6px rgba(255, 95, 86, 0.4)',
          },
        }),
        h('span', {
          style: {
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffbd2e',
            display: 'inline-block',
            boxShadow: '0 0 6px rgba(255, 189, 46, 0.4)',
          },
        }),
        h('span', {
          style: {
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#27c93f',
            display: 'inline-block',
            boxShadow: '0 0 6px rgba(39, 201, 63, 0.4)',
          },
        }),
        h(
          'span',
          {
            style: {
              marginLeft: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#f8fafc',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            },
          },
          '⚡ solution.cpp',
          h(
            'span',
            {
              style: {
                fontSize: '10px',
                color: '#94a3b8',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: '500',
              },
            },
            'C++20 (GCC 14)',
          ),
        ),
      ),

      // Toolbar Controls & Submit Button
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h(
          'button',
          {
            type: 'button',
            onClick: handleCopy,
            style: {
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '4px 10px',
              color: copied ? '#10b981' : '#cbd5e1',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            },
          },
          copied ? '✓ Copied' : '📋 Copy',
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => handleLoadTemplate('dynamicArray'),
            style: {
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              padding: '4px 10px',
              color: '#93c5fd',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            },
          },
          '💡 Load Safe Array Template',
        ),
        h(
          Button,
          {
            variant: 'primary',
            size: 'sm',
            onClick: handleSubmit,
            loading: submitting,
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '6px 18px',
              fontSize: '12.5px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            },
          },
          'Nộp bài giải (Submit)',
        ),
      ),
    ),

    // Editor Area with Line Numbers
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
      // Gutter Line Numbers
      h(
        'div',
        {
          style: {
            padding: '16px 14px 16px 16px',
            color: '#475569',
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#090d15',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          },
        },
        lineNumbers.map((num) => h('div', { key: num }, num)),
      ),
      // Textarea
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

    // IDE Status Bar Footer
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          backgroundColor: '#070a10',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#64748b',
        },
      },
      h('div', null, `UTF-8 | LF | Tab: 4 spaces | Lines: ${lineCount}`),
      h('div', { style: { color: '#94a3b8' } }, '💡 Gợi ý: Nhấn Ctrl + Enter để nộp bài nhanh'),
    ),
  );
}
