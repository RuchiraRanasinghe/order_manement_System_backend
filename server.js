const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');
const db = require('./database');

// Load environment variables
dotenv.config();

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection on startup
db.testConnection().then(isConnected => {
  if (isConnected) {
    console.log('✅ Database connection established');
  } else {
    console.log('❌ Database connection failed - running in fallback mode');
  }
});

// Health check with database status
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await db.testConnection();
    res.json({
      success: true,
      message: 'Server is running',
      database: isConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Server is running (fallback mode)',
      database: 'Disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  let { email, password } = req.body;
  
  try {
    // Trim inputs
    if (email) email = email.trim();
    if (password) password = password.trim();
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check in database
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Dashboard routes with MySQL
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) as issued,
        SUM(CASE WHEN status IN ('sended', 'in-transit', 'delivered') THEN 1 ELSE 0 END) as courier,
        SUM(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as monthly,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
    `;
    
    const statsResult = await db.query(statsQuery);
    const stats = statsResult[0] || {
      total: 0, pending: 0, received: 0, issued: 0, 
      courier: 0, today: 0, monthly: 0, revenue: 0
    };
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// Orders routes with MySQL
app.get('/api/orders', async (req, res) => {
  try {
    const { status, search, startDate, endDate, page, limit } = req.query;

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(fullName LIKE ? OR mobile LIKE ? OR order_id LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (startDate && endDate) {
      conditions.push('DATE(createdAt) BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

    // Pagination
    const parsedLimit = parseInt(limit, 10) || 0;
    const parsedPage = parseInt(page, 10) || 1;

    if (parsedLimit > 0) {
      // count total
      const countSql = `SELECT COUNT(*) as total FROM orders${whereClause}`;
      const countResult = await db.query(countSql, params);
      const total = countResult && countResult[0] ? countResult[0].total : 0;

      const offset = (parsedPage - 1) * parsedLimit;
      const dataSql = `SELECT * FROM orders${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
      const dataParams = params.slice();
      dataParams.push(parsedLimit, offset);
      const rows = await db.query(dataSql, dataParams);

      return res.json({
        success: true,
        data: {
          orders: rows,
          total,
          page: parsedPage,
          limit: parsedLimit
        }
      });
    }

    // no pagination requested - return all
    const allSql = `SELECT * FROM orders${whereClause} ORDER BY createdAt DESC`;
    const allRows = await db.query(allSql, params);
    res.json({
      success: true,
      data: allRows
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const orders = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: orders[0]
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Create new order (PUBLIC ENDPOINT) - FIXED VERSION
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📦 Received order request:', req.body);
    
    const { fullName, address, mobile, product = 'herbal-cream', quantity = '1' } = req.body;
    
    // Validate required fields
    if (!fullName || !address || !mobile) {
      console.log('❌ Missing fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Generate UNIQUE order ID
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // FIXED: Generate unique order ID using timestamp to avoid conflicts
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const order_id = `ORD${year}${month}${day}${timestamp.toString().slice(-6)}${random}`;
    
    // Get product details
    const products = await db.query('SELECT * FROM products WHERE product_id = ?', ['PROD001']);
    const productDetails = products[0] || {
      product_id: 'PROD001',
      name: 'NIRVAAN 5KG (100% PURE COCONUT OIL)',
      price: 10000
    };
    
    // Create new order
    const orderData = {
      order_id,
      fullName: fullName.trim(),
      address: address.trim(),
      mobile: mobile.replace(/[\s\-]/g, ''),
      product_id: productDetails.product_id,
      product_name: productDetails.name,
      quantity: parseInt(quantity) || 1,
      status: 'received',
      total_amount: productDetails.price * (parseInt(quantity) || 1),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Order data to insert:', orderData);
    
    // Insert into database
    const insertQuery = `
      INSERT INTO orders 
      (order_id, fullName, address, mobile, product_id, product_name, quantity, status, total_amount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(insertQuery, [
      orderData.order_id,
      orderData.fullName,
      orderData.address,
      orderData.mobile,
      orderData.product_id,
      orderData.product_name,
      orderData.quantity,
      orderData.status,
      orderData.total_amount,
      orderData.createdAt,
      orderData.updatedAt
    ]);
    
    console.log('✅ Database insert result:', result);
    
    // Get the inserted order
    const newOrder = await db.query('SELECT * FROM orders WHERE order_id = ?', [order_id]);
    
    if (newOrder.length === 0) {
      throw new Error('Failed to retrieve created order');
    }
    
    console.log('✅ Order created successfully:', newOrder[0]);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder[0]
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    
    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Order ID already exists. Please try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const updateQuery = 'UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?';
    const updateResult = await db.query(updateQuery, [status, id]);
    
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get updated order
    const orders = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: orders[0]
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// Products routes with MySQL
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products ORDER BY id');
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Analytics routes with MySQL
app.get('/api/analytics', async (req, res) => {
  try {
    // Get total revenue
    const revenueResult = await db.query('SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM orders');
    const totalRevenue = revenueResult[0].totalRevenue;
    
    // Get order count
    const countResult = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
    const totalOrders = countResult[0].totalOrders;
    
    // Get status distribution
    const statusResult = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders 
      GROUP BY status
    `);
    
    const statusData = statusResult.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      color: item.status === 'received' ? '#eab308' : 
             item.status === 'sended' ? '#3b82f6' : 
             item.status === 'delivered' ? '#10b981' : '#6b7280'
    }));
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        statusData
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Courier routes with MySQL
app.get('/api/courier/orders', async (req, res) => {
  try {
    const { page, limit } = req.query;

    // If limit is provided, return paginated results
    if (limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const offset = (pageNum - 1) * limitNum;

      // total count
      const countRows = await db.query(
        `SELECT COUNT(*) as total FROM orders WHERE status IN ('sended', 'in-transit', 'delivered')`
      );
      const total = countRows && countRows[0] ? countRows[0].total : 0;

      const orders = await db.query(
        `SELECT * FROM orders WHERE status IN ('sended', 'in-transit', 'delivered') ORDER BY updatedAt DESC LIMIT ? OFFSET ?`,
        [limitNum, offset]
      );

      return res.json({
        success: true,
        data: {
          orders,
          total,
          page: pageNum,
          limit: limitNum
        }
      });
    }

    // Fallback: return all courier orders when no limit specified
    const orders = await db.query(`
      SELECT * FROM orders 
      WHERE status IN ('sended', 'in-transit', 'delivered')
      ORDER BY updatedAt DESC
    `);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Courier orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courier orders'
    });
  }
});

// Inquiry routes with MySQL
let inquiries = []; // Temporary until we create inquiries table

app.get('/api/inquiries', async (req, res) => {
  try {
    // For now, return in-memory inquiries
    // TODO: Create inquiries table
    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries'
    });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const inquiry = {
      id: (inquiries.length + 1).toString(),
      ...req.body,
      status: 'received',
      createdAt: new Date().toISOString()
    };
    
    inquiries.push(inquiry);
    
    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting inquiry'
    });
  }
});

// Recent orders for dashboard
app.get('/api/orders/recent', async (req, res) => {
  try {
    const orders = await db.query(`
      SELECT * FROM orders 
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent orders'
    });
  }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if order exists
    const orders = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Delete order
    await db.query('DELETE FROM orders WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order'
    });
  }
});

// Get orders with filters
app.get('/api/orders/filter', async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      sql += ' AND (fullName LIKE ? OR mobile LIKE ? OR order_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (startDate && endDate) {
      sql += ' AND DATE(createdAt) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    const orders = await db.query(sql, params);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Filter orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering orders'
    });
  }
});

// Test database connection endpoint
app.get('/api/database/test', async (req, res) => {
  try {
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      return res.json({
        success: false,
        message: 'Database connection failed',
        connected: false
      });
    }
    
    // Test queries
    const [usersCount, productsCount, ordersCount] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM products'),
      db.query('SELECT COUNT(*) as count FROM orders')
    ]);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      connected: true,
      counts: {
        users: usersCount[0].count,
        products: productsCount[0].count,
        orders: ordersCount[0].count
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.json({
      success: false,
      message: 'Database connection failed',
      connected: false,
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      '/api/health',
      '/api/dashboard/stats',
      '/api/orders',
      '/api/orders/:id',
      '/api/products',
      '/api/analytics',
      '/api/courier/orders',
      '/api/auth/login'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3030;

app.listen(PORT, async () => {
  console.log(`\n🚀 Server Information:`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`🔐 Admin Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Email: admin@nirvaan.lk`);
  console.log(`   Password: admin123`);
  
  // Test database connection
  try {
    const isConnected = await db.testConnection();
    if (isConnected) {
      console.log(`\n🗄️  Database Information:`);
      console.log(`✅ Database: Connected to MySQL`);
      
      // Check if tables exist
      const tables = await db.query('SHOW TABLES');
      console.log(`📋 Database has ${tables.length} tables`);
      
      // Count data in tables
      try {
        const [users, products, orders] = await Promise.all([
          db.query('SELECT COUNT(*) as count FROM users'),
          db.query('SELECT COUNT(*) as count FROM products'),
          db.query('SELECT COUNT(*) as count FROM orders')
        ]);
        
        console.log(`👤 Users: ${users[0].count} users`);
        console.log(`📦 Products: ${products[0].count} products`);
        console.log(`📋 Orders: ${orders[0].count} orders`);
      } catch (countError) {
        console.log('⚠️  Could not count table data, tables may not exist');
      }
      
    } else {
      console.log(`\n⚠️  Database Status:`);
      console.log(`❌ Database: Connection failed - check your MySQL configuration`);
      console.log(`ℹ️  Server will start but database operations will fail`);
    }
  } catch (error) {
    console.log(`\n❌ Database Status:`);
    console.log(`❌ Database: Connection test failed - ${error.message}`);
  }
  
  console.log(`\n📝 Next Steps:`);
  console.log(`   1. Open browser to: http://localhost:${PORT}/api/health`);
  console.log(`   2. Create orders from frontend form`);
  console.log(`   3. View orders: http://localhost:${PORT}/api/orders`);
});