// Minimal server for debugging Railway deployment
console.log('=== TASKY SERVER STARTING ===');
console.log('Timestamp:', new Date().toISOString());

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PORT:', process.env.PORT || '5000 (default)');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  console.log('WARNING: Using default JWT_SECRET');
  process.env.JWT_SECRET = 'default-secret-change-in-production';
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - allow all for debugging
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

console.log('Middleware configured');

// Health check - MUST work first
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'ok',
    message: 'Tasky API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Tasky API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      user: '/api/user/*'
    }
  });
});

console.log('Loading routes...');

// Import routes with error handling
let authRoutes, userRoutes, monetagRoutes, callbackRoutes;

try {
  authRoutes = (await import('./routes/auth.js')).default;
  console.log('✓ Auth routes loaded');
} catch (e) {
  console.error('✗ Failed to load auth routes:', e.message);
}

try {
  userRoutes = (await import('./routes/user.js')).default;
  console.log('✓ User routes loaded');
} catch (e) {
  console.error('✗ Failed to load user routes:', e.message);
}

try {
  monetagRoutes = (await import('./routes/monetag.js')).default;
  console.log('✓ Monetag routes loaded');
} catch (e) {
  console.error('✗ Failed to load monetag routes:', e.message);
}

try {
  callbackRoutes = (await import('./routes/callback.js')).default;
  console.log('✓ Callback routes loaded');
} catch (e) {
  console.error('✗ Failed to load callback routes:', e.message);
}

// Mount routes if loaded
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/user', userRoutes);
if (monetagRoutes) app.use('/api/monetag', monetagRoutes);
if (callbackRoutes) app.use('/api/v1/callback', callbackRoutes);

console.log('Routes mounted');

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log('=================================');
});
