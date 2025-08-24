const mongoose = require('mongoose');

const MarketItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
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
    enum: ['Elektronik', 'Giyim', 'Spor', 'Ev & Yaşam', 'Kitap', 'Oyun', 'Hediye Kartı', 'Diğer'],
    default: 'Hediye Kartı'
  },
  qpPrice: {
    type: Number,
    required: [true, 'QP price is required'],
    min: [1, 'QP price must be at least 1']
  },
  realPrice: {
    type: Number,
    required: [true, 'Real price is required'],
    min: [0, 'Real price cannot be negative']
  },
  currency: {
    type: String,
    default: 'TL',
    enum: ['TL', 'USD', 'EUR']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [-1, 'Stock cannot be less than -1'], // -1 = unlimited
    default: 0
  },
  levelAccess: {
    type: String,
    required: [true, 'Level access is required'],
    enum: ['Tüm Seviyeler', 'Bronze+', 'Silver+', 'Gold+', 'Platinum+', 'Diamond+']
  },
  minLevelPoints: {
    type: Number,
    default: 0,
    min: [0, 'Minimum level points cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['Aktif', 'Pasif', 'Tükendi', 'Yakında'],
    default: 'Aktif'
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    percentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  specifications: [{
    key: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  sales: {
    type: Number,
    default: 0,
    min: [0, 'Sales cannot be negative']
  },
  revenue: {
    type: Number,
    default: 0,
    min: [0, 'Revenue cannot be negative']
  },
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  deliveryInfo: {
    type: {
      type: String,
      enum: ['Digital', 'Physical', 'Voucher'],
      default: 'Digital'
    },
    estimatedDays: {
      type: Number,
      min: [0, 'Delivery days cannot be negative'],
      default: 0
    },
    description: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for better performance
MarketItemSchema.index({ status: 1, featured: 1 });
MarketItemSchema.index({ category: 1, brand: 1 });
MarketItemSchema.index({ qpPrice: 1 });
MarketItemSchema.index({ levelAccess: 1, minLevelPoints: 1 });
MarketItemSchema.index({ tags: 1 });

// Virtual for availability
MarketItemSchema.virtual('isAvailable').get(function() {
  return this.status === 'Aktif' && (this.stock > 0 || this.stock === -1);
});

// Virtual for discounted price
MarketItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount.isActive && this.discount.percentage > 0) {
    const now = new Date();
    if (this.discount.startDate <= now && this.discount.endDate >= now) {
      return Math.round(this.qpPrice * (1 - this.discount.percentage / 100));
    }
  }
  return this.qpPrice;
});

// Method to check if item is in stock
MarketItemSchema.methods.isInStock = function(quantity = 1) {
  return this.stock === -1 || this.stock >= quantity;
};

// Method to reduce stock
MarketItemSchema.methods.reduceStock = function(quantity = 1) {
  if (this.stock !== -1) {
    this.stock = Math.max(0, this.stock - quantity);
    if (this.stock === 0) {
      this.status = 'Tükendi';
    }
  }
  this.sales += quantity;
  this.revenue += this.discountedPrice * quantity;
  return this.save();
};

// Static method to get featured items
MarketItemSchema.statics.getFeaturedItems = function() {
  return this.find({ 
    featured: true, 
    status: 'Aktif',
    $or: [
      { stock: { $gt: 0 } },
      { stock: -1 }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to search items
MarketItemSchema.statics.searchItems = function(query, filters = {}) {
  const searchCriteria = {
    status: 'Aktif',
    $or: [
      { stock: { $gt: 0 } },
      { stock: -1 }
    ]
  };

  if (query) {
    searchCriteria.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (filters.category) {
    searchCriteria.category = filters.category;
  }

  if (filters.brand) {
    searchCriteria.brand = filters.brand;
  }

  if (filters.maxPrice) {
    searchCriteria.qpPrice = { $lte: filters.maxPrice };
  }

  if (filters.levelAccess) {
    searchCriteria.levelAccess = filters.levelAccess;
  }

  return this.find(searchCriteria);
};

module.exports = mongoose.model('MarketItem', MarketItemSchema);
