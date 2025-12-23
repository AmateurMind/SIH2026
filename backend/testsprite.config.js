module.exports = {
  apiKey: process.env.TESTSPRITE_API_KEY,
  baseURL: process.env.NODE_ENV === 'test' ? 'http://localhost:5000/api' : 'http://localhost:5000/api',
  testFiles: ['../testsprite_tests/testsprite_frontend_test_plan.json'],
  reporters: ['console', 'json'],
  outputDir: './test-results',
  timeout: 30000,
  retries: 2,

  // Environment variables for testing
  env: {
    NODE_ENV: 'test',
    JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-campus-placement',
    FRONTEND_URL: 'http://localhost:3000',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-placement-test'
  },

  // Test data and fixtures
  fixtures: {
    users: {
      student: {
        id: 'TEST_STU_001',
        name: 'Test Student',
        email: 'test.student@college.edu',
        password: 'test123',
        role: 'student',
        department: 'Computer Science',
        semester: 5,
        cgpa: 8.5,
        skills: ['JavaScript', 'React', 'Node.js']
      },
      mentor: {
        id: 'TEST_MEN_001',
        name: 'Test Mentor',
        email: 'test.mentor@college.edu',
        password: 'test123',
        role: 'mentor',
        department: 'Computer Science'
      },
      admin: {
        id: 'TEST_ADM_001',
        name: 'Test Admin',
        email: 'test.admin@college.edu',
        password: 'test123',
        role: 'admin'
      },
      recruiter: {
        id: 'TEST_REC_001',
        name: 'Test Recruiter',
        email: 'test.recruiter@techcorp.com',
        password: 'test123',
        role: 'recruiter',
        company: 'Tech Corp'
      }
    },
    internships: {
      sample: {
        id: 'TEST_INT_001',
        title: 'Software Engineer Intern',
        company: 'Test Corp',
        description: 'Develop web applications using modern technologies',
        requiredSkills: ['JavaScript', 'React'],
        eligibleDepartments: ['Computer Science', 'IT'],
        minimumSemester: 3,
        minimumCGPA: 7.0,
        stipend: '₹25,000/month',
        duration: '6 months',
        location: 'Bangalore',
        workMode: 'Hybrid',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        maxApplications: 50,
        status: 'active',
        postedBy: 'TEST_ADM_001',
        postedByRole: 'admin'
      }
    }
  },

  // Hooks for setup and teardown
  hooks: {
    beforeAll: async () => {
      console.log('🚀 Setting up TestSprite test environment...');
      // Ensure test database is clean
      process.env.NODE_ENV = 'test';
    },

    afterAll: async () => {
      console.log('🧹 Cleaning up TestSprite test environment...');
    },

    beforeEach: async (test) => {
      console.log(`📋 Running test: ${test.title}`);
    },

    afterEach: async (test, result) => {
      if (result.passed) {
        console.log(`✅ Test passed: ${test.title}`);
      } else {
        console.log(`❌ Test failed: ${test.title}`);
        console.log(`   Error: ${result.error}`);
      }
    }
  },

  // Browser configuration for UI tests
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    slowMo: 50
  },

  // API testing configuration
  api: {
    validateResponse: true,
    logRequests: true,
    baseHeaders: {
      'Content-Type': 'application/json'
    }
  },

  // Security testing configuration
  security: {
    enabled: true,
    checks: [
      'jwt-validation',
      'role-based-access',
      'input-sanitization',
      'sql-injection-prevention',
      'xss-prevention'
    ]
  },

  // Performance testing configuration
  performance: {
    enabled: false, // Enable for performance tests
    thresholds: {
      responseTime: 2000, // ms
      throughput: 100 // requests per second
    }
  }
};