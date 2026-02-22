'use strict';

const dataService = require('../services/data.service');

async function useCoupon(req, res) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Missing coupon ID' });
        await dataService.incrementCouponUsage(id);
        res.json({ success: true });
    } catch (err) {
        console.error('[ApiController.useCoupon]', err);
        res.status(500).json({ error: 'Server error' });
    }
}

async function voteCoupon(req, res) {
    try {
        const { id } = req.params;
        const type = req.body.type || req.query.type;
        if (!id || !['up', 'down'].includes(type)) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }
        await dataService.voteCoupon(id, type);
        res.json({ success: true });
    } catch (err) {
        console.error('[ApiController.voteCoupon]', err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { useCoupon, voteCoupon };
