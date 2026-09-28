import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import NodeCache from 'node-cache';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: [
        "'self'",
        'https://vidlink.pro',
        'https://vidsrc.cc',
        'https://vidsrc.to',
        'https://embed.su',
        'https://player.autoembed.cc',
        'https://www.2embed.cc',
        'https://vidsrc.pro',
        'https://embed.smashystream.com',
        'https://www.youtube.com',
        'https://www.youtube-nocookie.com',
      ],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.themoviedb.org', 'https://*.firebaseio.com', 'https://*.googleapis.com'],
      mediaSrc: ["'self'", 'blob:', 'data:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: NODE_ENV === 'production' ? process.env.APP_URL || 'http://localhost:3000' : true,
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

const tmdbCache = new NodeCache({ stdTTL: 1800, checkperiod: 600 });
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function proxyTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API Key missing on server');
  }
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  const cached = tmdbCache.get(cacheKey);
  if (cached) return cached;

  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.append(k, v);
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json();
  tmdbCache.set(cacheKey, data);
  return data;
}

let adminDb: ReturnType<typeof getFirestore> | null = null;
try {
  if (!getApps().length && process.env.FIREBASE_PROJECT_ID) {
    const adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
    adminDb = getFirestore(adminApp);
  } else if (getApps().length) {
    adminDb = getFirestore(getApp());
  }
} catch {
  adminDb = null;
}

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }
    const uid = req.headers['x-user-uid'] as string;
    if (!uid) {
      return res.status(401).json({ error: 'User ID required' });
    }
    (req as any).userId = uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/public-config', (_req, res) => {
  res.json({
    projectId: process.env.FIREBASE_PROJECT_ID || 'moviebox-boxez',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'moviebox-boxez.firebaseapp.com',
  });
});

app.get('/api/tmdb/movie/popular', async (req, res) => {
  try {
    const page = String(req.query.page || '1');
    const data = await proxyTMDB('/movie/popular', { page });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

app.get('/api/tmdb/tv/popular', async (req, res) => {
  try {
    const page = String(req.query.page || '1');
    const data = await proxyTMDB('/tv/popular', { page });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch popular TV shows' });
  }
});

app.get('/api/tmdb/trending/:type/:timeWindow', async (req, res) => {
  try {
    const { type, timeWindow } = req.params;
    const page = String(req.query.page || '1');
    const data = await proxyTMDB(`/trending/${type}/${timeWindow}`, { page });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

app.get('/api/tmdb/search/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const query = String(req.query.query || '');
    const page = String(req.query.page || '1');
    if (!query) return res.status(400).json({ error: 'Query required' });
    const data = await proxyTMDB(`/search/${type}`, { query, page });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/tmdb/discover/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const params: Record<string, string> = {};
    const { sort_by, with_genres, primary_release_date_gte, primary_release_date_lte, first_air_date_gte, first_air_date_lte, vote_average_gte, page } = req.query;
    if (sort_by) params.sort_by = String(sort_by);
    if (with_genres) params.with_genres = String(with_genres);
    if (primary_release_date_gte) params['primary_release_date.gte'] = String(primary_release_date_gte);
    if (primary_release_date_lte) params['primary_release_date.lte'] = String(primary_release_date_lte);
    if (first_air_date_gte) params['first_air_date.gte'] = String(first_air_date_gte);
    if (first_air_date_lte) params['first_air_date.lte'] = String(first_air_date_lte);
    if (vote_average_gte) params['vote_average.gte'] = String(vote_average_gte);
    if (page) params.page = String(page);
    const data = await proxyTMDB(`/discover/${type}`, params);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Discover failed' });
  }
});

app.get('/api/tmdb/genre/:type/list', async (req, res) => {
  try {
    const { type } = req.params;
    const data = await proxyTMDB(`/genre/${type}/list`);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Genres fetch failed' });
  }
});

app.get('/api/tmdb/*', async (req, res) => {
  try {
    const endpoint = (req.params as any)[0];
    const queryParams: Record<string, string> = {};
    Object.entries(req.query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) queryParams[k] = String(v);
    });
    const data = await proxyTMDB(`/${endpoint}`, queryParams);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'TMDB endpoint fetch failed' });
  }
});

function userDoc(uid: string, collection: string) {
  return adminDb?.collection('users').doc(uid).collection(collection);
}

app.get('/api/user/data', requireAuth, async (req, res) => {
  try {
    const uid = (req as any).userId;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    const [favoritesSnap, historySnap, continueSnap, playlistsSnap] = await Promise.all([
      userDoc(uid, 'favorites')?.get() || Promise.resolve({ docs: [] }),
      userDoc(uid, 'history')?.get() || Promise.resolve({ docs: [] }),
      userDoc(uid, 'continue_watching')?.get() || Promise.resolve({ docs: [] }),
      userDoc(uid, 'playlists')?.get() || Promise.resolve({ docs: [] }),
    ]);

    res.json({
      profile: userData,
      favorites: favoritesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
      history: historySnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
      continueWatching: continueSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
      playlists: playlistsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

app.put('/api/user/data', requireAuth, async (req, res) => {
  try {
    const uid = (req as any).userId;
    const { collection, docId, data, action } = req.body;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    const colRef = userDoc(uid, collection);
    if (!colRef) return res.status(400).json({ error: 'Invalid collection' });

    if (action === 'delete' && docId) {
      await colRef.doc(docId).delete();
    } else if (docId) {
      await colRef.doc(docId).set(data, { merge: true });
    } else {
      const docRef = await colRef.add({ ...data, updatedAt: Date.now() });
      return res.json({ id: docRef.id });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update user data' });
  }
});

app.post('/api/admin/verify', (req, res) => {
  try {
    const { password } = req.body;
    const configuredPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;
    if (!configuredPass) {
      return res.status(500).json({ error: 'Admin passcode is not configured on server' });
    }
    if (password && String(password).trim() === String(configuredPass).trim()) {
      return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Invalid admin passcode' });
  } catch {
    return res.status(500).json({ error: 'Verification error' });
  }
});

app.get('/api/admin/locks', async (req, res) => {
  try {
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });
    const doc = await adminDb.collection('config').doc('locked_movies').get();
    const locks = doc.exists ? doc.data()?.locks || {} : {};
    res.json({ locks });
  } catch {
    res.status(500).json({ error: 'Failed to fetch locks' });
  }
});

app.post('/api/admin/locks', requireAuth, async (req, res) => {
  try {
    const uid = (req as any).userId;
    const { tmdbId, mediaType, title, isLocked, lockedUntil, reason } = req.body;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    const lockData = {
      tmdbId,
      mediaType: mediaType || 'movie',
      title: title || `Item #${tmdbId}`,
      isLocked: !!isLocked,
      lockedUntil: lockedUntil || null,
      reason: reason || 'Locked by Owner',
      updatedAt: Date.now(),
      updatedBy: uid,
    };

    const locksRef = adminDb.collection('config').doc('locked_movies');
    const locksSnap = await locksRef.get();
    const currentLocks = locksSnap.exists ? locksSnap.data()?.locks || {} : {};
    currentLocks[tmdbId] = lockData;

    await locksRef.set({ locks: currentLocks, lastUpdated: Date.now() }, { merge: true });
    res.json({ success: true, lock: lockData });
  } catch {
    res.status(500).json({ error: 'Failed to update lock' });
  }
});

app.delete('/api/admin/locks/:tmdbId', requireAuth, async (req, res) => {
  try {
    const { tmdbId } = req.params;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    const locksRef = adminDb.collection('config').doc('locked_movies');
    const locksSnap = await locksRef.get();
    const currentLocks = locksSnap.exists ? locksSnap.data()?.locks || {} : {};
    delete currentLocks[tmdbId];

    await locksRef.set({ locks: currentLocks, lastUpdated: Date.now() }, { merge: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete lock' });
  }
});

app.get('/api/watch-party/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });
    const doc = await adminDb.collection('watch_parties').doc(roomId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Room not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ error: 'Failed to fetch watch party' });
  }
});

app.post('/api/watch-party', requireAuth, async (req, res) => {
  try {
    const uid = (req as any).userId;
    const partyData = req.body;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    await adminDb.collection('watch_parties').doc(roomId).set({
      ...partyData,
      hostId: uid,
      updatedAt: Date.now(),
    });

    res.json({ roomId });
  } catch {
    res.status(500).json({ error: 'Failed to create watch party' });
  }
});

app.put('/api/watch-party/:roomId', requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    await adminDb.collection('watch_parties').doc(roomId).set({
      ...updates,
      updatedAt: Date.now(),
    }, { merge: true });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update watch party' });
  }
});

app.get('/api/trivia/leaderboard', async (req, res) => {
  try {
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });
    const snapshot = await adminDb.collection('leaderboard')
      .orderBy('score', 'desc')
      .limit(50)
      .get();
    
    const entries = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    res.json({ entries });
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/trivia/leaderboard', requireAuth, async (req, res) => {
  try {
    const uid = (req as any).userId;
    const entry = req.body;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    await adminDb.collection('leaderboard').doc(uid).set({
      ...entry,
      updatedAt: Date.now(),
    }, { merge: true });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

app.get('/api/reviews/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });
    
    const snapshot = await adminDb.collection('reviews')
      .where('mediaId', '==', Number(mediaId))
      .limit(50)
      .get();
    
    const reviews = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ reviews });
  } catch {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', requireAuth, async (req, res) => {
  try {
    const review = req.body;
    if (!adminDb) return res.status(500).json({ error: 'Database not initialized' });

    const docRef = await adminDb.collection('reviews').add({
      ...review,
      createdAt: Date.now(),
    });

    res.json({ id: docRef.id });
  } catch {
    res.status(500).json({ error: 'Failed to post review' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'moviebox-premium-server',
      },
    },
  });
}

function generateConciergeFallback(promptText: string): string {
  const p = (promptText || '').toLowerCase();

  if (p.includes('sci-fi') || p.includes('space') || p.includes('mind-bending') || p.includes('future') || p.includes('nolan')) {
    return `MovieBox AI Concierge — Sci-Fi & Mind-Benders Selection:

Here are top picks that deliver jaw-dropping visuals and brain-twisting plots:

1. **Interstellar (2014)** — *Match: 99%*
   > A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Directed by Christopher Nolan.

2. **Blade Runner 2049 (2017)** — *Match: 96%*
   > Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.

3. **Inception (2010)** — *Match: 98%*
   > A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.

4. **Dark (TV Series 2017-2020)** — *Match: 95%*
   > A family saga with a supernatural twist, set in a German town where two young children go missing.

Tip: Search for any of these titles in the MovieBox search bar to watch immediately in HD!`;
  }

  if (p.includes('comedy') || p.includes('cozy') || p.includes('funny') || p.includes('feel-good') || p.includes('laugh')) {
    return `MovieBox AI Concierge — Feel-Good & Cozy Picks:

Looking for a boost of serotonin? Check out these hilarious and heartwarming titles:

1. **The Office (TV Series 2005-2013)** — *Match: 99%*
   > A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.

2. **Ted Lasso (TV Series 2020-2023)** — *Match: 97%*
   > American college football coach Ted Lasso is hired to manage a British soccer team. His charm and optimism conquer everyone.

3. **Knives Out (2019)** — *Match: 95%*
   > A detective investigates the death of a patriarch of an eccentric, combative family in this clever, fun whodunit.

4. **Superbad (2007)** — *Match: 94%*
   > Two co-dependent high school seniors deal with separation anxiety as their plan to stage a booze-soaked party goes awry.

Tip: You can add these to your Custom Playlist or Favorites with one click!`;
  }

  if (p.includes('horror') || p.includes('scary') || p.includes('thriller') || p.includes('spooky') || p.includes('crime')) {
    return `MovieBox AI Concierge — High-Tension Horror & Thrillers:

Prepare for edge-of-your-seat suspense and dark atmospheres:

1. **Hereditary (2018)** — *Match: 98%*
   > A grieving family is haunted by tragic and disturbing occurrences after the death of their secretive grandmother.

2. **The Silence of the Lambs (1991)** — *Match: 99%*
   > A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to catch another serial killer.

3. **Severance (TV Series 2022-)** — *Match: 96%*
   > Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.

4. **Se7en (1995)** — *Match: 97%*
   > Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.

Tip: Try watching in Ambient Cinema Dark Mode with headphones for maximum chill!`;
  }

  return `MovieBox AI Concierge Recommendations:

Based on cinematic trends and top critic ratings, here are handpicked masterpieces for you:

1. **Dune: Part Two (2024)** — *Sci-Fi / Epic (Rating: 8.6/10)*
   > Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.

2. **The Penguin (TV Series 2024)** — *Crime / Drama (Rating: 8.8/10)*
   > Following the events of The Batman, Oz Cobb makes his move to claim the throne of Gotham City's underworld.

3. **Shogun (TV Series 2024)** — *Historical Drama / Action (Rating: 8.7/10)*
   > Lord Yoshii Toranaga fights for his life as his enemies on the Council of Regents unite against him in feudal Japan.

4. **Spider-Man: Across the Spider-Verse (2023)** — *Animation / Action (Rating: 8.6/10)*
   > Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.

Tip: Need something specific? Ask me for "Anime recommendations", "Mind-bending movies", or "Cozy TV shows"!`;
}

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemInstruction = `You are MovieBox AI Concierge, an expert film & television critic and recommendation guide.
Your goal is to provide concise, engaging, highly accurate movie and TV recommendations, plot insights, actor trivia, and watch order suggestions.
When suggesting movies or TV shows, provide exact title names and release years so they can be searched on TMDB.
Be cinematic, enthusiastic, and helpful. Use clear markdown formatting.`;

        const contents = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const msg of history) {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        });

        if (response.text) {
          res.json({ text: response.text });
          return;
        }
      } catch {

      }
    }

    const fallbackText = generateConciergeFallback(prompt);
    res.json({ text: fallbackText });
  } catch {
    res.json({ text: generateConciergeFallback(req.body.prompt || '') });
  }
});

app.post('/api/gemini/recommend', async (req, res) => {
  try {
    const { query, mood, genrePreference } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `User is looking for movie or TV show recommendations.
Query/Description: "${query || 'Any great cinematic experience'}"
Mood: "${mood || 'flexible'}"
Preferred Genre: "${genrePreference || 'any'}"

Return a valid JSON array of 5 suggested titles with the exact structure:
[
  {
    "title": "Exact Title",
    "year": "YYYY",
    "type": "movie" | "tv",
    "reason": "Short 1-sentence reason why this matches"
  }
]
Output ONLY valid JSON, no markdown backticks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });

        const jsonText = response.text?.trim() || '[]';
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          res.json({ recommendations: parsed });
          return;
        }
      } catch {

      }
    }

    res.json({
      recommendations: [
        { title: "Interstellar", year: "2014", type: "movie", reason: "Ultimate epic mind-bending space exploration" },
        { title: "Inception", year: "2010", type: "movie", reason: "Thrilling dream-layer heist masterpiece" },
        { title: "The Dark Knight", year: "2008", type: "movie", reason: "Peak superhero crime thriller" },
        { title: "Severance", year: "2022", type: "tv", reason: "Intriguing dystopian workplace mystery" },
        { title: "Dune: Part Two", year: "2024", type: "movie", reason: "Visually stunning sci-fi spectacle" }
      ]
    });
  } catch {
    res.json({ recommendations: [] });
  }
});

async function setupViteOrStatic() {
  if (NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
      lastModified: true,
    }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0');
}

setupViteOrStatic();
