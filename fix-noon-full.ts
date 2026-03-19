import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
    const envPaths = ['.env.local', '.env'];
    for (const ep of envPaths) {
        const fullPath = path.join(process.cwd(), ep);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            content.split(/\r?\n/).forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    let key = match[1].trim();
                    let val = match[2].trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    if (!process.env[key]) process.env[key] = val;
                }
            });
        }
    }
}
loadEnv();

const { adminDb } = require('./src/lib/firebase-admin');

async function fixNoonFull() {
    const snapshot = await adminDb.collection('stores').where('slug', '==', 'نون').get();
    if (snapshot.empty) {
        console.log("Noon not found.");
        return;
    }
    const store = snapshot.docs[0].data();
    
    const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text || '');

    const updates: any = {};
    if (isArabic(store.descriptionEn) || !store.descriptionEn) {
        updates.descriptionEn = "Best Noon coupon codes and offers.";
    }
    if (isArabic(store.longDescriptionEn) || !store.longDescriptionEn) {
        updates.longDescriptionEn = "Discover the best deals and discounts at Noon. We provide verified coupons and exclusive offers to help you save on your purchases.";
    }
    if (isArabic(store.shippingInfoEn) || !store.shippingInfoEn) {
        updates.shippingInfoEn = "Enjoy fast and reliable shipping from Noon to all supported countries. Shipping fees and delivery times vary by location. Please check the Noon website for specific details.";
    }
    if (isArabic(store.returnPolicyEn) || !store.returnPolicyEn) {
        updates.returnPolicyEn = "You can return most items purchased from Noon within 14-30 days of delivery. Please ensure items are in their original condition. Terms and conditions apply.";
    }
    if (isArabic(store.seoTitleEn) || !store.seoTitleEn) {
        updates.seoTitleEn = "Noon Coupons, Promo Codes & Deals";
    }
    if (isArabic(store.metaDescriptionEn) || !store.metaDescriptionEn) {
        updates.metaDescriptionEn = "Get the latest Noon coupons, promo codes, and offers. Save money on your next purchase with our verified discounts.";
    }

    if (Object.keys(updates).length > 0) {
        console.log("Fixing Noon fields:", updates);
        await adminDb.collection('stores').doc(snapshot.docs[0].id).update(updates);
    } else {
        console.log("Noon English fields are already in English:", store);
    }
    process.exit(0);
}

fixNoonFull();
