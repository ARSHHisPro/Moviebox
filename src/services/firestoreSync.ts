import { api } from './api';
import { db } from './firebase';
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

export interface WatchPartyParticipant {
  displayName: string;
  joinedAt: number;
  isActive: boolean;
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
  participants: Record<string, WatchPartyParticipant>;
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

export async function createWatchPartyRoom(room: Omit<WatchPartyRoom, 'id'>): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  try {
    const docRef = doc(db, 'watch_parties', code);
    await setDoc(docRef, {
      ...room,
      id: code,
      updatedAt: Date.now(),
    });
    return code;
  } catch {
    const data = await api.createWatchParty(room);
    return data?.roomId || code;
  }
}

export async function updateWatchPartyState(roomId: string, updates: Partial<WatchPartyRoom>) {
  try {
    const docRef = doc(db, 'watch_parties', roomId);
    await setDoc(docRef, { ...updates, updatedAt: Date.now() }, { merge: true });
  } catch {
    try {
      await api.updateWatchParty(roomId, updates);
    } catch {
    }
  }
}

export async function deleteWatchPartyRoom(roomId: string) {
  try {
    const docRef = doc(db, 'watch_parties', roomId);
    await deleteDoc(docRef);
  } catch {
    try {
      await api.deleteWatchParty(roomId);
    } catch {
    }
  }
}

export async function joinWatchPartyRoom(roomId: string, userId: string, displayName: string) {
  try {
    const docRef = doc(db, 'watch_parties', roomId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      const participants = data.participants || {};
      participants[userId] = { displayName, joinedAt: Date.now(), isActive: true };
      const activeCount = Object.keys(participants).filter((k) => participants[k].isActive).length;
      await setDoc(docRef, {
        participants,
        participantCount: activeCount,
        updatedAt: Date.now(),
      }, { merge: true });
      return { success: true, hostId: data.hostId };
    }
  } catch {
  }

  try {
    return await api.joinWatchParty(roomId, userId, displayName);
  } catch {
    return null;
  }
}

export async function leaveWatchPartyRoom(roomId: string, userId: string) {
  try {
    const docRef = doc(db, 'watch_parties', roomId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { success: true };

    const data = snap.data() as any;
    const participants = data.participants || {};
    if (participants[userId]) {
      participants[userId].isActive = false;
    }

    const activeList = Object.keys(participants).filter((k) => participants[k].isActive);
    if (activeList.length === 0) {
      await deleteDoc(docRef);
      return { success: true, roomDeleted: true };
    }

    let newHostId = data.hostId;
    let newHostName = data.hostName;
    let messages = data.messages || [];

    if (data.hostId === userId && activeList.length > 0) {
      newHostId = activeList[0];
      newHostName = participants[newHostId]?.displayName || 'New Host';
      messages = [
        ...messages,
        {
          id: Date.now().toString(),
          sender: 'System',
          text: `${newHostName} is now the host.`,
          time: Date.now(),
        },
      ];
    }

    await setDoc(docRef, {
      hostId: newHostId,
      hostName: newHostName,
      participants,
      participantCount: activeList.length,
      messages,
      updatedAt: Date.now(),
    }, { merge: true });

    return { success: true, newHostId };
  } catch {
  }

  try {
    return await api.leaveWatchParty(roomId, userId);
  } catch {
    return null;
  }
}

export function subscribeToWatchParty(roomId: string, callback: (room: WatchPartyRoom | null) => void) {
  let unsubFirestore: (() => void) | null = null;
  let active = true;

  try {
    const docRef = doc(db, 'watch_parties', roomId);
    unsubFirestore = onSnapshot(
      docRef,
      (snap) => {
        if (!active) return;
        if (snap.exists()) {
          callback({ id: snap.id, ...snap.data() } as WatchPartyRoom);
        } else {
          callback(null);
        }
      },
      () => {
        pollFallback();
      }
    );
  } catch {
    pollFallback();
  }

  function pollFallback() {
    const fetchRoom = async () => {
      try {
        const data = await api.getWatchParty(roomId);
        if (active) callback(data ? ({ id: data.id, ...data } as WatchPartyRoom) : null);
      } catch {
        if (active) callback(null);
      }
    };
    fetchRoom();
    const interval = setInterval(fetchRoom, 2500);
    return () => clearInterval(interval);
  }

  return () => {
    active = false;
    if (unsubFirestore) unsubFirestore();
  };
}

export async function getAnnouncementConfig(): Promise<AnnouncementConfig | null> {
  try {
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
  try {
    const docRef = doc(db, 'config', 'announcement');
    await setDoc(docRef, { ...announcement, updatedAt: Date.now() }, { merge: true });
    localStorage.setItem('moviebox_announcement', JSON.stringify(announcement));
    window.dispatchEvent(new Event('moviebox_announcement_updated'));
    return true;
  } catch {
    try {
      await api.setAnnouncement(announcement.text, announcement.type, announcement.active);
      localStorage.setItem('moviebox_announcement', JSON.stringify(announcement));
      window.dispatchEvent(new Event('moviebox_announcement_updated'));
      return true;
    } catch {
      localStorage.setItem('moviebox_announcement', JSON.stringify(announcement));
      window.dispatchEvent(new Event('moviebox_announcement_updated'));
      return true;
    }
  }
}

export async function getLeaderboardTop(): Promise<LeaderboardEntry[]> {
  try {
    const data = await api.getLeaderboard();
    return (data?.entries || []).map((e: any) => ({ id: e.id, ...e }));
  } catch {
    return [];
  }
}

export async function submitTriviaScore(entry: Omit<LeaderboardEntry, 'id'>) {
  try {
    await api.submitTriviaScore(entry);
  } catch {
  }
}

export function subscribeToMediaReviews(mediaId: number, callback: (reviews: CommunityReview[]) => void) {
  let active = true;
  const fetchReviews = async () => {
    try {
      const reviews = await getMediaReviews(mediaId);
      if (active) callback(reviews);
    } catch {
      if (active) callback([]);
    }
  };

  fetchReviews();
  const interval = setInterval(fetchReviews, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}
