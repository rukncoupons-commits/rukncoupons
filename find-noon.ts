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

async function fixNoonStores() {
    const snapshot = await adminDb.collection('stores').get();
    let fixed = 0;
    for (const doc of snapshot.docs) {
        const s = doc.data();
        if (s.name.includes('نون') || s.slug.includes('noon')) {
            console.log(`Found Noon store: ${s.name} (${s.slug}). Current nameEn: ${s.nameEn}`);
            if (!s.nameEn || s.nameEn === 'نون') {
                await adminDb.collection('stores').doc(doc.id).update({
                    nameEn: 'Noon'
                });
                console.log(`Fixed nameEn for ${s.slug} to 'Noon'`);
                fixed++;
            }
        }
        
        // Also check if nameEn is undefined or empty for others
        if (!s.nameEn) {
            const properEnName = s.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            await adminDb.collection('stores').doc(doc.id).update({
                nameEn: properEnName
            });
            console.log(`Fallback fixed nameEn for ${s.slug} to '${properEnName}'`);
            fixed++;
        }
    }
    console.log(`Fixed total ${fixed} stores.`);
    process.exit(0);
}

fixNoonStores();
