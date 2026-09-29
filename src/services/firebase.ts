import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  signInAnonymously,
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCHBOfrWMiEm0_iiDbVfrynmwlAhexBxYE",
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "moviebox-boxez.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FB_DB_URL || import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://moviebox-boxez-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FB_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID || "moviebox-boxez",
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "moviebox-boxez.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "571104348600",
  appId: import.meta.env.VITE_FB_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID || "1:571104348600:web:4ccc66a8b7507c2317a74d",
  measurementId: import.meta.env.VITE_FB_MEASURE_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X5FVPQ5R7Z",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  signInAnonymously
};
export type { FirebaseUser };
