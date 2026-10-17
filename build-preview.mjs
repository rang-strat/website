import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
let html = await readFile(join(root, 'index.html'), 'utf8');
const styles = await readFile(join(root, 'styles.css'), 'utf8');
const config = (await readFile(join(root, 'config.js'), 'utf8')).replace('export const', 'const');
const app = (await readFile(join(root, 'app.js'), 'utf8')).replace(/^import .*?;\s*/, '');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${styles}</style>`);
html = html.replace('<script type="module" src="app.js"></script>', '');
html = html.replace('</body>', () => `<script>${config}\n${app}</script></body>`);
for (const filename of ['logo.png', 'logo-cream.png', 'favicon.png', 'icon.png']) {
  const encoded = (await readFile(join(root, 'assets', filename))).toString('base64');
  html = html.replaceAll(`assets/${filename}`, `data:image/png;base64,${encoded}`);
}
await mkdir(join(root, 'review'), { recursive: true });
await writeFile(join(root, 'review', 'homepage.html'), html);
console.log(join(root, 'review', 'homepage.html'));
