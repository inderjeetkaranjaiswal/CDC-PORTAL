import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import authRoutes from './src/routes/auth.ts';
import internshipRoutes from './src/routes/internships.ts';
import { User } from './src/models/User.ts';

const PORT = 3000;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/hitam_cdc';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Connect to MongoDB
  try {
    // Use a longer timeout for the connection
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
    await seedUsers();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Running in fallback mode without MongoDB');
  }

  // API Routes
  app.get('/api/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
      status: 'ok', 
      database: dbStatus,
      env: process.env.NODE_ENV
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/internships', internshipRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

async function seedUsers() {
  const users = [
    { name: 'Student User', email: '24E51A6665@hitam.org', password: 'password123', role: 'student' },
    { name: 'CDC Faculty', email: 'cdc@hitam.org', password: 'password123', role: 'cdc' },
    { name: 'Principal', email: 'principal@hitam.org', password: 'password123', role: 'principal' },
  ];

  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await new User({ ...userData, password: hashedPassword }).save();
      console.log(`Seeded user: ${userData.email}`);
    }
  }
}

startServer();
