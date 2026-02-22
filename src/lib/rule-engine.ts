import { Coupon, Rule, RuleCondition } from "./types";

export function evaluateRule(
    rule: Rule,
    coupon: Coupon,
    currentCountryCode: string | null,
    context?: { storeCounts?: Map<string, number> }
): boolean {
    // 1. Scope Check
    if (
        rule.scope === "country" &&
        (!currentCountryCode || (coupon.countryCode && coupon.countryCode !== currentCountryCode))
    ) {
        // If country scoped, it must match current context
        // This part of the logic was a bit loose in Angular (empty if check), keeping it for now.
    }

    // 2. Conditions Check (AND logic)
    return rule.conditions.every((condition: RuleCondition) => {
        let actualValue: any;

        switch (condition.field) {
            case "country":
                actualValue = currentCountryCode;
                break;
            case "storeId":
                actualValue = coupon.storeId;
                break;
            case "type":
                actualValue = coupon.type || (coupon.code ? "coupon" : "deal");
                break;
            case "category":
                return (
                    coupon.categories &&
                    coupon.categories.some((c) =>
                        condition.operator === "eq" ? c === condition.value : c.includes(String(condition.value))
                    )
                );
            case "views":
                actualValue = coupon.viewCount || 0;
                break;
            case "clicks":
                actualValue = coupon.usedCount || 0;
                break;
            case "affiliateStatus":
                actualValue = coupon.affiliateStatus || "active";
                break;
            case "storeOffersCount":
                actualValue = context?.storeCounts?.get(coupon.storeId) || 0;
                break;
            case "status":
                if (condition.value === "expired") {
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

        // Evaluate Operator
        if (condition.operator === "eq") return String(actualValue) === String(condition.value);
        if (condition.operator === "neq") return String(actualValue) !== String(condition.value);
        if (condition.operator === "contains") return String(actualValue).includes(String(condition.value));
        if (condition.operator === "gt") return Number(actualValue) > Number(condition.value);
        if (condition.operator === "lt") return Number(actualValue) < Number(condition.value);

        return false;
    });
}

export function applyRules(
    coupons: Coupon[],
    rules: Rule[],
    countryCode: string | null,
    stores: any[] // Simplified Store type for rule context
): Coupon[] {
    if (!countryCode) return [];

    const activeRules = rules.filter((r) => r.isActive).sort((a, b) => a.priority - b.priority);

    // Context Pre-calculation
    const storeCounts = new Map<string, number>();
    coupons.forEach((c) => {
        storeCounts.set(c.storeId, (storeCounts.get(c.storeId) || 0) + 1);
    });

    return coupons
        .map((coupon) => {
            const processedCoupon: Coupon = { ...coupon, _ruleOverrides: {} };
            const overrides = processedCoupon._ruleOverrides!;

            // Default values
            overrides.visible = true;
            overrides.featured = coupon.isExclusive;
            overrides.suppressSchema = false;

            // Apply Stacked Rules
            for (const rule of activeRules) {
                if (evaluateRule(rule, processedCoupon, countryCode, { storeCounts })) {
                    rule.actions.forEach((action) => {
                        if (action.type === "visible") overrides.visible = action.value as boolean;
                        if (action.type === "featured") overrides.featured = action.value as boolean;
                        if (action.type === "suppressSchema") overrides.suppressSchema = action.value as boolean;
                        if (action.type === "badge") overrides.badge = String(action.value);
                    });
                }
            }
            return processedCoupon;
        })
        .filter((c) => c._ruleOverrides?.visible !== false);
}
