const STORAGE_KEY = 'leetkob_saved_accounts';

/**
 * Retrieve saved accounts that have previously logged in using password.
 * @returns {Array<Object>}
 */
export function getSavedAccounts() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const raw = globalThis.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // Storage access disabled or unavailable
  }
  return [];
}

/**
 * Save an authenticated account to local storage. Never stores passwords.
 * @param {Object} userWithToken
 * @returns {Array<Object>}
 */
export function saveAccount(userWithToken) {
  if (!userWithToken || !userWithToken.username || !userWithToken.token) return [];
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const existing = getSavedAccounts().filter((a) => a.username !== userWithToken.username);
      const entry = {
        id: userWithToken.id,
        username: userWithToken.username,
        name: userWithToken.name || userWithToken.username,
        role: userWithToken.role,
        classId: userWithToken.classId,
        token: userWithToken.token,
        lastLoginAt: Date.now(),
      };
      const updated = [entry, ...existing].slice(0, 5);
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch {
    // Storage unavailable
  }
  return [];
}

/**
 * Remove an account from remembered accounts on this device.
 * @param {string} username
 * @returns {Array<Object>}
 */
export function removeSavedAccount(username) {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const updated = getSavedAccounts().filter((a) => a.username !== username);
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch {
    // Storage unavailable
  }
  return [];
}
