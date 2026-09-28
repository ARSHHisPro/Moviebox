import confetti from 'canvas-confetti';
import { toast } from './toast';
import { api } from './api';

export interface LockedMovie {
  tmdbId: number;
  mediaType?: 'movie' | 'tv';
  title?: string;
  isLocked: boolean;
  lockedUntil?: number | null;
  reason?: string;
  lockedBy?: string;
  updatedAt: number;
}

type LockListener = (locks: Record<number, LockedMovie>) => void;

class LockStore {
  private locks: Record<number, LockedMovie> = {};
  private listeners: Set<LockListener> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initBackendSync();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('moviebox_locked_movies_v2');
      if (stored) {
        this.locks = JSON.parse(stored);
      }
    } catch {

    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('moviebox_locked_movies_v2', JSON.stringify(this.locks));
    } catch {

    }
  }

  private async initBackendSync() {
    await this.syncFromBackend();
    setInterval(() => {
      this.syncFromBackend();
    }, 30000);
  }

  private async syncFromBackend() {
    try {
      const data = await api.getLocks();
      if (data && data.locks) {
        this.locks = data.locks;
        this.saveToStorage();
        this.notify();
      }
    } catch {

    }
  }

  private async syncToBackend() {
    this.saveToStorage();
    this.notify();
    try {
      await api.setLock({ locks: this.locks, lastUpdated: Date.now() });
    } catch {

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

    if (item.lockedUntil && Date.now() >= item.lockedUntil) {
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

    await this.syncToBackend();
    toast.error('Locked TMDB ID ' + tmdbId + (durationMinutes ? ` for ${durationMinutes} mins` : ' indefinitely'));
  }

  public async unlockMovie(tmdbId: number, isAutoUnlock: boolean = false) {
    if (this.locks[tmdbId]) {
      this.locks[tmdbId].isLocked = false;
      await this.syncToBackend();
      this.triggerConfetti();

      if (isAutoUnlock) {
        toast.success('Lock expired! ' + (this.locks[tmdbId].title || tmdbId) + ' is now UNLOCKED!');
      } else {
        toast.success('Unlocked ' + (this.locks[tmdbId].title || tmdbId) + '! Confetti released!');
      }
    }
  }

  public getAllLocks(): LockedMovie[] {
    return Object.values(this.locks);
  }

  public triggerConfetti() {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d2ff', '#7b2cbf', '#ec4899', '#ffffff', '#ffd700'],
      });

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
    } catch {

    }
  }
}

export const lockStore = new LockStore();
