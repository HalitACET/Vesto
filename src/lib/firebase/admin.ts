import { cert, getApps, initializeApp, type App, applicationDefault } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function createAdminApp(): App {
    if (getApps().length > 0) return getApps()[0];

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
        || process.env.FIREBASE_PROJECT_ID
        || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

    // Eğer servis hesabı bilgileri sağlanmışsa onları kullan (local dev),
    // aksi hâlde Google Cloud ortamında Application Default Credentials kullan.
    // NOTE: On Vercel there is no ADC — FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL
    // and FIREBASE_ADMIN_PRIVATE_KEY env vars are REQUIRED there.
    if (clientEmail && privateKey) {
        return initializeApp({
            credential: cert({ projectId: projectId!, clientEmail, privateKey }),
            projectId,
        });
    }

    // Firebase Hosting / Cloud Run / Cloud Functions üzerinde ADC otomatik çalışır
    return initializeApp({
        credential: applicationDefault(),
        projectId,
    });
}

const adminApp = createAdminApp();

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
