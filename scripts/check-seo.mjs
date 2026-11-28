// Post-build SEO guard. Fails the build if a page ships with a placeholder domain, wrong canonical,
// missing/duplicate title or description, bad robots.txt or sitemap host, etc.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const SITE = (process.env.PUBLIC_SITE_URL || 'https://5letterwords.se').replace(/\/+$/, '');
const BAD_HOSTS = ['example.com', '5letter-words.io', 'localhost'];
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);

const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist);
// Google Search Console verification files (googleXXXX.html) are bare text files, not real pages
const isVerificationFile = (f) => /^google[a-z0-9]+\.html$/i.test(basename(f));
const html = files.filter((f) => f.endsWith('.html') && !isVerificationFile(f));
const titles = new Map();
const descs = new Map();
const attr = (src, re) => (src.match(re) || [])[1];

for (const f of html) {
  const rel = relative(dist, f);
  const src = readFileSync(f, 'utf8');
  const title = attr(src, /<title>([^<]*)<\/title>/);
  const desc = attr(src, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(src, /<link rel="canonical" href="([^"]*)"/);
  const robots = attr(src, /<meta name="robots" content="([^"]*)"/) || '';
  const noindex = /noindex/.test(robots);
  for (const h of BAD_HOSTS) if (src.includes(h)) err(rel, `contains "${h}"`);
  if (!title) err(rel, 'missing <title>');
  else {
    if (title.length > 65) err(rel, `title too long (${title.length}): ${title}`);
    if (title.length < 25) warnings.push(`${rel}: short title (${title.length})`);
    if (!noindex) { if (titles.has(title)) err(rel, `duplicate title also on ${titles.get(title)}`); titles.set(title, rel); }
  }
  if (!desc) err(rel, 'missing meta description');
  else {
    if (desc.length > 165) err(rel, `description too long (${desc.length})`);
    if (desc.length < 70) err(rel, `description too short (${desc.length})`);
    if (!noindex) { if (descs.has(desc)) err(rel, `duplicate description also on ${descs.get(desc)}`); descs.set(desc, rel); }
  }
  if (!canonical) err(rel, 'missing canonical');
  else if (!canonical.startsWith(SITE)) err(rel, `canonical off-site: ${canonical}`);
  else if (!noindex && !rel.startsWith('404')) {
    const expected = rel === 'index.html' ? `${SITE}/` : `${SITE}/${rel.replace(/\.html$/, '')}`;
    if (canonical !== expected) err(rel, `canonical ${canonical} != ${expected}`);
  }
  if ((src.match(/<h1[\s>]/g) || []).length !== 1) err(rel, 'page must have exactly one <h1>');
  for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { err(rel, 'invalid JSON-LD'); }
  }
  if (!noindex && !/og:image" content="[^"]+"/.test(src)) err(rel, 'missing og:image');
}

const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) err('robots.txt', `must contain "Sitemap: ${SITE}/sitemap-index.xml" (got: ${robots.trim().replace(/\n/g, ' | ')})`);

const sitemaps = files.filter((f) => /sitemap-\d+\.xml$/.test(f));
if (!sitemaps.length) err('sitemap', 'no sitemap-N.xml generated');
let urls = 0;
for (const f of sitemaps) {
  const xml = readFileSync(f, 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    urls++;
    if (!m[1].startsWith(SITE)) err(relative(dist, f), `off-site URL ${m[1]}`);
    if (/\/404/.test(m[1])) err(relative(dist, f), `404 listed: ${m[1]}`);
  }
}
const indexable = html.filter((f) => !/noindex/.test(readFileSync(f, 'utf8').match(/<meta name="robots" content="([^"]*)"/)?.[1] || '') && !f.endsWith('404.html'));
if (urls !== indexable.length) warnings.push(`sitemap lists ${urls} URLs but ${indexable.length} pages are indexable`);

console.log(`[check-seo] ${html.length} pages, ${urls} sitemap URLs, ${warnings.length} warnings, ${errors.length} errors`);
warnings.slice(0, 10).forEach((w) => console.log('  warn', w));
if (errors.length) {
  errors.slice(0, 40).forEach((e) => console.error('  ERROR', e));
  if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
  process.exit(1);
}
