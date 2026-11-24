import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { problem, rfc7807ErrorHandler } from './middleware/rfc7807.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createAuthRouter } from './features/auth/router.js';
import { createClassRouter } from './features/classes/router.js';
import { createLabRouter } from './features/labs/router.js';
import { createSubmissionRouter } from './features/submissions/router.js';
import { createReviewRouter } from './features/reviews/router.js';

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

export async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
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

  // Combine all route descriptors from feature subsystems
  const allRoutes = [
    ...authModule.router.routes,
    ...classModule.router.routes,
    ...labModule.router.routes,
    ...subModule.router.routes,
    ...revModule.router.routes,
  ];

  async function handle(req, res) {
    const url = new URL(req.url, 'http://x');
    const pathname = url.pathname;

    // Attach parsed query parameters
    req.query = Object.fromEntries(url.searchParams.entries());

    // 1. Serve root page
    if (['GET', 'HEAD'].includes(req.method) && (pathname === '/' || pathname === '')) {
      const pageHtml = existsSync(HTML_PATH) ? readFileSync(HTML_PATH, 'utf8') : PAGE;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(req.method === 'HEAD' ? '' : pageHtml);
    }

    // 2. Serve static files from public/ or src/frontend/ if requested
    if (['GET', 'HEAD'].includes(req.method) && !pathname.startsWith('/api/')) {
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
      req.body = await readJson(req);
      if (req.body === null) {
        return problem(res, 400, 'invalid-body', 'Malformed JSON in request body');
      }
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
          req.params[route.paramNames[i]] = match[i + 1];
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
