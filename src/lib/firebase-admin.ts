import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// IMPORTANT: Download your service account key JSON file from the Firebase console
// and place it in your project's root directory.
// Update the path to your service account key file.

let app: App | null = null;
let firestore: Firestore | null = null;

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      const serviceAccount = require('../../firebase-service-account.json');
      app = initializeApp({
        credential: cert(serviceAccount),
      });
      firestore = getFirestore(app);
    } catch (error: any) {
      console.error(
        'Firebase Admin initialization failed. Make sure firebase-service-account.json is present in the root directory.',
        error.message
      );
      // Set to null so we know initialization failed
      app = null;
      firestore = null;
    }
  } else {
    app = getApp();
    firestore = getFirestore(app);
  }
}

// Lazy initialization
function getAdminServices() {
  if (!app || !firestore) {
    initializeFirebaseAdmin();
  }
  
  if (!app || !firestore) {
      throw new Error("Firebase Admin SDK is not initialized. Check server logs for details.");
  }

  return { app, firestore };
}


// Export getters instead of direct instances
export function getAdminFirestore() {
    return getAdminServices().firestore;
}

export function getAdminApp() {
    return getAdminServices().app;
}
