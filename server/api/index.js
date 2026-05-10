// Vercel serverless wrapper for existing Express app
// This file adapts the Express `app` exported from ../index.js into a Vercel handler.

const app = require('../index');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const { seedDemoUser } = require('../utils/seedDemo');

// Cache DB connection in lambda / serverless environment
let dbConnected = false;

module.exports = async (req, res) => {
  try {
    // Connect to DB if MONGO_URI provided and not already connected
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (mongoUri && mongoose.connection.readyState !== 1) {
      await connectDB();
      dbConnected = true;
      // Ensure demo user exists
      try {
        await seedDemoUser();
      } catch (err) {
        // ignore
      }
    }

    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
