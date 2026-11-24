import { h } from '../../../lib/react.js';

export function StudentClassRosterRow({ student, index }) {
  const name = student.name || student.username || 'Sinh viên';
  const initial = name.charAt(0).toUpperCase();

  return h(
    'tr',
    {
      style: {
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfd',
      },
    },
    h('td', { style: { padding: '10px 12px', color: '#64748b', fontWeight: '500' } }, index + 1),
    h(
      'td',
      { style: { padding: '10px 12px' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h(
          'div',
          {
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              flexShrink: 0,
            },
          },
          initial,
        ),
        h('span', { style: { fontWeight: '600', color: '#0f172a' } }, name),
      ),
    ),
    h('td', { style: { padding: '10px 12px', color: '#64748b' } }, `@${student.username}`),
    h(
      'td',
      { style: { padding: '10px 12px' } },
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontWeight: '500',
          },
        },
        'Sinh viên',
      ),
    ),
    h(
      'td',
      { style: { padding: '10px 12px' } },
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            fontWeight: '600',
          },
        },
        'Đang học',
      ),
    ),
  );
}
