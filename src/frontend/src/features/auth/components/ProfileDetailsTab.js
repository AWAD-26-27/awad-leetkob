import { h } from '../../../lib/react.js';
import { Button, Badge } from '../../../components/ui/index.js';

export function ProfileDetailsTab({ user, roleColor, onLogout, onGoToSettings }) {
  const safeName = (user && user.name) || 'User';
  const safeUsername = (user && user.username) || '';
  const safeRole = (user && user.role) || 'guest';
  const isImageAvatar =
    user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image'));

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
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: roleColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: isImageAvatar ? '14px' : '24px',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: `0 0 0 4px ${roleColor}25`,
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
        h('div', { style: { fontSize: '17px', fontWeight: '800', color: '#0f172a' } }, safeName),
        h(
          'div',
          { style: { fontSize: '13px', color: '#64748b', fontFamily: 'var(--font-mono)' } },
          `@${safeUsername}`,
        ),
        h(
          'div',
          { style: { display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' } },
          h(
            Badge,
            { variant: safeRole === 'admin' ? 'info' : safeRole === 'ta' ? 'warning' : 'success' },
            safeRole.toUpperCase(),
          ),
          h(Badge, { variant: 'neutral' }, user?.classId ? `Class ${user.classId}` : 'All Classes'),
        ),
      ),
    ),
    // Details summary table
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '14px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #e2e8f0',
          fontSize: '13px',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '6px',
          },
        },
        h('span', { style: { color: '#64748b' } }, '📞 Số điện thoại:'),
        h(
          'span',
          { style: { fontWeight: '600', color: user?.phone ? '#0f172a' : '#94a3b8' } },
          user?.phone || 'Chưa cập nhật',
        ),
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '6px',
          },
        },
        h('span', { style: { color: '#64748b' } }, '🏷️ Vai trò:'),
        h(
          'span',
          { style: { fontWeight: '600', color: '#0f172a' } },
          safeRole === 'admin' ? 'Quản trị viên' : safeRole === 'ta' ? 'Giảng viên' : 'Sinh viên',
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between' } },
        h('span', { style: { color: '#64748b' } }, '🔑 Active Token:'),
        h(
          'span',
          { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#2563eb' } },
          user?.token || 'N/A',
        ),
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' } },
      onGoToSettings &&
        h(
          Button,
          {
            variant: 'primary',
            size: 'sm',
            onClick: onGoToSettings,
            style: {
              width: '100%',
              padding: '10px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            },
          },
          '⚙️ Cài Đặt & Chỉnh Sửa Thông Tin',
        ),
      h(
        Button,
        {
          variant: 'danger',
          size: 'sm',
          onClick: onLogout,
          style: { width: '100%', padding: '9px' },
        },
        '🚪 Đăng xuất',
      ),
    ),
  );
}
