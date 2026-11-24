import { h } from '../../../lib/react.js';

export function NavbarBrand() {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
    // Clean Minimal Logo Mark
    h(
      'div',
      {
        style: {
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '800',
          fontSize: '15px',
          letterSpacing: '-0.03em',
        },
      },
      'L',
    ),
    // Brand Title & Description
    h(
      'div',
      null,
      h(
        'div',
        {
          style: {
            fontWeight: '800',
            fontSize: '16px',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: 1.2,
          },
        },
        'LeeTKOB',
      ),
      h(
        'div',
        { style: { fontSize: '11.5px', color: '#64748b', fontWeight: '500', marginTop: '2px' } },
        'Hệ thống nộp & đánh giá bài tập C++',
      ),
    ),
  );
}
