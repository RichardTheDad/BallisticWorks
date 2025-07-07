const { Pool } = require('pg');

class PostgresDatabase {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.init();
  }

  async init() {
    try {
      // Create tables if they don't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          steam_id TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          avatar TEXT,
          profile_url TEXT,
          roleplay_name TEXT,
          phone_number TEXT,
          bank_number TEXT,
          email TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          image_url TEXT,
          category TEXT,
          stock_quantity INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          customer_notes TEXT,
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS recent_purchases (
          id SERIAL PRIMARY KEY,
          product_name TEXT NOT NULL,
          buyer_name TEXT NOT NULL,
          purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('PostgreSQL database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // User methods
  async createUser(userData) {
    const { steam_id, display_name, avatar, profile_url } = userData;
    const result = await this.pool.query(
      `INSERT INTO users (steam_id, display_name, avatar, profile_url, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (steam_id) 
       DO UPDATE SET 
         display_name = EXCLUDED.display_name,
         avatar = EXCLUDED.avatar,
         profile_url = EXCLUDED.profile_url,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [steam_id, display_name, avatar, profile_url]
    );
    return result.rows[0].id;
  }

  async getUserBySteamId(steamId) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE steam_id = $1',
      [steamId]
    );
    return result.rows[0];
  }

  async updateUserProfile(steamId, profileData) {
    const { roleplay_name, phone_number, bank_number, email } = profileData;
    const result = await this.pool.query(
      `UPDATE users SET roleplay_name = $1, phone_number = $2, bank_number = $3, email = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE steam_id = $5`,
      [roleplay_name, phone_number, bank_number, email, steamId]
    );
    return result.rowCount;
  }

  // Product methods
  async createProduct(productData) {
    const { name, description, price, image_url, category, stock_quantity } = productData;
    const result = await this.pool.query(
      `INSERT INTO products (name, description, price, image_url, category, stock_quantity) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, description, price, image_url, category, stock_quantity]
    );
    return result.rows[0].id;
  }

  async getAllProducts() {
    const result = await this.pool.query(
      'SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getProductById(id) {
    const result = await this.pool.query(
      'SELECT * FROM products WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return result.rows[0];
  }

  // Cart methods
  async addToCart(userId, productId, quantity) {
    const result = await this.pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = EXCLUDED.quantity
       RETURNING id`,
      [userId, productId, quantity]
    );
    return result.rows[0].id;
  }

  async getCartItems(userId) {
    const result = await this.pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = $1 AND p.is_active = TRUE`,
      [userId]
    );
    return result.rows;
  }

  async removeFromCart(userId, productId) {
    const result = await this.pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return result.rowCount;
  }

  // Order methods
  async createOrder(userId, totalAmount, customerNotes = null) {
    const result = await this.pool.query(
      'INSERT INTO orders (user_id, total_amount, customer_notes) VALUES ($1, $2, $3) RETURNING id',
      [userId, totalAmount, customerNotes]
    );
    return result.rows[0].id;
  }

  async addOrderItem(orderId, productId, quantity, price) {
    const result = await this.pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING id',
      [orderId, productId, quantity, price]
    );
    return result.rows[0].id;
  }

  async getRecentPurchases(limit = 10) {
    const result = await this.pool.query(
      'SELECT * FROM recent_purchases ORDER BY purchase_time DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  async addRecentPurchase(productName, buyerName) {
    const result = await this.pool.query(
      'INSERT INTO recent_purchases (product_name, buyer_name) VALUES ($1, $2) RETURNING id',
      [productName, buyerName]
    );
    return result.rows[0].id;
  }

  // Admin methods for orders
  async getAllOrders() {
    const result = await this.pool.query(`
      SELECT o.*, u.display_name, u.roleplay_name, u.phone_number, u.bank_number, u.email
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    
    // Get order items for each order
    for (let order of result.rows) {
      const orderItems = await this.pool.query(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = $1
      `, [order.id]);
      order.items = orderItems.rows;
    }
    
    return result.rows;
  }

  async updateOrderStatus(orderId, status, adminNotes = null) {
    const result = await this.pool.query(
      'UPDATE orders SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [status, adminNotes, orderId]
    );
    return result.rowCount;
  }

  async deleteProduct(productId) {
    const result = await this.pool.query(
      'UPDATE products SET is_active = FALSE WHERE id = $1',
      [productId]
    );
    return result.rowCount;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = PostgresDatabase;
