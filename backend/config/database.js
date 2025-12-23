const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment variable
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-placement';

    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set. Using local MongoDB fallback.');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // Increased timeout for Atlas (30s)
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 30000, // Connection timeout (30s)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      retryWrites: true, // Enable retryable writes for Atlas
      w: 'majority', // Write concern for Atlas
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📱 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('⚠️  Server will start without MongoDB. Some features may not work.');
    console.warn('💡 To use MongoDB:');
    console.warn('   1. Install MongoDB locally, or');
    console.warn('   2. Set MONGODB_URI in .env file');
    return null;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during MongoDB disconnection:', error);
    process.exit(1);
  }
});

module.exports = connectDB;