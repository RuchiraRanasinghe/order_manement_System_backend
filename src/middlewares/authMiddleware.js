const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Simple in-memory cache for user lookups (reduces DB queries)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header with multiple format support
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check cache first
    const cacheKey = `user_${decoded.id}`;
    const cachedUser = userCache.get(cacheKey);
    
    let user;
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      user = cachedUser.data;
    } else {
      // Find user from database
      user = await User.findById(decoded.id);
      
      if (user) {
        // Cache user data
        userCache.set(cacheKey, {
          data: user,
          timestamp: Date.now()
        });
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions'
      });
    }
    
    next();
  };
};

module.exports = { authMiddleware, authorize };