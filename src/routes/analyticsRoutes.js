const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { queryValidation } = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Analytics routes
router.get('/', analyticsController.getAnalytics);
router.get('/top-products', queryValidation, analyticsController.getTopProducts);
router.get('/revenue', queryValidation, analyticsController.getRevenueAnalytics);
router.get('/customers', queryValidation, analyticsController.getCustomerAnalytics);
router.get('/product-performance', queryValidation, analyticsController.getProductPerformance);

module.exports = router;