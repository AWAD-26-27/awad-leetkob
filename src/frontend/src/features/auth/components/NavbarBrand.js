import { h } from '../../../lib/react.js';

export function NavbarBrand() {
  return h(
    'div',
    {
      style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
      onClick: () => {
        if (typeof window !== 'undefined') window.location.hash = '#/';
      },
    },
    // Modern Code Logo Mark
    h(
      'div',
      {
        style: {
          width: '36px',
          height: '36px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38bdf8',
          fontWeight: '800',
          fontSize: '14px',
          fontFamily: 'monospace',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
      '</>',
    ),
    // Brand Title & Tagline
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h(
          'span',
          {
            style: {
              fontWeight: '800',
              fontSize: '18px',
              letterSpacing: '-0.02em',
              color: '#0f172a',
              lineHeight: 1.2,
            },
          },
          'LeeTKOB',
        ),
        h(
          'span',
          {
            style: {
              fontSize: '10.5px',
              fontWeight: '700',
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
            },
          },
          'v3.0',
        ),
      ),
      h(
        'span',
        { style: { fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '1px' } },
        'Hệ thống nộp & đánh giá C++',
      ),
    ),
  );
}
