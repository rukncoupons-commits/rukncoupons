import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
        let formattedKey = privateKey;
        try {
            // Sometimes it's passed as a JSON string like "\"-----BEGIN PRIVATE KEY-----\\n...\""
            formattedKey = JSON.parse(privateKey);
        } catch (e) {
            // Or just a string with escaped literal \n
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
        // Fallback for Cloud Run or build environment
        try {
            admin.initializeApp();
        } catch (error) {
            // During build, we might not have any credentials.
            // Provide a dummy project ID to prevent SDK crashes during module evaluation.
            admin.initializeApp({
                projectId: projectId || "build-placeholder",
            });
        }
    }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
