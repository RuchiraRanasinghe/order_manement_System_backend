const db = require('../../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  // Create user
  static async create(userData) {
    const { fullName, email, password, role = 'admin' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (fullName, email, password, role) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [fullName, email, hashedPassword, role]);
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const users = await db.query(sql, [email]);
    return users[0] || null;
  }

  // Find user by email or fullName
  static async findByEmailOrName(identifier) {
    const sql = `
      SELECT * FROM users 
      WHERE email = ? OR fullName = ?
      LIMIT 1
    `;
    
    const users = await db.query(sql, [identifier, identifier]);
    return users[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const users = await db.query(sql, [id]);
    return users[0] || null;
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Update user
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    if (updateData.fullName) {
      fields.push('fullName = ?');
      values.push(updateData.fullName);
    }
    
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    
    if (updateData.password) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(updateData.password, 10));
    }
    
    if (updateData.role) {
      fields.push('role = ?');
      values.push(updateData.role);
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  }

  // Delete user
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.query(sql, [id]);
    return true;
  }

  // Get all users
  static async getAll() {
    const sql = 'SELECT id, fullName, email, role, createdAt FROM users ORDER BY createdAt DESC';
    return await db.query(sql);
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let sql = 'SELECT id FROM users WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const users = await db.query(sql, params);
    return users.length > 0;
  }

  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }
}

module.exports = User;