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

async function extractArticles() {
    console.log("Extracting store articles (longDescription)...");
    const storesSnapshot = await db.collection("stores").get();
    const articles = [];
    storesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.longDescription) {
            articles.push({
                id: doc.id,
                name: data.name,
                nameEn: data.nameEn || "",
                longDescription: data.longDescription,
                longDescriptionEn: data.longDescriptionEn || ""
            });
        }
    });

    fs.writeFileSync(path.join(__dirname, 'store-articles.json'), JSON.stringify(articles, null, 2));
    console.log(`Extraction complete. Found ${articles.length} stores with articles.`);
}

extractArticles().catch(console.error);
