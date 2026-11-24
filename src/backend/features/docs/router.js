import { createRouter } from '../../lib/router.js';
import { openApiSpec } from './openapi-spec.js';

export function createDocsRouter() {
  const router = createRouter();

  // 1. Serve OpenAPI 3.1 JSON specification
  const serveSpec = (req, res) => {
    res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    });
    return res.end(JSON.stringify(openApiSpec, null, 2));
  };
  router.get('/api/openapi.json', serveSpec);
  router.get('/openapi.json', serveSpec);

  // 2. Serve interactive API documentation (Scalar API Reference)
  const serveDocs = (req, res) => {
    const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LeeTKOB PA3 — Tài Liệu API & OpenAPI 3.1</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>⚡</text></svg>" />
    <style>
      body { margin: 0; padding: 0; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api/openapi.json"
      data-proxy-url="https://proxy.scalar.com"
      data-theme="purple"
      src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(html);
  };
  router.get('/api/docs', serveDocs);
  router.get('/docs', serveDocs);

  return { router, spec: openApiSpec };
}
