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
  return new GoogleGenAI({ apiKey });
}

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini Movie Assistant / Concierge Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is missing. Please set GEMINI_API_KEY in the environment secrets.'
      });
      return;
    }

    const { prompt, history } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

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

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process AI recommendation' });
  }
});

// Gemini Smart Search / Recommendation Assistant
app.post('/api/gemini/recommend', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini API key not configured' });
      return;
    }

    const { query, mood, genrePreference } = req.body;
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
    try {
      const parsed = JSON.parse(jsonText);
      res.json({ recommendations: parsed });
    } catch {
      res.json({ recommendations: [] });
    }
  } catch (err: any) {
    console.error('Gemini Recommend Error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch smart recommendations' });
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
