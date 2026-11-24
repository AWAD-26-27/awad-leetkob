import { randomUUID } from 'node:crypto';

/**
 * Applies enterprise security headers and request-id tracing.
 * Follows OWASP Secure Headers guidelines.
 */
export function applySecurityHeaders(req, res) {
  // 1. Request ID Tracing (Correlation ID)
  const incomingId = req.headers['x-request-id'];
  const reqId =
    typeof incomingId === 'string' && incomingId.trim() ? incomingId.trim() : randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  // 2. OWASP Secure Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}
