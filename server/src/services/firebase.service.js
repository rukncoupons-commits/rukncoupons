'use strict';

const admin = require('firebase-admin');

let db = null;

function getDb() {
    if (db) return db;

    if (!admin.apps.length) {
        let credential;

        // Option 1: Service account JSON file path
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            credential = admin.credential.applicationDefault();
        }
        // Option 2: Individual env vars (recommended for production)
        else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID || 'wafer-214c9',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            });
        }
        // Option 3: Fallback - try application default (works on GCP/Cloud Run)
        else {
            console.warn('[Firebase] No explicit credentials found. Trying application default...');
            credential = admin.credential.applicationDefault();
        }

        admin.initializeApp({
            credential,
            projectId: process.env.FIREBASE_PROJECT_ID || 'wafer-214c9',
        });
    }

    db = admin.firestore();
    return db;
}

module.exports = { getDb };
