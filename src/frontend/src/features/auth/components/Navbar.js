import { h, useState, Fragment } from '../../../lib/react.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { LoginModal } from './LoginModal.js';
import { AccountProfileModal } from './AccountProfileModal.js';
import { NavbarBrand } from './NavbarBrand.js';
import { UserMenu } from './UserMenu.js';
import { PlaywrightUserSelector } from './PlaywrightUserSelector.js';

export function Navbar({ onOpenLogin } = {}) {
  const { user, switchUser, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');

  const handleOpenLogin = () => {
    if (onOpenLogin) onOpenLogin();
    else setShowLoginModal(true);
  };

  const handleOpenProfile = (tab = 'profile') => {
    setProfileModalTab(tab || 'profile');
    setShowProfileModal(true);
  };

  const isGuest = !isAuthenticated || user.role === 'guest';
  const roleLabel =
    user.role === 'admin'
      ? 'Quản trị viên'
      : user.role === 'ta'
        ? 'Giảng viên'
        : user.role === 'student'
          ? 'Sinh viên'
          : 'Khách';

  const roleColor =
    user.role === 'admin'
      ? '#8b5cf6'
      : user.role === 'ta'
        ? '#3b82f6'
        : user.role === 'student'
          ? '#10b981'
          : '#64748b';

  const roleBadgeBg =
    user.role === 'admin'
      ? '#f5f3ff'
      : user.role === 'ta'
        ? '#eff6ff'
        : user.role === 'student'
          ? '#ecfdf5'
          : '#f1f5f9';

  return h(
    Fragment,
    null,
    h(
      'header',
      {
        className: 'navbar-glassmorphism',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '12px 32px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        },
      },
      h(NavbarBrand, null),
      h(UserMenu, {
        user,
        isGuest,
        roleLabel,
        roleColor,
        roleBadgeBg,
        onOpenLogin: handleOpenLogin,
        onOpenProfile: handleOpenProfile,
        onLogout: logout,
      }),
      h(PlaywrightUserSelector, {
        currentUsername: user.username,
        onSelect: (e) => switchUser(e.target.value),
      }),
    ),
    h(LoginModal, {
      isOpen: showLoginModal,
      onClose: () => setShowLoginModal(false),
    }),
    h(AccountProfileModal, {
      isOpen: showProfileModal,
      initialTab: profileModalTab,
      onClose: () => setShowProfileModal(false),
    }),
  );
}

export { Navbar as UserSelectorBar };
