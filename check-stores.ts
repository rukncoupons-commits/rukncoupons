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

async function checkStores() {
  try {
    console.log('Fetching stores...');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
    const snapshot = await adminDb.collection('stores').get();
    const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const needsTranslation = stores.filter(store => {
      return !store.nameEn || !store.descriptionEn || !store.longDescriptionEn || 
             !store.shippingInfoEn || !store.returnPolicyEn || !store.seoTitleEn || 
             !store.metaDescriptionEn || (store.faq && store.faq.length > 0 && !store.faqEn) ||
             (store.seo && (!store.seo.metaTitleEn || !store.seo.metaDescriptionEn)) ||
             (store.countrySeo && Object.values(store.countrySeo).some((seo: any) => !seo.metaTitleEn || !seo.metaDescriptionEn));
    });

    console.log(`Found ${stores.length} total stores.`);
    console.log(`Found ${needsTranslation.length} stores that need some English translations.`);
    
    const storesToTranslate = [];

    // Dump names of stores that need translation
    for (const store of needsTranslation) {
        console.log(`- ${store.slug || store.id} (name: ${store.name}) needs translation.`);
        const missing = [];
        if (!store.nameEn) missing.push('nameEn');
        if (!store.descriptionEn) missing.push('descriptionEn');
        if (!store.longDescriptionEn && store.longDescription) missing.push('longDescriptionEn');
        if (!store.shippingInfoEn && store.shippingInfo) missing.push('shippingInfoEn');
        if (!store.returnPolicyEn && store.returnPolicy) missing.push('returnPolicyEn');
        if (!store.seoTitleEn) missing.push('seoTitleEn');
        if (!store.metaDescriptionEn) missing.push('metaDescriptionEn');
        if (!store.faqEn && store.faq && store.faq.length > 0) missing.push('faqEn');
        if (store.seo && (!store.seo.metaTitleEn || !store.seo.metaDescriptionEn)) missing.push('seoEn');
        if (store.countrySeo && Object.values(store.countrySeo).some((seo: any) => !seo.metaTitleEn || !seo.metaDescriptionEn)) missing.push('countrySeoEn');
        
        console.log(`  Missing: ${missing.join(', ')}`);
        storesToTranslate.push({
            id: store.id,
            slug: store.slug,
            name: store.name,
            missing
        });
    }

    fs.writeFileSync('stores-to-translate.json', JSON.stringify(storesToTranslate, null, 2));
    console.log('Wrote to stores-to-translate.json');

  } catch (error) {
    console.error('Error checking stores:', error);
  }
}

checkStores();
