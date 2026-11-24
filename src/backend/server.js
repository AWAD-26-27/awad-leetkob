import { open, USERS } from './db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3007);
const host = process.env.HOST || '127.0.0.1';

const db = open();
const app = createApp(db);

const server = app.listen(port, host, () => {
  console.log(`LeeTKOB server running on http://${host}:${port}`);
  console.log('Demo tokens: ' + USERS.map((u) => `${u.username}=${u.token}`).join('  '));
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => {
      try {
        db?.close?.();
      } catch {}
      process.exit(0);
    });
  });
}
