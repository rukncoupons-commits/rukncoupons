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

async function checkNoonCoupons() {
    const noonSnapshot = await adminDb.collection('stores').where('slug', '==', 'نون').get();
    if (noonSnapshot.empty) {
        console.log("Noon store not found.");
        return;
    }
    const storeId = noonSnapshot.docs[0].id;
    const storeNameEn = noonSnapshot.docs[0].data().nameEn || 'Noon';
    
    console.log(`Checking coupons for Noon (ID: ${storeId})`);
    
    const couponsSnapshot = await adminDb.collection('coupons').where('storeId', '==', storeId).get();
    let fixed = 0;
    
    for (const doc of couponsSnapshot.docs) {
        const c = doc.data();
        let needsUpdate = false;
        const updates: any = {};
        
        console.log(`Coupon ID: ${doc.id}`);
        console.log(`  Title: ${c.title}`);
        console.log(`  TitleEn: ${c.titleEn}`);
        console.log(`  Description: ${c.description}`);
        console.log(`  DescriptionEn: ${c.descriptionEn}`);
        
        if (!c.titleEn || c.titleEn.includes('نون')) {
            const cleanTitle = c.titleEn ? c.titleEn.replace('نون', storeNameEn) : `Special Offer at ${storeNameEn}`;
            updates.titleEn = cleanTitle;
            needsUpdate = true;
        }
        
        if (!c.descriptionEn || c.descriptionEn.includes('نون')) {
            const cleanDesc = c.descriptionEn ? c.descriptionEn.replace('نون', storeNameEn) : `Apply this coupon for ${storeNameEn} to save money.`;
            updates.descriptionEn = cleanDesc;
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            console.log(`  --> Updating to TitleEn: ${updates.titleEn}, DescEn: ${updates.descriptionEn}`);
            await doc.ref.update(updates);
            fixed++;
        }
    }
    console.log(`Fixed ${fixed} Noon coupons.`);
    process.exit(0);
}

checkNoonCoupons();
