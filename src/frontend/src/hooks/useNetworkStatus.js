import { useState, useEffect } from '../lib/react.js';

/**
 * Hook to monitor online/offline network connectivity.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof window !== 'undefined' && typeof window.navigator?.onLine === 'boolean'
      ? window.navigator.onLine
      : true;
  });

  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setReconnected(true);
      const timer = setTimeout(() => setReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, reconnected };
}
