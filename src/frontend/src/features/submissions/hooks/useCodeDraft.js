import { useState, useEffect, useRef } from '../../../lib/react.js';

const STORAGE_PREFIX = 'leetkob_code_draft_';

/**
 * Custom hook to automatically save and restore student code drafts in localStorage.
 * @param {string|number} labId Identifier of the lab assignment
 * @param {string} initialCode Default starter code template
 */
export function useCodeDraft(labId = 'default', initialCode = '') {
  const storageKey = `${STORAGE_PREFIX}${labId}`;

  // Retrieve existing draft or fallback to initialCode
  const [draft, setDraft] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(storageKey);
        if (saved && saved.trim()) return saved;
      }
    } catch {
      // LocalStorage access may fail in restricted iframes
    }
    return initialCode;
  });

  const [lastSaved, setLastSaved] = useState(null);
  const timerRef = useRef(null);

  const saveCode = (newCode) => {
    setDraft(newCode);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(storageKey, newCode);
          const now = new Date();
          const timeStr = now.toTimeString().split(' ')[0];
          setLastSaved(timeStr);
        }
      } catch {
        // Fall through
      }
    }, 400);
  };

  const resetDraft = (starterCode) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {}
    setDraft(starterCode);
    setLastSaved(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    draft,
    saveCode,
    lastSaved,
    resetDraft,
  };
}
