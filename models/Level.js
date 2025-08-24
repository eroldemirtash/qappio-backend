const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Level name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Level name cannot exceed 50 characters']
  },
  color: {
    type: String,
    required: [true, 'Level color is required'],
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  minPoints: {
    type: Number,
    required: [true, 'Minimum points is required'],
    min: [0, 'Minimum points cannot be negative']
  },
  maxPoints: {
    type: Number,
    required: [true, 'Maximum points is required'],
    validate: {
      validator: function(v) {
        return v > this.minPoints;
      },
      message: 'Maximum points must be greater than minimum points'
    }
  },
  order: {
    type: Number,
    required: [true, 'Level order is required'],
    min: [1, 'Order must be at least 1']
  },
  benefits: [{
    type: String,
    trim: true
  }],
  marketAccess: {
    type: Boolean,
    default: true
  },
  specialPerks: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  icon: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
LevelSchema.index({ order: 1 });
LevelSchema.index({ minPoints: 1, maxPoints: 1 });
LevelSchema.index({ isActive: 1 });

// Virtual for level range
LevelSchema.virtual('pointRange').get(function() {
  return `${this.minPoints.toLocaleString()} - ${this.maxPoints.toLocaleString()}`;
});

// Static method to find level by points
LevelSchema.statics.findByPoints = function(points) {
  return this.findOne({
    minPoints: { $lte: points },
    maxPoints: { $gte: points },
    isActive: true
  });
};

// Static method to get next level
LevelSchema.statics.getNextLevel = function(currentPoints) {
  return this.findOne({
    minPoints: { $gt: currentPoints },
    isActive: true
  }).sort({ minPoints: 1 });
};

// Static method to get all active levels sorted by order
LevelSchema.statics.getActiveLevels = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

// Method to check if points qualify for this level
LevelSchema.methods.qualifiesForLevel = function(points) {
  return points >= this.minPoints && points <= this.maxPoints;
};

// Pre-save middleware to ensure no overlapping point ranges
LevelSchema.pre('save', async function(next) {
  if (this.isModified('minPoints') || this.isModified('maxPoints')) {
    const overlapping = await this.constructor.findOne({
      _id: { $ne: this._id },
      $or: [
        {
          minPoints: { $lte: this.maxPoints },
          maxPoints: { $gte: this.minPoints }
        }
      ],
      isActive: true
    });

    if (overlapping) {
      next(new Error('Point ranges cannot overlap with existing levels'));
      return;
    }
  }
  next();
});

module.exports = mongoose.model('Level', LevelSchema);
