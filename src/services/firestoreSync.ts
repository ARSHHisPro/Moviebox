import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
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
  rating: number; // 1-10
  reviewText: string;
  upvotes: number;
  createdAt: number;
}

export interface WatchPartyRoom {
  id: string;
  hostId: string;
  hostName: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  mediaPoster: string | null;
  currentTime: number;
  isPlaying: boolean;
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    time: number;
  }>;
  participantCount: number;
  updatedAt: number;
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

// Admin Passcode Firestore Fetch/Update (/config/Admin panel)
export async function getAdminPasswordFromFirestore(): Promise<string> {
  try {
    const configRef = doc(db, 'config', 'Admin panel');
    const snap = await getDoc(configRef);
    if (snap.exists() && snap.data().password) {
      return snap.data().password;
    }
  } catch (e) {
    console.warn('Error reading admin password from Firestore:', e);
  }
  return 'MMSW-BLUEBOX';
}

export async function updateAdminPasswordInFirestore(newPassword: string): Promise<boolean> {
  try {
    const configRef = doc(db, 'config', 'Admin panel');
    await setDoc(configRef, { 
      password: newPassword, 
      updatedAt: Date.now() 
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed updating admin password in Firestore:', e);
    return false;
  }
}

// Ensure Firestore system documents exist automatically on app startup
export async function ensureFirestoreDefaults() {
  try {
    const adminDocRef = doc(db, 'config', 'Admin panel');
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
      await setDoc(adminDocRef, {
        password: 'MMSW-BLUEBOX',
        updatedAt: Date.now()
      });
    }

    const locksDocRef = doc(db, 'config', 'locked_movies');
    const locksSnap = await getDoc(locksDocRef);
    if (!locksSnap.exists()) {
      await setDoc(locksDocRef, {
        locks: {},
        lastUpdated: Date.now()
      });
    }
  } catch (e) {
    console.warn('Firestore auto-initialization warning:', e);
  }
}

// Auto-run defaults check on import
ensureFirestoreDefaults();

// User Custom Playlists
export async function getUserPlaylists(userId: string): Promise<CustomPlaylist[]> {
  try {
    const colRef = collection(db, 'users', userId, 'playlists');
    const snap = await getDocs(colRef);
    const lists: CustomPlaylist[] = [];
    snap.forEach((d) => {
      lists.push({ id: d.id, ...d.data() } as CustomPlaylist);
    });
    return lists;
  } catch (e) {
    console.warn('Error fetching playlists from Firestore:', e);
    return [];
  }
}

export async function saveUserPlaylist(userId: string, playlist: Omit<CustomPlaylist, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, 'users', userId, 'playlists');
    const docRef = await addDoc(colRef, {
      ...playlist,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (e) {
    console.error('Error saving playlist:', e);
    throw e;
  }
}

// Community Reviews (Realtime + Single Query to avoid composite index requirements)
export function subscribeToMediaReviews(mediaId: number, callback: (reviews: CommunityReview[]) => void) {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('mediaId', '==', mediaId)
    );
    return onSnapshot(q, (snap) => {
      const reviews: CommunityReview[] = [];
      snap.forEach((d) => {
        reviews.push({ id: d.id, ...d.data() } as CommunityReview);
      });
      reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(reviews);
    }, (err) => {
      console.warn('Reviews snapshot listener warning:', err);
      callback([]);
    });
  } catch (e) {
    console.warn('Error setting up reviews listener:', e);
    return () => {};
  }
}

export async function getMediaReviews(mediaId: number): Promise<CommunityReview[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('mediaId', '==', mediaId),
      limit(50)
    );
    const snap = await getDocs(q);
    const reviews: CommunityReview[] = [];
    snap.forEach((d) => {
      reviews.push({ id: d.id, ...d.data() } as CommunityReview);
    });
    reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return reviews;
  } catch (e) {
    console.warn('Error fetching reviews:', e);
    return [];
  }
}

export async function addMediaReview(review: Omit<CommunityReview, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, 'reviews');
    const docRef = await addDoc(colRef, {
      ...review,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (e) {
    console.error('Error posting review:', e);
    throw e;
  }
}

// Watch Party Sync
export function subscribeToWatchParty(roomId: string, callback: (room: WatchPartyRoom | null) => void) {
  const roomRef = doc(db, 'watch_parties', roomId);
  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as WatchPartyRoom);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('Watch party snapshot listener error:', err);
  });
}

export async function createWatchPartyRoom(room: Omit<WatchPartyRoom, 'id'>): Promise<string> {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'watch_parties', roomId);
  await setDoc(roomRef, {
    ...room,
    updatedAt: Date.now()
  });
  return roomId;
}

export async function updateWatchPartyState(roomId: string, updates: Partial<WatchPartyRoom>) {
  const roomRef = doc(db, 'watch_parties', roomId);
  await updateDoc(roomRef, {
    ...updates,
    updatedAt: Date.now()
  });
}

// Trivia Leaderboard
export async function getLeaderboardTop(): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    const list: LeaderboardEntry[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as LeaderboardEntry);
    });
    return list;
  } catch (e) {
    console.warn('Leaderboard error:', e);
    return [];
  }
}

export async function submitTriviaScore(entry: Omit<LeaderboardEntry, 'id'>) {
  try {
    const userRef = doc(db, 'leaderboard', entry.userId);
    await setDoc(userRef, {
      ...entry,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn('Submit trivia score warning:', e);
  }
}
