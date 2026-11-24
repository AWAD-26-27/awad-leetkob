// Unified API client with automatic Bearer token injection and RFC 7807 Problem Details parsing

let authToken = 'tok-ta-a'; // Default to TA Alice

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export class ApiError extends Error {
  constructor(status, title, detail, data) {
    super(detail || title || `HTTP error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.data = data;
  }
}

export async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json, application/problem+json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  if (
    options.body &&
    typeof options.body === 'object' &&
    !(typeof FormData !== 'undefined' && options.body instanceof FormData)
  ) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const title = data?.title || res.statusText || 'Error';
    const detail = data?.detail || data?.title || 'An unexpected error occurred';
    throw new ApiError(res.status, title, detail, data);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
