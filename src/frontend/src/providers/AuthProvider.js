import { h, createContext, useContext, useState, useEffect } from '../lib/react.js';
import { ALL_USERS, GUEST_USER } from '../config/constants.js';
import { setAuthToken } from '../lib/apiClient.js';
import { loginApi, logoutApi, changePasswordApi, fetchMe } from '../features/auth/api/authApi.js';

export const AuthContext = createContext({
  user: GUEST_USER,
  role: 'guest',
  classId: null,
  token: '',
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  switchUser: () => {},
  changePassword: async () => {},
});

export function AuthProvider({ children }) {
  // Initialize with stored user or fallback to GUEST_USER (default to Landing Page)
  const [user, setUser] = useState(() => {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
        const stored = globalThis.sessionStorage.getItem('leetkob_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.token && parsed.role !== 'guest') {
            setAuthToken(parsed.token);
            return parsed;
          }
        }
      }
    } catch {
      // Storage access disabled or unavailable
    }
    // Default fallback to GUEST_USER (Landing Page)
    setAuthToken('');
    return GUEST_USER;
  });

  // Verify and rehydrate token with GET /api/me on boot
  useEffect(() => {
    if (user && user.token && user.role !== 'guest') {
      fetchMe()
        .then((me) => {
          if (me && me.id) {
            setUser((prev) => ({
              ...prev,
              id: me.id,
              username: me.username,
              name: me.name,
              role: me.role,
              classId: me.classId,
            }));
          }
        })
        .catch(() => {
          // Token invalid or network down, revert to guest
          persistUser(GUEST_USER);
        });
    }
  }, []);

  const persistUser = (newUser) => {
    setUser(newUser);
    if (newUser && newUser.token && newUser.role !== 'guest') {
      setAuthToken(newUser.token);
      try {
        if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
          globalThis.sessionStorage.setItem('leetkob_user', JSON.stringify(newUser));
        }
      } catch {
        // Storage unavailable
      }
    } else {
      setAuthToken('');
      try {
        if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
          globalThis.sessionStorage.removeItem('leetkob_user');
        }
      } catch {
        // Storage unavailable
      }
    }
  };

  const login = async (username, password) => {
    const res = await loginApi(username, password);
    if (res && res.token && res.user) {
      const fullUser = {
        ...res.user,
        token: res.token,
      };
      persistUser(fullUser);
      return fullUser;
    }
    throw new Error('Invalid login response');
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Best-effort logout
    }
    persistUser(GUEST_USER);
  };

  const switchUser = (username) => {
    if (!username || username === 'guest') {
      persistUser(GUEST_USER);
      return;
    }

    const found = ALL_USERS.find((u) => u.username === username);
    if (found) {
      persistUser(found);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    return changePasswordApi(currentPassword, newPassword);
  };

  const value = {
    user,
    role: user.role,
    classId: user.classId,
    token: user.token,
    isAuthenticated: user.role !== 'guest' && Boolean(user.token),
    login,
    logout,
    switchUser,
    changePassword,
  };

  return h(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
