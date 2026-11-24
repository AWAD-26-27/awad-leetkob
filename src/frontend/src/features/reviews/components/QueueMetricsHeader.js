import { h } from '../../../lib/react.js';

export function QueueMetricsHeader({ queue, pendingCount, violationsCount, reviewedCount }) {
  return h(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '18px',
      },
    },
    h(
      'div',
      {
        style: {
          padding: '12px 14px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-md)',
        },
      },
      h(
        'div',
        { style: { fontSize: '11px', color: '#64748b', fontWeight: '600' } },
        '📋 TỔNG SỐ BÀI',
      ),
      h(
        'div',
        { style: { fontSize: '20px', fontWeight: '800', color: '#1e40af', marginTop: '2px' } },
        queue.length,
      ),
    ),
    h(
      'div',
      {
        style: {
          padding: '12px 14px',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
        },
      },
      h(
        'div',
        { style: { fontSize: '11px', color: '#92400e', fontWeight: '600' } },
        '⏳ CHỜ DUYỆT',
      ),
      h(
        'div',
        { style: { fontSize: '20px', fontWeight: '800', color: '#d97706', marginTop: '2px' } },
        pendingCount,
      ),
    ),
    h(
      'div',
      {
        style: {
          padding: '12px 14px',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-md)',
        },
      },
      h(
        'div',
        { style: { fontSize: '11px', color: '#991b1b', fontWeight: '600' } },
        '⚠️ VI PHẠM PHÁT HIỆN',
      ),
      h(
        'div',
        { style: { fontSize: '20px', fontWeight: '800', color: '#dc2626', marginTop: '2px' } },
        violationsCount,
      ),
    ),
    h(
      'div',
      {
        style: {
          padding: '12px 14px',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-md)',
        },
      },
      h('div', { style: { fontSize: '11px', color: '#065f46', fontWeight: '600' } }, '✅ ĐÃ DUYỆT'),
      h(
        'div',
        { style: { fontSize: '20px', fontWeight: '800', color: '#059669', marginTop: '2px' } },
        reviewedCount,
      ),
    ),
  );
}
