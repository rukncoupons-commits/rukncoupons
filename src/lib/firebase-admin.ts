import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, "\n"),
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
