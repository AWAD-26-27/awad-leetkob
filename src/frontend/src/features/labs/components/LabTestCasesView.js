import { h } from '../../../lib/react.js';

export function LabTestCasesView({ tests }) {
  if (!tests || tests.length === 0) return null;

  return h(
    'div',
    { className: 'animate-fade-in', style: { marginBottom: '16px' } },
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      tests.map((t, idx) => {
        const inputVal =
          t.input !== undefined && t.input !== null
            ? t.input
            : t.inputText !== undefined && t.inputText !== null
              ? t.inputText
              : '—';
        const expectedVal =
          t.expectedOutput !== undefined && t.expectedOutput !== null
            ? t.expectedOutput
            : t.expected !== undefined && t.expected !== null
              ? t.expected
              : t.output !== undefined && t.output !== null
                ? t.output
                : '—';

        return h(
          'div',
          {
            key: idx,
            style: {
              padding: '12px 14px',
              backgroundColor: '#0b0f19',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#e2e8f0',
            },
          },
          h(
            'div',
            { style: { color: '#94a3b8', marginBottom: '4px' } },
            `Test Case #${t.ordinal || idx + 1}:`,
          ),
          h('div', null, `Input: ${inputVal}`),
          h('div', { style: { color: '#10b981', marginTop: '2px' } }, `Expected: ${expectedVal}`),
        );
      }),
    ),
  );
}
