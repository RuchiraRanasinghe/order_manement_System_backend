const { body, query, param, validationResult } = require('express-validator');

// Common validation rules
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

// Login validation
const loginValidation = validate([
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('fullName').optional().isString().withMessage('Please provide a valid name'),
  body('password').notEmpty().withMessage('Password is required')
]);

// Register validation
const registerValidation = validate([
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['admin', 'staff']).withMessage('Invalid role')
]);

// Product validation
const productValidation = validate([
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('status').optional().isIn(['available', 'out-of-stock', 'discontinued']),
  body('category').optional().isString(),
  body('description').optional().isString()
]);

// Order validation
const orderValidation = validate([
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('product_id').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
]);

// Password change validation
const passwordChangeValidation = validate([
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
]);

// Profile update validation
const profileUpdateValidation = validate([
  body('fullName').optional().isString(),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isString()
]);

// Query validation
const queryValidation = validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isString(),
  query('category').optional().isString(),
  query('startDate').optional().isDate(),
  query('endDate').optional().isDate()
]);

module.exports = {
  validate,
  loginValidation,
  registerValidation,
  productValidation,
  orderValidation,
  passwordChangeValidation,
  profileUpdateValidation,
  queryValidation
};