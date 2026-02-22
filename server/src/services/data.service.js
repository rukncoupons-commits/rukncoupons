'use strict';

const { getDb } = require('./firebase.service');
const NodeCache = require('node-cache');

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10);
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 60 });

async function getCollection(collectionName) {
    const cacheKey = `col_${collectionName}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    try {
        const db = getDb();
        const snapshot = await db.collection(collectionName).get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        cache.set(cacheKey, data);
        return data;
    } catch (err) {
        console.error(`[DataService] Error loading ${collectionName}:`, err.message);
        return [];
    }
}

function invalidateCache(collectionName) {
    cache.del(`col_${collectionName}`);
}

// ─── Getters ──────────────────────────────────────────────────────────────────

async function getCountries() {
    const all = await getCollection('countries');
    // Deduplicate by code
    const seen = new Set();
    return all.filter(c => !seen.has(c.code) && seen.add(c.code));
}

async function getCategories() {
    return getCollection('categories');
}

async function getStores() {
    const all = await getCollection('stores');
    return all.filter(s => s.isActive !== false);
}

async function getCoupons() {
    return getCollection('coupons');
}

async function getRules() {
    return getCollection('rules');
}

async function getSlides() {
    return getCollection('slides');
}

async function getAdBanners() {
    return getCollection('adBanners');
}

async function getBlogPosts() {
    return getCollection('blogPosts');
}

async function getTrackingConfig() {
    const cacheKey = 'tracking_config';
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    try {
        const db = getDb();
        const snapshot = await db.collection('config').limit(1).get();
        const config = snapshot.empty ? null : snapshot.docs[0].data();
        cache.set(cacheKey, config);
        return config;
    } catch (err) {
        console.error('[DataService] Error loading tracking config:', err.message);
        return null;
    }
}

async function getSocialConfig() {
    const cacheKey = 'social_config';
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    try {
        const db = getDb();
        const snapshot = await db.collection('social_config').limit(1).get();
        const config = snapshot.empty ? null : snapshot.docs[0].data();
        cache.set(cacheKey, config);
        return config;
    } catch (err) {
        console.error('[DataService] Error loading social config:', err.message);
        return null;
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getStoreBySlug(slug) {
    const stores = await getStores();
    return stores.find(s => s.slug === slug) || null;
}

async function getStoreById(id) {
    const stores = await getStores();
    return stores.find(s => s.id === id) || null;
}

async function getPostBySlug(slug) {
    const posts = await getBlogPosts();
    return posts.find(p => p.slug === slug) || null;
}

async function getStoresForCountry(countryCode) {
    const stores = await getStores();
    return stores.filter(s =>
        Array.isArray(s.countryCodes) && s.countryCodes.includes(countryCode)
    );
}

async function getCouponsForCountry(countryCode) {
    const [coupons, stores, rules] = await Promise.all([
        getCoupons(),
        getStores(),
        getRules(),
    ]);

    const { applyRules } = require('./rule-engine.service');
    return applyRules(coupons, rules, countryCode, stores);
}

async function getBlogPostsForCountry(countryCode) {
    const posts = await getBlogPosts();
    return posts.filter(p => {
        if (p.status !== 'published') return false;
        const codes = Array.isArray(p.countryCodes) ? p.countryCodes : [];
        return codes.length === 0 || codes.includes(countryCode);
    });
}

async function getSlidesForCountry(countryCode) {
    const slides = await getSlides();
    return slides.filter(s => {
        const codes = s.countryCodes || (s.countryCode ? [s.countryCode] : []);
        return codes.length === 0 || codes.includes(countryCode);
    });
}

async function getAdBannersForCountry(countryCode) {
    const banners = await getAdBanners();
    return banners
        .filter(a => {
            if (!a.isActive) return false;
            if (!a.countryCodes || a.countryCodes.length === 0) return true;
            return a.countryCodes.includes(countryCode);
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// ─── Write Operations (for API endpoints) ────────────────────────────────────

async function incrementCouponUsage(couponId) {
    try {
        const db = getDb();
        await db.collection('coupons').doc(couponId).update({
            usedCount: require('firebase-admin').firestore.FieldValue.increment(1),
        });
        invalidateCache('coupons');
    } catch (err) {
        console.error('[DataService] Error incrementing coupon usage:', err.message);
    }
}

async function voteCoupon(couponId, type) {
    try {
        const db = getDb();
        const field = type === 'up' ? 'votesUp' : 'votesDown';
        await db.collection('coupons').doc(couponId).update({
            [field]: require('firebase-admin').firestore.FieldValue.increment(1),
        });
        invalidateCache('coupons');
    } catch (err) {
        console.error('[DataService] Error voting coupon:', err.message);
    }
}

module.exports = {
    getCountries,
    getCategories,
    getStores,
    getCoupons,
    getRules,
    getSlides,
    getAdBanners,
    getBlogPosts,
    getTrackingConfig,
    getSocialConfig,
    getStoreBySlug,
    getStoreById,
    getPostBySlug,
    getStoresForCountry,
    getCouponsForCountry,
    getBlogPostsForCountry,
    getSlidesForCountry,
    getAdBannersForCountry,
    incrementCouponUsage,
    voteCoupon,
    invalidateCache,
};
