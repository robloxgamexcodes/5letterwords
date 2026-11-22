import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Lists with fewer than MIN_WORDS words (see src/lib/words.ts) are not generated at all, so no sitemap filter is needed.

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://5letterwords.se',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
    // lastmod = build time; 404 and any noindex page are never listed.
    sitemap({ lastmod: new Date(), filter: (page) => !/\/404(\.html)?\/?$/.test(page) }),
  ],
});
