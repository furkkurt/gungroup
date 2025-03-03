import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCUEWO85iz4RzWH_o0hSJ-LURSEAtHvK40",
  authDomain: "gungroup-1a3c8.firebaseapp.com",
  projectId: "gungroup-1a3c8",
  storageBucket: "gungroup-1a3c8.firebasestorage.app",
  messagingSenderId: "936762715193",
  appId: "1:936762715193:web:695b5bb4d7601dfb82b1e8",
  measurementId: "G-JZ53PMDM88"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Get Auth instance with persistence
export const auth = getAuth()
auth.settings.appVerificationDisabledForTesting = true // Add this for testing

// Set persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Auth persistence error:', error)
  })

// Initialize other services
const db = getFirestore(app)
const storage = getStorage(app)

// Enable cross-origin isolation
auth.useDeviceLanguage()

export { db, storage } 