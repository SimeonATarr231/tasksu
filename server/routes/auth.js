const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

const SALT_ROUNDS = 10;

/* Register */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db.prepare(`
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `).run(username, email, hashedPassword);

    req.session.userId = result.lastInsertRowid;
    req.session.username = username;

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: result.lastInsertRowid, username }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/* Login */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/* Logout */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

/* Get Current User */
router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      user: { id: req.session.userId, username: req.session.username }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;