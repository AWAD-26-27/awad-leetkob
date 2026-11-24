import { h, useState, useEffect } from '../../../lib/react.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { fetchUsersList } from '../api/authApi.js';
import { ProfileDetailsTab } from './ProfileDetailsTab.js';
import { UserSettingsTab } from './UserSettingsTab.js';
import { ChangePasswordTab } from './ChangePasswordTab.js';
import { AdminDirectoryTab } from './AdminDirectoryTab.js';

export function AccountProfileModal({ isOpen, onClose, initialTab = 'profile' }) {
  const { user, logout, changePassword, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'profile');
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && onClose) onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      setLoadingUsers(true);
      fetchUsersList()
        .then((res) => {
          if (res?.items) setUsersList(res.items);
        })
        .catch(() => {})
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen, user?.role]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất khỏi hệ thống');
    if (onClose) onClose();
  };

  const roleColor =
    user?.role === 'admin' ? '#8b5cf6' : user?.role === 'ta' ? '#3b82f6' : '#10b981';

  const tabs = [
    { id: 'profile', label: '👤 Hồ sơ' },
    { id: 'settings', label: '⚙️ Cài đặt' },
    ...(user?.role === 'admin' ? [{ id: 'directory', label: '👥 Quản lý người dùng' }] : []),
  ];

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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
      // Header
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
          h(
            'div',
            { style: { fontWeight: '800', fontSize: '20px', color: '#0f172a' } },
            'Tài Khoản & Cài Đặt',
          ),
          h(
            'div',
            { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
            `${user?.name || 'User'} (@${user?.username || ''})`,
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
              fontSize: '22px',
              color: '#64748b',
              cursor: 'pointer',
              lineHeight: 1,
            },
          },
          '×',
        ),
      ),
      // Tabs Navigation
      h(
        'div',
        {
          style: {
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            padding: '0 16px',
            gap: '8px',
          },
        },
        tabs.map((tab) =>
          h(
            'button',
            {
              key: tab.id,
              type: 'button',
              id: `modal-tab-${tab.id}`,
              onClick: () => setActiveTab(tab.id),
              style: {
                padding: '13px 18px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#1d4ed8' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '14px',
                background: 'transparent',
                cursor: 'pointer',
              },
            },
            tab.label,
          ),
        ),
      ),
      // Tab Content
      h(
        'div',
        { style: { padding: '24px', overflowY: 'auto', flex: 1 } },
        activeTab === 'profile' &&
          h(ProfileDetailsTab, {
            user,
            roleColor,
            onLogout: handleLogout,
            onGoToSettings: () => setActiveTab('settings'),
          }),
        activeTab === 'settings' &&
          h(UserSettingsTab, {
            user,
            onUpdateProfile: updateProfile,
            onChangePassword: changePassword,
            onSuccess: () => {},
          }),
        activeTab === 'security' &&
          h(ChangePasswordTab, {
            onChangePassword: changePassword,
            onSuccess: () => setActiveTab('profile'),
          }),
        activeTab === 'directory' &&
          user?.role === 'admin' &&
          h(AdminDirectoryTab, { usersList, loadingUsers }),
      ),
    ),
  );
}
