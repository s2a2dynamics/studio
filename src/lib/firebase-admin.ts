import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// IMPORTANT: Download your service account key JSON file from the Firebase console
// and place it in your project's root directory.
// Update the path to your service account key file.
const serviceAccount = require('../../firebase-service-account.json');

let app: App;
let firestore: Firestore;

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  app = getApp();
}

firestore = getFirestore(app);

export { app, firestore };
