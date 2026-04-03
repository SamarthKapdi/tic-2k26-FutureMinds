const admin = require('firebase-admin');

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return null;
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error('Firebase Admin credentials are missing in backend environment');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

const verifyFirebaseIdToken = async (idToken) => {
  initializeFirebaseAdmin();
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseIdToken };
