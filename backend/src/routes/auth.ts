import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseInitialized = false;

try {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountStr && serviceAccountStr.includes('project_id')) {
    const serviceAccount = JSON.parse(serviceAccountStr);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
    }
  } else {
    console.log('⚠️ Firebase service account not configured. Running in mock auth mode.');
  }
} catch (err) {
  console.warn('⚠️ Could not initialize Firebase Admin SDK:', err);
}

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing idToken' });
  }

  if (firebaseInitialized) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return res.json({ uid: decoded.uid, email: decoded.email, name: decoded.name });
    } catch (e) {
      console.error('Firebase token verification failed:', e);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    // Mock user for testing when Firebase credentials are not yet set
    return res.json({
      uid: 'user-mock-123',
      email: 'demo@padelsaas.com',
      name: 'Usuario Demo',
    });
  }
});

export default router;
