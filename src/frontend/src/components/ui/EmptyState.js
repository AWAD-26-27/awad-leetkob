import { h } from '../../lib/react.js';

export function EmptyState({
  icon = '📂',
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có nội dung nào trong danh mục này.',
  action = null,
  style = {},
}) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-muted)',
        ...style,
      },
    },
    h(
      'div',
      {
        style: {
          fontSize: '36px',
          marginBottom: '12px',
          filter: 'grayscale(0.2)',
        },
      },
      icon,
    ),
    h(
      'h4',
      {
        style: {
          margin: '0 0 6px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-main)',
        },
      },
      title,
    ),
    h(
      'p',
      {
        style: {
          margin: '0 0 16px 0',
          fontSize: '13.5px',
          maxWidth: '380px',
          lineHeight: '1.5',
        },
      },
      description,
    ),
    action ? h('div', null, action) : null,
  );
}
