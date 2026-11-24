import { h } from '../../lib/react.js';
import { useNetworkStatus } from '../../hooks/useNetworkStatus.js';

export function OfflineBanner() {
  const { isOnline, reconnected } = useNetworkStatus();

  if (isOnline && !reconnected) return null;

  const isOffline = !isOnline;

  const bg = isOffline ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)';
  const icon = isOffline ? '⚡' : '✓';
  const text = isOffline
    ? 'Mất kết nối mạng — Đang chờ khôi phục tín hiệu máy chủ...'
    : 'Đã kết nối lại thành công!';

  return h(
    'div',
    {
      role: 'alert',
      'aria-live': 'assertive',
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: bg,
        color: '#ffffff',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        transition: 'all 0.3s ease',
      },
    },
    h('span', { style: { fontSize: '15px' } }, icon),
    h('span', null, text),
  );
}
