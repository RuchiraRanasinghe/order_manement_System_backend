const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { productValidation, queryValidation } = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Product routes
router.get('/', queryValidation, productsController.getAllProducts);
router.get('/stats', productsController.getProductStats);
router.get('/search', productsController.searchProducts);
router.get('/categories', productsController.getCategories);
router.get('/category/:category', productsController.getProductsByCategory);
router.get('/:id', productsController.getProductById);
router.post('/', productValidation, productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

// Product status routes
router.put('/:id/status', productsController.updateProductStatus);

module.exports = router;