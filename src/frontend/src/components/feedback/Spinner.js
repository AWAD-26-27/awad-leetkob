import { h } from '../../lib/react.js';

export function Spinner({ size = 20, color = 'var(--primary)' }) {
  return h('span', {
    style: {
      display: 'inline-block',
      width: `${size}px`,
      height: `${size}px`,
      border: `2px solid rgba(0,0,0,0.1)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    },
  });
}
