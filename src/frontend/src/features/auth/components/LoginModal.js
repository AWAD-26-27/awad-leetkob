import { h, useState, useEffect } from '../../../lib/react.js';
import { Button, Input } from '../../../components/ui/index.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { LoginDemoQuickFill } from './LoginDemoQuickFill.js';

export function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success(`Đăng nhập thành công với tài khoản ${username.trim()}!`);
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.detail || err.message || 'Đăng nhập thất bại: sai username hoặc password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user, pass = 'password123') => {
    setUsername(user);
    setPassword(pass);
  };

  return h(
    'div',
    {
      style: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      },
      onClick: (e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      },
    },
    h(
      'div',
      {
        className: 'animate-fade-in',
        style: {
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          maxWidth: '440px',
          width: '100%',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        },
      },
      // Header
      h(
        'div',
        {
          style: {
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          },
        },
        h(
          'div',
          null,
          h('div', { style: { fontWeight: '700', fontSize: '16px', color: '#0f172a' } }, 'Đăng nhập tài khoản'),
          h('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px' } }, 'Hệ thống LeeTKOB'),
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: onClose,
            style: {
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              color: '#64748b',
              cursor: 'pointer',
              lineHeight: 1,
            },
          },
          '×',
        ),
      ),

      // Form Body
      h(
        'form',
        {
          onSubmit: handleSubmit,
          style: { padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' },
        },
        h(Input, {
          label: 'Tên đăng nhập',
          placeholder: 'admin, ta_a, student_1...',
          value: username,
          onChange: (e) => setUsername(e.target.value),
          required: true,
        }),
        h(Input, {
          type: 'password',
          label: 'Mật khẩu',
          placeholder: 'Mật khẩu mặc định: password123',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          required: true,
        }),

        // Quick Demo Fill Pills
        h(LoginDemoQuickFill, { onSelectUser: handleQuickFill }),

        // Action Submit Button
        h(
          Button,
          {
            type: 'submit',
            variant: 'primary',
            loading,
            style: {
              marginTop: '4px',
              padding: '10px 20px',
              fontWeight: '600',
              fontSize: '14px',
              width: '100%',
            },
          },
          'Đăng nhập',
        ),
      ),
    ),
  );
}
