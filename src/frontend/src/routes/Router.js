// Client-side Hash Router for LeeTKOB PA3 SPA
// Supports bidirectional synchronization between URL hash, application views, and browser history.
import { useState, useEffect } from '../lib/react.js';

export function parseHash(hashStr) {
  const clean = (hashStr || '').replace(/^#\/?/, '').trim();
  if (!clean || clean === '/') {
    return { path: '/', params: {} };
  }

  const parts = clean.split('/').filter(Boolean);
  const route = parts[0];

  // #/labs or #/labs/:labId
  if (route === 'labs') {
    if (parts[1]) {
      const labId = parseInt(parts[1], 10);
      return { path: '/labs/:labId', params: { labId: isNaN(labId) ? null : labId } };
    }
    return { path: '/labs', params: {} };
  }

  // #/admin or #/admin/labs or #/admin/classes
  if (route === 'admin') {
    const sub = parts[1] || 'admin';
    return { path: `/admin/${sub}`, params: { mode: sub === 'labs' ? 'labs' : 'admin' } };
  }

  // #/classes or #/classes/:classId
  if (route === 'classes') {
    if (parts[1]) {
      const classId = parseInt(parts[1], 10);
      return { path: '/classes/:classId', params: { classId: isNaN(classId) ? null : classId } };
    }
    return { path: '/classes', params: {} };
  }

  // #/profile
  if (route === 'profile') {
    return { path: '/profile', params: {} };
  }

  // #/login
  if (route === 'login') {
    return { path: '/login', params: {} };
  }

  return { path: `/${route}`, params: {} };
}

export function formatHash(path, params = {}) {
  if (path === '/' || !path) return '#/';
  if (path === '/labs/:labId' && params.labId) return `#/labs/${params.labId}`;
  if (path === '/labs') return '#/labs';
  if (path.startsWith('/admin')) {
    return params.mode === 'labs' ? '#/admin/labs' : '#/admin';
  }
  if (path === '/classes/:classId' && params.classId) return `#/classes/${params.classId}`;
  if (path === '/classes') return '#/classes';
  if (path === '/profile') return '#/profile';
  if (path === '/login') return '#/login';
  return `#${path}`;
}

export function navigateTo(hash) {
  if (typeof window !== 'undefined') {
    const target = hash.startsWith('#') ? hash : `#${hash}`;
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
  }
}

export function useHashRouter() {
  const [routeInfo, setRouteInfo] = useState(() => {
    if (typeof window === 'undefined') return { path: '/', params: {} };
    return parseHash(window.location.hash);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onHashChange = () => {
      setRouteInfo(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return {
    path: routeInfo.path,
    params: routeInfo.params,
    navigate: navigateTo,
  };
}
