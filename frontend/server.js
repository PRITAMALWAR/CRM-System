const express = require('express');
const path = require('path');

const app = express();
// Render provides PORT environment variable automatically
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing - return all requests to React app
// This ensures that refreshing the page or directly accessing routes works
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend server is running on port ${PORT}`);
  console.log(`📁 Serving static files from ${path.join(__dirname, 'dist')}`);
});

