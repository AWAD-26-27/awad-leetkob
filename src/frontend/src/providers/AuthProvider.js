import { h, createContext, useContext, useState } from '../lib/react.js';
import { DEMO_USERS } from '../config/constants.js';
import { setAuthToken } from '../lib/apiClient.js';

export const AuthContext = createContext({
  user: DEMO_USERS[1], // Default: TA Alice (ta_a)
  role: 'ta',
  classId: 1,
  token: 'tok-ta-a',
  switchUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_USERS[1]);

  const switchUser = (username) => {
    const found = DEMO_USERS.find((u) => u.username === username);
    if (found) {
      setUser(found);
      setAuthToken(found.token);
    }
  };

  const value = {
    user,
    role: user.role,
    classId: user.classId,
    token: user.token,
    switchUser,
  };

  return h(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
