import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hitam_cdc_secret_key_2024';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fallback for demo purposes if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      const fallbackUsers = [
        { name: 'Student User', email: '24E51A6665@hitam.org', password: 'password123', role: 'student' },
        { name: 'CDC Faculty', email: 'cdc@hitam.org', password: 'password123', role: 'cdc' },
        { name: 'Principal', email: 'principal@hitam.org', password: 'password123', role: 'principal' },
      ];
      
      const fallbackUser = fallbackUsers.find(u => u.email === email && u.password === password);
      if (fallbackUser) {
        const token = jwt.sign({ id: 'fallback-id', role: fallbackUser.role, email: fallbackUser.email }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, user: { id: 'fallback-id', name: fallbackUser.name, email: fallbackUser.email, role: fallbackUser.role } });
      }
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in. Please check if the database is running.' });
  }
});

export default router;
