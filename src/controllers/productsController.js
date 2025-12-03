const { Product } = require('../models');
const { validationResult } = require('express-validator');

class ProductsController {
  // Get all products
  async getAllProducts(req, res, next) {
    try {
      const filters = {};
      
      if (req.query.status && req.query.status !== 'all') {
        filters.status = req.query.status;
      }
      
      if (req.query.category) {
        filters.category = req.query.category;
      }
      
      if (req.query.search) {
        filters.search = req.query.search;
      }
      
      const products = await Product.getAll(filters);
      
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Get product by ID
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Create new product
  async createProduct(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const { 
        name, 
        description, 
        price, 
        status = 'available', 
        category, 
        image,
        product_id 
      } = req.body;
      
      // Check if product_id already exists
      if (product_id) {
        const exists = await Product.exists(product_id);
        if (exists) {
          return res.status(400).json({
            success: false,
            message: 'Product ID already exists'
          });
        }
      }
      
      // Create product
      const productData = {
        name,
        description,
        price: parseFloat(price) || 10000.00,
        status,
        category,
        image,
        product_id
      };
      
      const product = await Product.create(productData);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Update product
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Check if product_id is being updated and already exists
      if (updateData.product_id && updateData.product_id !== product.product_id) {
        const exists = await Product.exists(updateData.product_id, id);
        if (exists) {
          return res.status(400).json({
            success: false,
            message: 'Product ID already exists'
          });
        }
      }
      
      const updatedProduct = await Product.update(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Update product status
  async updateProductStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      const validStatuses = ['available', 'out-of-stock', 'discontinued'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      const updatedProduct = await Product.updateStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: 'Product status updated successfully',
        data: updatedProduct
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Delete product
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      await Product.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Get product statistics
  async getProductStats(req, res, next) {
    try {
      const stats = await Product.getStats();
      
      res.status(200).json({
        success: true,
        ...stats
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Search products
  async searchProducts(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const products = await Product.search(q);
      
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Get products by category
  async getProductsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      
      const products = await Product.getByCategory(category);
      
      res.status(200).json({
        success: true,
        count: products.length,
        category,
        data: products
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Get all categories
  async getCategories(req, res, next) {
    try {
      const sql = 'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category';
      const { query } = require('../../database');
      const categories = await query(sql);
      
      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories.map(c => c.category)
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductsController();