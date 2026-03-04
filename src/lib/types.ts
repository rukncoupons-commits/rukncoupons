export interface SeoConfig {
    metaTitle: string;
    metaDescription: string;
    slug?: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl?: string;
    noIndex?: boolean;
}

export interface TrackingConfig {
    ga4MeasurementId: string;
    googleAdsConversionId: string;
    metaPixelId: string;
    tiktokPixelId: string;
    enableGA4: boolean;
    enableGoogleAds: boolean;
    enableMeta: boolean;
    enableTikTok: boolean;
}

export interface SocialConfig {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    snapchat: string;
    upscrolled: string;
}

export interface RuleCondition {
    field: 'country' | 'storeId' | 'status' | 'type' | 'category' | 'views' | 'clicks' | 'storeOffersCount' | 'affiliateStatus';
    operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt';
    value: string | number;
}

export interface RuleAction {
    type: 'visible' | 'featured' | 'suppressSchema' | 'badge';
    value: boolean | string;
}

export interface Rule {
    id: string;
    name: string;
    scope: 'global' | 'country' | 'store';
    priority: number;
    isActive: boolean;
    conditions: RuleCondition[];
    actions: RuleAction[];
}

export interface Category {
    id: string;
    name: string;
    icon?: string;
    slug: string;
    type?: 'store' | 'blog';
    parentId?: string;
    countryCode?: string;
}

export interface Country {
    id: string;
    code: string;
    name: string;
    currency: string;
    introTitle: string;
    introDesc: string;
    seo?: SeoConfig;
}

export interface Slide {
    id: string;
    image: string;
    title?: string;
    description?: string;
    linkUrl?: string;
    countryCode?: string;
    countryCodes?: string[];
}

export interface AdBanner {
    id: string;
    type?: 'image' | 'html';
    htmlContent?: string;
    imageUrl?: string;
    linkUrl?: string;
    altText: string;
    isActive: boolean;
    order: number;
    countryCodes?: string[];
}

export interface Store {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
    storeUrl?: string;
    countryCodes: string[];
    description: string;
    longDescription: string;
    longDescriptions?: { [countryCode: string]: string };
    shippingInfo: string;
    returnPolicy: string;
    category?: string;
    isActive?: boolean;
    seo?: SeoConfig;
    countrySeo?: { [countryCode: string]: SeoConfig };
}

export interface Coupon {
    id: string;
    storeId: string;
    countryCodes: string[];
    countryCode?: string;
    type: 'coupon' | 'deal';
    code?: string;
    title: string;
    description: string;
    discountValue: string;
    expiryDate?: string;
    isActive?: boolean;
    usedCount: number;
    viewCount?: number;
    votesUp: number;
    votesDown: number;
    isExclusive?: boolean;
    isVerified?: boolean;
    affiliateLink?: string;
    affiliateStatus?: 'active' | 'broken';
    categories: string[];
    imageUrl?: string;

    _ruleOverrides?: {
        visible?: boolean;
        featured?: boolean;
        suppressSchema?: boolean;
        badge?: string;
    };
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface BlogPost {
    id: string;
    status: 'published' | 'draft';
    title: string;
    slug: string;
    image: string;
    excerpt: string;
    content: string;
    author: string;
    createdAt: string; // Replaces 'date'
    updatedAt: string;
    isActive: boolean;
    views: number;
    countryCodes: string[];
    category: string;
    tags?: string[];
    // AI SEO Engine (Phase 9)
    aiIntentType?: 'transactional' | 'commercial' | 'informational' | 'navigational';
    aiIntentScore?: number;
    aiCommercialWeight?: number;
    aiDetectedKeywords?: string[];
    aiMatchedStoreIds?: string[];
    aiInjectedCouponIds?: string[];
    aiAnchorVariations?: Record<string, number>;
    aiMonetizationScore?: number;
    aiInternalLinkScore?: number;
    aiConfidenceScore?: number;
    aiOptimizationScore?: number; // Final combined score (0-100)
    autoLink?: boolean;
    manualStoreIds?: string[];
    manualCouponIds?: string[];
    relatedStoreIds?: string[];
    faq?: FAQItem[];
    seo?: SeoConfig;
    countrySeo?: { [countryCode: string]: SeoConfig };

    // Phase 8: AI Behavioral Engine - Full Granular Heatmap Schema
    behavioral_data?: {
        total_sessions: number;
        total_desktop_sessions: number;
        total_mobile_sessions: number;
        avg_scroll_depth: number;
        median_scroll_depth?: number;
        p75_scroll_depth?: number;
        scroll_histogram: Record<string, number>;
        paragraph_engagement: Record<string, number>;
        conversion_hotspots: Record<string, number>;
        exit_paragraph_distribution?: Record<string, number>;
        optimal_injection_index: number;
        mobile_optimal_index: number;
        desktop_optimal_index: number;
        injection_confidence: number;
        injection_confidence_interval?: { lower: number; upper: number; };
        avg_time_on_page?: number;
        median_time_on_page?: number;
        referrer_segments?: Record<string, { sessions: number; avg_scroll_depth: number; }>;
        ab_trials?: Array<{
            variant: 'A' | 'B';
            injection_index: number;
            converted: boolean;
            scroll_depth: number;
            device: 'mobile' | 'desktop';
            timestamp: string;
        }>;
        ab_summary?: {
            variant_A: { sessions: number; conversions: number; cvr: number; avg_scroll: number; };
            variant_B: { sessions: number; conversions: number; cvr: number; avg_scroll: number; };
            winner?: 'A' | 'B' | 'tie';
            confidence?: number;
        };
        first_tracked?: string;
        last_updated: string;
    };
}

export interface AffiliateProduct {
    id: string;
    storeId: string;            // Link it to the 'amazon' store
    countryCodes: string[];    // E.g., ['sa', 'ae']
    title: string;
    description: string;
    imageUrl: string;
    price?: string;
    oldPrice?: string;
    discountPercent?: number;
    rating: number;            // E.g., 4.5
    reviewsCount: number;
    affiliateUrl: string;
    badge?: string;            // E.g., 'أفضل مبيعاً'
    isActive: boolean;
    order: number;             // For display ordering in sections
    section: 'top_deals' | 'trending' | 'comparison' | 'none'; // Where to display it
    createdAt: string;
    updatedAt: string;
}
