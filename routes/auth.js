const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateUser = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// ========================
// Register
// ========================
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed });
    await newUser.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ========================
// Login
// ========================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Set cookies
    res.cookie('token', token, {
      httpOnly: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000
    });

    res.cookie('username', encodeURIComponent(user.username), {
      httpOnly: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000
    });

    res.cookie('userid', user._id.toString(), {
      httpOnly: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000
    });

    res.json({
      message: "Logged in",
      requiresTerms: !user.acceptedTerms
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ========================
// Accept Terms
// ========================
router.patch('/accept-terms', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.acceptedTerms = true;
    await user.save();

    res.json({ message: 'Terms accepted' });
  } catch (err) {
    console.error("Error accepting terms:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================
// Update Contact Info
// ========================
router.patch('/contact', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.contact = req.body.contact;
    await user.save();

    res.json({ message: 'Contact info updated' });
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================
// Get Current User Info
// ========================
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      contact: user.contact || ''
    });
  } catch (err) {
    console.error("GET /api/auth/me failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================
// Update Password
// ========================
router.patch('/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "Current password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get('/admin-contact', async (req, res) => {
  try {
    const admin = await User.findOne({ isAdmin: true }).sort({ createdAt: 1 }); // oldest admin
    if (!admin || !admin.contact) {
      return res.status(404).json({ message: 'Admin contact not available' });
    }
    res.json({ contact: admin.contact });
  } catch (err) {
    console.error("Error fetching admin contact:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
