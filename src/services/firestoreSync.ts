import { api } from './api';
import { db, auth, signInAnonymously } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit
} from 'firebase/firestore';

export interface CustomPlaylist {
  id: string;
  userId: string;
  title: string;
  description: string;
  itemCount: number;
  items: Array<{
    id: number;
    title: string;
    poster: string | null;
    type: 'movie' | 'tv';
    year?: string;
  }>;
  createdAt: number;
}

export interface CommunityReview {
  id: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  userId: string;
  username: string;
  userAvatar: string;
  rating: number;
  reviewText: string;
  upvotes: number;
  createdAt: number;
}



export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  streak: number;
  rankTitle: string;
  updatedAt: number;
}

export interface AnnouncementConfig {
  text: string;
  type: 'info' | 'warning' | 'alert' | 'promo';
  active: boolean;
  updatedAt?: number;
}

export async function getUserPlaylists(_userId: string): Promise<CustomPlaylist[]> {
  try {
    const data = await api.getUserData();
    return (data?.playlists || []).map((p: any) => ({ id: p.id, ...p }));
  } catch {
    return [];
  }
}

export async function saveUserPlaylist(_userId: string, playlist: Omit<CustomPlaylist, 'id'>): Promise<string> {
  const data = await api.updateUserData('playlists', null, playlist, 'add');
  return data?.id || Math.random().toString(36).substring(7);
}

export async function getMediaReviews(mediaId: number): Promise<CommunityReview[]> {
  try {
    const q = query(collection(db, 'reviews'), where('mediaId', '==', Number(mediaId)), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityReview));
    }
  } catch {
  }

  try {
    const data = await api.getReviews(mediaId);
    return (data?.reviews || []).map((r: any) => ({ id: r.id, ...r }));
  } catch {
    return [];
  }
}

export async function addMediaReview(review: Omit<CommunityReview, 'id'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: Date.now(),
    });
    return ref.id;
  } catch {
    const data = await api.postReview(review);
    return data?.id || Math.random().toString(36).substring(7);
  }
}

function cleanFirestoreData<T>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData) as any;
  }
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanFirestoreData(value);
    }
  }
  return result;
}

async function ensureAuth() {
  try {
    if (auth && !auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch {
  }
}

export async function getAnnouncementConfig(): Promise<AnnouncementConfig | null> {
  try {
    await ensureAuth();
    const docRef = doc(db, 'config', 'announcement');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AnnouncementConfig;
      localStorage.setItem('moviebox_announcement', JSON.stringify(data));
      return data;
    }
  } catch {
  }

  try {
    const cached = localStorage.getItem('moviebox_announcement');
    if (cached) return JSON.parse(cached);
  } catch {
  }

  try {
    const res = await api.getAnnouncement();
    if (res?.announcement) return res.announcement;
  } catch {
  }

  return {
    text: "Welcome to MovieBox+! Spider-Man: Brand New Day cinema re-release event is now live.",
    type: 'info',
    active: true,
  };
}

export async function setAnnouncementConfig(announcement: AnnouncementConfig): Promise<boolean> {
  const payload = { ...announcement, updatedAt: Date.now() };
  try {
    await ensureAuth();
    const docRef = doc(db, 'config', 'announcement');
    await setDoc(docRef, payload, { merge: true });
    localStorage.setItem('moviebox_announcement', JSON.stringify(payload));
  } catch (err) {
    console.error('Direct firestore setAnnouncementConfig failed:', err);
  }

  try {
    await api.setAnnouncement(announcement.text, announcement.type, announcement.active);
    localStorage.setItem('moviebox_announcement', JSON.stringify(payload));
  } catch (err) {
    console.error('API setAnnouncement failed:', err);
  }

  window.dispatchEvent(new Event('moviebox_announcement_updated'));
  return true;
}

export interface SystemSettings {
  allowRegistrations: boolean;
  appName: string;
  appUrl: string;
  maintenanceMode: boolean;
  maxContinueWatching: number;
  maxPlaylistsPerUser: number;
  maxWatchHistory: number;
  updatedAt: number;
}

const DEFAULT_SETTINGS: SystemSettings = {
  allowRegistrations: true,
  appName: "MovieBox Premium",
  appUrl: "https://moviebox-premium-boxez.vercel.app",
  maintenanceMode: false,
  maxContinueWatching: 50,
  maxPlaylistsPerUser: 20,
  maxWatchHistory: 100,
  updatedAt: Date.now()
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    await ensureAuth();
    const docRef = doc(db, 'config', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SystemSettings;
      localStorage.setItem('moviebox_system_settings', JSON.stringify(data));
      return { ...DEFAULT_SETTINGS, ...data };
    }
  } catch {}

  try {
    const local = localStorage.getItem('moviebox_system_settings');
    if (local) return JSON.parse(local);
  } catch {}

  return DEFAULT_SETTINGS;
}

export async function updateSystemSettings(updates: Partial<SystemSettings>): Promise<boolean> {
  const merged = { ...updates, updatedAt: Date.now() };
  try {
    await ensureAuth();
    const docRef = doc(db, 'config', 'settings');
    await setDoc(docRef, cleanFirestoreData(merged), { merge: true });
    localStorage.setItem('moviebox_system_settings', JSON.stringify(merged));
  } catch (err) {
    console.error('Direct firestore updateSystemSettings failed:', err);
  }

  try {
    await api.updateSettings(cleanFirestoreData(merged));
    localStorage.setItem('moviebox_system_settings', JSON.stringify(merged));
  } catch (err) {
    console.error('API updateSettings failed:', err);
  }

  window.dispatchEvent(new Event('moviebox_settings_updated'));
  return true;
}

export function subscribeToSystemSettings(callback: (settings: SystemSettings) => void): () => void {
  try {
    const docRef = doc(db, 'config', 'settings');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SystemSettings;
        localStorage.setItem('moviebox_system_settings', JSON.stringify(data));
        callback({ ...DEFAULT_SETTINGS, ...data });
      }
    });
  } catch {
    getSystemSettings().then(callback);
    return () => {};
  }
}

const SEED_LEADERBOARD_ENTRIES: Omit<LeaderboardEntry, 'id'>[] = [
  {
    userId: 'cinephile_prime',
    username: 'MovieBuff',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    score: 1850,
    streak: 14,
    rankTitle: 'Grand Cinephile',
    updatedAt: Date.now() - 3600000
  },
  {
    userId: 'cine_sophia',
    username: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    score: 1620,
    streak: 11,
    rankTitle: 'Master Director',
    updatedAt: Date.now() - 7200000
  },
  {
    userId: 'marcus_v',
    username: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    score: 1400,
    streak: 8,
    rankTitle: 'Film Critic Legend',
    updatedAt: Date.now() - 14400000
  },
  {
    userId: 'retro_alex',
    username: 'Alex Rivers',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    score: 1150,
    streak: 6,
    rankTitle: 'Sci-Fi Maestro',
    updatedAt: Date.now() - 28800000
  },
  {
    userId: 'blockbuster_hero',
    username: 'Peter Parker',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100',
    score: 950,
    streak: 4,
    rankTitle: 'Cinema Scout',
    updatedAt: Date.now() - 86400000
  }
];

export async function getLeaderboardTop(): Promise<LeaderboardEntry[]> {
  try {
    await ensureAuth();
    const snap = await getDocs(collection(db, 'leaderboard'));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeaderboardEntry));
      items.sort((a, b) => (b.score || 0) - (a.score || 0));
      return items;
    }

    // Seed Firestore leaderboard if empty so it will never be empty again
    for (const seed of SEED_LEADERBOARD_ENTRIES) {
      try {
        await setDoc(doc(db, 'leaderboard', seed.userId), cleanFirestoreData(seed));
      } catch {}
    }

    return SEED_LEADERBOARD_ENTRIES.map((s, idx) => ({ id: s.userId || `seed-${idx}`, ...s }));
  } catch {
    try {
      const data = await api.getLeaderboard();
      if (data?.entries && data.entries.length > 0) {
        return (data.entries || []).map((e: any) => ({ id: e.id, ...e }));
      }
    } catch {}
    return SEED_LEADERBOARD_ENTRIES.map((s, idx) => ({ id: s.userId || `seed-${idx}`, ...s }));
  }
}

export async function submitTriviaScore(entry: Omit<LeaderboardEntry, 'id'>) {
  try {
    await ensureAuth();
    const docId = entry.userId || `user_${Date.now()}`;
    await setDoc(
      doc(db, 'leaderboard', docId),
      cleanFirestoreData({
        ...entry,
        id: docId,
        updatedAt: Date.now()
      }),
      { merge: true }
    );
  } catch {}

  try {
    await api.submitTriviaScore(entry);
  } catch {}
}

export function subscribeToLeaderboard(callback: (entries: LeaderboardEntry[]) => void): () => void {
  try {
    const colRef = collection(db, 'leaderboard');
    return onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeaderboardEntry));
        items.sort((a, b) => (b.score || 0) - (a.score || 0));
        callback(items);
      } else {
        getLeaderboardTop().then(callback);
      }
    }, () => {
      getLeaderboardTop().then(callback);
    });
  } catch {
    getLeaderboardTop().then(callback);
    return () => {};
  }
}

export async function getFirestoreUsers(): Promise<any[]> {
  try {
    await ensureAuth();
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.displayName || data.username || d.id,
          email: data.email || 'N/A',
          role: data.isAdmin ? 'admin' : (data.isVip ? 'vip' : 'user'),
          status: 'Active',
          avatar: data.photoURL || data.avatar || '',
          preferences: data.preferences,
          createdAt: data.createdAt || Date.now(),
        };
      });
    }
  } catch {}
  return [];
}

export function subscribeToMediaReviews(mediaId: number, callback: (reviews: CommunityReview[]) => void): () => void {
  let unsubFirestore: (() => void) | null = null;
  let active = true;

  try {
    const q = query(collection(db, 'reviews'), where('mediaId', '==', Number(mediaId)));
    unsubFirestore = onSnapshot(q, (snap) => {
      if (!active) return;
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityReview));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(list);
      } else {
        getMediaReviews(mediaId).then((revs) => {
          if (active) callback(revs);
        });
      }
    }, () => {
      getMediaReviews(mediaId).then((revs) => {
        if (active) callback(revs);
      });
    });
  } catch {
    getMediaReviews(mediaId).then((revs) => {
      if (active) callback(revs);
    });
  }

  return () => {
    active = false;
    if (unsubFirestore) unsubFirestore();
  };
}
