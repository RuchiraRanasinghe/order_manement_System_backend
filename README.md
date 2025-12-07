# 🚀 OMS Backend - Order Management System

**Production-ready backend API for Order Management System**

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-v8.0+-orange.svg)](https://www.mysql.com/)

---

## 📖 Documentation

**📚 [COMPLETE DOCUMENTATION](DOCUMENTATION.md)** ← Click here for everything!

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server (in-memory)
node server.js

# Start production server (database)
node server-db.js
```

**Server:** `http://localhost:3030`

**Default Login:**
- Email: `admin@nirvaan.lk`
- Password: `admin123`

---

## 🎯 Key Features

✅ JWT Authentication  
✅ Order Management (CRUD)  
✅ Real-time Analytics  
✅ Rate Limiting (100 req/min)  
✅ Response Compression  
✅ Input Validation  
✅ Security Headers  
✅ Error Handling  

---

## 📡 API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status
- `GET /api/dashboard/stats` - Dashboard stats
- `GET /api/products` - Get products
- `GET /api/courier/orders` - Courier orders
- `POST /api/inquiries` - Submit inquiry

**👉 [Full API Reference](DOCUMENTATION.md#endpoints-reference)**

---

## 🏗️ Tech Stack

- Node.js v22+ | Express v5.2
- MySQL 8.0+ | JWT Auth
- Helmet | Compression | bcrypt

---

## 🗄️ Database

```bash
# Configure .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=oms_db

# Seed database
npm run seed
```

**👉 [Database Schema](DOCUMENTATION.md#database-setup)**

---

## 🧪 Testing

```bash
# Test health
curl http://localhost:3030/api/health

# Test database
node quick-test.js
```

---

## 📁 Project Structure

```
oms-backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   └── routes/
├── server.js          # In-memory mode
├── server-db.js       # Database mode
└── DOCUMENTATION.md   # Complete docs
```

---

## 🔧 Scripts

```bash
npm start       # Production server
npm run dev     # Development with nodemon
npm run seed    # Seed database
```

---

## 🛡️ Security & Performance

✅ Helmet security headers  
✅ Rate limiting  
✅ Input validation  
✅ Password hashing  
✅ Response compression (60-80%)  
✅ Connection pooling  
✅ User caching (5min)  

---

## 📚 Resources

- **[Complete Documentation](DOCUMENTATION.md)** - Everything you need
- **[API Reference](DOCUMENTATION.md#endpoints-reference)** - All endpoints
- **[Database Schema](DOCUMENTATION.md#database-setup)** - Tables & structure
- **[Security Guide](DOCUMENTATION.md#security--performance)** - Best practices
- **[Troubleshooting](DOCUMENTATION.md#troubleshooting)** - Common issues

---

## 📝 Version 2.0

**Last Updated:** December 6, 2025

### Recent Updates
✅ Code optimization  
✅ Security enhancements  
✅ Performance improvements  
✅ Enhanced validation  
✅ Consolidated documentation  

---

## 📄 License

ISC

---

**Built with ❤️ for efficient order management**

