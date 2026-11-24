import { h } from '../../lib/react.js';

export function EmptyState({ icon = '📭', title = 'No records found', description = '', action }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      },
    },
    h('span', { style: { fontSize: '2.5rem', marginBottom: '0.75rem' } }, icon),
    h(
      'h4',
      {
        style: {
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '4px',
        },
      },
      title,
    ),
    description &&
      h(
        'p',
        {
          style: {
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            maxWidth: '400px',
            marginBottom: '1rem',
          },
        },
        description,
      ),
    action,
  );
}
