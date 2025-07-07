const express = require('express');
const database = require('../models/database');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await database.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await database.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get recent purchases for display
router.get('/recent-purchases', async (req, res) => {
  try {
    const recentPurchases = await database.getRecentPurchases(5);
    res.json(recentPurchases);
  } catch (error) {
    console.error('Error fetching recent purchases:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create order from cart
router.post('/order', requireAuth, async (req, res) => {
  try {
    const { customer_notes } = req.body;
    const user = await database.getUserBySteamId(req.user.steamId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has completed profile
    if (!user.roleplay_name || !user.phone_number || !user.bank_number) {
      return res.status(400).json({ error: 'Please complete your profile before placing an order' });
    }

    // Get cart items
    const cartItems = await database.getCartItems(user.id);
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const orderId = await database.createOrder(user.id, totalAmount, customer_notes);

    // Add order items
    for (const item of cartItems) {
      await database.addOrderItem(orderId, item.product_id, item.quantity, item.price);
      // Add to recent purchases
      await database.addRecentPurchase(item.name, user.roleplay_name || user.display_name);
      // Clear from cart
      await database.removeFromCart(user.id, item.product_id);
    }

    // Send email notification
    try {
      const orderDetails = cartItems.map(item => 
        `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `New Order #${orderId} - BallisticWorks Market`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${user.roleplay_name || user.display_name}</p>
          <p><strong>Steam Profile:</strong> ${user.profile_url}</p>
          <p><strong>Phone:</strong> ${user.phone_number}</p>
          <p><strong>Bank:</strong> ${user.bank_number}</p>
          <p><strong>Email:</strong> ${user.email || 'Not provided'}</p>
          <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
          
          <h3>Items:</h3>
          <pre>${orderDetails}</pre>
          
          ${customer_notes ? `<p><strong>Customer Notes:</strong> ${customer_notes}</p>` : ''}
          
          <p>Login to admin panel to manage this order.</p>
        `
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the order if email fails
    }

    res.json({ 
      message: 'Order created successfully', 
      orderId: orderId,
      totalAmount: totalAmount 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
