require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Database
const { testConnection } = require('./config/db');

// Models (for table creation)
const UserModel = require('./models/userModel');
const RoomModel = require('./models/roomModel');
const CustomerModel = require('./models/customerModel');
const BookingModel = require('./models/bookingModel');

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const receptionRoutes = require('./routes/receptionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Request logger (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Panchavati Hotel API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reception', receptionRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the limit',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ==================== DATABASE INIT & START ====================

async function initializeDatabase() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Create tables in correct order (respecting foreign keys)
    console.log('📦 Creating database tables...');
    await UserModel.createTable();
    await RoomModel.createTables();
    await CustomerModel.createTable();
    await BookingModel.createTables();
    console.log('✅ All database tables created/verified');

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║   🏨 Panchavati Hotel API Server                 ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log(`║   🌐 Server:  http://localhost:${PORT}              ║`);
    console.log(`║   📁 Uploads: ${uploadsDir}`);
    console.log(`║   🔧 Env:     ${process.env.NODE_ENV || 'development'}                    ║`);
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log('║   API Endpoints:                                 ║');
    console.log('║   POST /api/auth/login                           ║');
    console.log('║   POST /api/auth/register                        ║');
    console.log('║   GET  /api/auth/me                              ║');
    console.log('║   GET  /api/rooms/types                          ║');
    console.log('║   GET  /api/customer/categories                  ║');
    console.log('║   POST /api/customer/availability                ║');
    console.log('║   POST /api/admin/employees                      ║');
    console.log('║   GET  /api/admin/employees                      ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('');
  });
}

startServer();

module.exports = app;
