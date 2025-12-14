const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

class AuthController {
  // User login
  async login(req, res, next) {
    try {
      let { email, fullName, password } = req.body;
      // Trim inputs for safety
      if (email) email = email.trim();
      if (fullName) fullName = fullName.trim();
      if (password) password = password.trim();
      
      // Validate input
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }
      
      // Find user by email or fullName
      const identifier = email || fullName;
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Email or full name is required'
        });
      }
      
      const user = await User.findByEmailOrName(identifier);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check password
      const isPasswordValid = await User.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      });
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
      
    } catch (error) {
      next(error);
    }
  }

  // User registration (admin only)
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const { fullName, email, password, role = 'staff' } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmailOrName(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }
      
      // Create user
      const userId = await User.create({ fullName, email, password, role });
      const user = await User.findById(userId);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const { fullName, email } = req.body;
      const userId = req.user.id;
      
      // Check if email already exists
      if (email) {
        const emailExists = await User.emailExists(email, userId);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }
      
      // Update user
      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      
      const updatedUser = await User.update(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      // Get user
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Verify current password
      const isPasswordValid = await User.comparePassword(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      await User.update(userId, { password: newPassword });
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Logout (client-side only)
  async logout(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res, next) {
    try {
      const users = await User.getAll();
      
      res.status(200).json({
        success: true,
        count: users.length,
        users
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      // Prevent deleting self
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }
      
      await User.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();