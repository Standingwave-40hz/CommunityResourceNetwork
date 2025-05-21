const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret"; // Use env in prod

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed });
    await newUser.save();

    res.status(201).json({ message: "User registered" });
});

// Login
router.post('/login', async (req, res) => {
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

    res.cookie('userid', user._id.toString(), {   // ✅ Moved here
        httpOnly: false,
        sameSite: 'Lax',
        path: '/',
        maxAge: 2 * 60 * 60 * 1000
    });

    res.json({
  message: "Logged in",
  requiresTerms: !user.acceptedTerms // true if they haven't accepted yet
});

});
const authenticateUser = require('../middleware/auth'); // if not already imported

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

module.exports = router;
