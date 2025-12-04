const db = require('./database');

async function createInquiriesTable() {
  try {
    console.log('Creating inquiries table...');
    
    const sql = `
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        message TEXT NOT NULL,
        name VARCHAR(255) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        mobile VARCHAR(20) DEFAULT '',
        status ENUM('pending', 'resolved') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    await db.query(sql);
    console.log('✅ Inquiries table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating inquiries table:', error.message);
    process.exit(1);
  }
}

createInquiriesTable();
