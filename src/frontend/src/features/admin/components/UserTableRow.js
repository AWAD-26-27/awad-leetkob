import { h } from '../../../lib/react.js';

export function UserTableRow({ user, classes = [], onOpenClassesModal }) {
  const roleConfig =
    user.role === 'admin'
      ? { label: 'Quản trị viên', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' }
      : user.role === 'ta'
        ? { label: 'Giảng viên', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' }
        : { label: 'Sinh viên', color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };

  const userClass = classes.find((c) => c.id === user.classId);
  const isAssigned =
    Boolean(userClass) ||
    user.role === 'admin' ||
    (Array.isArray(user.classes) && user.classes.length > 0);

  return h(
    'tr',
    { key: user.id, style: { borderBottom: '1px solid #f1f5f9' } },
    h('td', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '500' } }, `#${user.id}`),
    h('td', { style: { padding: '9px 12px', fontWeight: '600', color: '#0f172a' } }, user.name),
    h(
      'td',
      {
        style: {
          padding: '9px 12px',
          fontFamily: 'monospace',
          color: '#475569',
          fontSize: '12px',
        },
      },
      `@${user.username}`,
    ),
    h(
      'td',
      { style: { padding: '9px 12px' } },
      h(
        'span',
        {
          style: {
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            color: roleConfig.color,
            backgroundColor: roleConfig.bg,
            border: `1px solid ${roleConfig.border}`,
          },
        },
        roleConfig.label,
      ),
    ),
    h(
      'td',
      { style: { padding: '9px 12px' } },
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            fontWeight: '500',
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: isAssigned ? '#ecfdf5' : '#fffbeb',
            color: isAssigned ? '#065f46' : '#92400e',
            border: `1px solid ${isAssigned ? '#a7f3d0' : '#fde68a'}`,
          },
        },
        isAssigned ? 'Đã gán lớp' : 'Chưa có lớp',
      ),
    ),
    h(
      'td',
      {
        style: {
          padding: '9px 12px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#64748b',
        },
      },
      user.token
        ? h(
            'code',
            {
              style: {
                backgroundColor: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                border: '1px solid #e2e8f0',
              },
            },
            user.token,
          )
        : '—',
    ),
    h(
      'td',
      { style: { padding: '9px 12px' } },
      h(
        'button',
        {
          type: 'button',
          onClick: () => onOpenClassesModal(user),
          style: {
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#2563eb',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          },
        },
        'Xem thêm',
      ),
    ),
  );
}
