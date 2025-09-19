// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db'); // PostgreSQL connection
const trainsRouter = require('./routes/trains');
const aiRouter = require('./routes/ai');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/trains', trainsRouter);
app.use('/api/ai', aiRouter);

// Optional: test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database test failed' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Railway DSS backend running on port ${PORT}`));
