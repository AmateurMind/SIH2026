/**
 * MongoDB Atlas Connection Test Script
 * This script tests the connection to MongoDB Atlas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const { Student, Admin, Mentor, Recruiter, Internship, Application } = require('./models');

async function testConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Check if MONGODB_URI is set
    console.log('\n📋 Test 1: Environment Variable Check');
    if (process.env.MONGODB_URI) {
      const maskedURI = process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
      console.log('✅ MONGODB_URI is set');
      console.log(`   Connection String: ${maskedURI}`);
    } else {
      console.log('⚠️  MONGODB_URI is not set');
      console.log('   Will use local MongoDB fallback');
    }

    // Test 2: Attempt connection
    console.log('\n📋 Test 2: Database Connection');
    const conn = await connectDB();
    
    if (conn) {
      console.log('✅ Successfully connected to MongoDB!');
      console.log(`   Host: ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);
      console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)`);
    } else {
      console.log('❌ Failed to connect to MongoDB');
      process.exit(1);
    }

    // Test 3: Test basic operations
    console.log('\n📋 Test 3: Basic Database Operations');
    
    // Count documents in collections
    const studentCount = await Student.countDocuments();
    const adminCount = await Admin.countDocuments();
    const mentorCount = await Mentor.countDocuments();
    const recruiterCount = await Recruiter.countDocuments();
    const internshipCount = await Internship.countDocuments();
    const applicationCount = await Application.countDocuments();

    console.log('✅ Database operations working!');
    console.log(`   Students: ${studentCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Mentors: ${mentorCount}`);
    console.log(`   Recruiters: ${recruiterCount}`);
    console.log(`   Internships: ${internshipCount}`);
    console.log(`   Applications: ${applicationCount}`);

    // Test 4: Test a simple query
    console.log('\n📋 Test 4: Query Test');
    const sampleStudent = await Student.findOne().lean();
    if (sampleStudent) {
      console.log('✅ Query test successful!');
      console.log(`   Sample student: ${sampleStudent.name || sampleStudent.email}`);
    } else {
      console.log('⚠️  No students found in database (this is okay if database is empty)');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests passed! MongoDB Atlas connection is working correctly.');
    console.log('='.repeat(50));

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔒 Connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check your MONGODB_URI in .env file');
    console.error('   2. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('   3. Check your database user credentials');
    console.error('   4. Ensure your cluster is running in Atlas');
    process.exit(1);
  }
}

// Run the test
testConnection();

