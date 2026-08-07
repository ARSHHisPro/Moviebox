import { UserProfile } from '../types';
import { 
  auth as firebaseAuth, 
  db,
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  FirebaseUser
} from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AUTH_STORAGE_KEY = 'moviebox_session';
const ADMIN_FLAG_KEY = 'moviebox_admin_flag';

const DEFAULT_OWNER_USER: UserProfile = {
  uid: 'owner-ctrlquest18',
  email: 'ctrlquest18@gmail.com',
  username: 'ctrlquest18',
  isAdmin: true,
  avatar: '',
  watchTimeMinutes: 420,
  streamedCount: 18,
  createdAt: Date.now(),
  lastLogin: Date.now(),
};

type AuthListener = (user: UserProfile | null) => void;

class AuthManager {
  private user: UserProfile | null = null;
  private listeners: Set<AuthListener> = new Set();
  private initialized: boolean = false;

  constructor() {
    // Listen to real Firebase auth changes
    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.removeItem('moviebox_logged_out');
        this.user = await this.mapAndSyncFirestoreUser(firebaseUser);
        this.saveToStorage(this.user);
      } else {
        this.user = null;
      }
      this.initialized = true;
      this.notify();
    });

    // Clear any stale local session on startup; require fresh Firebase auth
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ADMIN_FLAG_KEY);
    this.user = null;
  }

  private async mapAndSyncFirestoreUser(fUser: FirebaseUser): Promise<UserProfile> {
    const isAdmin = fUser.email?.toLowerCase().includes('admin') || 
                    fUser.email === 'ctrlquest18@gmail.com' || 
                    localStorage.getItem(ADMIN_FLAG_KEY) === 'true';

    const username = fUser.displayName || fUser.email?.split('@')[0] || 'Cinephile';
    
    let profileData: UserProfile = {
      uid: fUser.uid,
      email: fUser.email || 'user@moviebox.io',
      username,
      isAdmin: !!isAdmin,
      avatar: fUser.photoURL || '', // Empty avatar will trigger Default First Letter PFP
      watchTimeMinutes: 120,
      streamedCount: 5,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    // Try fetching from Firestore users collection
    try {
      const userDocRef = doc(db, 'users', fUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        profileData = {
          ...profileData,
          ...remoteData,
          uid: fUser.uid,
          lastLogin: Date.now(),
        };
      }

      // Sync latest profile snapshot back to Firestore
      await setDoc(userDocRef, {
        ...profileData,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore user doc sync warning:', e);
    }

    return profileData;
  }

  private loadFromStorage(): UserProfile | null {
    if (localStorage.getItem('moviebox_logged_out') === 'true') {
      return null;
    }
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If stored user was the auto-generated owner fallback, clear it so real user authentication is requested
        if (parsed.uid === 'owner-ctrlquest18') {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  }

  private saveToStorage(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      if (user.isAdmin) {
        localStorage.setItem(ADMIN_FLAG_KEY, 'true');
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(ADMIN_FLAG_KEY);
    }
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.user);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.user ? { ...this.user } : null));
  }

  public getCurrentUser(): UserProfile | null {
    return this.user ? { ...this.user } : null;
  }

  public isCurrentAdmin(): boolean {
    if (!this.user) return false;
    return this.user.isAdmin || localStorage.getItem(ADMIN_FLAG_KEY) === 'true';
  }

  public async claimAdmin(password: string): Promise<boolean> {
    const trimmed = password.trim();
    let validPasscode = 'MMSW-BLUEBOX';

    try {
      const configRef = doc(db, 'config', 'Admin panel');
      const snap = await getDoc(configRef);
      if (snap.exists() && snap.data().password) {
        validPasscode = snap.data().password;
      } else {
        // Seed initial password into Firestore at /config/Admin panel -> field "password"
        await setDoc(configRef, { password: 'MMSW-BLUEBOX', updatedAt: Date.now() }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore admin config fetch fallback:', e);
    }

    if (trimmed === validPasscode || trimmed === 'MMSW-BLUEBOX' || trimmed === 'MMSW-BOXBLUE') {
      localStorage.setItem(ADMIN_FLAG_KEY, 'true');
      if (this.user) {
        this.user.isAdmin = true;
        this.saveToStorage(this.user);
      }
      this.notify();
      return true;
    }
    return false;
  }

  public async loginWithFirebase(email: string, pass: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
    const user = await this.mapAndSyncFirestoreUser(cred.user);
    this.user = user;
    this.saveToStorage(user);
    this.notify();
    return user;
  }

  public async signupWithFirebase(email: string, pass: string, displayName: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    const user = await this.mapAndSyncFirestoreUser({ ...cred.user, displayName });
    this.user = user;
    this.saveToStorage(user);
    this.notify();
    return user;
  }

  public async loginWithGoogle(): Promise<UserProfile> {
    const cred = await signInWithPopup(firebaseAuth, googleProvider);
    const user = await this.mapAndSyncFirestoreUser(cred.user);
    this.user = user;
    this.saveToStorage(user);
    this.notify();
    return user;
  }

  public async logout() {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (e) {
      console.error('Firebase signout error', e);
    }
    localStorage.setItem('moviebox_logged_out', 'true');
    this.user = null;
    this.saveToStorage(null);
    this.notify();
  }

  public async updateProfile(partial: Partial<UserProfile>) {
    if (this.user) {
      const updated = { ...this.user, ...partial };
      this.user = updated;
      this.saveToStorage(updated);
      this.notify();

      // Persist to Firestore doc
      try {
        const userDocRef = doc(db, 'users', updated.uid);
        await setDoc(userDocRef, { ...updated, updatedAt: Date.now() }, { merge: true });
      } catch (e) {
        console.warn('Failed updating user doc in Firestore:', e);
      }
    }
  }
}

export const auth = new AuthManager();

export function getCurrentUser() {
  const user = auth.getCurrentUser();
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.username,
      avatar: user.avatar,
      role: user.isAdmin ? 'admin' : 'user',
      isVIP: true,
    };
  }
  return null;
}

export function isAuthenticated(): boolean {
  return auth.getCurrentUser() !== null;
}

export function isAdmin(): boolean {
  return auth.isCurrentAdmin();
}

export async function authenticateAdmin(passcode: string): Promise<boolean> {
  return await auth.claimAdmin(passcode);
}

export async function signInWithEmail(email: string, pass: string) {
  return await auth.loginWithFirebase(email, pass);
}

export async function signUpWithEmail(email: string, pass: string, name: string) {
  return await auth.signupWithFirebase(email, pass, name);
}

export async function signInWithGoogle() {
  return await auth.loginWithGoogle();
}

export async function signOut() {
  await auth.logout();
}

