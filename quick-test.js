const mysql = require('mysql2/promise');
require('dotenv').config();

async function quickTest() {
  console.log('\n🔍 Quick MySQL Connection Test\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST);
  console.log('  User:', process.env.DB_USER);
  console.log('  Database:', process.env.DB_NAME);
  console.log('  Password:', process.env.DB_PASSWORD ? '***SET***' : '(EMPTY)');
  console.log('');
  
  try {
    console.log('Attempting to connect...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connected to MySQL!\n');
    
    // Test query
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM orders');
    console.log('✅ Query successful!');
    console.log('   Orders in database:', rows[0].count);
    
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    console.log('   Products in database:', products[0].count);
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log('   Users in database:', users[0].count);
    
    console.log('\n🎉 DATABASE IS CONNECTED AND WORKING!\n');
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!');
    console.error('Error:', error.message);
    console.error('\nCommon issues:');
    console.error('1. MySQL server not running - Start XAMPP/WAMP');
    console.error('2. Wrong password in .env file');
    console.error('3. Database "oms_db" does not exist');
    console.error('4. User does not have permissions\n');
    process.exit(1);
  }
}

quickTest();
