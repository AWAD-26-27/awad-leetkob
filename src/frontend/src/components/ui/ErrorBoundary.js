import { h, useState } from '../../lib/react.js';

/**
 * Functional resilience wrapper to handle render errors and prevent blank screens.
 */
export function ErrorBoundary({ children, fallback = null }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (hasError) {
    if (fallback) return fallback;

    return h(
      'div',
      {
        style: {
          padding: '48px 24px',
          margin: '32px auto',
          maxWidth: '600px',
          backgroundColor: '#1e1b2e',
          border: '1px solid #e11d48',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#f8fafc',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
        },
      },
      h('div', { style: { fontSize: '40px', marginBottom: '16px' } }, '⚠️'),
      h(
        'h3',
        { style: { margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' } },
        'Đã xảy ra sự cố hiển thị',
      ),
      h(
        'p',
        { style: { color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' } },
        errorMessage || 'Ứng dụng gặp một ngoại lệ không mong muốn trong quá trình render.',
      ),
      h(
        'button',
        {
          type: 'button',
          className: 'btn btn-primary',
          onClick: () => {
            setHasError(false);
            if (typeof window !== 'undefined') window.location.reload();
          },
        },
        'Tải lại trang (Reload)',
      ),
    );
  }

  try {
    return children;
  } catch (err) {
    setHasError(true);
    setErrorMessage(err?.message || String(err));
    return null;
  }
}
