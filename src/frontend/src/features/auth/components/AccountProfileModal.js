import { h, useState, useEffect } from '../../../lib/react.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { fetchUsersList } from '../api/authApi.js';
import { ProfileDetailsTab } from './ProfileDetailsTab.js';
import { ChangePasswordTab } from './ChangePasswordTab.js';
import { AdminDirectoryTab } from './AdminDirectoryTab.js';

export function AccountProfileModal({ isOpen, onClose }) {
  const { user, logout, changePassword } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen && user.role === 'admin') {
      setLoadingUsers(true);
      fetchUsersList()
        .then((res) => {
          if (res?.items) setUsersList(res.items);
        })
        .catch(() => {})
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen, user.role]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất khỏi hệ thống');
    if (onClose) onClose();
  };

  const roleColor =
    user.role === 'admin' ? '#8b5cf6' : user.role === 'ta' ? '#3b82f6' : '#10b981';

  return h(
    'div',
    {
      style: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
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
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
      h(
        'div',
        {
          style: {
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          },
        },
        h(
          'div',
          null,
          h('div', { style: { fontWeight: '800', fontSize: '18px', color: '#0f172a' } }, 'Quản Lý Tài Khoản'),
          h('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px' } }, `${user.name} (@${user.username})`),
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
      h(
        'div',
        {
          style: {
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            padding: '0 16px',
          },
        },
        h(
          'button',
          {
            type: 'button',
            onClick: () => setActiveTab('profile'),
            style: {
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'profile' ? '#1d4ed8' : '#64748b',
              fontWeight: activeTab === 'profile' ? '700' : '500',
              fontSize: '13px',
              background: 'transparent',
              cursor: 'pointer',
            },
          },
          'Thông tin tài khoản',
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => setActiveTab('security'),
            style: {
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'security' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'security' ? '#1d4ed8' : '#64748b',
              fontWeight: activeTab === 'security' ? '700' : '500',
              fontSize: '13px',
              background: 'transparent',
              cursor: 'pointer',
            },
          },
          'Đổi mật khẩu',
        ),
        user.role === 'admin' &&
          h(
            'button',
            {
              type: 'button',
              onClick: () => setActiveTab('directory'),
              style: {
                padding: '12px 16px',
                border: 'none',
                borderBottom: activeTab === 'directory' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'directory' ? '#1d4ed8' : '#64748b',
                fontWeight: activeTab === 'directory' ? '700' : '500',
                fontSize: '13px',
                background: 'transparent',
                cursor: 'pointer',
              },
            },
            'Quản lý người dùng',
          ),
      ),
      h(
        'div',
        { style: { padding: '24px' } },
        activeTab === 'profile' &&
          h(ProfileDetailsTab, { user, roleColor, onLogout: handleLogout }),
        activeTab === 'security' &&
          h(ChangePasswordTab, {
            onChangePassword: changePassword,
            onSuccess: () => setActiveTab('profile'),
          }),
        activeTab === 'directory' &&
          user.role === 'admin' &&
          h(AdminDirectoryTab, { usersList, loadingUsers }),
      ),
    ),
  );
}
