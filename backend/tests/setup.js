const mongoose = require('mongoose');
const { Student, Admin, Mentor, Recruiter, Internship, Application } = require('../models');

const testUsers = {
  student: {
    id: 'TEST_STU_001',
    name: 'Test Student',
    email: 'test.student@college.edu',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'student',
    department: 'Computer Science',
    semester: 5,
    cgpa: 8.5,
    skills: ['JavaScript', 'React', 'Node.js'],
    resumeLink: 'https://example.com/resume.pdf'
  },
  mentor: {
    id: 'TEST_MEN_001',
    name: 'Test Mentor',
    email: 'test.mentor@college.edu',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'mentor',
    department: 'Computer Science'
  },
  admin: {
    id: 'TEST_ADM_001',
    name: 'Test Admin',
    email: 'test.admin@college.edu',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'admin'
  },
  recruiter: {
    id: 'TEST_REC_001',
    name: 'Test Recruiter',
    email: 'test.recruiter@techcorp.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'recruiter',
    company: 'Tech Corp'
  }
};

const testInternship = {
  id: 'TEST_INT_001',
  title: 'Software Engineer Intern',
  company: 'Test Corp',
  description: 'Develop web applications using modern technologies like React and Node.js',
  requiredSkills: ['JavaScript', 'React'],
  eligibleDepartments: ['Computer Science', 'IT'],
  minimumSemester: 3,
  minimumCGPA: 7.0,
  stipend: '₹25,000/month',
  duration: '6 months',
  location: 'Bangalore',
  workMode: 'Hybrid',
  applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  maxApplications: 50,
  status: 'active',
  postedBy: 'TEST_ADM_001',
  postedByRole: 'admin'
};

async function setupTestData() {
  try {
    console.log('🧹 Cleaning existing test data...');

    // Clean up existing test data
    await Student.deleteMany({ id: /^TEST_/ });
    await Admin.deleteMany({ id: /^TEST_/ });
    await Mentor.deleteMany({ id: /^TEST_/ });
    await Recruiter.deleteMany({ id: /^TEST_/ });
    await Internship.deleteMany({ id: /^TEST_/ });
    await Application.deleteMany({ studentId: /^TEST_/ });

    console.log('📝 Inserting test data...');

    // Insert test users
    await Student.create(testUsers.student);
    await Admin.create(testUsers.admin);
    await Mentor.create(testUsers.mentor);
    await Recruiter.create(testUsers.recruiter);

    // Insert test internship
    await Internship.create(testInternship);

    console.log('✅ Test data setup complete');
    console.log('👥 Test users created:', Object.keys(testUsers).length);
    console.log('💼 Test internships created: 1');

    return {
      users: testUsers,
      internship: testInternship
    };
  } catch (error) {
    console.error('❌ Test data setup failed:', error);
    throw error;
  }
}

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...');

    await Student.deleteMany({ id: /^TEST_/ });
    await Admin.deleteMany({ id: /^TEST_/ });
    await Mentor.deleteMany({ id: /^TEST_/ });
    await Recruiter.deleteMany({ id: /^TEST_/ });
    await Internship.deleteMany({ id: /^TEST_/ });
    await Application.deleteMany({ studentId: /^TEST_/ });

    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
    throw error;
  }
}

async function getAuthToken(email, password = 'password') {
  // This would normally make an API call, but for testing we'll simulate
  // In a real scenario, you'd use the actual login endpoint
  return `test-jwt-token-for-${email}`;
}

module.exports = {
  setupTestData,
  cleanupTestData,
  getAuthToken,
  testUsers,
  testInternship
};