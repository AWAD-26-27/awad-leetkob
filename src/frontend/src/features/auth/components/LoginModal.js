import { h, useState, useEffect, useRef } from '../../../lib/react.js';
import { Button, Input } from '../../../components/ui/index.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { LoginDemoQuickFill } from './LoginDemoQuickFill.js';

export function LoginModal({ isOpen, onClose }) {
  const { login, savedAccounts, loginWithSavedAccount, forgetSavedAccount } = useAuth();
  const { toast } = useToast();
  const usernameRef = useRef('');
  const passwordRef = useRef('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      usernameRef.current = '';
      passwordRef.current = '';
      setLoading(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const form = e?.target;
    const doc = typeof document !== 'undefined' ? document : null;
    const username = (
      usernameRef.current ||
      form?.username?.value ||
      doc?.getElementById('login-username')?.value ||
      ''
    ).trim();
    const password =
      passwordRef.current ||
      form?.password?.value ||
      doc?.getElementById('login-password')?.value ||
      '';

    if (!username || !password) {
      toast.error('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      toast.success(`Đăng nhập thành công với tài khoản ${username}!`);
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.detail || err.message || 'Đăng nhập thất bại: sai username hoặc password');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = (account) => {
    try {
      loginWithSavedAccount(account);
      toast.success(`Đăng nhập thành công với tài khoản ${account.name || account.username}!`);
      if (onClose) onClose();
    } catch {
      toast.error('Không thể đăng nhập vào tài khoản này');
    }
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
        style: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          maxWidth: '460px',
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
            padding: '20px 24px',
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
          h(
            'div',
            { style: { fontWeight: '700', fontSize: '18px', color: '#0f172a' } },
            'Đăng nhập tài khoản',
          ),
          h(
            'div',
            { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
            'Hệ thống LeeTKOB',
          ),
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
          id: 'login-username',
          name: 'username',
          label: 'Tên đăng nhập',
          placeholder: 'admin, ta_a, student_1...',
          defaultValue: usernameRef.current,
          onChange: (e) => (usernameRef.current = e.target.value),
          onInput: (e) => (usernameRef.current = e.target.value),
          required: true,
        }),
        h(Input, {
          id: 'login-password',
          name: 'password',
          type: 'password',
          label: 'Mật khẩu',
          placeholder: 'Nhập mật khẩu...',
          defaultValue: passwordRef.current,
          onChange: (e) => (passwordRef.current = e.target.value),
          onInput: (e) => (passwordRef.current = e.target.value),
          required: true,
        }),

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

        // Quick Login: Accounts previously authenticated with password
        h(LoginDemoQuickFill, {
          savedAccounts,
          onDirectLogin: handleDirectLogin,
          onRemoveAccount: forgetSavedAccount,
        }),
      ),
    ),
  );
}
