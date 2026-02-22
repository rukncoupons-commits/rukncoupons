'use strict';

/**
 * Rule Engine Service
 * Exact port of the Angular Rule Engine from data.service.ts
 */

/**
 * Evaluate a single rule against a coupon
 */
function evaluateRule(rule, coupon, currentCountryCode, context = {}) {
    return rule.conditions.every(condition => {
        let actualValue;

        switch (condition.field) {
            case 'country':
                actualValue = currentCountryCode;
                break;
            case 'storeId':
                actualValue = coupon.storeId;
                break;
            case 'type':
                actualValue = coupon.type || (coupon.code ? 'coupon' : 'deal');
                break;
            case 'category':
                if (!coupon.categories) return false;
                return coupon.categories.some(c =>
                    condition.operator === 'eq'
                        ? c === condition.value
                        : c.includes(String(condition.value))
                );
            case 'views':
                actualValue = coupon.viewCount || 0;
                break;
            case 'clicks':
                actualValue = coupon.usedCount || 0;
                break;
            case 'affiliateStatus':
                actualValue = coupon.affiliateStatus || 'active';
                break;
            case 'storeOffersCount':
                actualValue = (context.storeCounts && context.storeCounts.get(coupon.storeId)) || 0;
                break;
            case 'status':
                if (condition.value === 'expired') {
                    if (!coupon.expiryDate) return false;
                    const exp = new Date(coupon.expiryDate);
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    return exp < now;
                }
                return true;
            default:
                return false;
        }

        if (condition.operator === 'eq') return String(actualValue) === String(condition.value);
        if (condition.operator === 'neq') return String(actualValue) !== String(condition.value);
        if (condition.operator === 'contains') return String(actualValue).includes(String(condition.value));
        if (condition.operator === 'gt') return Number(actualValue) > Number(condition.value);
        if (condition.operator === 'lt') return Number(actualValue) < Number(condition.value);

        return false;
    });
}

/**
 * Apply all active rules to a list of coupons for a given country.
 * Returns filtered + annotated coupons (with _ruleOverrides).
 */
function applyRules(allCoupons, rules, countryCode, stores) {
    // Get active store IDs
    const activeStoreIds = new Set(
        stores.filter(s => s.isActive !== false).map(s => s.id)
    );

    // Base filter: country + active store + active coupon
    let countryCoupons = allCoupons.filter(c =>
        Array.isArray(c.countryCodes) &&
        c.countryCodes.includes(countryCode) &&
        c.isActive !== false &&
        activeStoreIds.has(c.storeId)
    );

    // Pre-calculate store offer counts for storeOffersCount condition
    const storeCounts = new Map();
    countryCoupons.forEach(c => {
        storeCounts.set(c.storeId, (storeCounts.get(c.storeId) || 0) + 1);
    });

    // Sort rules ascending by priority (low → high, high runs last = wins)
    const activeRules = rules
        .filter(r => r.isActive)
        .sort((a, b) => a.priority - b.priority);

    // Apply rules
    const result = countryCoupons.map(coupon => {
        const processed = { ...coupon, _ruleOverrides: {} };
        const overrides = processed._ruleOverrides;

        // Defaults
        overrides.visible = true;
        overrides.featured = coupon.isExclusive || false;
        overrides.suppressSchema = false;

        for (const rule of activeRules) {
            const isMatch = evaluateRule(rule, processed, countryCode, { storeCounts });
            if (isMatch) {
                rule.actions.forEach(action => {
                    if (action.type === 'visible') overrides.visible = action.value;
                    if (action.type === 'featured') overrides.featured = action.value;
                    if (action.type === 'suppressSchema') overrides.suppressSchema = action.value;
                    if (action.type === 'badge') overrides.badge = String(action.value);
                });
            }
        }

        return processed;
    }).filter(c => c._ruleOverrides.visible !== false);

    return result;
}

module.exports = { evaluateRule, applyRules };
