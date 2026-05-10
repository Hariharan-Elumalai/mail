require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/emails');

const app = express();

// Note: DB connection is performed by the runtime that starts the server.
// For local runs (when started directly) we connect and seed a demo user.

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/emails', emailRoutes);

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Export the app for serverless platforms (Vercel) and testing.
module.exports = app;

if (require.main === module) {
  // Running locally — connect to DB and seed demo user if applicable.
  (async () => {
    try {
      await connectDB();
      // Seed demo user if available
      try {
        const { seedDemoUser } = require('./utils/seedDemo');
        await seedDemoUser();
      } catch (err) {
        // ignore seeding errors
        console.warn('Demo seeding skipped:', err.message || err);
      }

      app.listen(PORT, () =>
        console.log(`🚀 Server running on http://localhost:${PORT}`)
      );
    } catch (err) {
      console.error('Failed to connect to DB on startup:', err.message || err);
    }
  })();
}
