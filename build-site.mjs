import { cp, mkdir, readdir } from 'node:fs/promises';

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
const pages = (await readdir(new URL('./', import.meta.url))).filter((filename) => filename.endsWith('.html'));
for (const filename of [...pages, 'styles.css', 'app.js', 'config.js', 'contact.js', 'assets']) {
  await cp(new URL(filename, import.meta.url), new URL(`dist/${filename}`, import.meta.url), { recursive: true });
}
console.log('Built public website files in dist/.');
