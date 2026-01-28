// TASKY SERVER - PRODUCTION
// This file uses static imports only for compatibility

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Load env first
dotenv.config();

console.log('=====================================');
console.log('TASKY SERVER STARTING');
console.log('=====================================');
console.log('Time:', new Date().toISOString());
console.log('Node:', process.version);
console.log('ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || '5000');
console.log('DB:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('JWT:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Set defaults
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'tasky-default-secret-2024';
  console.log('WARNING: Using default JWT_SECRET');
}

// Import routes
import authRoutes from './routes/auth.js';
import callbackRoutes from './routes/callback.js';
import monetagRoutes from './routes/monetag.js';
import userRoutes from './routes/user.js';

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
  res.json({ status: 'ok', message: 'Tasky API is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Tasky API v1.0' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/monetag', monetagRoutes);
app.use('/api/v1/callback', callbackRoutes);

console.log('Routes mounted OK');

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Server error' });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log('=====================================');
  console.log('SERVER RUNNING ON PORT', PORT);
  console.log('=====================================');
});
