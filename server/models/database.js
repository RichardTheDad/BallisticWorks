// Use PostgreSQL if DATABASE_URL is provided (Railway), otherwise use SQLite
if (process.env.DATABASE_URL) {
  const PostgresDatabase = require('./postgres-database');
  module.exports = new PostgresDatabase();
} else {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');

  class Database {
    constructor() {
      this.db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite');
      this.init();
    }

  init() {
    // Create tables if they don't exist
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          steam_id TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          avatar TEXT,
          profile_url TEXT,
          roleplay_name TEXT,
          phone_number TEXT,
          bank_number TEXT,
          email TEXT,
          is_admin BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          image_url TEXT,
          category TEXT,
          stock_quantity INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          customer_notes TEXT,
          admin_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Order items table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Shopping cart table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Purchase history for recent purchases display
      this.db.run(`
        CREATE TABLE IF NOT EXISTS recent_purchases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_name TEXT NOT NULL,
          buyer_name TEXT NOT NULL,
          purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Database initialized successfully');
    });
  }

  // User methods
  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { steam_id, display_name, avatar, profile_url } = userData;
      this.db.run(
        `INSERT OR REPLACE INTO users (steam_id, display_name, avatar, profile_url, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [steam_id, display_name, avatar, profile_url],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getUserBySteamId(steamId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE steam_id = ?',
        [steamId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  updateUserProfile(steamId, profileData) {
    return new Promise((resolve, reject) => {
      const { roleplay_name, phone_number, bank_number, email } = profileData;
      this.db.run(
        `UPDATE users SET roleplay_name = ?, phone_number = ?, bank_number = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE steam_id = ?`,
        [roleplay_name, phone_number, bank_number, email, steamId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Product methods
  createProduct(productData) {
    return new Promise((resolve, reject) => {
      const { name, description, price, image_url, category, stock_quantity } = productData;
      this.db.run(
        `INSERT INTO products (name, description, price, image_url, category, stock_quantity) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, price, image_url, category, stock_quantity],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getAllProducts() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getProductById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM products WHERE id = ? AND is_active = 1',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Cart methods
  addToCart(userId, productId, quantity) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO cart_items (user_id, product_id, quantity) 
         VALUES (?, ?, ?)`,
        [userId, productId, quantity],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getCartItems(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT ci.*, p.name, p.price, p.image_url 
         FROM cart_items ci 
         JOIN products p ON ci.product_id = p.id 
         WHERE ci.user_id = ? AND p.is_active = 1`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  removeFromCart(userId, productId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, productId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Order methods
  createOrder(userId, totalAmount, customerNotes = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO orders (user_id, total_amount, customer_notes) VALUES (?, ?, ?)',
        [userId, totalAmount, customerNotes],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  addOrderItem(orderId, productId, quantity, price) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, productId, quantity, price],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getRecentPurchases(limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM recent_purchases ORDER BY purchase_time DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  addRecentPurchase(productName, buyerName) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO recent_purchases (product_name, buyer_name) VALUES (?, ?)',
        [productName, buyerName],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

    close() {
      this.db.close();
    }
  }

  module.exports = new Database();
}
