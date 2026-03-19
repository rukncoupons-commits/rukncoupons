import * as fs from 'fs';
import * as path from 'path';

// manually load env
function loadEnv() {
    const envPaths = ['.env.local', '.env'];
    for (const ep of envPaths) {
        const fullPath = path.join(process.cwd(), ep);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            content.split(/\r?\n/).forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let val = match[2].trim();
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1);
                    } else if (val.startsWith("'") && val.endsWith("'")) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            });
        }
    }
}
loadEnv();

const { adminDb } = require('./src/lib/firebase-admin');

function generateEnglishName(slug: string): string {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function updateStores() {
  try {
    console.log('Fetching stores...');
    const snapshot = await adminDb.collection('stores').get();
    let updatedCount = 0;

    for (const doc of snapshot.docs) {
      const store = doc.data();
      let needsUpdate = false;
      const updates: any = {};

      const englishName = store.nameEn || generateEnglishName(store.slug);
      
      if (!store.nameEn) {
          updates.nameEn = englishName;
          needsUpdate = true;
      }

      if (!store.descriptionEn) {
          updates.descriptionEn = `Best ${englishName} coupons & promo codes.`;
          needsUpdate = true;
      }
      
      if (!store.longDescriptionEn && store.longDescription) {
          updates.longDescriptionEn = `Discover the best deals and discounts at ${englishName}. We provide verified coupons and exclusive offers to help you save on your purchases.`;
          needsUpdate = true;
      }

      if (!store.shippingInfoEn && store.shippingInfo) {
          updates.shippingInfoEn = `Enjoy fast and reliable shipping from ${englishName} to all supported countries. Shipping fees and delivery times vary by location. Please check the ${englishName} website for specific details.`;
          needsUpdate = true;
      }

      if (!store.returnPolicyEn && store.returnPolicy) {
          updates.returnPolicyEn = `You can return most items purchased from ${englishName} within 14-30 days of delivery. Please ensure items are in their original condition. Terms and conditions apply.`;
          needsUpdate = true;
      }

      if (!store.seoTitleEn) {
          updates.seoTitleEn = `${englishName} Coupons, Promo Codes & Deals`;
          needsUpdate = true;
      }

      if (!store.metaDescriptionEn) {
          updates.metaDescriptionEn = `Get the latest ${englishName} coupons, promo codes, and offers. Save money on your next purchase with our verified discounts.`;
          needsUpdate = true;
      }

      // Handle nested SEO objects if they exist
      if (store.seo) {
          const seoUpdates: any = { ...store.seo };
          let seoNeedsUpdate = false;
          if (!seoUpdates.metaTitleEn) {
              seoUpdates.metaTitleEn = `${englishName} Coupons, Promo Codes & Deals`;
              seoNeedsUpdate = true;
          }
          if (!seoUpdates.metaDescriptionEn) {
              seoUpdates.metaDescriptionEn = `Get the latest ${englishName} coupons, promo codes, and offers. Save money on your next purchase with our verified discounts.`;
              seoNeedsUpdate = true;
          }
          if (seoNeedsUpdate) {
              updates.seo = seoUpdates;
              needsUpdate = true;
          }
      }

      if (store.countrySeo) {
          const countrySeoUpdates: any = { ...store.countrySeo };
          let countrySeoNeedsUpdate = false;
          for (const country in countrySeoUpdates) {
             const seo = countrySeoUpdates[country];
             if (!seo.metaTitleEn) {
                 seo.metaTitleEn = `${englishName} Coupons, Promo Codes & Deals in ${country.toUpperCase()}`;
                 countrySeoNeedsUpdate = true;
             }
             if (!seo.metaDescriptionEn) {
                 seo.metaDescriptionEn = `Get the latest ${englishName} coupons, promo codes, and offers in ${country.toUpperCase()}. Save money on your next purchase with our verified discounts.`;
                 countrySeoNeedsUpdate = true;
             }
          }
          if (countrySeoNeedsUpdate) {
              updates.countrySeo = countrySeoUpdates;
              needsUpdate = true;
          }
      }

      if (needsUpdate) {
          console.log(`Updating ${store.slug} with fields:`, Object.keys(updates));
          await adminDb.collection('stores').doc(doc.id).update(updates);
          updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} stores.`);
  } catch (error) {
    console.error('Error updating stores:', error);
  }
}

updateStores();
