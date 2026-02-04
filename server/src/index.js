// TASKY SERVER - PRODUCTION
// This file uses static imports only for compatibility

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Load env first
dotenv.config();

console.log('=====================================');
console.log('Mita SERVER STARTING (Prisma Client Updated)');
console.log('=====================================');
console.log('Time:', new Date().toISOString());
console.log('Node:', process.version);
console.log('ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || '5000');
console.log('DB:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('JWT:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Set defaults
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mita-default-secret-2024';
  console.log('WARNING: Using default JWT_SECRET');
}

// Import routes
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import callbackRoutes from './routes/callback.js';
import monetagRoutes from './routes/monetag.js';
import proxyRoutes from './routes/proxy.js';
import reportRoutes from './routes/report.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/user.js';

// Import utilities
import { seedAdmin } from './utils/seedAdmin.js';

console.log('Routes imported OK');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow all origins for now
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

console.log('Middleware OK');

// Health check FIRST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mita API is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Mita API v1.0' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/monetag', monetagRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/callback', callbackRoutes);
app.use('/api/proxy', proxyRoutes); // Proxy routes untuk offerwall
app.use('/api/reports', reportRoutes); // Report routes
app.use('/api/upload', uploadRoutes); // Upload routes

// Serve uploaded files statically
import path from 'path';
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log(`[Static] Serving uploads from: ${path.join(__dirname, 'uploads')}`);

console.log('Routes mounted OK');

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Server error' });
});

// Start
app.listen(PORT, '0.0.0.0', async () => {
  console.log('=====================================');
  console.log('SERVER RUNNING ON PORT', PORT);
  console.log('=====================================');

  // Seed default admin account for development
  if (process.env.NODE_ENV === 'development') {
    console.log('\nSeeding default admin account...');
    await seedAdmin();
  }
});
