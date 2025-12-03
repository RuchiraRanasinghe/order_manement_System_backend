const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courierController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { queryValidation } = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Courier routes
router.get('/orders', queryValidation, courierController.getCourierOrders);
router.get('/stats', courierController.getCourierStats);
router.get('/orders/:id/next-statuses', courierController.getNextStatuses);
router.get('/orders/:id/delivery-timeline', courierController.getDeliveryTimeline);
router.put('/orders/:id/status', courierController.updateCourierStatus);
router.put('/orders/bulk-update', courierController.bulkUpdateStatus);

module.exports = router;