const db = require('../../database');

class Product {
  // Generate product ID
  static generateProductId() {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PROD${random}`;
  }

  // Create product
  static async create(productData) {
    const productId = productData.product_id || this.generateProductId();
    const { 
      name, 
      description = '', 
      price = 10000.00, 
      status = 'available', 
      category = '', 
      image = '' 
    } = productData;

    const sql = `
      INSERT INTO products 
      (product_id, name, description, price, status, category, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [
      productId, name, description, price, status, category, image
    ]);
    
    return this.findById(result.insertId);
  }

  // Find product by ID
  static async findById(id) {
    const sql = 'SELECT * FROM products WHERE id = ? LIMIT 1';
    const products = await db.query(sql, [id]);
    return products[0] || null;
  }

  // Find product by product_id
  static async findByProductId(productId) {
    const sql = 'SELECT * FROM products WHERE product_id = ? LIMIT 1';
    const products = await db.query(sql, [productId]);
    return products[0] || null;
  }

  // Get all products
  static async getAll(filters = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR product_id LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    return await db.query(sql, params);
  }

  // Update product
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['name', 'description', 'price', 'status', 'category', 'image', 'product_id'];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  }

  // Update product status
  static async updateStatus(id, status) {
    const sql = 'UPDATE products SET status = ? WHERE id = ?';
    await db.query(sql, [status, id]);
    return this.findById(id);
  }

  // Delete product
  static async delete(id) {
    const sql = 'DELETE FROM products WHERE id = ?';
    await db.query(sql, [id]);
    return true;
  }

  // Get product statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'out-of-stock' THEN 1 ELSE 0 END) as outOfStock,
        SUM(CASE WHEN status = 'discontinued' THEN 1 ELSE 0 END) as discontinued
      FROM products
    `;
    
    const result = await db.query(sql);
    return result[0] || {
      total: 0, available: 0, outOfStock: 0, discontinued: 0
    };
  }

  // Search products
  static async search(query) {
    const sql = `
      SELECT * FROM products 
      WHERE name LIKE ? OR description LIKE ? OR product_id LIKE ?
      ORDER BY name ASC
      LIMIT 20
    `;
    
    const searchTerm = `%${query}%`;
    return await db.query(sql, [searchTerm, searchTerm, searchTerm]);
  }

  // Get products by category
  static async getByCategory(category) {
    const sql = `
      SELECT * FROM products 
      WHERE category = ? AND status = 'available'
      ORDER BY name ASC
    `;
    
    return await db.query(sql, [category]);
  }

  // Check if product exists
  static async exists(productId, excludeId = null) {
    let sql = 'SELECT id FROM products WHERE product_id = ?';
    const params = [productId];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const products = await db.query(sql, params);
    return products.length > 0;
  }
}

module.exports = Product;