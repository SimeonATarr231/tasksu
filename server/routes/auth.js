const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../email');

const SALT_ROUNDS = 10;

// ── HELPER: Generate a secure random token 
// crypto is a built-in Node.js module — no install needed
// It generates a cryptographically secure random string
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ── HELPER: Get expiry timestamp ───────────────────────────────
// hours parameter controls how long the token lives
const getExpiryTime = (hours) => {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  // Format as SQLite-compatible string: "YYYY-MM-DD HH:MM:SS"
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

// ── REGISTER ───────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
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

    // Create account with verified = 0
    const result = db.prepare(`
      INSERT INTO users (username, email, password, verified)
      VALUES (?, ?, ?, 0)
    `).run(username, email, hashedPassword);

    const userId = result.lastInsertRowid;

    // Generate verification token — expires in 24 hours
    const token = generateToken();
    const expiresAt = getExpiryTime(24);

    db.prepare(`
      INSERT INTO tokens (user_id, token, type, expires_at)
      VALUES (?, ?, 'verification', ?)
    `).run(userId, token, expiresAt);

    // Send verification email
    await sendVerificationEmail(email, username, token);

    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
      requiresVerification: true
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── VERIFY EMAIL ───────────────────────────────────────────────
// GET /api/auth/verify-email?token=xxxxx
router.get('/verify-email', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect('/index.html?error=invalid_token');
  }

  try {
    // Find the token record
    const tokenRecord = db.prepare(`
      SELECT * FROM tokens
      WHERE token = ? AND type = 'verification'
    `).get(token);

    if (!tokenRecord) {
      return res.redirect('/index.html?error=invalid_token');
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);

    if (now > expiresAt) {
      // Delete the expired token
      db.prepare('DELETE FROM tokens WHERE id = ?').run(tokenRecord.id);
      return res.redirect('/index.html?error=token_expired');
    }

    // Mark user as verified
    db.prepare('UPDATE users SET verified = 1 WHERE id = ?').run(tokenRecord.user_id);

    // Delete the used token — tokens are single use
    db.prepare('DELETE FROM tokens WHERE id = ?').run(tokenRecord.id);

    // Redirect to login page with success message
    res.redirect('/index.html?verified=true');

  } catch (error) {
    console.error('Verify email error:', error);
    res.redirect('/index.html?error=server_error');
  }
});

// ── RESEND VERIFICATION EMAIL ───────────────────────────────────
// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Always return success even if email not found — security best practice
    if (!user || user.verified === 1) {
      return res.json({ message: 'If that email exists and is unverified, a new link has been sent.' });
    }

    // Delete any existing verification tokens for this user
    db.prepare(`
      DELETE FROM tokens WHERE user_id = ? AND type = 'verification'
    `).run(user.id);

    // Generate new token
    const token = generateToken();
    const expiresAt = getExpiryTime(24);

    db.prepare(`
      INSERT INTO tokens (user_id, token, type, expires_at)
      VALUES (?, ?, 'verification', ?)
    `).run(user.id, token, expiresAt);

    await sendVerificationEmail(email, user.username, token);

    res.json({ message: 'If that email exists and is unverified, a new link has been sent.' });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── LOGIN ──────────────────────────────────────────────────────
// POST /api/auth/login
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

    // Block unverified accounts from logging in
    if (user.verified === 0) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email
      });
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

// ── LOGOUT ─────────────────────────────────────────────────────
// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

/* GET CURRENT USER */
// GET /api/auth/me
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

/* FORGOT PASSWORD */
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Always return success — never reveal if email exists
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Delete any existing password reset tokens for this user
    db.prepare(`
      DELETE FROM tokens WHERE user_id = ? AND type = 'password_reset'
    `).run(user.id);

    // Generate reset token — expires in 1 hour
    const token = generateToken();
    const expiresAt = getExpiryTime(1);

    db.prepare(`
      INSERT INTO tokens (user_id, token, type, expires_at)
      VALUES (?, ?, 'password_reset', ?)
    `).run(user.id, token, expiresAt);

    await sendPasswordResetEmail(email, user.username, token);

    res.json({ message: 'If that email is registered, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* RESET PASSWORD */
// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const tokenRecord = db.prepare(`
      SELECT * FROM tokens
      WHERE token = ? AND type = 'password_reset'
    `).get(token);

    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);

    if (now > expiresAt) {
      db.prepare('DELETE FROM tokens WHERE id = ?').run(tokenRecord.id);
      return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Update the user's password
    db.prepare('UPDATE users SET password = ? WHERE id = ?')
      .run(hashedPassword, tokenRecord.user_id);

    // Delete the used token
    db.prepare('DELETE FROM tokens WHERE id = ?').run(tokenRecord.id);

    res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

/* VALIDATE RESET TOKEN */
// GET /api/auth/validate-reset-token?token=xxxxx
// Frontend calls this when the reset page loads to check if token is still valid
router.get('/validate-reset-token', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.json({ valid: false });
  }

  try {
    const tokenRecord = db.prepare(`
      SELECT * FROM tokens
      WHERE token = ? AND type = 'password_reset'
    `).get(token);

    if (!tokenRecord) {
      return res.json({ valid: false });
    }

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);

    if (now > expiresAt) {
      return res.json({ valid: false });
    }

    res.json({ valid: true });

  } catch (error) {
    res.json({ valid: false });
  }
});

module.exports = router;