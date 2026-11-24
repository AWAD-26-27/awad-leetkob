import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { problem, rfc7807ErrorHandler } from './middleware/rfc7807.js';
import { applySecurityHeaders } from './middleware/security.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createAuthRouter } from './features/auth/router.js';
import { createClassRouter } from './features/classes/router.js';
import { createLabRouter } from './features/labs/router.js';
import { createSubmissionRouter } from './features/submissions/router.js';
import { createReviewRouter } from './features/reviews/router.js';
import { createDocsRouter } from './features/docs/router.js';

const HTML_PATH = new URL('../../public/index.html', import.meta.url);
const PAGE = existsSync(HTML_PATH)
  ? readFileSync(HTML_PATH, 'utf8')
  : '<!doctype html><html><body>LeeTKOB</body></html>';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

export async function readJson(req, limit = 1024 * 1024) {
  let raw = '';
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > limit) {
      return { __error: 'payload-too-large' };
    }
    raw += chunk;
  }
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createApp(db) {
  const authMiddleware = createAuthMiddleware(db);
  const authModule = createAuthRouter(db, authMiddleware);
  const classModule = createClassRouter(db, authMiddleware);
  const labModule = createLabRouter(db, authMiddleware);
  const subModule = createSubmissionRouter(db, labModule.labModel, authMiddleware);
  const revModule = createReviewRouter(
    db,
    labModule.labModel,
    subModule.submissionModel,
    authMiddleware,
  );
  const docsModule = createDocsRouter();

  // Combine all route descriptors from feature subsystems
  const allRoutes = [
    ...authModule.router.routes,
    ...classModule.router.routes,
    ...labModule.router.routes,
    ...subModule.router.routes,
    ...revModule.router.routes,
    ...docsModule.router.routes,
  ];

  async function handle(req, res) {
    // 0. Apply security headers & Request-ID tracing
    applySecurityHeaders(req, res);

    const url = new URL(req.url, 'http://x');
    const pathname = url.pathname;

    // Attach parsed query parameters
    req.query = Object.fromEntries(url.searchParams.entries());

    // 0.1 Health check probe
    if (['GET', 'HEAD'].includes(req.method) && (pathname === '/api/health' || pathname === '/healthz' || pathname === '/health')) {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          connected: Boolean(db),
          mode: 'WAL',
        },
      };
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(health));
    }

    // 1. Serve root page & SPA client route navigation fallback
    const isSpaRoute =
      ['GET', 'HEAD'].includes(req.method) &&
      !pathname.startsWith('/api/') &&
      !extname(pathname) &&
      (pathname === '/' ||
        pathname === '' ||
        ['/labs', '/admin', '/classes', '/profile', '/login'].some(
          (r) => pathname === r || pathname.startsWith(r + '/'),
        ));

    if (isSpaRoute) {
      const pageHtml = existsSync(HTML_PATH) ? readFileSync(HTML_PATH, 'utf8') : PAGE;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(req.method === 'HEAD' ? '' : pageHtml);
    }

    // 2. Serve static files from public/ or src/frontend/ if requested
    if (['GET', 'HEAD'].includes(req.method) && !pathname.startsWith('/api/')) {
      if (pathname.includes('..')) {
        return problem(res, 403, 'forbidden', 'Path traversal is forbidden');
      }
      let filePath = join(process.cwd(), 'public', pathname);
      if (!existsSync(filePath)) {
        filePath = join(process.cwd(), pathname);
      }
      if (existsSync(filePath) && !filePath.includes('.env')) {
        try {
          if (statSync(filePath).isFile()) {
            const ext = extname(filePath).toLowerCase();
            const mime = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'content-type': mime });
            return res.end(req.method === 'HEAD' ? '' : readFileSync(filePath));
          }
        } catch {
          // Fall through if file cannot be read
        }
      }
    }

    // 3. Parse request body for mutations
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const parsed = await readJson(req);
      if (parsed && parsed.__error === 'payload-too-large') {
        return problem(res, 413, 'payload-too-large', 'Request payload exceeds 1MB limit');
      }
      if (parsed === null) {
        return problem(res, 400, 'invalid-body', 'Malformed JSON in request body');
      }
      req.body = parsed;
    } else {
      req.body = {};
    }

    // 4. Match against feature subsystem routes
    for (const route of allRoutes) {
      if (route.method !== 'ALL' && route.method !== req.method) {
        continue;
      }

      const match = route.regex.exec(pathname);
      if (match) {
        req.params = {};
        for (let i = 0; i < route.paramNames.length; i++) {
          try {
            req.params[route.paramNames[i]] = decodeURIComponent(match[i + 1]);
          } catch {
            req.params[route.paramNames[i]] = match[i + 1];
          }
        }

        // Execute handler chain (e.g. authMiddleware -> controller)
        for (const handler of route.handlers) {
          let nextCalled = false;
          const next = () => {
            nextCalled = true;
          };

          await handler(req, res, next);
          if (res.headersSent) {
            return;
          }
          if (!nextCalled) {
            return;
          }
        }
        return;
      }
    }

    // Unmatched API route returns 404 Problem Details
    return problem(res, 404, 'not-found', 'No such route');
  }

  const server = createServer((req, res) =>
    handle(req, res).catch((err) => {
      rfc7807ErrorHandler(err, req, res);
    }),
  );

  server.db = db;
  return server;
}
