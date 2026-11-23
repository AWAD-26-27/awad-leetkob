import { h } from '../../lib/react.js';
import { cx } from '../../utils/classNames.js';

export function Callout({ variant = 'info', title, children, className = '', style = {} }) {
  const icon =
    variant === 'danger'
      ? '🚫'
      : variant === 'warning'
        ? '⚠️'
        : variant === 'success'
          ? '✅'
          : 'ℹ️';

  return h(
    'div',
    {
      className: cx('callout', `callout-${variant}`, className),
      style,
    },
    h('span', { style: { fontSize: '1.2rem', lineHeight: 1 } }, icon),
    h(
      'div',
      { style: { flex: 1 } },
      title &&
        h('strong', { style: { display: 'block', marginBottom: '2px', fontWeight: 700 } }, title),
      children,
    ),
  );
}
