const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { orderValidation, queryValidation } = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Order routes
router.get('/', queryValidation, ordersController.getAllOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/', orderValidation, ordersController.createOrder);
router.put('/:id', ordersController.updateOrder);
router.delete('/:id', ordersController.deleteOrder);

// Order status routes
router.put('/:id/status', ordersController.updateOrderStatus);
router.put('/:id/send-to-courier', ordersController.sendToCourier);

// Order utilities
router.get('/:id/whatsapp-message', ordersController.generateWhatsAppMessage);
router.get('/:id/timeline', ordersController.getOrderTimeline);

module.exports = router;