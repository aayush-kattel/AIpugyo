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

// ❌ REMOVED: fs.mkdirSync('uploads') — Vercel filesystem is read-only

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // set your frontend Vercel URL in env
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

// ✅ Export app instead of calling app.listen() — Vercel handles the server
export default app;