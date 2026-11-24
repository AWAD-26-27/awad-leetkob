import { h } from '../../../lib/react.js';

export function UserDropdownHeader({ user, safeName, roleLabel, roleColor, roleBadgeBg }) {
  const isImageAvatar =
    user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image'));

  return h(
    'div',
    {
      style: {
        padding: '14px 16px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc',
      },
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
      h(
        'div',
        {
          style: {
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: roleColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isImageAvatar ? '12px' : '16px',
            fontWeight: '700',
            overflow: 'hidden',
            flexShrink: 0,
          },
        },
        isImageAvatar
          ? h('img', {
              src: user.avatar,
              alt: safeName,
              style: { width: '100%', height: '100%', objectFit: 'cover' },
            })
          : user?.avatar || safeName.charAt(0).toUpperCase(),
      ),
      h(
        'div',
        { style: { overflow: 'hidden', flex: 1 } },
        h(
          'div',
          {
            style: {
              fontWeight: '700',
              fontSize: '14px',
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },
          safeName,
        ),
        h('div', { style: { fontSize: '12px', color: '#64748b' } }, `@${user?.username || ''}`),
      ),
    ),
    h(
      'div',
      { style: { marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center' } },
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
  );
}
