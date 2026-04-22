'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Basic rate limiter: max 300 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Serve Angular static build output
const distPath = path.join(__dirname, 'dist', 'carteira-monolito', 'browser');
app.use(express.static(distPath));

// SPA fallback: return index.html for any route not matched by a static file
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
