import { h } from '../../../lib/react.js';
import { UserDropdownHeader } from './UserDropdownHeader.js';

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
      onClick: (e) => e?.stopPropagation?.(),
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
    // User Profile Header Card
    h(UserDropdownHeader, { user, safeName, roleLabel, roleColor, roleBadgeBg }),
    // Menu Actions: Profile, Setting, Docs
    h(
      'div',
      { style: { padding: '6px' }, role: 'menu' },
      menuBtn(
        'user-dropdown-profile-btn',
        itemStyle,
        () => {
          onClose();
          onOpenProfile?.('profile');
        },
        '👤',
        'Hồ sơ cá nhân (Profile)',
      ),
      menuBtn(
        'user-dropdown-settings-btn',
        itemStyle,
        () => {
          onClose();
          onOpenProfile?.('settings');
        },
        '⚙️',
        'Cài đặt tài khoản (Setting)',
      ),
      menuBtn(
        'user-dropdown-docs-btn',
        itemStyle,
        () => {
          onClose();
          window.open?.('/api/docs', '_blank');
        },
        '📖',
        'Tài liệu API (Docs)',
      ),
    ),
    // Divider
    h('div', { style: { height: '1px', backgroundColor: '#f1f5f9', margin: '0 6px' } }),
    // Logout Option
    h(
      'div',
      { style: { padding: '6px' } },
      menuBtn(
        'user-dropdown-logout-btn',
        { ...itemStyle, fontWeight: '600', color: '#dc2626' },
        () => {
          onClose();
          onLogout?.();
        },
        '🚪',
        'Đăng xuất (Logout)',
      ),
    ),
  );
}

function menuBtn(id, style, onClick, icon, text) {
  return h(
    'button',
    { type: 'button', id, role: 'menuitem', style, onClick },
    h('span', { style: { fontSize: '15px' } }, icon),
    text,
  );
}
