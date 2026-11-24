import { useAuth } from '../../../providers/AuthProvider.js';

export function useCurrentUser() {
  const { user, isAuthenticated, logout } = useAuth();

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'ta',
    isStudent: user?.role === 'student',
    classId: user?.classId ?? null,
    logout,
  };
}
