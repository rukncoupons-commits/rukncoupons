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

async function verify() {
    const noonSnapshot = await adminDb.collection('stores').where('slug', '==', 'نون').get();
    const store = noonSnapshot.docs[0].data();
    console.log("Store:", { name: store.name, nameEn: store.nameEn, slug: store.slug });

    const couponsSnapshot = await adminDb.collection('coupons').where('storeId', '==', noonSnapshot.docs[0].id).get();
    for (const doc of couponsSnapshot.docs) {
        const c = doc.data();
        console.log("Coupon:", { title: c.title, titleEn: c.titleEn, descriptionEn: c.descriptionEn });
    }
    process.exit(0);
}

verify();
