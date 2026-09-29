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

  const adminPass = localStorage.getItem('moviebox_admin_pass');
  if (adminPass) {
    headers['x-admin-pass'] = adminPass;
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

  updateAdminPassword: (password: string) =>
    request('/admin/password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getSettings: () => request('/admin/settings'),
  updateSettings: (settings: any) =>
    request('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  getLocks: () => request('/admin/locks'),
  setLock: (lockData: any) =>
    request('/admin/locks', {
      method: 'POST',
      body: JSON.stringify(lockData),
    }),
  deleteLock: (tmdbId: number) =>
    request(`/admin/locks/${tmdbId}`, { method: 'DELETE' }),

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
