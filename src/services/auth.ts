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
import { api } from './api';

const AUTH_STORAGE_KEY = 'moviebox_session';
const ADMIN_FLAG_KEY = 'moviebox_admin_flag';

type AuthListener = (user: UserProfile | null) => void;

class AuthManager {
  private user: UserProfile | null = null;
  private listeners: Set<AuthListener> = new Set();
  private initialized: boolean = false;

  constructor() {
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

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ADMIN_FLAG_KEY);
    this.user = null;
  }

  private async mapAndSyncFirestoreUser(fUser: FirebaseUser): Promise<UserProfile> {
    const isAdmin = fUser.email?.toLowerCase().includes('admin') || 
                    localStorage.getItem(ADMIN_FLAG_KEY) === 'true';

    const username = fUser.displayName || fUser.email?.split('@')[0] || 'Cinephile';
    
    let profileData: UserProfile = {
      uid: fUser.uid,
      email: fUser.email || 'user@moviebox.io',
      username,
      isAdmin: !!isAdmin,
      avatar: fUser.photoURL || '',
      watchTimeMinutes: 120,
      streamedCount: 5,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

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

      await setDoc(userDocRef, {
        ...profileData,
        updatedAt: Date.now()
      }, { merge: true });
    } catch {

    }

    return profileData;
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
    if (!trimmed) return false;

    try {
      const res = await api.verifyAdminPassword(trimmed);
      if (res && res.success) {
        localStorage.setItem(ADMIN_FLAG_KEY, 'true');
        if (this.user) {
          this.user.isAdmin = true;
          this.saveToStorage(this.user);
        }
        this.notify();
        return true;
      }
    } catch {
      return false;
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
    } catch {

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

      try {
        const userDocRef = doc(db, 'users', updated.uid);
        await setDoc(userDocRef, { ...updated, updatedAt: Date.now() }, { merge: true });
      } catch {

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
