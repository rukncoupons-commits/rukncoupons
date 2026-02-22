'use strict';

const dataService = require('../services/data.service');
const { SITE_URL } = require('../services/seo.service');

const VALID_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

async function getSitemap(req, res, next) {
    try {
        const [stores, blogPosts, countries] = await Promise.all([
            dataService.getStores(),
            dataService.getBlogPosts(),
            dataService.getCountries(),
        ]);

        const publishedPosts = blogPosts.filter(p => p.status === 'published');
        const urls = [];

        // Country home pages
        VALID_COUNTRIES.forEach(code => {
            urls.push({ loc: `${SITE_URL}/${code}`, priority: '1.0', changefreq: 'daily' });
            urls.push({ loc: `${SITE_URL}/${code}/stores`, priority: '0.8', changefreq: 'weekly' });
            urls.push({ loc: `${SITE_URL}/${code}/coupons`, priority: '0.8', changefreq: 'daily' });
            urls.push({ loc: `${SITE_URL}/${code}/blog`, priority: '0.7', changefreq: 'weekly' });
        });

        // Store pages (per country)
        stores.forEach(store => {
            if (!Array.isArray(store.countryCodes)) return;
            store.countryCodes.forEach(code => {
                if (!VALID_COUNTRIES.includes(code)) return;
                urls.push({
                    loc: `${SITE_URL}/${code}/${store.slug}`,
                    priority: '0.9',
                    changefreq: 'daily',
                });
            });
        });

        // Blog post pages (per country)
        publishedPosts.forEach(post => {
            const codes = Array.isArray(post.countryCodes) && post.countryCodes.length > 0
                ? post.countryCodes
                : VALID_COUNTRIES;
            codes.forEach(code => {
                if (!VALID_COUNTRIES.includes(code)) return;
                urls.push({
                    loc: `${SITE_URL}/${code}/blog/${post.slug}`,
                    priority: '0.7',
                    changefreq: 'monthly',
                    lastmod: post.updatedAt || post.date || '',
                });
            });
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (err) {
        console.error('[SitemapController]', err);
        next(err);
    }
}

function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

module.exports = { getSitemap };
