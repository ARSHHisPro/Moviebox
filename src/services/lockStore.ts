import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import confetti from 'canvas-confetti';
import { toast } from './toast';

export interface LockedMovie {
  tmdbId: number;
  mediaType?: 'movie' | 'tv';
  title?: string;
  isLocked: boolean;
  lockedUntil?: number | null; // Epoch timestamp ms
  reason?: string;
  lockedBy?: string;
  updatedAt: number;
}

const STORAGE_KEY = 'moviebox_locked_movies_v2';
type LockListener = (locks: Record<number, LockedMovie>) => void;

class LockStore {
  private locks: Record<number, LockedMovie> = {};
  private listeners: Set<LockListener> = new Set();
  private docRef = doc(db, 'config', 'locked_movies');

  constructor() {
    this.loadFromStorage();
    this.initFirestoreListener();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.locks = JSON.parse(stored);
      }
    } catch {}
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.locks));
    } catch {}
  }

  private initFirestoreListener() {
    try {
      onSnapshot(this.docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.locks) {
            this.locks = data.locks;
            this.saveToStorage();
            this.notify();
          }
        } else {
          // Auto-initialize document in Firestore if it doesn't exist
          setDoc(this.docRef, { locks: this.locks, lastUpdated: Date.now() }, { merge: true }).catch(() => {});
        }
      }, (err) => {
        console.warn('Firestore locks snapshot warning:', err);
      });
    } catch (e) {
      console.warn('Could not initialize Firestore locks listener', e);
    }
  }

  private async syncToFirestore() {
    this.saveToStorage();
    this.notify();
    try {
      await setDoc(this.docRef, { locks: this.locks, lastUpdated: Date.now() }, { merge: true });
    } catch (e) {
      console.warn('Firestore lock write failed (saving locally)', e);
    }
  }

  public subscribe(listener: LockListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.locks });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.locks }));
  }

  public isMovieLocked(tmdbId: number): { isLocked: boolean; lockedUntil?: number | null; reason?: string } {
    const item = this.locks[tmdbId];
    if (!item || !item.isLocked) {
      return { isLocked: false };
    }

    // Check if timed lock expired
    if (item.lockedUntil && Date.now() >= item.lockedUntil) {
      // Auto unlock and trigger confetti!
      this.unlockMovie(tmdbId, true);
      return { isLocked: false };
    }

    return {
      isLocked: true,
      lockedUntil: item.lockedUntil,
      reason: item.reason || 'Locked by Owner',
    };
  }

  public async lockMovie(
    tmdbId: number, 
    mediaType: 'movie' | 'tv' = 'movie', 
    title?: string, 
    durationMinutes?: number, 
    reason: string = 'Exclusive Owner Lock'
  ) {
    const lockedUntil = durationMinutes && durationMinutes > 0 ? Date.now() + durationMinutes * 60 * 1000 : null;

    this.locks[tmdbId] = {
      tmdbId,
      mediaType,
      title: title || `Item #${tmdbId}`,
      isLocked: true,
      lockedUntil,
      reason,
      updatedAt: Date.now(),
    };

    await this.syncToFirestore();
    toast.error(`Locked TMDB ID ${tmdbId} ${durationMinutes ? `for ${durationMinutes} mins` : 'indefinitely'}`);
  }

  public async unlockMovie(tmdbId: number, isAutoUnlock: boolean = false) {
    if (this.locks[tmdbId]) {
      this.locks[tmdbId].isLocked = false;
      await this.syncToFirestore();

      // Trigger Confetti!
      this.triggerConfetti();

      if (isAutoUnlock) {
        toast.success(`🎉 Lock expired! "${this.locks[tmdbId].title || tmdbId}" is now UNLOCKED!`);
      } else {
        toast.success(`🎉 Unlocked "${this.locks[tmdbId].title || tmdbId}"! Confetti released!`);
      }
    }
  }

  public getAllLocks(): LockedMovie[] {
    return Object.values(this.locks);
  }

  public triggerConfetti() {
    try {
      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d2ff', '#7b2cbf', '#ec4899', '#ffffff', '#ffd700'],
      });

      // Side cannons after 200ms
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00d2ff', '#ffd700'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ec4899', '#7b2cbf'],
        });
      }, 200);
    } catch (e) {
      console.warn('Confetti trigger error:', e);
    }
  }
}

export const lockStore = new LockStore();
