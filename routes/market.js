const express = require('express');
const router = express.Router();
const MarketItem = require('../models/Market');

// @route   GET /api/market
// @desc    Get all market items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      status,
      levelAccess,
      featured,
      search,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (status) filter.status = status;
    if (levelAccess) filter.levelAccess = levelAccess;
    if (featured !== undefined) filter.featured = featured === 'true';
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.qpPrice = {};
      if (minPrice) filter.qpPrice.$gte = parseInt(minPrice);
      if (maxPrice) filter.qpPrice.$lte = parseInt(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      filter.$or = [
        { stock: { $gt: 0 } },
        { stock: -1 }
      ];
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const items = await MarketItem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalItems = await MarketItem.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get market items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching market items',
      error: error.message
    });
  }
});

// @route   GET /api/market/featured
// @desc    Get featured market items
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredItems = await MarketItem.getFeaturedItems()
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: featuredItems,
      count: featuredItems.length
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured items',
      error: error.message
    });
  }
});

// @route   GET /api/market/categories
// @desc    Get all categories with item counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await MarketItem.aggregate([
      {
        $match: { status: 'Aktif' }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$qpPrice' },
          minPrice: { $min: '$qpPrice' },
          maxPrice: { $max: '$qpPrice' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// @route   GET /api/market/:id
// @desc    Get single market item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await MarketItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get market item error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching market item',
      error: error.message
    });
  }
});

// @route   POST /api/market
// @desc    Create new market item
// @access  Public (in real app, this would be protected)
router.post('/', async (req, res) => {
  try {
    const itemData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'brand', 'qpPrice', 'realPrice', 'levelAccess'];
    const missingFields = requiredFields.filter(field => !itemData[field] && itemData[field] !== 0);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Create new market item
    const item = new MarketItem(itemData);
    const savedItem = await item.save();

    res.status(201).json({
      success: true,
      message: 'Market item created successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Create market item error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating market item',
      error: error.message
    });
  }
});

// @route   PUT /api/market/:id
// @desc    Update market item
// @access  Public (in real app, this would be protected)
router.put('/:id', async (req, res) => {
  try {
    const item = await MarketItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }

    res.json({
      success: true,
      message: 'Market item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update market item error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating market item',
      error: error.message
    });
  }
});

// @route   DELETE /api/market/:id
// @desc    Delete market item
// @access  Public (in real app, this would be protected)
router.delete('/:id', async (req, res) => {
  try {
    const item = await MarketItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }

    res.json({
      success: true,
      message: 'Market item deleted successfully',
      data: item
    });
  } catch (error) {
    console.error('Delete market item error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting market item',
      error: error.message
    });
  }
});

// @route   POST /api/market/:id/purchase
// @desc    Purchase market item (reduce stock)
// @access  Public
router.post('/:id/purchase', async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const item = await MarketItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }

    if (!item.isInStock(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    if (item.status !== 'Aktif') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for purchase'
      });
    }

    await item.reduceStock(quantity);

    res.json({
      success: true,
      message: 'Purchase successful',
      data: {
        item,
        quantity,
        totalPrice: item.discountedPrice * quantity
      }
    });
  } catch (error) {
    console.error('Purchase item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing purchase',
      error: error.message
    });
  }
});

// @route   PATCH /api/market/:id/toggle-featured
// @desc    Toggle featured status
// @access  Public (in real app, this would be protected)
router.patch('/:id/toggle-featured', async (req, res) => {
  try {
    const item = await MarketItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }

    item.featured = !item.featured;
    await item.save();

    res.json({
      success: true,
      message: `Item ${item.featured ? 'featured' : 'unfeatured'} successfully`,
      data: item
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling featured status',
      error: error.message
    });
  }
});

// @route   GET /api/market/search/:query
// @desc    Search market items
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { category, brand, maxPrice, levelAccess, limit = 20 } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    if (levelAccess) filters.levelAccess = levelAccess;

    const items = await MarketItem.searchItems(query, filters)
      .limit(parseInt(limit))
      .sort({ sales: -1, createdAt: -1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
      query,
      filters
    });
  } catch (error) {
    console.error('Search items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching items',
      error: error.message
    });
  }
});

module.exports = router;
