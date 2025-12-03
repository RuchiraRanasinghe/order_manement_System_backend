const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const { 
  loginValidation, 
  registerValidation, 
  passwordChangeValidation,
  profileUpdateValidation 
} = require('../utils/validation');

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, profileUpdateValidation, authController.updateProfile);
router.put('/password', authMiddleware, passwordChangeValidation, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);

// Admin only routes
router.get('/users', authMiddleware, authorize('admin'), authController.getAllUsers);
router.delete('/users/:id', authMiddleware, authorize('admin'), authController.deleteUser);

module.exports = router;