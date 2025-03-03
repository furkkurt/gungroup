import admin from 'firebase-admin';

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
      serviceAccountId: process.env.FIREBASE_CLIENT_EMAIL,
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    // Set CORS config for auth
    const auth = admin.auth();
    auth.setCustomUserClaims('*', {
      allowedOrigins: [
        'https://gungroup.vercel.app',
        'https://gungroup-furkkurt.vercel.app'
      ]
    }).catch(console.error);

    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export const adminAuth = admin.auth(); 