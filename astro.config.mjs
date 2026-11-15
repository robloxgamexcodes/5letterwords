import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// List pages with fewer than MIN_WORDS words are rendered with noindex (see [...slug].astro),
// so they are also left out of the sitemap.
const MIN_WORDS = 5;
const words = {};
for (const len of [3, 4, 5, 6, 7]) {
  const raw = JSON.parse(readFileSync(new URL(`./src/data/generated/words-${len}.json`, import.meta.url), 'utf8'));
  words[len] = raw.w.split(' ');
}
const LIST_RE = /\/(\d)-letter-words-(that-start-with|that-end-with|containing)-([a-z]+)$/;
const isThinList = (url) => {
  const m = url.match(LIST_RE);
  if (!m) return false;
  const [, len, kind, v] = m;
  const list = words[len] || [];
  const n = list.filter((w) => (kind === 'that-start-with' ? w.startsWith(v) : kind === 'that-end-with' ? w.endsWith(v) : w.includes(v))).length;
  return n < MIN_WORDS;
};

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://example.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
  integrations: [react(), sitemap({ filter: (page) => !isThinList(page) })],
});
