const express = require('express');
const database = require('../models/database');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await database.getUserBySteamId(req.user.steamId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { roleplay_name, phone_number, bank_number, email } = req.body;
    
    // Validate required fields
    if (!roleplay_name || !phone_number || !bank_number) {
      return res.status(400).json({ error: 'Roleplay name, phone number, and bank number are required' });
    }

    await database.updateUserProfile(req.user.steamId, {
      roleplay_name,
      phone_number,
      bank_number,
      email
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get user's cart
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const user = await database.getUserBySteamId(req.user.steamId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cartItems = await database.getCartItems(user.id);
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add item to cart
router.post('/cart', requireAuth, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid product ID and quantity are required' });
    }

    const user = await database.getUserBySteamId(req.user.steamId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if product exists
    const product = await database.getProductById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await database.addToCart(user.id, product_id, quantity);
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Remove item from cart
router.delete('/cart/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await database.getUserBySteamId(req.user.steamId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await database.removeFromCart(user.id, productId);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
