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

async function checkNoon() {
    const snapshot = await adminDb.collection('stores').where('slug', '==', 'noon').get();
    if (snapshot.empty) {
        console.log("Noon store not found.");
        return;
    }
    const store = snapshot.docs[0].data();
    console.log("Noon Store Data:", {
        name: store.name,
        nameEn: store.nameEn,
        slug: store.slug
    });
    
    if (!store.nameEn) {
        console.log("Fixing Noon missing English name...");
        await adminDb.collection('stores').doc(snapshot.docs[0].id).update({
            nameEn: 'Noon'
        });
        console.log("Fixed.");
    }

    // Let's also check all stores missing nameEn and fix them:
    const allStores = await adminDb.collection('stores').get();
    let fixed = 0;
    for (const doc of allStores.docs) {
        const s = doc.data();
        if (!s.nameEn) {
            const properEnName = s.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            await adminDb.collection('stores').doc(doc.id).update({
                nameEn: properEnName
            });
            fixed++;
        }
    }
    console.log(`Checked all stores, fixed missing nameEn for ${fixed} stores.`);
    process.exit(0);
}

checkNoon();
