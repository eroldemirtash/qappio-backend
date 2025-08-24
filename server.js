const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:19006', 
    'http://192.168.1.101:3000',
    'http://192.168.1.101:19006',
    'exp://192.168.1.128:19000',
    'exp://192.168.1.101:19000'
  ], // Admin dashboard + Expo + Local network
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qappio', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected Successfully 🚀');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Import Routes
const taskRoutes = require('./routes/tasks');
const levelRoutes = require('./routes/levels');
const marketRoutes = require('./routes/market');
const brandRoutes = require('./routes/brands');

// Use Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/brands', brandRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Qappio Backend API 🚀',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      levels: '/api/levels',
      market: '/api/market'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`📖 Documentation: http://localhost:${PORT}`);
});

module.exports = app;
