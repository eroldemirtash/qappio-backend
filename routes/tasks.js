const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      status,
      brand,
      category,
      isWeekly,
      isSponsored,
      featured,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (category) filter.category = category;
    if (isWeekly !== undefined) filter.isWeekly = isWeekly === 'true';
    if (isSponsored !== undefined) filter.isSponsored = isSponsored === 'true';
    if (featured !== undefined) filter.featured = featured === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Add deadline information to each task
    const tasksWithDeadline = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.remainingTime = task.getRemainingTime();
      taskObj.deadlineStatus = task.getDeadlineStatus();
      return taskObj;
    });

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / parseInt(limit));

    res.json({
      success: true,
      data: tasksWithDeadline,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalTasks,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/active
// @desc    Get active tasks only
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const activeTasks = await Task.getActiveTasks()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: activeTasks,
      count: activeTasks.length
    });
  } catch (error) {
    console.error('Get active tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active tasks',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/weekly/featured
// @desc    Get weekly featured task (haftanın görevi)
// @access  Public
router.get('/weekly/featured', async (req, res) => {
  try {
    const weeklyTask = await Task.findOne({ 
      isWeekly: true, 
      status: 'Aktif',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    if (!weeklyTask) {
      return res.json({
        success: true,
        data: null,
        message: 'No weekly task found'
      });
    }

    // Add deadline information
    const weeklyTaskWithDeadline = weeklyTask.toObject();
    weeklyTaskWithDeadline.remainingTime = weeklyTask.getRemainingTime();
    weeklyTaskWithDeadline.deadlineStatus = weeklyTask.getDeadlineStatus();

    res.json({
      success: true,
      data: weeklyTaskWithDeadline,
      message: 'Weekly task found'
    });
  } catch (error) {
    console.error('Get weekly task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly task',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Public (in real app, this would be protected)
router.post('/', async (req, res) => {
  try {
    const taskData = req.body;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'brand', 'budget', 'reward', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !taskData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate date range
    const startDate = new Date(taskData.startDate);
    const endDate = new Date(taskData.endDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Create new task
    const task = new Task(taskData);
    const savedTask = await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    
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
      message: 'Error creating task',
      error: error.message
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Public (in real app, this would be protected)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
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
      message: 'Error updating task',
      error: error.message
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Public (in real app, this would be protected)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    console.error('Delete task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// @route   POST /api/tasks/:id/participate
// @desc    Join a task (increment participants)
// @access  Public
router.post('/:id/participate', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.participants >= task.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Task is full'
      });
    }

    if (task.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Task has expired'
      });
    }

    task.participants += 1;
    await task.save();

    res.json({
      success: true,
      message: 'Successfully joined the task',
      data: task
    });
  } catch (error) {
    console.error('Participate task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining task',
      error: error.message
    });
  }
});

module.exports = router;
