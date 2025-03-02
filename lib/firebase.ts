import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Check if we have all required environment variables
if (!firebaseConfig.apiKey) {
  throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY')
}

// Initialize Firebase only on client side and only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)

if (typeof window !== 'undefined') {
  // Set language for SMS and reCAPTCHA
  auth.languageCode = 'en'
  
  // Configure reCAPTCHA
  auth.settings.appVerificationDisabledForTesting = false
}

// For development only
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase initialized')
}

export { auth } 