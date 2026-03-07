import React from 'react';
import Link from 'next/link';

interface DynamicStoreContentENProps {
    storeName: string;
    countryName: string;
    countryCode: string;
    storeCategory: string;
}

function stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

export default function DynamicStoreContentEN({ storeName, countryName, countryCode, storeCategory }: DynamicStoreContentENProps) {
    const hash = stringToHash(storeName + countryCode);
    const year = new Date().getFullYear();

    // Intro
    const introVariants = [
        `Looking for the latest ${storeName} coupon codes in ${countryName}? You're in the right place. We collect and verify the best ${storeName} promo codes and discount deals every day, so you never miss a chance to save. Whether you're shopping for ${storeCategory.toLowerCase()} or exploring new arrivals, our curated list of ${storeName} coupons helps you get the best prices in ${year}.`,
        `Welcome to the most comprehensive collection of ${storeName} coupon codes for ${countryName}. Our team of deal experts tests every ${storeName} promo code before publishing it, ensuring you only see working discounts. From percentage-off deals to free shipping codes, we've got everything you need to save on your next ${storeName} purchase.`,
        `Save money on your ${storeName} orders in ${countryName} with our verified coupon codes. We update this page daily to bring you the freshest ${storeName} discount codes, exclusive promo codes, and limited-time deals. Start shopping smarter today and keep more money in your pocket with Rukn Coupons.`,
    ];

    // How To Use
    const howToVariants = [
        {
            title: `How to Use ${storeName} Coupon Codes`,
            steps: [
                `Browse the coupon codes listed above and find the best deal for your purchase.`,
                `Click the "Copy" button next to your chosen ${storeName} promo code.`,
                `Visit the ${storeName} website and add your desired items to the cart.`,
                `At checkout, paste the code in the "Promo Code" or "Coupon Code" field.`,
                `Click "Apply" and watch the discount appear on your order total.`,
            ],
        },
        {
            title: `Step-by-Step: Redeeming Your ${storeName} Discount`,
            steps: [
                `Select a ${storeName} coupon code from our list that matches what you're shopping for.`,
                `Copy the code to your clipboard with one click.`,
                `Head over to ${storeName} and shop as usual.`,
                `During checkout, find the coupon input field and paste your code.`,
                `Complete your purchase and enjoy instant savings.`,
            ],
        },
    ];

    // Tips
    const tipsVariants = [
        {
            title: `Tips to Save More at ${storeName}`,
            tips: [
                `Always check this page before checkout — we add new codes daily.`,
                `Compare multiple coupon codes to find the highest discount.`,
                `Sign up for ${storeName}'s newsletter for exclusive member deals.`,
                `Shop during major sale events like Black Friday for the biggest savings.`,
                `Look for stackable deals: use a coupon code on top of already-discounted items.`,
            ],
        },
        {
            title: `Maximize Your Savings at ${storeName}`,
            tips: [
                `Bookmark this page and check back before every purchase.`,
                `Try codes marked "Exclusive" first — they often offer the best discounts.`,
                `Create a ${storeName} account to access member-only promotions.`,
                `Consider the store's loyalty or rewards program for additional perks.`,
                `Check for free shipping codes if your order doesn't meet the free shipping threshold.`,
            ],
        },
    ];

    const intro = introVariants[hash % introVariants.length];
    const howTo = howToVariants[hash % howToVariants.length];
    const tips = tipsVariants[hash % tipsVariants.length];

    return (
        <div className="mt-10 space-y-10">
            {/* Intro */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-gray-800 mb-4">
                    {storeName} Coupon Codes {countryName} {year}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{intro}</p>
            </section>

            {/* How to Use */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-gray-800 mb-4">{howTo.title}</h2>
                <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
                    {howTo.steps.map((step, i) => (
                        <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                </ol>
            </section>

            {/* Saving Tips */}
            <section className="bg-gradient-to-l from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
                <h2 className="text-xl font-black text-gray-800 mb-4">{tips.title}</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                    {tips.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Internal linking */}
            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">You May Also Like</h3>
                <div className="flex flex-wrap gap-2">
                    {["noon", "amazon", "namshi", "shein", "bath-and-body-works"].map((slug) => (
                        <Link
                            key={slug}
                            href={`/en/${countryCode}/${slug}`}
                            className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all"
                        >
                            {slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')} Coupon Codes
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
