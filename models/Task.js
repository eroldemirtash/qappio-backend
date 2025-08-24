const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Sosyal Medya', 'Fotoğraf', 'Video', 'Anket', 'İçerik Üretimi', 'Pazarlama', 'Araştırma'],
    default: 'Fotoğraf'
  },
  status: {
    type: String,
    enum: ['Aktif', 'Pasif', 'Beklemede', 'Tamamlandı'],
    default: 'Aktif'
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  participants: {
    type: Number,
    default: 0,
    min: [0, 'Participants cannot be negative']
  },
  maxParticipants: {
    type: Number,
    default: 100,
    min: [1, 'Max participants must be at least 1']
  },
  reward: {
    type: Number,
    required: [true, 'Reward is required'],
    min: [1, 'Reward must be at least 1']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isWeekly: {
    type: Boolean,
    default: false
  },
  isSponsored: {
    type: Boolean,
    default: false
  },
  sponsorBrand: {
    type: String,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better performance
TaskSchema.index({ status: 1, brand: 1 });
TaskSchema.index({ startDate: 1, endDate: 1 });
TaskSchema.index({ tags: 1 });
TaskSchema.index({ featured: 1 });

// Pre-save middleware to sync isWeekly with featured
TaskSchema.pre('save', function(next) {
  // If isWeekly is true, set featured to true
  if (this.isWeekly) {
    this.featured = true;
  }
  next();
});

// Pre-update middleware to sync isWeekly with featured
TaskSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.isWeekly === true) {
    update.featured = true;
  }
  next();
});

// Virtual for active tasks
TaskSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'Aktif' && 
         this.startDate <= now && 
         this.endDate >= now &&
         this.participants < this.maxParticipants;
});

// Method to check if task is expired
TaskSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

// Static method to get active tasks
TaskSchema.statics.getActiveTasks = function() {
  const now = new Date();
  return this.find({
    status: 'Aktif',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Method to calculate remaining time until deadline
TaskSchema.methods.getRemainingTime = function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  
  if (now >= endDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      total: 0,
      isExpired: true,
      formatted: 'Süre Doldu'
    };
  }
  
  const diff = endDate.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  let formatted = '';
  if (days > 0) formatted += `${days}g `;
  if (hours > 0) formatted += `${hours}s `;
  if (minutes > 0) formatted += `${minutes}dk`;
  if (formatted === '') formatted = '1dk';
  
  return {
    days,
    hours,
    minutes,
    total: diff,
    isExpired: false,
    formatted: formatted.trim()
  };
};

// Method to get deadline status
TaskSchema.methods.getDeadlineStatus = function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  const startDate = new Date(this.startDate);
  
  if (now < startDate) {
    return {
      status: 'waiting',
      text: 'Başlamadı',
      color: 'gray'
    };
  } else if (now >= endDate) {
    return {
      status: 'expired',
      text: 'Süre Doldu',
      color: 'red'
    };
  } else {
    return {
      status: 'active',
      text: 'Aktif',
      color: 'green'
    };
  }
};

module.exports = mongoose.model('Task', TaskSchema);
