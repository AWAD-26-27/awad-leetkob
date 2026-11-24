import { h, useState } from '../../../lib/react.js';
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

  const handleOpenLogin = () => {
    if (onOpenLogin) onOpenLogin();
    else setShowLoginModal(true);
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
    'header',
    {
      className: 'navbar-glassmorphism',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '14px 28px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.04)',
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
      onOpenProfile: () => setShowProfileModal(true),
      onLogout: logout,
    }),
    h(PlaywrightUserSelector, {
      currentUsername: user.username,
      onSelect: (e) => switchUser(e.target.value),
    }),
    h(LoginModal, {
      isOpen: showLoginModal,
      onClose: () => setShowLoginModal(false),
    }),
    h(AccountProfileModal, {
      isOpen: showProfileModal,
      onClose: () => setShowProfileModal(false),
    }),
  );
}

export { Navbar as UserSelectorBar };
