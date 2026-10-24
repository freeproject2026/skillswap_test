import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import videoRoutes from './routes/videoRoutes.js';
import quizRoutes from './routes/quizRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SkillSwap API Server',
    database: mongoose.connection.readyState === 1 ? 'connected (MongoDB)' : 'in-memory (mock fallback mode)',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred.'
  });
});

// Attempt MongoDB Connection with fast timeout fallback
console.log('🔄 Connecting to MongoDB at', MONGODB_URI, '...');
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('✅ MongoDB connected successfully.');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB not detected locally (or timeout). SkillSwap will run seamlessly with in-memory database store.');
  });

// Start Express Listener
app.listen(PORT, () => {
  console.log(`🚀 SkillSwap Backend Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
