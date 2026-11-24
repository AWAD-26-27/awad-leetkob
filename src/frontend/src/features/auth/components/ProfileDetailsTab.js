import { h } from '../../../lib/react.js';
import { Button, Badge } from '../../../components/ui/index.js';

export function ProfileDetailsTab({ user, roleColor, onLogout }) {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #e2e8f0',
        },
      },
      h(
        'div',
        {
          style: {
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: roleColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '20px',
            boxShadow: `0 0 0 4px ${roleColor}25`,
          },
        },
        user.name.charAt(0).toUpperCase(),
      ),
      h(
        'div',
        null,
        h('div', { style: { fontSize: '16px', fontWeight: '800', color: '#0f172a' } }, user.name),
        h('div', { style: { fontSize: '13px', color: '#64748b', fontFamily: 'var(--font-mono)' } }, `@${user.username}`),
        h(
          'div',
          { style: { display: 'flex', gap: '8px', marginTop: '6px' } },
          h(Badge, { variant: user.role === 'admin' ? 'info' : user.role === 'ta' ? 'warning' : 'success' }, user.role.toUpperCase()),
          h(Badge, { variant: 'neutral' }, user.classId ? `Class ${user.classId}` : 'All Classes'),
        ),
      ),
    ),
    h(
      'div',
      {
        style: {
          padding: '12px 14px',
          backgroundColor: '#0b0f19',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
      h('div', { style: { fontSize: '11px', color: '#94a3b8', marginBottom: '4px' } }, 'Active Bearer Token:'),
      h('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#38bdf8' } }, user.token || 'No token'),
    ),
    h(
      'div',
      { style: { paddingTop: '8px' } },
      h(
        Button,
        {
          variant: 'danger',
          size: 'sm',
          onClick: onLogout,
          style: { width: '100%', padding: '10px' },
        },
        'Đăng xuất',
      ),
    ),
  );
}
