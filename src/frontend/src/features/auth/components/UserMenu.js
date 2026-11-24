import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

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
  if (isGuest) {
    return h(
      Button,
      {
        variant: 'primary',
        onClick: onOpenLogin,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          fontWeight: '600',
          fontSize: '13px',
        },
      },
      'Đăng nhập',
    );
  }

  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
    h(
      'div',
      {
        onClick: onOpenProfile,
        title: 'Nhấn để xem Hồ sơ & Đổi mật khẩu',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
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
            fontSize: '13px',
          },
        },
        (user.name || 'U').charAt(0).toUpperCase(),
      ),
      h(
        'div',
        null,
        h(
          'div',
          { style: { fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 } },
          user.name,
        ),
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' } },
          h(
            'span',
            {
              style: {
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: '600',
                color: roleColor,
                backgroundColor: roleBadgeBg,
                border: `1px solid ${roleColor}33`,
              },
            },
            roleLabel,
          ),
          user.classId &&
            h(
              'span',
              {
                style: {
                  fontSize: '10.5px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  color: '#475569',
                  backgroundColor: '#f1f5f9',
                },
              },
              `Lớp ${user.classId}`,
            ),
        ),
      ),
    ),
    h(
      Button,
      {
        variant: 'secondary',
        size: 'sm',
        onClick: onLogout,
        style: {
          color: '#475569',
          borderColor: '#cbd5e1',
          backgroundColor: '#ffffff',
          fontSize: '12px',
          padding: '6px 12px',
        },
      },
      'Đăng xuất',
    ),
  );
}
