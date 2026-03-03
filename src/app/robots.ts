import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-helpers";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/",
                    "/login",
                    "/api/",
                    "/*/coupons?*",   // Block filter-based coupon URLs
                    "/*?cat=*",       // Block category filter params
                    "/*?store=*",     // Block store filter params
                    "/*?q=*",         // Block search query params
                ],
            },
            {
                // Explicitly block aggressive crawlers from high-cost paths
                userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot"],
                disallow: "/",
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
