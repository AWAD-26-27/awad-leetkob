import { h } from '../../lib/react.js';
import { cx } from '../../utils/classNames.js';

export function Badge({ children, variant = 'neutral', icon, className = '', style = {} }) {
  return h(
    'span',
    {
      className: cx('badge', `badge-${variant}`, className),
      style,
    },
    icon && h('span', { style: { fontSize: '0.85em' } }, icon),
    children,
  );
}
