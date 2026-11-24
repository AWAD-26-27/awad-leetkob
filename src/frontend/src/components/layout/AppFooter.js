import { h } from '../../lib/react.js';

export function AppFooter() {
  return h(
    'footer',
    {
      style: {
        padding: '20px 32px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        color: '#64748b',
        fontSize: '13.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      },
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h('span', { style: { fontWeight: '700', color: '#0f172a' } }, 'LeeTKOB'),
      h('span', { style: { color: '#cbd5e1' } }, '—'),
      h('span', null, 'Nền tảng thực hành & thẩm định bài tập C++'),
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
        h('span', {
          style: {
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
          },
        }),
        h(
          'span',
          { style: { fontWeight: '600', color: '#059669', fontSize: '13px' } },
          'Hệ thống hoạt động',
        ),
      ),
      h('span', { style: { color: '#cbd5e1' } }, '•'),
      h('span', { style: { fontSize: '12.5px', color: '#94a3b8' } }, 'AWAD 2609 • Node.js & C++20'),
    ),
  );
}
