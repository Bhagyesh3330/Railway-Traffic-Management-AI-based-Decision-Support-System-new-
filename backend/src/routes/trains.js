const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all trains
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trains ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Get single train
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trains WHERE id=$1', [req.params.id]);
    res.json(result.rows[0] || { error: 'not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
