const mongoose = require('mongoose');

async function connectDB() {
  try {
    console.log('🔍 Attempting to connect to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ EXISTS' : '❌ MISSING');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable ისაა დაკონფიგურირებული!');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 წამი timeout
    });
    
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;