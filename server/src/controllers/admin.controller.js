'use strict';

const dataService = require('../services/data.service');

const adminController = {
    getLogin: (req, res) => {
        if (req.session && req.session.isAdmin) {
            return res.redirect('/admin');
        }
        res.render('pages/admin/login', {
            layout: false, // Don't use the main site layout for login
            error: null
        });
    },

    postLogin: async (req, res) => {
        const { username, password } = req.body;
        try {
            const isValid = await dataService.verifyCredentials(username, password);
            if (isValid) {
                req.session.isAdmin = true;
                req.session.username = username;
                return res.redirect('/admin');
            }
            res.render('pages/admin/login', {
                layout: false,
                error: 'بيانات الدخول غير صحيحة'
            });
        } catch (error) {
            console.error('Login error:', error);
            res.render('pages/admin/login', {
                layout: false,
                error: 'حدث خطأ أثناء تسجيل الدخول'
            });
        }
    },

    getDashboard: async (req, res) => {
        try {
            const stores = await dataService.getCollection('stores');
            const coupons = await dataService.getCollection('coupons');
            const blogPosts = await dataService.getCollection('blogPosts');
            const rules = await dataService.getCollection('rules');

            res.render('pages/admin/dashboard', {
                layout: 'layouts/admin',
                stats: {
                    stores: stores.length,
                    coupons: coupons.length,
                    blogPosts: blogPosts.length,
                    rules: rules.length
                },
                page: 'dashboard'
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('Error loading dashboard');
        }
    },

    getStores: async (req, res) => {
        try {
            const stores = await dataService.getCollection('stores');
            res.render('pages/admin/stores', {
                layout: 'layouts/admin',
                stores,
                page: 'stores'
            });
        } catch (error) {
            res.status(500).send('Error loading stores');
        }
    },

    getCoupons: async (req, res) => {
        try {
            const coupons = await dataService.getCollection('coupons');
            const stores = await dataService.getCollection('stores');
            const storeMap = stores.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
            res.render('pages/admin/coupons', {
                layout: 'layouts/admin',
                coupons,
                storeMap,
                page: 'coupons'
            });
        } catch (error) {
            res.status(500).send('Error loading coupons');
        }
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    }
};

module.exports = adminController;
