import { h } from '../../../lib/react.js';

export function LabTestCasesView({ tests }) {
  if (!tests || tests.length === 0) return null;

  return h(
    'div',
    { className: 'animate-fade-in', style: { marginBottom: '16px' } },
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      tests.map((t, idx) =>
        h(
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
          h('div', null, `Input: ${t.input || t.inputText || '—'}`),
          h(
            'div',
            { style: { color: '#10b981', marginTop: '2px' } },
            `Expected: ${t.expected || t.expectedOutput || '—'}`,
          ),
        ),
      ),
    ),
  );
}
