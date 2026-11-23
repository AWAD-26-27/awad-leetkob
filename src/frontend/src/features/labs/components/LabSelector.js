import { h } from '../../../lib/react.js';

export function LabSelector({ labs = [], activeLabId, onSelectLab }) {
  if (labs.length === 0) return null;

  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      },
    },
    h(
      'span',
      { style: { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' } },
      'Select Lab:',
    ),
    labs.map((lab) => {
      const isActive = lab.id === activeLabId;
      return h(
        'button',
        {
          key: lab.id,
          type: 'button',
          onClick: () => onSelectLab(lab.id),
          className: isActive ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm',
          style: {
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '12px',
          },
        },
        `Lab ${lab.id}: ${lab.title || 'Untitled'}`,
      );
    }),
  );
}
