const express = require('express');
const cors = require('cors');
const path = require('path');
const filesRouter = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve uploaded files
const uploadsPath = process.env.VERCEL === '1' 
  ? path.join('/tmp', 'uploads') 
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api', filesRouter);

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 School File Vault running at http://localhost:${PORT}`);
  });
}

module.exports = app;
