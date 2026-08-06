import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini instance getter
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Smart Movie & TV Concierge Fallback Knowledge Engine
function generateConciergeFallback(promptText: string): string {
  const p = (promptText || '').toLowerCase();

  if (p.includes('sci-fi') || p.includes('space') || p.includes('mind-bending') || p.includes('future') || p.includes('nolan')) {
    return `🎬 **MovieBox AI Concierge — Sci-Fi & Mind-Benders Selection:**

Here are top picks that deliver jaw-dropping visuals and brain-twisting plots:

1. **Interstellar (2014)** — *Match: 99%*
   > A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Directed by Christopher Nolan.

2. **Blade Runner 2049 (2017)** — *Match: 96%*
   > Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.

3. **Inception (2010)** — *Match: 98%*
   > A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.

4. **Dark (TV Series 2017-2020)** — *Match: 95%*
   > A family saga with a supernatural twist, set in a German town where two young children go missing.

✨ *Tip: Search for any of these titles in the MovieBox search bar to watch immediately in HD!*`;
  }

  if (p.includes('comedy') || p.includes('cozy') || p.includes('funny') || p.includes('feel-good') || p.includes('laugh')) {
    return `🍿 **MovieBox AI Concierge — Feel-Good & Cozy Picks:**

Looking for a boost of serotonin? Check out these hilarious and heartwarming titles:

1. **The Office (TV Series 2005-2013)** — *Match: 99%*
   > A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.

2. **Ted Lasso (TV Series 2020-2023)** — *Match: 97%*
   > American college football coach Ted Lasso is hired to manage a British soccer team. His charm and optimism conquer everyone.

3. **Knives Out (2019)** — *Match: 95%*
   > A detective investigates the death of a patriarch of an eccentric, combative family in this clever, fun whodunit.

4. **Superbad (2007)** — *Match: 94%*
   > Two co-dependent high school seniors deal with separation anxiety as their plan to stage a booze-soaked party goes awry.

✨ *Tip: You can add these to your Custom Playlist or Favorites with one click!*`;
  }

  if (p.includes('horror') || p.includes('scary') || p.includes('thriller') || p.includes('spooky') || p.includes('crime')) {
    return `👻 **MovieBox AI Concierge — High-Tension Horror & Thrillers:**

Prepare for edge-of-your-seat suspense and dark atmospheres:

1. **Hereditary (2018)** — *Match: 98%*
   > A grieving family is haunted by tragic and disturbing occurrences after the death of their secretive grandmother.

2. **The Silence of the Lambs (1991)** — *Match: 99%*
   > A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to catch another serial killer.

3. **Severance (TV Series 2022-)** — *Match: 96%*
   > Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.

4. **Se7en (1995)** — *Match: 97%*
   > Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.

✨ *Tip: Try watching in Ambient Cinema Dark Mode with headphones for maximum chill!*`;
  }

  return `🌟 **MovieBox AI Concierge Recommendations:**

Based on cinematic trends and top critic ratings, here are handpicked masterpieces for you:

1. **Dune: Part Two (2024)** — *Sci-Fi / Epic (Rating: 8.6/10)*
   > Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.

2. **The Penguin (TV Series 2024)** — *Crime / Drama (Rating: 8.8/10)*
   > Following the events of The Batman, Oz Cobb makes his move to claim the throne of Gotham City's underworld.

3. **Shōgun (TV Series 2024)** — *Historical Drama / Action (Rating: 8.7/10)*
   > Lord Yoshii Toranaga fights for his life as his enemies on the Council of Regents unite against him in feudal Japan.

4. **Spider-Man: Across the Spider-Verse (2023)** — *Animation / Action (Rating: 8.6/10)*
   > Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.

💡 *Need something specific? Ask me for "Anime recommendations", "Mind-bending movies", or "Cozy TV shows"!*`;
}

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini Movie Assistant / Concierge Chat Endpoint
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
      } catch (geminiError) {
        console.warn('Gemini API call warning, falling back to smart concierge engine:', geminiError);
      }
    }

    // Smart Fallback Response
    const fallbackText = generateConciergeFallback(prompt);
    res.json({ text: fallbackText });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    res.json({ text: generateConciergeFallback(req.body.prompt || '') });
  }
});

// Gemini Smart Search / Recommendation Assistant
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
      } catch (geminiError) {
        console.warn('Gemini recommend warning, falling back:', geminiError);
      }
    }

    // Default Fallback JSON Recommendations
    res.json({
      recommendations: [
        { title: "Interstellar", year: "2014", type: "movie", reason: "Ultimate epic mind-bending space exploration" },
        { title: "Inception", year: "2010", type: "movie", reason: "Thrilling dream-layer heist masterpiece" },
        { title: "The Dark Knight", year: "2008", type: "movie", reason: "Peak superhero crime thriller" },
        { title: "Severance", year: "2022", type: "tv", reason: "Intriguing dystopian workplace mystery" },
        { title: "Dune: Part Two", year: "2024", type: "movie", reason: "Visually stunning sci-fi spectacle" }
      ]
    });
  } catch (err: any) {
    console.error('Gemini Recommend Error:', err);
    res.json({ recommendations: [] });
  }
});

// Vite middleware or static serve
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MovieBox Premium server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
