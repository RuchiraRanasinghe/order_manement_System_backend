const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createDatabase = async () => {
  let connection;

  try {
    // Connect without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Creating database...');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database ${process.env.DB_NAME} created/verified`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Drop tables if exists (for clean seed)
    console.log('Dropping existing tables...');
    await connection.query('DROP TABLE IF EXISTS orders');
    await connection.query('DROP TABLE IF EXISTS products');
    await connection.query('DROP TABLE IF EXISTS users');

    // Create users table
    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'admin',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    console.log('Creating products table...');
    await connection.query(`
      CREATE TABLE products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 10000.00,
        status ENUM('available', 'out-of-stock', 'discontinued') DEFAULT 'available',
        category VARCHAR(100),
        image VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create orders table (FIXED)
    console.log('Creating orders table...');
    await connection.query(`
      CREATE TABLE orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id VARCHAR(20) UNIQUE NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        product_id VARCHAR(20),  -- FIXED: removed NOT NULL
        product_name VARCHAR(200) NOT NULL,
        quantity INT NOT NULL,
        status ENUM('received', 'issued', 'sended', 'in-transit', 'delivered') DEFAULT 'received',
        notes TEXT,
        total_amount DECIMAL(10, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
      )
    `);

    // Insert admin user
    console.log('Inserting admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO users (fullName, email, password, role) 
      VALUES (?, ?, ?, ?)
    `, ['Admin User', 'admin@nirvaan.lk', hashedPassword, 'admin']);

    // Insert sample products
    console.log('Inserting sample products...');
    const products = [
      {
        product_id: 'PROD001',
        name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)',
        description: '100% Pure Coconut Oil, 5KG pack',
        price: 10000.00,
        status: 'available',
        category: 'Coconut Oil',
        image: 'https://example.com/oil.jpg'
      },
     
    ];

    for (const product of products) {
      await connection.query(`
        INSERT INTO products (product_id, name, description, price, status, category, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        product.product_id,
        product.name,
        product.description,
        product.price,
        product.status,
        product.category,
        product.image
      ]);
    }

    // Insert sample orders
    console.log('Inserting sample orders...');
  const orders = [
  { order_id: 'ORD20251213001', fullName: 'Kamal Perera', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213002', fullName: 'Nimal Fernando', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213003', fullName: 'Saman Jayasinghe', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213004', fullName: 'Chathura Silva', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213005', fullName: 'Ruwan Kumara', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213006', fullName: 'Sanduni Wickramasinghe', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213007', fullName: 'Tharindu Abeysekara', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213008', fullName: 'Dilani Peris', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213009', fullName: 'Ishara Madushan', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213010', fullName: 'Hansika de Alwis', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },

  { order_id: 'ORD20251213011', fullName: 'Pradeep Ranasinghe', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213012', fullName: 'Kasun Pathirana', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213013', fullName: 'Dinesh Gunawardena', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213014', fullName: 'Lakshan Wijesuriya', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213015', fullName: 'Shehani Fernando', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213016', fullName: 'Chamod Dilshan', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213017', fullName: 'Nisala Perera', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213018', fullName: 'Umesh Karunaratne', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213019', fullName: 'Sachini Weerasinghe', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 },
  { order_id: 'ORD20251213020', fullName: 'Janith Senanayake', address: '123 Main Street, Colombo', mobile: '94701234567', product_id: 'PROD001', product_name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)', quantity: 2, status: 'received', total_amount: 20000.00 }
]



    for (const order of orders) {
      await connection.query(`
        INSERT INTO orders (order_id, fullName, address, mobile, product_id, product_name, quantity, status, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        order.order_id,
        order.fullName,
        order.address,
        order.mobile,
        order.product_id,
        order.product_name,
        order.quantity,
        order.status,
        order.total_amount
      ]);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log('👤 Admin User: admin@nirvaan.lk / admin123');
    console.log('📦 Products: 5 sample products added');
    console.log('📋 Orders: 6 sample orders added');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
};

createDatabase();
