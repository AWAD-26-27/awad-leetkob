import { h } from '../../lib/react.js';

export function SkeletonLine({ width = '100%', height = '14px', style = {} }) {
  return h('div', {
    className: 'skeleton-shimmer',
    style: {
      width,
      height,
      borderRadius: 'var(--radius-sm)',
      ...style,
    },
  });
}

export function SkeletonCard({ lines = 3, style = {} }) {
  return h(
    'div',
    {
      style: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        ...style,
      },
    },
    h(SkeletonLine, { width: '40%', height: '20px' }),
    Array.from({ length: lines }).map((_, i) =>
      h(SkeletonLine, { key: i, width: i === lines - 1 ? '70%' : '100%' }),
    ),
  );
}

export function SkeletonTable({ rows = 4, cols = 4, style = {} }) {
  return h(
    'div',
    {
      style: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        ...style,
      },
    },
    h(
      'div',
      { style: { display: 'flex', gap: '12px' } },
      Array.from({ length: cols }).map((_, i) =>
        h(SkeletonLine, { key: i, width: `${100 / cols}%`, height: '18px' }),
      ),
    ),
    Array.from({ length: rows }).map((_, r) =>
      h(
        'div',
        { key: r, style: { display: 'flex', gap: '12px' } },
        Array.from({ length: cols }).map((_, c) =>
          h(SkeletonLine, { key: c, width: `${100 / cols}%`, height: '14px' }),
        ),
      ),
    ),
  );
}
