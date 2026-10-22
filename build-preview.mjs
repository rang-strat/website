import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const styles = await readFile(join(root, 'styles.css'), 'utf8');
const config = (await readFile(join(root, 'config.js'), 'utf8')).replace('export const', 'const');
const app = (await readFile(join(root, 'app.js'), 'utf8')).replace(/^import .*?;\s*/, '');
const contact = await readFile(join(root, 'contact.js'), 'utf8');
await mkdir(join(root, 'review'), { recursive: true });
const pages = (await readdir(root)).filter((filename) => filename.endsWith('.html'));
const assets = await Promise.all(['logo.png', 'logo-cream.png', 'favicon.png', 'icon.png'].map(async (filename) => {
  const encoded = (await readFile(join(root, 'assets', filename))).toString('base64');
  return [filename, `data:image/png;base64,${encoded}`];
}));

for (const filename of pages) {
  let html = await readFile(join(root, filename), 'utf8');
  html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${styles}</style>`);
  html = html.replace('<script type="module" src="app.js"></script>', '');
  const hasContactForm = html.includes('<script type="module" src="contact.js"></script>');
  html = html.replace('<script type="module" src="contact.js"></script>', '');
  html = html.replace('</body>', () => `<script>${config}\n${app}</script></body>`);
  if (hasContactForm) html = html.replace('</body>', () => `<script>${contact}</script></body>`);
  html = html.replaceAll('href="index.html', 'href="homepage.html');
  for (const [asset, dataUrl] of assets) {
    html = html.replaceAll(`assets/${asset}`, dataUrl);
  }
  const output = filename === 'index.html' ? 'homepage.html' : filename;
  await writeFile(join(root, 'review', output), html);
}
console.log(`Built ${pages.length} linked review pages. Open ${join(root, 'review', 'homepage.html')}`);
