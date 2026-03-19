const { adminDb } = require('./src/lib/firebase-admin');

async function checkStores() {
  try {
    console.log('Fetching stores...');
    const snapshot = await adminDb.collection('stores').get();
    const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const needsTranslation = stores.filter(store => {
      return !store.nameEn || !store.descriptionEn || !store.longDescriptionEn || 
             !store.shippingInfoEn || !store.returnPolicyEn || !store.seoTitleEn || 
             !store.metaDescriptionEn;
    });

    console.log(`Found ${stores.length} total stores.`);
    console.log(`Found ${needsTranslation.length} stores that need some English translations.`);
    
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
        if (!store.faqEn && store.faq) missing.push('faqEn');
        console.log(`  Missing: ${missing.join(', ')}`);
    }
  } catch (error) {
    console.error('Error checking stores:', error);
  }
}

checkStores();
