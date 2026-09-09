// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK (service account JSON path via env)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
  });
}

const router = Router();

// POST /api/auth/login - client sends Firebase ID token, we verify and create session cookie
router.post('/login', async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing idToken' });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Here we could create a JWT for our API or just return user info
    return res.json({ uid: decoded.uid, email: decoded.email, name: decoded.name });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
