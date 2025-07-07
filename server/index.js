const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// Debug all environment variables related to ports
console.log('🔧 Environment Debug:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   All env keys containing PORT:`, Object.keys(process.env).filter(k => k.includes('PORT')));

// Force port 5000 to match Railway's routing configuration
const PORT = 5000;
console.log(`🔧 Final PORT: ${PORT} (forced to match Railway routing)`);
console.log(`🔧 Railway provided PORT: ${process.env.PORT}`);

// Import routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Steam Strategy
passport.use(new SteamStrategy({
  returnURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/steam/return`,
  realm: process.env.SERVER_URL || 'http://localhost:5000',
  apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
  // Steam profile processing
  const user = {
    steamId: profile.id,
    displayName: profile.displayName,
    avatar: profile.photos[0].value,
    profileUrl: profile._json.profileurl
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Simple root endpoint will be handled by React app in production

// Health check (before other routes)
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint (before other routes)  
app.get('/test', (req, res) => {
  console.log('Test endpoint requested');
  res.json({ message: 'Server is working!', port: PORT });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  console.log(`Serving static files from: ${buildPath}`);
  app.use(express.static(buildPath));
  
  // Handle React routing - serve React app for all non-API routes (must be last)
  app.get('*', (req, res) => {
    // Skip API routes and specific endpoints
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/auth') || 
        req.path.startsWith('/uploads') ||
        req.path === '/health' ||
        req.path === '/test') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const indexPath = path.join(__dirname, '../client/build', 'index.html');
    console.log(`Serving React app from: ${indexPath} for ${req.path}`);
    res.sendFile(indexPath);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Server URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}`);
  console.log(`🔗 Binding to all interfaces on port ${PORT}`);
  console.log(`✅ Server ready to accept connections`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});
