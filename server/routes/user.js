const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const SALT_ROUNDS = 10;

/* GET PROFILE */
// GET /api/user/profile
router.get('/profile', requireAuth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* UPDATE USERNAME */
// PUT /api/user/username
router.put('/username', requireAuth, async (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanUsername = username.trim();

  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  try {
    // Check if username is taken by another user
    const existing = db.prepare(`
      SELECT id FROM users WHERE username = ? AND id != ?
    `).get(cleanUsername, req.user.id);

    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    db.prepare('UPDATE users SET username = ? WHERE id = ?')
      .run(cleanUsername, req.user.id);

    // Update session username
    req.session.username = cleanUsername;

    res.json({ message: 'Username updated successfully', username: cleanUsername });

  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* UPDATE PASSWORD */
// PUT /api/user/password
router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    db.prepare('UPDATE users SET password = ? WHERE id = ?')
      .run(hashedPassword, req.user.id);

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* DELETE ACCOUNT */
// DELETE /api/user/account
router.delete('/account', requireAuth, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required to delete account' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete all tasks first
    db.prepare('DELETE FROM tasks WHERE user_id = ?').run(req.user.id);

    // Delete the user
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);

    // Destroy session
    req.session.destroy();
    res.clearCookie('connect.sid');

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;