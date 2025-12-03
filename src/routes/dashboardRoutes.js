const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { queryValidation } = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Dashboard stats
router.get('/stats', dashboardController.getStats);
router.get('/recent-orders', queryValidation, dashboardController.getRecentOrders);
router.get('/daily-data', dashboardController.getDailyData);
router.get('/status-distribution', dashboardController.getStatusDistribution);
router.get('/monthly-summary', dashboardController.getMonthlySummary);

module.exports = router;