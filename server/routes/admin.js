const express = require('express');
const multer = require('multer');
const path = require('path');
const database = require('../models/database');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await database.getUserBySteamId(req.user.steamId);
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get all products (admin view)
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const products = await database.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new product
router.post('/products', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock_quantity } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const productId = await database.createProduct({
      name,
      description: description || '',
      price: parseFloat(price),
      image_url,
      category: category || 'General',
      stock_quantity: parseInt(stock_quantity) || 0
    });

    res.json({ 
      message: 'Product created successfully', 
      productId: productId,
      image_url: image_url 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all orders
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await database.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update order status
router.put('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const orderId = req.params.id;
    
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await database.updateOrderStatus(orderId, status, admin_notes || null);

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete product
router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    
    await database.deleteProduct(productId);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Check if user is admin
router.get('/check', async (req, res) => {
  if (!req.user) {
    return res.json({ isAdmin: false });
  }

  try {
    const user = await database.getUserBySteamId(req.user.steamId);
    res.json({ isAdmin: !!(user && user.is_admin) });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.json({ isAdmin: false });
  }
});

module.exports = router;
