import { FavoriteItem, WatchProgress, WatchHistoryItem, MediaItem, MediaType } from '../types';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './auth';

type Listener<T> = (items: T[]) => void;

class SubscribedStore<T> {
  protected key: string;
  private listeners: Set<Listener<T>> = new Set();
  protected items: T[] = [];

  constructor(key: string) {
    this.key = key;
    this.items = this.load();
  }

  private load(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  protected save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.items));
    } catch (e) {
      console.warn(`Failed to save ${this.key} to localStorage`, e);
    }
    this.notify();
  }

  public subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    listener(this.items);
    return () => {
      this.listeners.delete(listener);
    };
  }

  protected notify() {
    this.listeners.forEach((l) => l(this.items));
  }

  public getAll(): T[] {
    return [...this.items];
  }

  public getItems(): T[] {
    return this.getAll();
  }

  public setAll(items: T[], syncToRemote: boolean = true) {
    this.items = items;
    this.save();
    if (syncToRemote) {
      this.syncToFirestore();
    }
  }

  protected syncToFirestore() {
    // Override in subclass if needed
  }

  public clear() {
    this.items = [];
    this.save();
    this.syncToFirestore();
  }
}

// 1. Favorites Store with Firestore backup
class FavoritesStore extends SubscribedStore<FavoriteItem> {
  private currentUserId: string | null = null;
  private unsubscribeRemote: (() => void) | null = null;

  constructor() {
    super('moviebox_favorites');
    auth.subscribe((user) => {
      const newUid = user ? user.uid : null;
      if (newUid !== this.currentUserId) {
        this.currentUserId = newUid;
        this.initUserRemoteSync(newUid);
      }
    });
  }

  private initUserRemoteSync(uid: string | null) {
    if (this.unsubscribeRemote) {
      this.unsubscribeRemote();
      this.unsubscribeRemote = null;
    }
    if (!uid) return;

    try {
      const favDocRef = doc(db, 'users', uid, 'data', 'favorites');
      this.unsubscribeRemote = onSnapshot(favDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.items)) {
            this.items = data.items;
            this.save();
          }
        } else if (this.items.length > 0) {
          // Push initial local items to Firestore
          setDoc(favDocRef, { items: this.items, updatedAt: Date.now() }, { merge: true }).catch(() => {});
        }
      }, (err) => {
        console.warn('Firestore favorites sync warning:', err);
      });
    } catch (e) {
      console.warn('Error setting up remote favorites listener:', e);
    }
  }

  protected syncToFirestore() {
    if (!this.currentUserId) return;
    try {
      const favDocRef = doc(db, 'users', this.currentUserId, 'data', 'favorites');
      setDoc(favDocRef, { items: this.items, updatedAt: Date.now() }, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Firestore favorites save error:', e);
    }
  }

  public isFavorite(id: number, type: MediaType): boolean {
    return this.getAll().some((item) => item.id === id && item.type === type);
  }

  public toggleFavorite(media: MediaItem, genreNames: string[] = []): boolean {
    const type: MediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');
    const existing = this.getAll().find((f) => f.id === media.id && f.type === type);

    if (existing) {
      const updated = this.getAll().filter((f) => !(f.id === media.id && f.type === type));
      this.setAll(updated);
      return false; // removed
    } else {
      const newItem: FavoriteItem = {
        id: media.id,
        type,
        title: media.title || media.name || 'Untitled',
        poster: media.poster_path,
        backdrop: media.backdrop_path,
        rating: Math.round((media.vote_average || 0) * 10) / 10,
        year: (media.release_date || media.first_air_date || '').substring(0, 4) || 'N/A',
        genres: genreNames,
        addedAt: Date.now(),
      };
      this.setAll([newItem, ...this.getAll()]);
      return true; // added
    }
  }

  public removeFavorite(id: number, type: MediaType) {
    const updated = this.getAll().filter((f) => !(f.id === id && f.type === type));
    this.setAll(updated);
  }
}

// 2. Continue Watching Store
class ContinueWatchingStore extends SubscribedStore<WatchProgress> {
  constructor() {
    super('moviebox_continue_watching');
  }

  public getById(id: number, type: MediaType, season?: number, episode?: number): WatchProgress | undefined {
    return this.getAll().find((item) => item.id === id && item.type === type && item.season === season && item.episode === episode);
  }

  public saveProgress(progressData: {
    id: number;
    type: MediaType;
    title: string;
    poster: string | null;
    backdrop: string | null;
    season?: number;
    episode?: number;
    lastPosition: number;
    duration: number;
  }) {
    if (!progressData.duration || progressData.duration <= 0) return;
    const progressRatio = Math.min(1, Math.max(0, progressData.lastPosition / progressData.duration));

    // Filter existing
    const filtered = this.getAll().filter(
      (item) => !(item.id === progressData.id && item.type === progressData.type && item.season === progressData.season && item.episode === progressData.episode)
    );

    // If completed (> 95%), don't show in continue watching
    if (progressRatio > 0.95) {
      this.setAll(filtered);
      return;
    }

    const newItem: WatchProgress = {
      ...progressData,
      progress: progressRatio,
      lastWatched: Date.now(),
    };

    // Keep max 50 items
    const updated = [newItem, ...filtered].slice(0, 50);
    this.setAll(updated);
  }

  public removeItem(id: number, type: MediaType, season?: number, episode?: number) {
    const updated = this.getAll().filter(
      (item) => !(item.id === id && item.type === type && (season === undefined || item.season === season) && (episode === undefined || item.episode === episode))
    );
    this.setAll(updated);
  }
}

// 3. Watch History Store
class WatchHistoryStore extends SubscribedStore<WatchHistoryItem> {
  constructor() {
    super('moviebox_watch_history');
  }

  public recordWatch(historyData: {
    id: number;
    type: MediaType;
    title: string;
    poster: string | null;
    progress: number;
    duration: number;
    season?: number;
    episode?: number;
  }) {
    const filtered = this.getAll().filter((item) => !(item.id === historyData.id && item.type === historyData.type && item.season === historyData.season && item.episode === historyData.episode));

    const newItem: WatchHistoryItem = {
      ...historyData,
      watchedAt: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, 100);
    this.setAll(updated);
  }

  public removeItem(id: number, type: MediaType) {
    const updated = this.getAll().filter((item) => !(item.id === id && item.type === type));
    this.setAll(updated);
  }
}

// 4. Recent Searches Store
class RecentSearchStore extends SubscribedStore<string> {
  constructor() {
    super('moviebox_recent_searches');
  }

  public addSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    const filtered = this.getAll().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 10);
    this.setAll(updated);
  }

  public removeSearch(query: string) {
    const updated = this.getAll().filter((q) => q.toLowerCase() !== query.toLowerCase());
    this.setAll(updated);
  }
}

// Export singletons
export const favoritesStore = new FavoritesStore();
export const continueWatchingStore = new ContinueWatchingStore();
export const watchHistoryStore = new WatchHistoryStore();
export const recentSearchStore = new RecentSearchStore();
