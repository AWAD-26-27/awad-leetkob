import { h, createContext, useContext, useState } from '../lib/react.js';
import { TOAST_DURATION_MS } from '../config/constants.js';

export const ToastContext = createContext({
  toast: {
    success: () => {},
    error: () => {},
    info: () => {},
  },
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return h(
    ToastContext.Provider,
    { value: { toast } },
    children,
    h(
      'div',
      {
        style: {
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        },
      },
      toasts.map((t) =>
        h(
          'div',
          {
            key: t.id,
            role: 'alert',
            id: 'statusMessage',
            className: `badge badge-${t.type === 'error' ? 'danger' : t.type === 'success' ? 'success' : 'primary'}`,
            style: {
              padding: '0.75rem 1.25rem',
              boxShadow: 'var(--shadow-floating)',
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-sm)',
            },
          },
          t.type === 'success' ? '✅ ' : t.type === 'error' ? '❌ ' : 'ℹ️ ',
          t.message,
        ),
      ),
    ),
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  const toastObj = ctx?.toast || {
    success: () => {},
    error: () => {},
    info: () => {},
  };
  return {
    ...toastObj,
    toast: toastObj,
  };
}
