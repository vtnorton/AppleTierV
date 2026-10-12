import path from 'node:path';

const PORT = Number(process.env.PORT ?? 4173);
const ROOT = path.join(import.meta.dir, '..');

Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname === '/' ? '/series.html' : url.pathname;
    const file = Bun.file(path.join(ROOT, pathname));
    if (!(await file.exists())) {
      return new Response('Not found', { status: 404 });
    }
    return new Response(file);
  },
});

console.log(`appletv-tierlist dev server: http://localhost:${PORT}`);
