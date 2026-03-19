const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
try {
    const dotenvFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    dotenvFile.split(/\r?\n/).forEach((line: string) => {
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

async function runUpload() {
    const filePath = path.join(__dirname, 'store-articles.json');
    if (!fs.existsSync(filePath)) {
        console.error("store-articles.json not found.");
        return;
    }

    const stores = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${stores.length} stores to upload.`);

    const batch = db.batch();
    let updates = 0;

    for (let i = 0; i < stores.length; i++) {
        const store = stores[i];

        const placeholderEn = `Discover the latest and best discount codes for ${store.nameEn || store.name}. Shop now and save big with our exclusive deals.`;
        if (store.longDescriptionEn && store.longDescriptionEn !== placeholderEn && store.longDescriptionEn.trim() !== '') {
            const docRef = db.collection('stores').doc(store.id);
            batch.update(docRef, { longDescriptionEn: store.longDescriptionEn });
            updates++;
            console.log(`[${i + 1}/${stores.length}] Queued update for ${store.nameEn || store.name}`);
        }
    }

    if (updates > 0) {
        console.log(`Committing ${updates} batch updates to Firebase...`);
        await batch.commit();
        console.log("Database migration complete!");
    } else {
        console.log("No translations found to upload.");
    }
}

runUpload().catch(console.error);
