import * as fs from 'fs';
import * as path from 'path';

// manually load env
function loadEnv() {
    const envPaths = ['.env.local', '.env'];
    for (const ep of envPaths) {
        const fullPath = path.join(process.cwd(), ep);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            content.split(/\r?\n/).forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let val = match[2].trim();
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1);
                    } else if (val.startsWith("'") && val.endsWith("'")) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            });
        }
    }
}
loadEnv();

const { adminDb } = require('./src/lib/firebase-admin');

async function testStore() {
  const doc = await adminDb.collection('stores').doc('aqFqOXSDrkqzv2mnAjAU').get(); // amazon
  console.log('Amazon Store Data:', JSON.stringify(doc.data(), null, 2));
}

testStore();
