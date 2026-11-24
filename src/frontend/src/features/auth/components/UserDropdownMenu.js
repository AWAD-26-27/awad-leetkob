import { h } from '../../../lib/react.js';

export function UserDropdownMenu({
  user,
  safeName,
  roleLabel,
  roleColor,
  roleBadgeBg,
  onOpenProfile,
  onLogout,
  onClose,
}) {
  const itemStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#334155',
    cursor: 'pointer',
    textAlign: 'left',
  };

  return h(
    'div',
    {
      className: 'animate-fade-in',
      style: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '240px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        zIndex: 1000,
      },
    },
    // User Profile Header
    h(
      'div',
      {
        style: {
          padding: '14px 16px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
        },
      },
      h('div', { style: { fontWeight: '700', fontSize: '14px', color: '#0f172a' } }, safeName),
      h('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px' } }, `@${user?.username || ''}`),
      h(
        'div',
        { style: { marginTop: '6px', display: 'flex', gap: '6px' } },
        h(
          'span',
          {
            style: {
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '4px',
              fontWeight: '600',
              color: roleColor,
              backgroundColor: roleBadgeBg,
              border: `1px solid ${roleColor}33`,
            },
          },
          roleLabel,
        ),
        user?.classId &&
          h(
            'span',
            {
              style: {
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '4px',
                fontWeight: '500',
                color: '#475569',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
              },
            },
            `Lớp ${user.classId}`,
          ),
      ),
    ),
    // Menu Actions
    h(
      'div',
      { style: { padding: '6px' }, role: 'menu' },
      h(
        'button',
        {
          type: 'button',
          role: 'menuitem',
          style: itemStyle,
          onClick: () => {
            onClose();
            if (onOpenProfile) onOpenProfile('profile');
          },
        },
        h('span', { style: { fontSize: '15px' } }, '👤'),
        'Xem hồ sơ tài khoản',
      ),
      h(
        'button',
        {
          type: 'button',
          role: 'menuitem',
          style: itemStyle,
          onClick: () => {
            onClose();
            if (onOpenProfile) onOpenProfile('security');
          },
        },
        h('span', { style: { fontSize: '15px' } }, '🔑'),
        'Đổi mật khẩu',
      ),
      h(
        'button',
        {
          type: 'button',
          role: 'menuitem',
          style: itemStyle,
          onClick: () => {
            onClose();
            if (typeof window !== 'undefined') window.open('/api/docs', '_blank');
          },
        },
        h('span', { style: { fontSize: '15px' } }, '📖'),
        'Tài liệu API (Docs)',
      ),
    ),
    // Divider
    h('div', { style: { height: '1px', backgroundColor: '#f1f5f9', margin: '0 6px' } }),
    // Logout Option
    h(
      'div',
      { style: { padding: '6px' } },
      h(
        'button',
        {
          type: 'button',
          style: { ...itemStyle, fontWeight: '600', color: '#dc2626' },
          onClick: () => {
            onClose();
            if (onLogout) onLogout();
          },
        },
        h('span', { style: { fontSize: '15px' } }, '🚪'),
        'Đăng xuất',
      ),
    ),
  );
}
