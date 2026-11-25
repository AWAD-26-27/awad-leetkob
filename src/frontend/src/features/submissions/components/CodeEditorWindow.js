import { h, useRef, useState, useEffect } from '../../../lib/react.js';
import { EditorHeader } from './EditorHeader.js';
import { EditorLineGutter } from './EditorLineGutter.js';
import { useCodeDraft } from '../hooks/useCodeDraft.js';

const DEFAULT_STARTER_CODE = `#include <iostream>

int main() {
    // Viết giải thuật C++ của bạn tại đây
    int a, b;
    if (std::cin >> a >> b) {
        std::cout << (a + b) << "\\n";
    }
    return 0;
}
`;

export function CodeEditorWindow({ labId = '1', onSubmit, submitting = false }) {
  const textareaRef = useRef(null);
  const { draft, saveCode, lastSaved } = useCodeDraft(labId, DEFAULT_STARTER_CODE);
  const codeRef = useRef(draft);
  const [lineCount, setLineCount] = useState(14);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== draft) {
      textareaRef.current.value = draft;
      codeRef.current = draft;
      const lines = (draft.match(/\n/g) || []).length + 1;
      setLineCount(Math.max(lines, 14));
    }
  }, [labId, draft]);

  const handleInput = (e) => {
    const val = e.target.value;
    codeRef.current = val;
    saveCode(val);
    const lines = (val.match(/\n/g) || []).length + 1;
    if (lines !== lineCount) setLineCount(Math.max(lines, 14));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      ta.value = val.substring(0, start) + '    ' + val.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 4;
      codeRef.current = ta.value;
      saveCode(ta.value);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
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

  const handleReset = () => {
    if (textareaRef.current) {
      textareaRef.current.value = DEFAULT_STARTER_CODE;
      codeRef.current = DEFAULT_STARTER_CODE;
      saveCode(DEFAULT_STARTER_CODE);
      const lines = (DEFAULT_STARTER_CODE.match(/\n/g) || []).length + 1;
      setLineCount(Math.max(lines, 14));
    }
  };

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return h(
    'div',
    {
      className: 'code-editor-container',
      style: {
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid #334155',
        overflow: 'hidden',
        marginBottom: '20px',
      },
    },
    h(EditorHeader, {
      onCopy: handleCopy,
      copied,
      onReset: handleReset,
      onSubmit: handleSubmit,
      submitting,
    }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          minHeight: '280px',
          fontFamily: 'monospace',
          fontSize: '13.5px',
          lineHeight: '1.6',
          position: 'relative',
        },
      },
      h(EditorLineGutter, { lineNumbers }),
      h('textarea', {
        ref: textareaRef,
        defaultValue: draft,
        onInput: handleInput,
        onKeyDown: handleKeyDown,
        spellCheck: 'false',
        'aria-label': 'Trình soạn thảo mã nguồn C++',
        style: {
          flex: 1,
          padding: '16px 20px',
          backgroundColor: 'transparent',
          color: '#f8fafc',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'monospace',
          fontSize: '13.5px',
          lineHeight: '1.6',
          whiteSpace: 'pre',
          tabSize: 4,
          minHeight: '280px',
          boxSizing: 'border-box',
        },
      }),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: '#090d16',
          borderTop: '1px solid #1e293b',
          fontSize: '12px',
          color: '#64748b',
        },
      },
      h('span', null, 'Phím tắt: Ctrl + Enter để nộp bài'),
      h('span', null, lastSaved ? `Đã lưu nháp lúc ${lastSaved}` : 'Tự động lưu nháp'),
    ),
  );
}
