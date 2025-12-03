# OMS Backend API Documentation

## 🚀 Quick Start

```bash
node server.js
```

Server runs on: `http://localhost:3030`

---

## 🔐 Authentication

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@nirvaan.lk",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "test-jwt-token",
  "user": {
    "id": 1,
    "fullName": "Admin User",
    "email": "admin@nirvaan.lk",
    "role": "admin"
  }
}
```

---

## 📊 Dashboard

### Get Dashboard Statistics
**GET** `/api/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "total": 4,
  "pending": 1,
  "received": 1,
  "issued": 1,
  "courier": 1,
  "today": 0,
  "monthly": 4
}
```

**Statistics are calculated in real-time from orders data.**

---

## 📦 Orders

### Get All Orders
**GET** `/api/orders`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "order_id": "ORD202401001",
      "fullName": "Kamal Perera",
      "address": "123 Main Street, Colombo",
      "mobile": "94701234567",
      "product": "Herbal Cream",
      "product_id": "PROD001",
      "product_name": "NIRVAAN 5KG (100% PURE COCONUT OIL)",
      "quantity": "2",
      "status": "pending",
      "total_amount": 20000.00,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Get Order by ID
**GET** `/api/orders/:id`

**Example:** `/api/orders/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "order_id": "ORD202401001",
    "fullName": "Kamal Perera",
    "address": "123 Main Street, Colombo",
    "mobile": "94701234567",
    "product": "Herbal Cream",
    "quantity": "2",
    "status": "pending",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

### Update Order Status
**PUT** `/api/orders/:id/status`

**Example:** `/api/orders/1/status`

**Request Body:**
```json
{
  "status": "sent-to-courier"
}
```

**Valid Status Values:**
- `pending`
- `received`
- `issued`
- `sent-to-courier`
- `in-transit`
- `delivered`
- `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "1",
    "status": "sent-to-courier",
    ...
  }
}
```

**Error Response (400 - Invalid Status):**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

## 🛍️ Products

### Get All Products
**GET** `/api/products`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "product_id": "PROD001",
      "name": "NIRVAAN 5KG (100% PURE COCONUT OIL)",
      "description": "100% Pure Coconut Oil, 5KG pack",
      "price": 10000.00,
      "status": "available",
      "category": "Coconut Oil",
      "image": "/images/oil.jpg"
    }
  ]
}
```

---

## 📈 Analytics

### Get Analytics Data
**GET** `/api/analytics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 80000,
    "totalOrders": 4,
    "statusData": [
      { "name": "Pending", "value": 1, "color": "#f59e0b" },
      { "name": "Received", "value": 1, "color": "#3b82f6" },
      { "name": "Issued", "value": 1, "color": "#10b981" },
      { "name": "Sent to Courier", "value": 1, "color": "#8b5cf6" }
    ]
  }
}
```

**Analytics are calculated in real-time from orders data.**

---

## 🚚 Courier

### Get Courier Orders
**GET** `/api/courier/orders`

**Returns orders with status:** `sent-to-courier`, `in-transit`, or `delivered`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "4",
      "order_id": "ORD202401004",
      "fullName": "Anil Silva",
      "status": "sent-to-courier",
      ...
    }
  ]
}
```

---

## 🏥 Health Check

### Check Server Status
**GET** `/api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-03T10:30:00.000Z"
}
```

---

## ⚡ Key Features

### ✅ Real-Time Updates
- Dashboard statistics update automatically when order status changes
- Analytics reflect current order data
- Courier list filters orders by status dynamically

### ✅ Data Persistence
- All changes are stored in-memory
- Orders and products persist during server runtime
- Status updates immediately reflect across all endpoints

### ✅ Error Handling
- Proper HTTP status codes (200, 400, 404, 500)
- Consistent error response format
- Validation for order status updates

---

## 🔧 Testing with cURL

### Login
```bash
curl -X POST http://localhost:3030/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nirvaan.lk","password":"admin123"}'
```

### Get All Orders
```bash
curl http://localhost:3030/api/orders
```

### Get Order by ID
```bash
curl http://localhost:3030/api/orders/1
```

### Update Order Status
```bash
curl -X PUT http://localhost:3030/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"sent-to-courier"}'
```

### Get Dashboard Stats
```bash
curl http://localhost:3030/api/dashboard/stats
```

---

## 📝 Notes

1. **In-Memory Storage:** Data is stored in memory and will reset when the server restarts. For production, connect to a real database.

2. **Authentication:** Currently uses simple token-based auth. Implement JWT properly for production.

3. **CORS:** Enabled for all origins. Restrict in production.

4. **Duplicate IDs Fixed:** All orders and products now have unique IDs.

5. **Order Updates:** When you update an order status via `/api/orders/:id/status`, the dashboard automatically reflects the new statistics.

---

## 🎯 Integration with Frontend

Your frontend should:

1. **Login:** Store the token from `/api/auth/login`
2. **Fetch Orders:** Use `/api/orders` for list, `/api/orders/:id` for details
3. **Update Status:** Call `/api/orders/:id/status` when clicking "Send to Courier"
4. **Dashboard:** Fetch stats from `/api/dashboard/stats` - they update automatically!

---

## 🐛 Common Issues & Solutions

### Issue: Dashboard not showing updated data
**Solution:** The dashboard now calculates stats in real-time from the orders array. Make sure you're calling the updated endpoints.

### Issue: Order status not updating
**Solution:** Use `PUT /api/orders/:id/status` with proper status value in request body.

### Issue: Duplicate key warnings
**Solution:** Fixed! All IDs are now unique (1, 2, 3, 4 for orders; 1, 2 for products).

---

## 🚀 Next Steps

To make this production-ready:

1. Connect to a real database (MongoDB/PostgreSQL)
2. Implement proper JWT authentication
3. Add middleware for token validation
4. Add request validation with express-validator
5. Add logging with winston or morgan
6. Add rate limiting
7. Add input sanitization
8. Add unit tests
