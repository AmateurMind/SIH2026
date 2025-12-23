const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const mentorRoutes = require('./routes/mentors');
const adminRoutes = require('./routes/admins');
const internshipRoutes = require('./routes/internships');
const applicationRoutes = require('./routes/applications');
const recruiterRoutes = require('./routes/recruiters');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');
const resumeRoutes = require('./routes/resume');
const resumeViewRoutes = require('./routes/resumes');
const resumeManagementRoutes = require('./routes/resumeManagement');
const notificationRoutes = require('./routes/notifications');
const integrationsRoutes = require('./routes/integrations'); // External integrations (n8n, etc.)
const ippRoutes = require('./routes/ipp');
const calendarRoutes = require('./routes/calendar');
console.log('🔍 IPP Routes loaded:', typeof ippRoutes);
if (typeof ippRoutes !== 'function') {
  console.error('❌ IPP Routes is NOT a function/router!');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Direct test route to verify server is updating
app.get('/api/test-direct', (req, res) => {
  res.json({ message: 'Direct test route working', timestamp: new Date() });
});

// Import notification service
const notificationService = require('./services/notificationService');

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests, or testsprite proxy)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',  // Legacy
      'http://localhost:5173',  // Student frontend
      'http://localhost:5174',  // SuperAdmin frontend
      'http://localhost:5175',  // Recruiter frontend
      'http://localhost:5176',  // Mentor frontend
      /^https?:\/\/.*\.testsprite\.com$/,  // Testsprite proxy
      /^https?:\/\/tun\.testsprite\.com$/,  // Testsprite tunnel
      process.env.FRONTEND_URL // Deployed Frontend URL
    ].filter(Boolean);

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      // Log for debugging but allow in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`CORS warning: Origin ${origin} not in allowed list, but allowing in development`);
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Disable ETag to prevent 304 responses and force fresh data
app.set('etag', false);

// Add Cache-Control headers to all responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve generated certificates
app.use('/certificates', express.static('certificates'));

// Serve favicon to prevent 404 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resumes', resumeViewRoutes);
app.use('/api/resume-management', resumeManagementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/ipp', ippRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const isMongoConnected = mongoose.connection.readyState === 1;

  const health = {
    status: 'OK',
    message: 'Campus Placement Portal API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: isMongoConnected,
      status: isMongoConnected ? 'Connected' : 'Disconnected',
      host: isMongoConnected ? mongoose.connection.host : null,
      database: isMongoConnected ? mongoose.connection.name : null
    }
  };

  res.status(isMongoConnected ? 200 : 503).json(health);
});

// Default route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Campus Placement Portal API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// For non-API routes, don't send JSON (let frontend handle routing)
app.use('*', (req, res) => {
  // If it's not an API route, this is likely a frontend route
  // Don't respond with JSON, let the frontend handle it
  res.status(404).send('Route not found - This is likely a frontend route. Please check React Router configuration.');
});

// Connect to MongoDB first, then start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB (optional)
    await connectDB();

    // Start server regardless of MongoDB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}`);
      console.log(`✨ IPP Routes registered at /api/ipp`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);

      // Start notification service
      notificationService.start();
      console.log('✅ Notification service started');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
