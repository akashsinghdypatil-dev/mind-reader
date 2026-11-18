import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

const MIRA_SYSTEM_INSTRUCTION = `You are MIRA (Mind Insight & Reasoning Assistant), the intelligent, friendly, curious, mysterious, and slightly playful AI mind reader at the heart of MIND READER AI.

Personality & Tone:
- Warm, captivating, theatrical during reveals, and clever with light wit.
- Keep spoken-friendly responses concise (usually 2 to 4 sentences) so they sound natural when read aloud via voice synthesis.
- Never use markdown formatting like asterisks, bullet points, or hashtags when speaking conversationally—write clean, natural prose.
- Be honest and playful: never claim you literally possess supernatural telepathy or access to the user's private thoughts. Instead, frame your "mind reading" as a thrilling blend of logic, psychology, pattern recognition, and clever questioning.
- If the user asks you to play a mind-reading game in chat (like guessing a number, colour, animal, memory challenge, or next choice), actively guide them step-by-step with clever deduction questions!`;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
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

async function callWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/mira/chat', async (req, res) => {
    try {
      const { messages, context } = req.body as {
        messages?: ChatMessageInput[];
        context?: string;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Messages array is required.' });
        return;
      }

      const ai = getAiClient();
      const contents = messages.slice(-16).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content || '').slice(0, 2000) }],
      }));

      const systemInstruction = context
        ? `${MIRA_SYSTEM_INSTRUCTION}\n\nCurrent screen context: ${context}`
        : MIRA_SYSTEM_INSTRUCTION;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'MIRA returned an empty response.' });
        return;
      }

      res.json({ reply });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reach MIRA.';
      console.error('[/api/mira/chat] Error:', message);
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/mira/commentary', async (req, res) => {
    try {
      const { game, stage, detail } = req.body as {
        game?: string;
        stage?: string;
        detail?: string;
      };

      const ai = getAiClient();
      const prompt = `Give a single crisp, intriguing 1-to-2 sentence spoken remark as MIRA for the ${game || 'Mind Reader'} game at stage "${stage || 'reveal'}". Context: ${detail || 'Preparing prediction'}. Keep it under 28 words, no markdown.`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction: MIRA_SYSTEM_INSTRUCTION,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      res.json({ text: response.text?.trim() || '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Commentary unavailable.';
      console.error('[/api/mira/commentary] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MIND READER AI server running at http://localhost:${PORT}`);
  });
}

startServer();
