// Serves dist/ the way Vercel will, so the pages can be looked at locally: /pro answers with
// pro.html and /ru/ with ru/index.html. Never deployed. Localhost only, GET and HEAD only, and never
// a file outside dist/. Run `npm run build` first; files are read on every request, so a rebuild
// shows up on the next reload.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 5190;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const isFile = (path) => stat(path).then((s) => s.isFile(), () => false);

async function locate(pathname) {
  let clean;
  try {
    clean = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '');
  } catch {
    return null; // a malformed %-escape
  }
  const base = join(DIST, clean);
  if (base !== DIST && !base.startsWith(DIST + sep)) return null;
  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

http
  .createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end();
      return;
    }
    const file = await locate(new URL(req.url, 'http://localhost').pathname);
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : await readFile(file));
  })
  .listen(PORT, '127.0.0.1', () => console.log(`http://localhost:${PORT}`));
