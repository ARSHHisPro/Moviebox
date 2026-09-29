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

const partyChannels: Record<string, BroadcastChannel> = {};
function getPartyChannel(roomId: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!partyChannels[roomId]) {
    try {
      partyChannels[roomId] = new BroadcastChannel(`mb_wp_${roomId}`);
    } catch {
      return null;
    }
  }
  return partyChannels[roomId];
}

export async function createWatchPartyRoom(room: Omit<WatchPartyRoom, 'id'>): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomObj: WatchPartyRoom = cleanFirestoreData({
    ...room,
    id: code,
    mediaPoster: room.mediaPoster ?? null,
    currentTime: room.currentTime ?? 0,
    isPlaying: room.isPlaying ?? true,
    messages: room.messages ?? [],
    participants: room.participants ?? {},
    participantCount: room.participantCount ?? 1,
    updatedAt: Date.now(),
  });

  await ensureAuth();
  const docRef = doc(db, 'watch_parties', code);

  try {
    await setDoc(docRef, roomObj);
  } catch (firestoreErr) {
    try {
      await signInAnonymously(auth);
      await setDoc(docRef, roomObj);
    } catch {
      try {
        await api.createWatchParty(roomObj);
      } catch {
      }
    }
  }

  return code;
}

export async function checkWatchPartyRoomExists(roomId: string): Promise<boolean> {
  const code = roomId.trim().toUpperCase();
  if (!code) return false;
  await ensureAuth();

  try {
    const docRef = doc(db, 'watch_parties', code);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return true;
    }
  } catch {
  }

  try {
    const data = await api.getWatchParty(code);
    if (data && (data.id || data.roomId)) {
      return true;
    }
  } catch {
  }

  return false;
}

export async function updateWatchPartyState(roomId: string, updates: Partial<WatchPartyRoom>) {
  const cleanUpdates = cleanFirestoreData({ ...updates, updatedAt: Date.now() });

  try {
    await ensureAuth();
    const docRef = doc(db, 'watch_parties', roomId);
    await setDoc(docRef, cleanUpdates, { merge: true });
  } catch {
    try {
      await api.updateWatchParty(roomId, cleanUpdates);
    } catch {
    }
  }
}

export async function deleteWatchPartyRoom(roomId: string) {
  try {
    await ensureAuth();
    const docRef = doc(db, 'watch_parties', roomId);
    await deleteDoc(docRef);
  } catch {
    try {
      await api.deleteWatchParty(roomId);
    } catch {
    }
  }
}

export async function joinWatchPartyRoom(
  roomId: string,
  userId: string,
  displayName: string
): Promise<{ success: boolean; hostId?: string; error?: string }> {
  const code = roomId.trim().toUpperCase();
  if (!code) return { success: false, error: 'Room code cannot be empty' };

  await ensureAuth();
  let existingRoom: WatchPartyRoom | null = null;
  const docRef = doc(db, 'watch_parties', code);

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      existingRoom = { id: snap.id, ...snap.data() } as WatchPartyRoom;
    }
  } catch {
  }

  if (!existingRoom) {
    try {
      const data = await api.getWatchParty(code);
      if (data && (data.id || data.roomId)) {
        existingRoom = { id: data.id || data.roomId, ...data } as WatchPartyRoom;
      }
    } catch {
    }
  }

  if (!existingRoom) {
    return {
      success: false,
      error: `Room code "${code}" does not exist in the database. Please verify the code with the host.`,
    };
  }

  const participants = existingRoom.participants || {};
  participants[userId] = {
    displayName: displayName || 'Audience Member',
    joinedAt: Date.now(),
    isActive: true,
  };
  const activeCount = Object.keys(participants).filter((k) => participants[k]?.isActive).length;

  const messages = existingRoom.messages || [];
  const hasJoinedMsg = messages.some((m) => m.text.includes(`${displayName} joined the party`));
  if (!hasJoinedMsg && userId !== existingRoom.hostId) {
    messages.push({
      id: Date.now().toString(),
      sender: 'System',
      text: `${displayName} joined the party!`,
      time: Date.now(),
    });
  }

  const updates = cleanFirestoreData({
    participants,
    participantCount: activeCount,
    messages,
    updatedAt: Date.now(),
  });

  await updateWatchPartyState(code, updates);
  return { success: true, hostId: existingRoom.hostId };
}

export async function leaveWatchPartyRoom(roomId: string, userId: string) {
  let existingRoom: WatchPartyRoom | null = null;
  try {
    const local = localStorage.getItem(`moviebox_room_${roomId}`);
    if (local) existingRoom = JSON.parse(local);
  } catch {
  }

  try {
    await ensureAuth();
    const docRef = doc(db, 'watch_parties', roomId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      existingRoom = { id: snap.id, ...snap.data() } as WatchPartyRoom;
    }
  } catch {
  }

  if (!existingRoom) {
    try {
      return await api.leaveWatchParty(roomId, userId);
    } catch {
      return { success: true };
    }
  }

  const participants = existingRoom.participants || {};
  if (participants[userId]) {
    participants[userId].isActive = false;
  }

  const activeList = Object.keys(participants).filter((k) => participants[k]?.isActive);
  if (activeList.length === 0) {
    await deleteWatchPartyRoom(roomId);
    return { success: true, roomDeleted: true };
  }

  let newHostId = existingRoom.hostId;
  let newHostName = existingRoom.hostName;
  let messages = existingRoom.messages || [];

  if (existingRoom.hostId === userId && activeList.length > 0) {
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

  const updates = {
    hostId: newHostId,
    hostName: newHostName,
    participants,
    participantCount: activeList.length,
    messages,
    updatedAt: Date.now(),
  };

  await updateWatchPartyState(roomId, updates);
  return { success: true, newHostId };
}

export function subscribeToWatchParty(roomId: string, callback: (room: WatchPartyRoom | null) => void) {
  let unsubFirestore: (() => void) | null = null;
  let active = true;

  try {
    const local = localStorage.getItem(`moviebox_room_${roomId}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed) callback(parsed);
    }
  } catch {
  }

  const ch = getPartyChannel(roomId);
  const handleBroadcast = (e: MessageEvent) => {
    if (!active) return;
    if (e.data?.type === 'UPDATE' && e.data.room) {
      callback(e.data.room);
    } else if (e.data?.type === 'DELETE') {
      callback(null);
    }
  };
  ch?.addEventListener('message', handleBroadcast);

  const handleStorage = (e: StorageEvent) => {
    if (!active) return;
    if (e.key === `moviebox_room_${roomId}`) {
      if (e.newValue) {
        try {
          callback(JSON.parse(e.newValue));
        } catch {
        }
      } else {
        callback(null);
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  let pollInterval: any = null;
  function startPolling() {
    if (pollInterval) return;
    const fetchRoom = async () => {
      if (!active) return;
      try {
        const data = await api.getWatchParty(roomId);
        if (data && active) {
          const room = { id: data.id || roomId, ...data } as WatchPartyRoom;
          try {
            localStorage.setItem(`moviebox_room_${roomId}`, JSON.stringify(room));
          } catch {
          }
          callback(room);
        }
      } catch {
      }
    };
    fetchRoom();
    pollInterval = setInterval(fetchRoom, 2500);
  }

  try {
    const docRef = doc(db, 'watch_parties', roomId);
    unsubFirestore = onSnapshot(
      docRef,
      (snap) => {
        if (!active) return;
        if (snap.exists()) {
          const roomData = { id: snap.id, ...snap.data() } as WatchPartyRoom;
          try {
            localStorage.setItem(`moviebox_room_${roomId}`, JSON.stringify(roomData));
          } catch {
          }
          callback(roomData);
        } else {
          const local = localStorage.getItem(`moviebox_room_${roomId}`);
          if (!local) {
            callback(null);
          }
        }
      },
      () => {
        startPolling();
      }
    );
  } catch {
    startPolling();
  }

  return () => {
    active = false;
    if (unsubFirestore) unsubFirestore();
    if (pollInterval) clearInterval(pollInterval);
    ch?.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
  };
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
  try {
    await ensureAuth();
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
