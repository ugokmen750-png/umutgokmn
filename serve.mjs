// Yerel önizleme: node serve.mjs → http://localhost:5181
// public/ klasörünü temiz URL'lerle sunar (/kirikkale-mezar-yapimi/ → index.html).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { base } from './src/config.mjs';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const PORT = Number(process.env.PORT) || 5181;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
};

createServer(async (req, res) => {
  let path = new URL(req.url, 'http://x').pathname;
  // GitHub Pages alt klasörünü taklit et: /hasbey-mermer/… → public/…
  if (base) {
    if (path === '/' || path === base) { res.writeHead(302, { Location: base + '/' }).end(); return; }
    if (path.startsWith(base + '/')) path = path.slice(base.length);
  }
  let rel = normalize(decodeURIComponent(path)).replace(/^[/\\]+/, '');
  if (rel.split(sep).includes('..')) { res.writeHead(403).end(); return; }
  let file = join(root, rel);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    const hdr = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
    // video için Range (GitHub Pages gibi): tarayıcı parça parça ister
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m) {
      const start = m[1] ? Number(m[1]) : Math.max(0, body.length - Number(m[2]));
      const end = m[1] && m[2] ? Math.min(Number(m[2]), body.length - 1) : body.length - 1;
      if (start >= body.length || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${body.length}` }).end(); return; }
      res.writeHead(206, { ...hdr, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Content-Length': end - start + 1 });
      res.end(body.subarray(start, end + 1)); return;
    }
    res.writeHead(200, hdr);
    res.end(body);
  } catch {
    const body = await readFile(join(root, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
