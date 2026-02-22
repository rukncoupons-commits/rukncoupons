'use strict';

const dataService = require('../services/data.service');
const { buildMeta, buildHreflangTags, SITE_URL } = require('../services/seo.service');
const { generateBlogPostingSchema, generateFAQSchema, generateBreadcrumbSchema, buildJsonLd } = require('../services/schema.service');
const { processContent, mergeRelatedCoupons } = require('../services/auto-link.service');

const VALID_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

async function getBlogList(req, res, next) {
    try {
        const countryCode = req.params.country;
        if (!VALID_COUNTRIES.includes(countryCode)) return res.redirect(301, '/sa/blog');

        const [countries, country, blogPosts, categories, adBanners, trackingConfig, socialConfig] = await Promise.all([
            dataService.getCountries(),
            dataService.getCountries().then(cs => cs.find(c => c.code === countryCode)),
            dataService.getBlogPostsForCountry(countryCode),
            dataService.getCategories(),
            dataService.getAdBannersForCountry(countryCode),
            dataService.getTrackingConfig(),
            dataService.getSocialConfig(),
        ]);

        const countryName = country?.name || '';
        const meta = buildMeta({
            title: `مدونة ركن الكوبونات - مقالات وأدلة التسوق في ${countryName}`,
            description: `اقرأ أحدث مقالات التسوق الذكي، أدلة الخصومات، ومقارنات المتاجر في ${countryName}.`,
            canonical: `${SITE_URL}/${countryCode}/blog`,
        });

        const hreflangTags = buildHreflangTags(countries, `/${countryCode}/blog`);
        const blogCategories = categories.filter(c => c.type === 'blog');

        res.render('pages/blog-list', {
            title: meta.title,
            meta,
            jsonLd: null,
            hreflangTags,
            trackingConfig,
            socialConfig,
            countryCode,
            countries,
            country,
            blogPosts,
            blogCategories,
            adBanners,
            recentPosts: blogPosts.slice(0, 3),
            SITE_URL,
        });
    } catch (err) {
        console.error('[BlogController.getBlogList]', err);
        next(err);
    }
}

async function getBlogPost(req, res, next) {
    try {
        const countryCode = req.params.country;
        const slug = req.params.slug;
        if (!VALID_COUNTRIES.includes(countryCode)) return res.redirect(301, `/sa/blog/${slug}`);

        const [countries, country, post, allCoupons, stores, categories, adBanners, blogPosts, trackingConfig, socialConfig] = await Promise.all([
            dataService.getCountries(),
            dataService.getCountries().then(cs => cs.find(c => c.code === countryCode)),
            dataService.getPostBySlug(slug),
            dataService.getCouponsForCountry(countryCode),
            dataService.getStoresForCountry(countryCode),
            dataService.getCategories(),
            dataService.getAdBannersForCountry(countryCode),
            dataService.getBlogPostsForCountry(countryCode),
            dataService.getTrackingConfig(),
            dataService.getSocialConfig(),
        ]);

        if (!post || post.status !== 'published') {
            return res.status(404).render('pages/404', {
                title: 'المقال غير موجود | ركن الكوبونات',
                meta: {
                    title: 'المقال غير موجود',
                    description: 'المقال الذي تبحث عنه غير موجود.',
                    canonical: `${SITE_URL}/${countryCode}/blog`,
                    robots: 'noindex, nofollow',
                    ogTitle: 'المقال غير موجود',
                    ogDescription: '',
                    ogImage: '',
                    twitterCard: 'summary',
                },
                jsonLd: null,
                hreflangTags: [],
                trackingConfig,
                socialConfig,
                countryCode,
                countries,
            });
        }

        // Get country-specific SEO
        let seoConfig = post.seo || null;
        if (post.countrySeo && post.countrySeo[countryCode]) {
            seoConfig = post.countrySeo[countryCode];
        }

        const meta = buildMeta({
            title: `${post.title} | ركن الكوبونات`,
            description: post.excerpt,
            canonical: `${SITE_URL}/${countryCode}/blog/${post.slug}`,
            ogImage: post.image,
            seoConfig,
        });

        const hreflangTags = buildHreflangTags(countries, `/${countryCode}/blog/${post.slug}`);

        // Process content: auto-link + TOC extraction
        const { processedHtml, detectedStoreIds, toc } = processContent(
            post.content, post, countryCode, stores
        );

        // Resolve related coupons
        const relatedCoupons = mergeRelatedCoupons(post, detectedStoreIds, allCoupons);

        // Build schema
        const blogSchema = generateBlogPostingSchema(post, countryCode);
        const breadcrumb = generateBreadcrumbSchema([
            { name: 'الرئيسية', url: `${SITE_URL}/${countryCode}` },
            { name: 'المدونة', url: `${SITE_URL}/${countryCode}/blog` },
            { name: post.title, url: `${SITE_URL}/${countryCode}/blog/${post.slug}` },
        ]);
        const schemas = [blogSchema, breadcrumb];
        if (post.faq && post.faq.length > 0) {
            schemas.push(generateFAQSchema(post.faq));
        }
        const jsonLd = buildJsonLd(schemas);

        // Get category name
        const categoryName = categories.find(c => c.slug === post.category)?.name || post.category || '';

        // Build store map for related coupon cards
        const allStores = await dataService.getStores();
        const storeMap = Object.fromEntries(allStores.map(s => [s.id, s]));

        res.render('pages/blog-post', {
            title: meta.title,
            meta,
            jsonLd,
            hreflangTags,
            trackingConfig,
            socialConfig,
            countryCode,
            countries,
            country,
            post,
            processedHtml,
            toc,
            relatedCoupons,
            categoryName,
            adBanners,
            recentPosts: blogPosts.slice(0, 3),
            storeMap,
            SITE_URL,
        });
    } catch (err) {
        console.error('[BlogController.getBlogPost]', err);
        next(err);
    }
}

module.exports = { getBlogList, getBlogPost };
