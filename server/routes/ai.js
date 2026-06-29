import express from 'express';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs';
import Groq from 'groq-sdk';
import ChatHistory from '../models/ChatHistory.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const SYSTEM_PROMPT = `You are AI Pugyo (AI पुग्यो), an expert virtual assistant for tourists visiting Nepal. You have deep knowledge of all 77 districts, major trekking routes (EBC, Annapurna Circuit, Langtang, Manaslu, Upper Mustang, Kanchenjunga), teahouse names, altitude sickness symptoms, cultural customs, food, transport, weather patterns, visa rules, emergency contacts, and UNESCO heritage sites. Detect language: Nepali input -> respond Nepali. English input -> respond English. NEVER invent emergency numbers. Be concise and practical.`;

// Helper: call Groq with full conversation history
async function callGroq(messages) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 1024,
  });
  return completion.choices[0].message.content;
}

// Helper: call Groq vision model for image recognition
async function callGroqVision(base64Image, mimeType) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'This photo was taken by a tourist in Nepal. Identify what is in this image. If a Nepal landmark: 1. Name 2. Location (district and region) 3. Historical/cultural significance (2-3 sentences) 4. Best time to visit 5. Practical tips for tourists. If not a Nepal landmark, describe what you see and suggest relevant Nepal places.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1024,
  });
  return completion.choices[0].message.content;
}

// POST /api/ai/chat — multi-turn conversation with Groq
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, sessionId, history } = req.body;

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history) && history.length > 0) {
      history.forEach(h => {
        groqMessages.push({ role: 'user', content: h.message });
        groqMessages.push({ role: 'assistant', content: h.reply });
      });
    }

    groqMessages.push({ role: 'user', content: message });

    const reply = await callGroq(groqMessages);

    if (userId) {
      await ChatHistory.create({ userId, sessionId: sessionId || null, message, reply });
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
});

// GET /api/ai/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }).limit(100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/image — image recognition via Groq Vision (llama-4-scout)
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imageData = fs.readFileSync(req.file.path);
    const base64 = imageData.toString('base64');
    const mimeType = req.file.mimetype;

    // Use Groq Vision (llama-4-scout supports image input)
    const description = await callGroqVision(base64, mimeType);

    res.json({ description });
  } catch (err) {
    // Friendly fallback if vision model fails
    const msg = err?.error?.message || err.message || '';
    if (msg.includes('model') || msg.includes('vision') || msg.includes('image')) {
      res.json({
        description:
          "I received your image! Unfortunately the image AI is temporarily unavailable. Please describe what's in the photo and I'll help identify the Nepal landmark or provide travel tips.",
      });
    } else {
      res.status(500).json({ message: 'Image recognition failed', error: err.message });
    }
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// POST /api/ai/itinerary — uses Groq
router.post('/itinerary', async (req, res) => {
  try {
    const { destination, days, difficulty, budget } = req.body;
    const prompt = `Create a ${days}-day trekking itinerary for ${destination} in Nepal. Difficulty: ${difficulty}. Budget: $${budget} USD per day. 
For EACH day return a JSON object with exactly these fields:
{
  "day": number,
  "title": string,
  "description": string,
  "distance_km": number,
  "max_altitude_m": number,
  "accommodation": string,
  "meals": string,
  "safety_tip": string,
  "highlights": string
}
Return ONLY a valid JSON array. No markdown. No extra text. No explanation.`;

    const raw = await callGroq([
      { role: 'system', content: 'You are a Nepal trekking expert. Respond only with valid JSON arrays. No markdown, no backticks, no explanation.' },
      { role: 'user', content: prompt },
    ]);
    const clean = raw.replace(/```json|```/g, '').trim();
    const itinerary = JSON.parse(clean);

    const userId = req.body.userId;
    if (userId) {
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(userId, { $inc: { trekPlans: 1 } });
    }

    res.json({ itinerary });
  } catch (err) {
    res.status(500).json({ message: 'Itinerary generation failed', error: err.message });
  }
});

export default router;
