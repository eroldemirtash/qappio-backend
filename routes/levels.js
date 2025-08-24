const express = require('express');
const router = express.Router();
const Level = require('../models/Level');

// @route   GET /api/levels
// @desc    Get all levels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      active,
      sortBy = 'order',
      sortOrder = 'asc' 
    } = req.query;

    // Build filter
    const filter = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const levels = await Level.find(filter).sort(sort);

    res.json({
      success: true,
      data: levels,
      count: levels.length
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching levels',
      error: error.message
    });
  }
});

// @route   GET /api/levels/active
// @desc    Get active levels only
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const levels = await Level.getActiveLevels();

    res.json({
      success: true,
      data: levels,
      count: levels.length
    });
  } catch (error) {
    console.error('Get active levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active levels',
      error: error.message
    });
  }
});

// @route   GET /api/levels/:id
// @desc    Get single level by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    res.json({
      success: true,
      data: level
    });
  } catch (error) {
    console.error('Get level error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching level',
      error: error.message
    });
  }
});

// @route   GET /api/levels/by-points/:points
// @desc    Get level by points
// @access  Public
router.get('/by-points/:points', async (req, res) => {
  try {
    const points = parseInt(req.params.points);
    
    if (isNaN(points) || points < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points value'
      });
    }

    const level = await Level.findByPoints(points);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'No level found for these points'
      });
    }

    // Also get next level
    const nextLevel = await Level.getNextLevel(points);

    res.json({
      success: true,
      data: {
        currentLevel: level,
        nextLevel: nextLevel || null,
        pointsToNext: nextLevel ? nextLevel.minPoints - points : null
      }
    });
  } catch (error) {
    console.error('Get level by points error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching level by points',
      error: error.message
    });
  }
});

// @route   POST /api/levels
// @desc    Create new level
// @access  Public (in real app, this would be protected)
router.post('/', async (req, res) => {
  try {
    const levelData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'color', 'minPoints', 'maxPoints', 'order'];
    const missingFields = requiredFields.filter(field => !levelData[field] && levelData[field] !== 0);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Check if order already exists
    const existingOrder = await Level.findOne({ order: levelData.order });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Level order already exists'
      });
    }

    // Create new level
    const level = new Level(levelData);
    const savedLevel = await level.save();

    res.status(201).json({
      success: true,
      message: 'Level created successfully',
      data: savedLevel
    });
  } catch (error) {
    console.error('Create level error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.message.includes('overlapping') || error.message.includes('overlap')) {
      return res.status(400).json({
        success: false,
        message: 'Point ranges cannot overlap with existing levels'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Level name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating level',
      error: error.message
    });
  }
});

// @route   PUT /api/levels/:id
// @desc    Update level
// @access  Public (in real app, this would be protected)
router.put('/:id', async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    res.json({
      success: true,
      message: 'Level updated successfully',
      data: level
    });
  } catch (error) {
    console.error('Update level error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
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

    if (error.message.includes('overlapping') || error.message.includes('overlap')) {
      return res.status(400).json({
        success: false,
        message: 'Point ranges cannot overlap with existing levels'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Level name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating level',
      error: error.message
    });
  }
});

// @route   DELETE /api/levels/:id
// @desc    Delete level
// @access  Public (in real app, this would be protected)
router.delete('/:id', async (req, res) => {
  try {
    const level = await Level.findByIdAndDelete(req.params.id);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    res.json({
      success: true,
      message: 'Level deleted successfully',
      data: level
    });
  } catch (error) {
    console.error('Delete level error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting level',
      error: error.message
    });
  }
});

// @route   PATCH /api/levels/:id/toggle
// @desc    Toggle level active status
// @access  Public (in real app, this would be protected)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    level.isActive = !level.isActive;
    await level.save();

    res.json({
      success: true,
      message: `Level ${level.isActive ? 'activated' : 'deactivated'} successfully`,
      data: level
    });
  } catch (error) {
    console.error('Toggle level error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling level status',
      error: error.message
    });
  }
});

// @route   POST /api/levels/reorder
// @desc    Reorder levels
// @access  Public (in real app, this would be protected)
router.post('/reorder', async (req, res) => {
  try {
    const { levelOrders } = req.body; // Array of {id, order}
    
    if (!Array.isArray(levelOrders)) {
      return res.status(400).json({
        success: false,
        message: 'levelOrders must be an array'
      });
    }

    // Update each level's order
    const updatePromises = levelOrders.map(({ id, order }) => 
      Level.findByIdAndUpdate(id, { order }, { new: true })
    );

    const updatedLevels = await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Levels reordered successfully',
      data: updatedLevels.filter(level => level !== null)
    });
  } catch (error) {
    console.error('Reorder levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering levels',
      error: error.message
    });
  }
});

module.exports = router;
