import { h, useState, useEffect } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';
import { UserDropdownMenu } from './UserDropdownMenu.js';

export function UserMenu({
  user,
  isGuest,
  roleLabel,
  roleColor,
  roleBadgeBg,
  onOpenLogin,
  onOpenProfile,
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#user-menu-dropdown-container')) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  if (isGuest) {
    return h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h(
        'button',
        {
          type: 'button',
          onClick: () => {
            if (typeof window !== 'undefined') window.open('/api/docs', '_blank');
          },
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#475569',
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: 'pointer',
          },
        },
        h('span', null, '📖'),
        'API Docs',
      ),
      h(
        Button,
        {
          variant: 'primary',
          onClick: onOpenLogin,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            fontWeight: '600',
            fontSize: '14px',
            borderRadius: '8px',
          },
        },
        'Đăng nhập',
      ),
    );
  }

  const safeName = (user && user.name) || 'User';

  return h(
    'div',
    {
      id: 'user-menu-dropdown-container',
      style: { position: 'relative', display: 'inline-block' },
    },
    h(
      'button',
      {
        type: 'button',
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen,
        'aria-label': 'Menu tài khoản người dùng',
        onClick: () => setIsOpen(!isOpen),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '5px 14px 5px 6px',
          borderRadius: '9999px',
          border: isOpen ? '1px solid #3b82f6' : '1px solid #e2e8f0',
          backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
        },
      },
      h(
        'div',
        {
          style: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: roleColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '13.5px',
          },
        },
        safeName.charAt(0).toUpperCase(),
      ),
      h(
        'div',
        { style: { textAlign: 'left', display: 'flex', flexDirection: 'column' } },
        h(
          'span',
          { style: { fontSize: '13.5px', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 } },
          safeName,
        ),
        h(
          'span',
          { style: { fontSize: '11px', color: '#64748b', fontWeight: '500' } },
          roleLabel + (user?.classId ? ` • Lớp ${user.classId}` : ''),
        ),
      ),
      h(
        'span',
        {
          style: {
            fontSize: '10px',
            color: '#94a3b8',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            marginLeft: '4px',
          },
        },
        '▼',
      ),
    ),
    isOpen &&
      h(UserDropdownMenu, {
        user,
        safeName,
        roleLabel,
        roleColor,
        roleBadgeBg,
        onOpenProfile,
        onLogout,
        onClose: () => setIsOpen(false),
      }),
  );
}
