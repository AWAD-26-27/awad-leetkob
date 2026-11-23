import { h } from '../../lib/react.js';
import { cx } from '../../utils/classNames.js';

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  style = {},
  headerStyle = {},
}) {
  return h(
    'div',
    {
      className: cx('card', className),
      style,
    },
    (title || actions) &&
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--card-border)',
            ...headerStyle,
          },
        },
        h(
          'div',
          null,
          title &&
            h(
              'h3',
              {
                style: {
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.01em',
                },
              },
              title,
            ),
          subtitle &&
            h(
              'p',
              { style: { fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' } },
              subtitle,
            ),
        ),
        actions && h('div', { style: { display: 'flex', gap: '8px' } }, actions),
      ),
    children,
  );
}
