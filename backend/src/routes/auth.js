// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // assumes you have a postgres pool module at backend/src/db.js
// If you don't have a db helper, I'll explain a minimal one below.

router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'Missing username or password' });
    }

    // Query user by username
    const q = 'SELECT id, username, password, role FROM users WHERE username = $1 LIMIT 1';
    const result = await pool.query(q, [username]);

    if (result.rowCount === 0) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // NOTE: For this demo we compare plain text to avoid "string doesn't match" hashing problems.
    // In production ALWAYS hash and compare with bcrypt (bcrypt.compare).
    if (user.password !== password) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    // optional: check role if provided by frontend
    if (role && user.role !== role) {
      return res.status(403).json({ ok: false, message: 'Unauthorized role' });
    }

    // Return a simple session-like payload (no JWT for simplicity)
    return res.json({
      ok: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
