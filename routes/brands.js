const express = require('express');
const router = express.Router();

// Sample brands data (in real app, this would come from MongoDB)
const sampleBrands = [
  {
    _id: 'brand-1',
    name: 'Nike',
    logo: 'https://example.com/nike-logo.png',
    email: 'contact@nike.com',
    balance: 50000,
    status: 'Aktif',
    website: 'https://nike.com',
    social: {
      instagram: '@nike',
      twitter: '@nike',
      facebook: 'nike'
    }
  },
  {
    _id: 'brand-2',
    name: 'Starbucks',
    logo: 'https://example.com/starbucks-logo.png',
    email: 'info@starbucks.com',
    balance: 75000,
    status: 'Aktif',
    website: 'https://starbucks.com',
    social: {
      instagram: '@starbucks',
      twitter: '@starbucks',
      facebook: 'starbucks'
    }
  },
  {
    _id: 'brand-3',
    name: 'Samsung',
    logo: 'https://example.com/samsung-logo.png',
    email: 'contact@samsung.com',
    balance: 120000,
    status: 'Aktif',
    website: 'https://samsung.com',
    social: {
      instagram: '@samsung',
      twitter: '@samsung',
      facebook: 'samsung'
    }
  }
];

// @route   GET /api/brands
// @desc    Get all brands
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let filteredBrands = sampleBrands;
    
    if (status) {
      filteredBrands = filteredBrands.filter(brand => brand.status === status);
    }
    
    if (search) {
      filteredBrands = filteredBrands.filter(brand => 
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredBrands,
      count: filteredBrands.length
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
});

// @route   GET /api/brands/:id
// @desc    Get single brand by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const brand = sampleBrands.find(b => b._id === req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand',
      error: error.message
    });
  }
});

module.exports = router;
