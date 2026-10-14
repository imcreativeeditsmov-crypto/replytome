import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

const hasAdminConfig = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
);

let adminApp: App | undefined;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

if (hasAdminConfig) {
  try {
    adminApp =
      getApps().length === 0
        ? initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
          })
        : getApps()[0];

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
  } catch (error) {
    console.warn("Failed to initialize Firebase Admin SDK:", error);
  }
}

export { adminDb, adminAuth };
export const isAdminConfigured = Boolean(adminDb);
