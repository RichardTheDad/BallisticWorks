const express = require('express');
const passport = require('passport');
const database = require('../models/database');
const router = express.Router();

// Steam authentication routes
router.get('/steam',
  (req, res, next) => {
    console.log('🚀 Steam login initiated');
    console.log('🔧 Steam API Key exists:', !!process.env.STEAM_API_KEY);
    console.log('🔧 Return URL will be:', `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/steam/return`);
    next();
  },
  passport.authenticate('steam', { failureRedirect: '/login' }),
  (req, res) => {
    // This function will not be called
  }
);

router.get('/steam/return',
  (req, res, next) => {
    console.log('🔄 Steam return callback hit');
    console.log('🔧 Query params:', req.query);
    next();
  },
  passport.authenticate('steam', { 
    failureRedirect: '/login',
    failureFlash: false 
  }),
  async (req, res) => {
    try {
      console.log('✅ Steam authentication successful');
      console.log('👤 User data:', req.user);
      
      // Create or update user in database
      await database.createUser({
        steam_id: req.user.steamId,
        display_name: req.user.displayName,
        avatar: req.user.avatar,
        profile_url: req.user.profileUrl
      });

      console.log('💾 User saved to database');
      console.log('🔄 Redirecting to:', `${process.env.CLIENT_URL}/account?login=success`);
      
      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/account?login=success`);
    } catch (error) {
      console.error('❌ Error in Steam return callback:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=database`);
    }
  }
);

// Get current user
router.get('/user', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await database.getUserBySteamId(req.user.steamId);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({ 
    isAuthenticated: !!req.user,
    user: req.user || null 
  });
});

module.exports = router;
