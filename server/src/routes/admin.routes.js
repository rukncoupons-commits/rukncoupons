'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Middleware to protect admin routes
const isAdmin = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
};

// Login routes (public)
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

// Admin dashboard routes (protected)
router.get('/', isAdmin, adminController.getDashboard);
router.get('/stores', isAdmin, adminController.getStores);
router.get('/coupons', isAdmin, adminController.getCoupons);

module.exports = router;
