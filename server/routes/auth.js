const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../db");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../email");

const SALT_ROUNDS = 10;

/* Register */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const existingUsername = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db
      .prepare(
        `
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `,
      )
      .run(username, email, hashedPassword);

    // Send verification email
    try {
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

      db.prepare(
        `
    INSERT INTO tokens (user_id, token, type, expires_at)
    VALUES (?, ?, 'verification', ?)
  `,
      ).run(result.lastInsertRowid, verifyToken, expiresAt);

      await sendVerificationEmail(email, verifyToken);
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr);
      // Don't block registration if email fails
    }

    res.status(201).json({
      message:
        "Account created successfully. Please check your email to verify your account.",
      user: { id: result.lastInsertRowid, username },
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

/* Login */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.verified) {
      return res.status(403).json({
        error:
          "Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

/* Logout */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

/* Get Current User */
router.get("/me", (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      user: { id: req.session.userId, username: req.session.username },
    });
  } else {
    res.json({ loggedIn: false });
  }
});

/* Forgot Password */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

    // Always respond with success so we don't reveal if email exists
    if (!user)
      return res.json({
        message: "If that email exists, a reset link was sent",
      });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour

    db.prepare("DELETE FROM tokens WHERE user_id = ? AND type = ?").run(
      user.id,
      "reset",
    );
    db.prepare(
      `
      INSERT INTO tokens (user_id, token, type, expires_at)
      VALUES (?, ?, 'reset', ?)
    `,
    ).run(user.id, token, expiresAt);

    await sendPasswordResetEmail(email, token);

    res.json({ message: "If that email exists, a reset link was sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* Reset Password */
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: "Token and password are required" });
  if (password.length < 8)
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });

  try {
    const record = db
      .prepare(
        `
      SELECT * FROM tokens WHERE token = ? AND type = 'reset'
    `,
      )
      .get(token);

    if (!record)
      return res.status(400).json({ error: "Invalid or expired reset link" });
    if (Date.now() > Number(record.expires_at)) {
      db.prepare("DELETE FROM tokens WHERE id = ?").run(record.id);
      return res.status(400).json({ error: "Reset link has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
      hashedPassword,
      record.user_id,
    );
    db.prepare("DELETE FROM tokens WHERE id = ?").run(record.id);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* Verify Email */
router.get("/verify-email", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    const record = db
      .prepare(
        `
      SELECT * FROM tokens WHERE token = ? AND type = 'verification'
    `,
      )
      .get(token);

    if (!record)
      return res.status(400).send("Invalid or expired verification link");
    if (Date.now() > Number(record.expires_at)) {
      db.prepare("DELETE FROM tokens WHERE id = ?").run(record.id);
      return res.status(400).send("Verification link has expired");
    }

    db.prepare("UPDATE users SET verified = 1 WHERE id = ?").run(
      record.user_id,
    );
    db.prepare("DELETE FROM tokens WHERE id = ?").run(record.id);

    // Redirect to login with a success message
    res.redirect("/login.html?verified=true");
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).send("Server error");
  }
});

/* Resend Verification */
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user)
      return res.json({
        message: "If that email exists, a verification link was sent",
      });
    if (user.verified)
      return res.status(400).json({ error: "Account already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    db.prepare("DELETE FROM tokens WHERE user_id = ? AND type = ?").run(
      user.id,
      "verification",
    );
    db.prepare(
      `
      INSERT INTO tokens (user_id, token, type, expires_at)
      VALUES (?, ?, 'verification', ?)
    `,
    ).run(user.id, token, expiresAt);

    await sendVerificationEmail(email, token);

    res.json({ message: "If that email exists, a verification link was sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
