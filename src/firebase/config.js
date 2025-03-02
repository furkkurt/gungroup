import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUEWO85iz4RzWH_o0hSJ-LURSEAtHvK40",
  authDomain: "gungroup-1a3c8.firebaseapp.com",
  projectId: "gungroup-1a3c8",
  storageBucket: "gungroup-1a3c8.firebasestorage.app",
  messagingSenderId: "936762715193",
  appId: "1:936762715193:web:695b5bb4d7601dfb82b1e8",
  measurementId: "G-JZ53PMDM88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, analytics }; 