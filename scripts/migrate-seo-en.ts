const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
    const dotenvFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    dotenvFile.split(/\r?\n/).forEach(line => {
        const [key, ...valueMatches] = line.split('=');
        if (key && valueMatches.length > 0) {
            let value = valueMatches.join('=').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key.trim()] = value;
        }
    });
} catch (e) {
    console.log("No .env.local found or error parsing it.");
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        let formattedKey = privateKey;
        try {
            formattedKey = JSON.parse(privateKey);
        } catch (e) {
            formattedKey = privateKey.replace(/\\n/g, "\n");
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });
    } else {
        console.error("Missing Firebase credentials pattern in .env.local.");
        process.exit(1);
    }
}

const db = admin.firestore();

async function migrateData() {
    const dataPath = path.join(__dirname, 'translated-data.json');
    if (!fs.existsSync(dataPath)) {
        console.error("translated-data.json not found. Run generate-seo.js first.");
        return;
    }

    const { stores, coupons } = require(dataPath);
    const batch = db.batch();
    let updatesCount = 0;

    console.log(`Processing ${stores.length} stores for migration...`);
    for (const store of stores) {
        const docRef = db.collection("stores").doc(store.id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const currentData = docSnap.data();
            const updates = {};

            // Safe assignment: don't overwrite if it already exists in DB
            if (!currentData.nameEn) updates.nameEn = store.nameEn;
            if (!currentData.descriptionEn) updates.descriptionEn = store.descriptionEn;
            if (!currentData.seoTitleEn) updates.seoTitleEn = store.seoTitleEn;
            if (!currentData.metaDescriptionEn) updates.metaDescriptionEn = store.metaDescriptionEn;
            if (!currentData.faqEn || currentData.faqEn.length === 0) updates.faqEn = store.faqEn;

            if (Object.keys(updates).length > 0) {
                batch.update(docRef, updates);
                updatesCount++;
            }
        }
    }

    console.log(`Processing ${coupons.length} coupons for migration...`);
    for (const coupon of coupons) {
        const docRef = db.collection("coupons").doc(coupon.id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const currentData = docSnap.data();
            const updates = {};

            // Safe assignment
            if (!currentData.titleEn) updates.titleEn = coupon.titleEn;
            if (!currentData.descriptionEn) updates.descriptionEn = coupon.descriptionEn;
            if (!currentData.discountValueEn) updates.discountValueEn = coupon.discountValueEn;

            if (Object.keys(updates).length > 0) {
                batch.update(docRef, updates);
                updatesCount++;
            }
        }
    }

    if (updatesCount > 0) {
        console.log(`Committing ${updatesCount} updates to Firestore...`);
        await batch.commit();
        console.log("Migration complete.");
    } else {
        console.log("No new mappings to update (documents already have English fields).");
    }
}

migrateData().catch(console.error);
