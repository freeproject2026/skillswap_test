import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { startLocalMongo } from './localMongo.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import videoRoutes from './routes/videoRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import learningRequestRoutes from './routes/learningRequestRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import proofRoutes from './routes/proofRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Explicitly load server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check with explicit database and service diagnostics
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const stateLabels = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const isDbConnected = readyState === 1;
  const status = isDbConnected ? 'ok' : 'degraded';
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    service: 'SkillSwap API Server',
    database: {
      status: stateLabels[readyState] || 'unknown',
      name: isDbConnected ? mongoose.connection.name : null,
      readyState
    },
    timestamp: new Date().toISOString()
  });
});

// Interactive MongoDB Web Explorer
app.get('/db', async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let collections = [];
    let selectedCol = req.query.collection || '';
    let documents = [];

    if (isDbConnected && mongoose.connection.db) {
      const cols = await mongoose.connection.db.listCollections().toArray();
      collections = await Promise.all(cols.map(async (c) => {
        const count = await mongoose.connection.db.collection(c.name).countDocuments();
        return { name: c.name, count };
      }));
      collections.sort((a, b) => a.name.localeCompare(b.name));

      if (!selectedCol && collections.length > 0) {
        selectedCol = collections[0].name;
      }

      if (selectedCol) {
        documents = await mongoose.connection.db.collection(selectedCol).find({}).limit(50).toArray();
      }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkillSwap - MongoDB Web Explorer</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-8 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🍃</span>
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            MongoDB Web Explorer
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold ${isDbConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
              ${isDbConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </h1>
          <p class="text-xs text-slate-400">Database: <strong class="text-teal-400">${mongoose.connection.name || 'skillswap'}</strong></p>
        </div>
      </div>
      <div class="flex gap-2">
        <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" class="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-sm flex items-center gap-1.5">
          Open MongoDB Atlas Web ↗
        </a>
        <a href="http://localhost:5173" target="_blank" class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all">
          Open SkillSwap App ↗
        </a>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <aside class="md:col-span-1 bg-slate-800/60 rounded-xl p-4 border border-slate-800 space-y-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Collections (${collections.length})</h2>
        <div class="space-y-1">
          ${collections.map(c => `
            <a href="/db?collection=${encodeURIComponent(c.name)}" class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedCol === c.name ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'}">
              <span class="truncate">${c.name}</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full ${selectedCol === c.name ? 'bg-teal-800 text-teal-100' : 'bg-slate-700/60 text-slate-400'}">${c.count}</span>
            </a>
          `).join('') || '<p class="text-xs text-slate-500">No collections yet</p>'}
        </div>
      </aside>

      <main class="md:col-span-3 bg-slate-800/60 rounded-xl p-5 border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            Collection: <span class="text-teal-400 font-mono">${selectedCol || 'None'}</span>
            <span class="text-xs font-normal text-slate-400">(${documents.length} document${documents.length === 1 ? '' : 's'} displayed)</span>
          </h2>
        </div>

        ${documents.length === 0 
          ? '<div class="py-12 text-center text-slate-500 text-xs">No documents found in this collection.</div>'
          : `<div class="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              ${documents.map((doc, idx) => `
                <div class="p-3.5 bg-slate-900 rounded-lg border border-slate-800/80 font-mono text-xs">
                  <div class="flex items-center justify-between text-[11px] text-slate-500 pb-1.5 mb-1.5 border-b border-slate-800">
                    <span class="text-teal-400">#${idx + 1} _id: ${doc._id || idx}</span>
                    <span>${doc.createdAt ? new Date(doc.createdAt).toLocaleString() : ''}</span>
                  </div>
                  <pre class="overflow-x-auto text-slate-300 leading-relaxed">${JSON.stringify(doc, null, 2)}</pre>
                </div>
              `).join('')}
            </div>`
        }
      </main>
    </div>
  </div>
</body>
</html>`;

    res.send(html);
  } catch (err) {
    res.status(500).send(`<h3>Failed to load database explorer: ${err.message}</h3>`);
  }
});

// Serve uploaded video files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Core Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/upload', uploadRoutes);

// Mount Additional Learning Platform Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/learning-requests', learningRequestRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/proof', proofRoutes);

// Centralized Error Handling
app.use((err, _req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
});

// Mongoose Connection Event Listeners
mongoose.connection.on('connected', () => {
  console.log(`✅ MongoDB connected successfully to database: "${mongoose.connection.name}".`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

// Start database connection and HTTP listener
export async function startServer(uri = MONGODB_URI, port = PORT) {
  const isAtlas = uri && uri.startsWith('mongodb+srv://');
  const preferLocal = process.env.USE_LOCAL_MONGO === 'true';

  const connectLocal = async () => {
    try {
      console.log('🔄 Launching persistent local MongoDB instance...');
      const localUri = await startLocalMongo();
      await mongoose.connect(localUri);
      console.log(`✅ MongoDB connected successfully to database: "${mongoose.connection.name}".`);
    } catch (localErr) {
      console.error('❌ Failed to connect to local MongoDB:', localErr.message);
    }
  };

  const connectDb = async () => {
    if (preferLocal) {
      console.log('📌 USE_LOCAL_MONGO is set: connecting to local MongoDB...');
      await connectLocal();
      return;
    }

    if (isAtlas) {
      console.log('🔄 Connecting to MongoDB Atlas (URI configured)...');
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          tls: true,
          retryWrites: true
        });
        console.log(`✅ MongoDB Atlas connected successfully to database: "${mongoose.connection.name}".`);
      } catch (err) {
        console.warn('⚠️ Initial MongoDB Atlas connection failed:', err.message);
        console.warn('🔄 Automatically switching to persistent local MongoDB...');
        await mongoose.disconnect().catch(() => {});
        await connectLocal();
      }
    } else {
      console.log('🔄 Connecting to MongoDB...');
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000
        });
        console.log(`✅ MongoDB connected successfully to database: "${mongoose.connection.name}".`);
      } catch (err) {
        console.warn('⚠️ Connection to MongoDB failed, switching to local instance...');
        await connectLocal();
      }
    }
  };

  // Launch database connection asynchronously so HTTP server starts immediately
  connectDb().catch(e => console.error('Database connection error:', e));

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`🚀 SkillSwap Backend Server running at http://localhost:${port}`);
      console.log(`📡 Health Check: http://localhost:${port}/api/health`);
      resolve(server);
    });
  });
}

// Only auto-start when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer();
}

export default app;
