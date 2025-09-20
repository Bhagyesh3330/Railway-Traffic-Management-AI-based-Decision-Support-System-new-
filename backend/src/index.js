// backend/src/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRouter = require('./routes/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Mount auth router
app.use('/api/auth', authRouter);

// TODO: keep adding your other routes here, e.g.:
// const otherRouter = require('./routes/other');
// app.use('/api/other', otherRouter);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
