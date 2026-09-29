import { FavoriteItem, WatchProgress, WatchHistoryItem, MediaItem, MediaType } from '../types';
import { auth } from './auth';
import { api } from './api';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';

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
    } catch {

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

  public setAll(items: T[]) {
    this.items = items;
    this.save();
  }

  public clear() {
    this.items = [];
    this.save();
  }
}

class FavoritesStore extends SubscribedStore<FavoriteItem> {
  private currentUserId: string | null = null;

  constructor() {
    super('moviebox_favorites');
    auth.subscribe((user) => {
      const newUid = user ? user.uid : null;
      if (newUid !== this.currentUserId) {
        this.currentUserId = newUid;
        if (newUid) {
          this.loadFromFirestore(newUid);
          this.syncToBackend();
        }
      }
    });
  }

  private async loadFromFirestore(uid: string) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'favorites'));
      if (!snap.empty) {
        const remoteFavorites = snap.docs.map((d) => d.data() as FavoriteItem);
        const map = new Map<string, FavoriteItem>();
        for (const item of [...this.items, ...remoteFavorites]) {
          map.set(`${item.type}_${item.id}`, item);
        }
        this.setAll(Array.from(map.values()));
      }
    } catch {}
  }

  private async syncToBackend() {
    if (!this.currentUserId) return;
    try {
      await api.updateUserData('favorites', null, { items: this.items, syncedAt: Date.now() }, 'replace');
    } catch {}

    try {
      const uid = this.currentUserId;
      await setDoc(doc(db, 'users', uid), { favorites: this.items }, { merge: true });
      for (const item of this.items.slice(0, 30)) {
        await setDoc(doc(db, 'users', uid, 'favorites', `${item.type}_${item.id}`), item, { merge: true });
      }
    } catch {}
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
      this.syncToBackend();
      if (this.currentUserId) {
        deleteDoc(doc(db, 'users', this.currentUserId, 'favorites', `${type}_${media.id}`)).catch(() => {});
      }
      return false;
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
      this.syncToBackend();
      return true;
    }
  }

  public removeFavorite(id: number, type: MediaType) {
    const updated = this.getAll().filter((f) => !(f.id === id && f.type === type));
    this.setAll(updated);
    this.syncToBackend();
    if (this.currentUserId) {
      deleteDoc(doc(db, 'users', this.currentUserId, 'favorites', `${type}_${id}`)).catch(() => {});
    }
  }
}

class ContinueWatchingStore extends SubscribedStore<WatchProgress> {
  private currentUserId: string | null = null;

  constructor() {
    super('moviebox_continue_watching');
    auth.subscribe((user) => {
      const newUid = user ? user.uid : null;
      if (newUid !== this.currentUserId) {
        this.currentUserId = newUid;
        if (newUid) {
          this.loadFromFirestore(newUid);
        }
      }
    });
  }

  private async loadFromFirestore(uid: string) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'continue_watching'));
      if (!snap.empty) {
        const remoteItems = snap.docs.map((d) => d.data() as WatchProgress);
        const map = new Map<string, WatchProgress>();
        for (const item of [...this.items, ...remoteItems]) {
          const key = `${item.type}_${item.id}_${item.season || 0}_${item.episode || 0}`;
          map.set(key, item);
        }
        this.setAll(Array.from(map.values()));
      }
    } catch {}
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

    const filtered = this.getAll().filter(
      (item) => !(item.id === progressData.id && item.type === progressData.type && item.season === progressData.season && item.episode === progressData.episode)
    );

    if (progressRatio > 0.95) {
      this.setAll(filtered);
      if (this.currentUserId) {
        const key = `${progressData.type}_${progressData.id}_${progressData.season || 0}_${progressData.episode || 0}`;
        deleteDoc(doc(db, 'users', this.currentUserId, 'continue_watching', key)).catch(() => {});
      }
      return;
    }

    const newItem: WatchProgress = {
      ...progressData,
      progress: progressRatio,
      lastWatched: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, 50);
    this.setAll(updated);

    if (this.currentUserId) {
      const uid = this.currentUserId;
      const key = `${progressData.type}_${progressData.id}_${progressData.season || 0}_${progressData.episode || 0}`;
      setDoc(doc(db, 'users', uid, 'continue_watching', key), newItem, { merge: true }).catch(() => {});
      setDoc(doc(db, 'users', uid), { continue_watching: updated.slice(0, 20) }, { merge: true }).catch(() => {});
    }
  }

  public removeItem(id: number, type: MediaType, season?: number, episode?: number) {
    const updated = this.getAll().filter(
      (item) => !(item.id === id && item.type === type && (season === undefined || item.season === season) && (episode === undefined || item.episode === episode))
    );
    this.setAll(updated);

    if (this.currentUserId) {
      const key = `${type}_${id}_${season || 0}_${episode || 0}`;
      deleteDoc(doc(db, 'users', this.currentUserId, 'continue_watching', key)).catch(() => {});
      setDoc(doc(db, 'users', this.currentUserId), { continue_watching: updated }, { merge: true }).catch(() => {});
    }
  }
}

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

export const favoritesStore = new FavoritesStore();
export const continueWatchingStore = new ContinueWatchingStore();
export const watchHistoryStore = new WatchHistoryStore();
export const recentSearchStore = new RecentSearchStore();
