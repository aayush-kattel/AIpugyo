import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import placesRoutes from './routes/places.js';
import heritageRoutes from './routes/heritage.js';
import safetyRoutes from './routes/safety.js';
import trekRoutes from './routes/trek.js';
import adminRoutes from './routes/admin.js';
import weatherRoutes from './routes/weather.js';

dotenv.config();

const app = express();

// ✅ Allow both production frontend and local dev frontend
const allowedOrigins = [
  'https://aipugyo.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // CRA/Next default
].filter(Boolean); // removes undefined if FRONTEND_URL isn't set

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/heritage', heritageRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/trek', trekRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Pugyo API is running' });
});

// Connect MongoDB once (Vercel reuses connections across warm invocations)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log('MongoDB connected');
};

connectDB().catch(console.error);

// ✅ Export app for Vercel (serverless — no .listen() needed there)
export default app;

// ✅ Only listen locally — Vercel sets NODE_ENV=production automatically,
// so this block is skipped in production and only runs on your machine.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running locally on http://localhost:${PORT}`);
  });
}