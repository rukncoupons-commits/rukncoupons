const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { translate } = require('bing-translate-api');

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

// Sleep utility to prevent rate limit
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateHtml(html) {
    if (!html || html.trim() === '') return '';

    try {
        const res = await translate(html, null, 'en');
        return res.translation;
    } catch (err) {
        console.error("Translation error", err.message);
    }

    return html; // Fallback to original if fails
}

async function runTranslation() {
    const filePath = path.join(__dirname, 'store-articles.json');
    if (!fs.existsSync(filePath)) {
        console.error("store-articles.json not found.");
        return;
    }

    const stores = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${stores.length} stores to translate.`);

    const batch = db.batch();
    let updates = 0;

    for (let i = 0; i < stores.length; i++) {
        const store = stores[i];

        // Skip if English description is already a full article (assume length > 300 chars or > 20% of Arabic)
        if (store.longDescriptionEn && store.longDescriptionEn.length > 300) {
            console.log(`[${i + 1}/${stores.length}] Skipping ${store.nameEn || store.name} - already translated.`);
            continue;
        }

        console.log(`[${i + 1}/${stores.length}] Translating article for ${store.nameEn || store.name}...`);

        // Translate the HTML content
        const translated = await translateHtml(store.longDescription);

        if (translated && translated !== store.longDescription) {
            const docRef = db.collection('stores').doc(store.id);
            batch.update(docRef, { longDescriptionEn: translated });
            updates++;
            console.log(`   -> Successfully translated! length: ${translated.length}`);
        } else {
            console.log(`   -> Failed or no output.`);
        }

        // Wait 3 seconds to avoid Google rate limit
        await sleep(3000);
    }

    if (updates > 0) {
        console.log(`Committing ${updates} batch updates to Firebase...`);
        await batch.commit();
        console.log("Translation and database migration complete!");
    } else {
        console.log("No new translations needed.");
    }
}

runTranslation().catch(console.error);
