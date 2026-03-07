const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
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

async function extractData() {
    console.log("Extracting stores...");
    const storesSnapshot = await db.collection("stores").get();
    const stores = [];
    storesSnapshot.forEach(doc => {
        const data = doc.data();
        stores.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            nameEn: data.nameEn,
            descriptionEn: data.descriptionEn,
            seoTitleEn: data.seoTitleEn,
            metaDescriptionEn: data.metaDescriptionEn,
            faqEn: data.faqEn
        });
    });

    console.log("Extracting coupons...");
    const couponsSnapshot = await db.collection("coupons").get();
    const coupons = [];
    couponsSnapshot.forEach(doc => {
        const data = doc.data();
        coupons.push({
            id: doc.id,
            storeId: data.storeId,
            title: data.title,
            description: data.description,
            discountValue: data.discountValue,
            titleEn: data.titleEn,
            descriptionEn: data.descriptionEn,
            discountValueEn: data.discountValueEn
        });
    });

    const output = { stores, coupons };
    fs.writeFileSync(path.join(__dirname, 'extracted-data.json'), JSON.stringify(output, null, 2));
    console.log(`Extraction complete. Saved ${stores.length} stores and ${coupons.length} coupons to extracted-data.json`);
}

extractData().catch(console.error);
