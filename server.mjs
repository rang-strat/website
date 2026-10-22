import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContactHandler } from './lib/contact.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'dist');
const contactHandler = createContactHandler();
const port = Number(process.env.PORT || 4173);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/api/contact') {
      const chunks = [];
      let size = 0;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 16384) {
          response.writeHead(413, { 'Content-Type': 'application/json' }).end(JSON.stringify({ success: false, message: 'Your message is too long.' }));
          return;
        }
        chunks.push(chunk);
      }
      const apiRequest = new Request(`http://127.0.0.1:${port}/api/contact`, {
        method: request.method, headers: request.headers,
        ...(request.method === 'GET' || request.method === 'HEAD' ? {} : { body: Buffer.concat(chunks) }),
      });
      const result = await contactHandler(apiRequest);
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(await result.text());
      return;
    }
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = resolve(root, relativePath);
    if (!filePath.startsWith(root + sep) || !contentTypes[extname(filePath)]) {
      response.writeHead(404).end('Not found');
      return;
    }
    if (!(await stat(filePath)).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)],
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(await readFile(filePath));
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Rang Strategies preview: http://127.0.0.1:${port}`);
});
