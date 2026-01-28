import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.js';
import callbackRoutes from './routes/callback.js';
import monetagRoutes from './routes/monetag.js';
import userRoutes from './routes/user.js';

// Load environment variables FIRST
dotenv.config();

// Early startup logging for debugging
console.log('🚀 Starting Tasky Server...');
console.log(`📍 Node.js ${process.version}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET'}`);
console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'NOT SET'}`);

// Warn about important env vars
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set, using default (NOT SECURE FOR PRODUCTION!)');
  process.env.JWT_SECRET = 'default-jwt-secret-change-me-in-production';
}

console.log('✅ Environment validated');
console.log('✅ Routes loaded successfully');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://tasky7.vercel.app'
].filter(Boolean);

console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/monetag', monetagRoutes);

// Unified Postback System (V1 API)
// All provider callbacks use /api/v1/callback prefix
app.use('/api/v1/callback', callbackRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tasky API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Tasky API', version: '1.0.0', status: 'online' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log('🎉 Ready to accept connections!');
});
