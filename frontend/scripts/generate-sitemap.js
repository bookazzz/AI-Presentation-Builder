#!/usr/bin/env node
/**
 * Generate sitemap.xml for GitHub Pages deployment.
 * Run after npm run build.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://bookazzz.github.io/AI-Presentation-Builder';
const OUT = path.join(__dirname, '..', 'out');

const publicPages = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'create', priority: '0.9', changefreq: 'monthly' },
  { path: 'login', priority: '0.3', changefreq: 'monthly' },
  { path: 'register', priority: '0.5', changefreq: 'monthly' },
  { path: 'presentation-demo', priority: '0.7', changefreq: 'monthly' },
];

const today = new Date().toISOString().split('T')[0];

const urls = publicPages.map(p => `  <url>
    <loc>${BASE}/${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

const dest = path.join(OUT, 'sitemap.xml');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, sitemap, 'utf-8');
console.log(`sitemap.xml generated (${publicPages.length} URLs)`);
