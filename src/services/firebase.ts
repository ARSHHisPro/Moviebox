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
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCHBOfrWMiEm0_iiDbVfrynmwlAhexBxYE",
  authDomain: "moviebox-boxez.firebaseapp.com",
  projectId: "moviebox-boxez",
  storageBucket: "moviebox-boxez.firebasestorage.app",
  messagingSenderId: "571104348600",
  appId: "1:571104348600:web:4ccc66a8b7507c2317a74d",
  measurementId: "G-X5FVPQ5R7Z"
};

// Initialize Firebase
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
  updateProfile 
};
export type { FirebaseUser };
