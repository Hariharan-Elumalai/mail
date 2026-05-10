// Vercel serverless wrapper for existing Express app
// This file adapts the Express `app` exported from ../index.js into a Vercel handler.

const app = require('../index');

module.exports = (req, res) => {
  return app(req, res);
};
