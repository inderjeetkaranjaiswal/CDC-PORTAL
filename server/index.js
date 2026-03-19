const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Added JWT

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// A secret key used to sign the tokens (keep this private!)
const JWT_SECRET = "hitam_cdc_secret_key_2024";

// MongoDB Connection (Local)
mongoose.connect('mongodb://127.0.0.1:27017/hitam_cdc')
  .then(() => console.log("✅ Connected to Local MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if it is a HITAM email
    if (email.endsWith('@hitam.org')) {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({ email });
        await user.save();
        console.log(`New student registered: ${email}`);
      }

      // --- NEW: GENERATE A REAL TOKEN ---
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' } // Token is valid for 1 day
      );

      // Success Response with REAL token
      res.json({
        token: token, 
        user: { email: user.email, role: user.role }
      });
    } else {
      res.status(401).json({ message: "Invalid HITAM credentials. Use your @hitam.org email." });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));