import { h } from '../../../lib/react.js';

export function EditorLineGutter({ lineNumbers }) {
  return h(
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
  );
}
