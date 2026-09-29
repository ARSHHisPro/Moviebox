import dotenv from 'dotenv';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '.env' });

const adminApp = initializeApp({
  credential: cert({
    projectId: process.env.FB_ADMIN_PROJECT_ID,
    clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL,
    privateKey: (process.env.FB_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(adminApp);

async function seed() {
  await db.collection('config').doc('admin').set({
    updatedAt: Date.now(),
  });

  await db.collection('config').doc('locked_movies').set({
    locks: {},
    lastUpdated: Date.now(),
  });

  await db.collection('config').doc('settings').set({
    appName: 'MovieBox Premium',
    appUrl: process.env.APP_URL || 'https://moviebox-premium-boxez.vercel.app',
    maintenanceMode: false,
    allowRegistrations: true,
    maxContinueWatching: 50,
    maxWatchHistory: 100,
    maxPlaylistsPerUser: 20,
    updatedAt: Date.now(),
  });

  await db.collection('watch_parties').doc('SAMPLE').set({
    hostId: 'demo',
    hostName: 'Demo Host',
    mediaId: 550,
    mediaType: 'movie',
    mediaTitle: 'Fight Club',
    mediaPoster: '/path/to/poster.jpg',
    currentTime: 0,
    isPlaying: false,
    messages: [],
    participantCount: 1,
    updatedAt: Date.now(),
  });

  await db.collection('reviews').doc('sample1').set({
    mediaId: 550,
    mediaType: 'movie',
    mediaTitle: 'Fight Club',
    userId: 'demo',
    username: 'MovieBuff',
    userAvatar: 'https://ui-avatars.com/api/?name=MovieBuff&background=7b2cbf&color=fff',
    rating: 9,
    reviewText: 'A mind-bending masterpiece that questions consumerism and identity.',
    upvotes: 42,
    createdAt: Date.now() - 86400000,
  });

  const leaderboardData = [
    { userId: 'user1', username: 'Cinephile', avatar: 'https://ui-avatars.com/api/?name=Cinephile&background=00d2ff&color=fff', score: 9500, streak: 15, rankTitle: 'Movie Master' },
    { userId: 'user2', username: 'BingeWatcher', avatar: 'https://ui-avatars.com/api/?name=BingeWatcher&background=ec4899&color=fff', score: 8200, streak: 12, rankTitle: 'Series Addict' },
    { userId: 'user3', username: 'NightOwl', avatar: 'https://ui-avatars.com/api/?name=NightOwl&background=ffd700&color=000', score: 7800, streak: 10, rankTitle: 'Marathon Runner' },
  ];

  for (const entry of leaderboardData) {
    await db.collection('leaderboard').doc(entry.userId).set({
      ...entry,
      updatedAt: Date.now(),
    });
  }

  await db.collection('users').doc('demo').set({
    displayName: 'Demo User',
    email: 'demo@moviebox.app',
    photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=7b2cbf&color=fff',
    createdAt: Date.now(),
    preferences: {
      autoplay: true,
      quality: 'auto',
      theme: 'dark',
    },
  }, { merge: true });

  await db.collection('users').doc('demo').collection('favorites').doc('_meta').set({ count: 0 });
  await db.collection('users').doc('demo').collection('history').doc('_meta').set({ count: 0 });
  await db.collection('users').doc('demo').collection('continue_watching').doc('_meta').set({ count: 0 });
  await db.collection('users').doc('demo').collection('playlists').doc('_meta').set({ count: 0 });

  await deleteApp(adminApp);
}

seed().catch(() => {
  process.exit(1);
});

