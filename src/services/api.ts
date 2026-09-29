const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const user = getCurrentUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (user?.uid) {
    headers['x-user-uid'] = user.uid;
    headers['Authorization'] = `Bearer ${user.uid}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  health: () => request('/health'),

  getUserData: () => request('/user/data'),
  updateUserData: (collection: string, docId: string | null, data: any, action?: string) =>
    request('/user/data', {
      method: 'PUT',
      body: JSON.stringify({ collection, docId, data, action }),
    }),

  verifyAdminPassword: (password: string) =>
    request('/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getLocks: () => request('/admin/locks'),
  setLock: (lockData: any) =>
    request('/admin/locks', {
      method: 'POST',
      body: JSON.stringify(lockData),
    }),
  deleteLock: (tmdbId: number) =>
    request(`/admin/locks/${tmdbId}`, { method: 'DELETE' }),

  getWatchParty: (roomId: string) => request(`/watch-party/${roomId}`),
  createWatchParty: (data: any) =>
    request('/watch-party', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateWatchParty: (roomId: string, updates: any) =>
    request(`/watch-party/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteWatchParty: (roomId: string) =>
    request(`/watch-party/${roomId}`, { method: 'DELETE' }),
  joinWatchParty: (roomId: string, userId: string, displayName: string) =>
    request(`/watch-party/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId, displayName }),
    }),
  leaveWatchParty: (roomId: string, userId: string) =>
    request(`/watch-party/${roomId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getLeaderboard: () => request('/trivia/leaderboard'),
  submitTriviaScore: (entry: any) =>
    request('/trivia/leaderboard', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  getReviews: (mediaId: number) => request(`/reviews/${mediaId}`),
  postReview: (review: any) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }),

  getAnnouncement: () => request('/announcement'),
  setAnnouncement: (text: string, type: string, active: boolean) =>
    request('/announcement', {
      method: 'POST',
      body: JSON.stringify({ text, type, active }),
    }),

  getNews: () => request('/news'),
};

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('moviebox_session');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
