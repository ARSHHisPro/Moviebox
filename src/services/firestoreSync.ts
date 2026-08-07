import { toast } from './toast';
import { api } from './api';

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

// Admin Passcode Firestore Fetch/Update
export async function getAdminPasswordFromFirestore(): Promise<string> {
  try {
    const data = await api.getAdminPassword();
    return data?.password || 'MMSW-BLUEBOX';
  } catch (e) {
    console.warn('Error reading admin password:', e);
    return 'MMSW-BLUEBOX';
  }
}

export async function updateAdminPasswordInFirestore(newPassword: string): Promise<boolean> {
  try {
    await api.updateAdminPassword(newPassword);
    return true;
  } catch (e) {
    console.error('Failed updating admin password:', e);
    return false;
  }
}

// User Custom Playlists
export async function getUserPlaylists(userId: string): Promise<CustomPlaylist[]> {
  try {
    const data = await api.getUserData();
    return (data?.playlists || []).map((p: any) => ({ id: p.id, ...p }));
  } catch (e) {
    console.warn('Error fetching playlists:', e);
    return [];
  }
}

export async function saveUserPlaylist(userId: string, playlist: Omit<CustomPlaylist, 'id'>): Promise<string> {
  try {
    const data = await api.updateUserData('playlists', null, playlist, 'add');
    return data?.id || Math.random().toString(36).substring(7);
  } catch (e) {
    console.error('Error saving playlist:', e);
    throw e;
  }
}

// Community Reviews
export async function getMediaReviews(mediaId: number): Promise<CommunityReview[]> {
  try {
    const data = await api.getReviews(mediaId);
    return (data?.reviews || []).map((r: any) => ({ id: r.id, ...r }));
  } catch (e) {
    console.warn('Error fetching reviews:', e);
    return [];
  }
}

export async function addMediaReview(review: Omit<CommunityReview, 'id'>): Promise<string> {
  try {
    const data = await api.postReview(review);
    return data?.id || Math.random().toString(36).substring(7);
  } catch (e) {
    console.error('Error posting review:', e);
    throw e;
  }
}

// Watch Party Sync
export async function createWatchPartyRoom(room: Omit<WatchPartyRoom, 'id'>): Promise<string> {
  try {
    const data = await api.createWatchParty(room);
    return data?.roomId || Math.random().toString(36).substring(2, 8).toUpperCase();
  } catch (e) {
    console.error('Error creating watch party:', e);
    throw e;
  }
}

export async function updateWatchPartyState(roomId: string, updates: Partial<WatchPartyRoom>) {
  try {
    await api.updateWatchParty(roomId, updates);
  } catch (e) {
    console.warn('Error updating watch party:', e);
  }
}

// Trivia Leaderboard
export async function getLeaderboardTop(): Promise<LeaderboardEntry[]> {
  try {
    const data = await api.getLeaderboard();
    return (data?.entries || []).map((e: any) => ({ id: e.id, ...e }));
  } catch (e) {
    console.warn('Leaderboard error:', e);
    return [];
  }
}

export async function submitTriviaScore(entry: Omit<LeaderboardEntry, 'id'>) {
  try {
    await api.submitTriviaScore(entry);
  } catch (e) {
    console.warn('Submit trivia score warning:', e);
  }
}

// Community Reviews polling subscription
export function subscribeToMediaReviews(mediaId: number, callback: (reviews: CommunityReview[]) => void) {
  let active = true;
  const fetchReviews = async () => {
    try {
      const reviews = await getMediaReviews(mediaId);
      if (active) callback(reviews);
    } catch (e) {
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

// Watch Party polling subscription
export function subscribeToWatchParty(roomId: string, callback: (room: WatchPartyRoom | null) => void) {
  let active = true;
  const fetchRoom = async () => {
    try {
      const data = await api.getWatchParty(roomId);
      if (active) callback(data ? { id: data.id, ...data } as WatchPartyRoom : null);
    } catch (e) {
      if (active) callback(null);
    }
  };

  fetchRoom();
  const interval = setInterval(fetchRoom, 5000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}
