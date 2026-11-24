import { h } from '../../lib/react.js';
import { cx } from '../../utils/classNames.js';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  return h(
    'button',
    {
      type,
      className: cx('btn', variantClass, sizeClass, className),
      disabled: disabled || loading,
      onClick,
      ...props,
    },
    loading &&
      h('span', {
        style: {
          display: 'inline-block',
          width: '14px',
          height: '14px',
          border: '2px solid rgba(255,255,255,0.35)',
          borderTopColor: '#ffffff',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        },
      }),
    children,
  );
}
