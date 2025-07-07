// Quick Railway port test
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

console.log('🔧 Railway Port Test Starting...');
console.log(`PORT env var: ${process.env.PORT}`);
console.log(`Using PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Railway connection test successful!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server listening on 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});
