'use strict';

const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home.controller');
const storesController = require('../controllers/stores.controller');
const storeController = require('../controllers/store.controller');
const couponsController = require('../controllers/coupons.controller');
const blogController = require('../controllers/blog.controller');
const staticController = require('../controllers/static.controller');
const sitemapController = require('../controllers/sitemap.controller');
const apiController = require('../controllers/api.controller');

// ─── SEO Files ────────────────────────────────────────────────────────────────
router.get('/sitemap.xml', sitemapController.getSitemap);

// ─── API Endpoints ────────────────────────────────────────────────────────────
router.post('/api/coupon/use/:id', apiController.useCoupon);
router.post('/api/coupon/vote/:id', apiController.voteCoupon);

// ─── Root Redirect ────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    res.redirect(301, `/${process.env.DEFAULT_COUNTRY || 'sa'}`);
});

// ─── Country-Scoped Routes ────────────────────────────────────────────────────
// Order matters: specific routes before the catch-all store slug route

router.get('/:country', homeController.getHome);
router.get('/:country/stores', storesController.getStores);
router.get('/:country/coupons', couponsController.getCoupons);
router.get('/:country/blog', blogController.getBlogList);
router.get('/:country/blog/:slug', blogController.getBlogPost);
router.get('/:country/about', staticController.getAbout);
router.get('/:country/contact', staticController.getContact);
router.get('/:country/privacy', staticController.getPrivacy);

// Store page (catch-all slug — must be LAST among country routes)
router.get('/:country/:storeSlug', storeController.getStore);

module.exports = router;
