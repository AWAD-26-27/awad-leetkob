import { h } from '../../lib/react.js';

export function Spinner({
  size = 24,
  color = '#2563eb',
  label = '',
  center = false,
  fullPage = false,
  inline = false,
  style = {},
}) {
  const spinnerElement = h('span', {
    className: 'loading-spinner',
    'aria-label': label || 'Loading',
    'aria-hidden': 'true',
    style: {
      display: 'inline-block',
      width: `${size}px`,
      height: `${size}px`,
      border: `${Math.max(2, Math.round(size / 8))}px solid rgba(37, 99, 235, 0.15)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
      flexShrink: 0,
      verticalAlign: inline ? 'middle' : undefined,
      ...style,
    },
  });

  if (inline) {
    return h(
      'span',
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          verticalAlign: 'middle',
        },
      },
      spinnerElement,
      label ? h('span', { style: { fontSize: '13px', color: '#475569' } }, label) : null,
    );
  }

  if (!center && !fullPage && !label) {
    return spinnerElement;
  }

  const containerStyle = fullPage
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: '12px',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
        gap: '12px',
        color: '#64748b',
        fontSize: '13.5px',
        fontWeight: '500',
        width: '100%',
      };

  return h(
    'div',
    { style: containerStyle },
    spinnerElement,
    label
      ? h('span', { style: { color: '#64748b', fontSize: '13.5px', fontWeight: '500' } }, label)
      : null,
  );
}
