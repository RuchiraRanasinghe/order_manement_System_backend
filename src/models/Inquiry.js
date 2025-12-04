const db = require('../../database');

class Inquiry {
  // Create inquiry
  static async create(inquiryData) {
    const { message, name = '', email = '', mobile = '' } = inquiryData;

    const sql = `
      INSERT INTO inquiries 
      (message, name, email, mobile, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    
    const result = await db.query(sql, [message, name, email, mobile]);
    return this.findById(result.insertId);
  }

  // Find inquiry by ID
  static async findById(id) {
    const sql = 'SELECT * FROM inquiries WHERE id = ? LIMIT 1';
    const inquiries = await db.query(sql, [id]);
    return inquiries[0] || null;
  }

  // Get all inquiries
  static async getAll(filters = {}) {
    let sql = 'SELECT * FROM inquiries WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    return await db.query(sql, params);
  }

  // Update inquiry status
  static async updateStatus(id, status) {
    const sql = 'UPDATE inquiries SET status = ?, updatedAt = NOW() WHERE id = ?';
    await db.query(sql, [status, id]);
    return this.findById(id);
  }

  // Delete inquiry
  static async delete(id) {
    const sql = 'DELETE FROM inquiries WHERE id = ?';
    await db.query(sql, [id]);
    return true;
  }

  // Get statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM inquiries
    `;
    
    const result = await db.query(sql);
    return result[0] || { total: 0, pending: 0, resolved: 0 };
  }
}

module.exports = Inquiry;
