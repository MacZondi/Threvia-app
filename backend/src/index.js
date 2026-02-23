require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const competitionRoutes = require('./routes/competitions');
const tokenRoutes = require('./routes/token');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/token', tokenRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Threvia API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Threvia API running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

module.exports = app;
