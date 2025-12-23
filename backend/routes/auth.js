const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Student, Admin, Mentor, Recruiter } = require('../models');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Helper function to load users from JSON files (fallback)
const loadUsersFromJSON = () => {
  const dataDir = path.join(__dirname, '../data');
  const users = [];

  try {
    // Load students
    const studentsPath = path.join(dataDir, 'students.json');
    if (fs.existsSync(studentsPath)) {
      const students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
      users.push(...students);
    }

    // Load admins
    const adminsPath = path.join(dataDir, 'admins.json');
    if (fs.existsSync(adminsPath)) {
      const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));
      users.push(...admins);
    }

    // Load mentors
    const mentorsPath = path.join(dataDir, 'mentors.json');
    if (fs.existsSync(mentorsPath)) {
      const mentors = JSON.parse(fs.readFileSync(mentorsPath, 'utf8'));
      users.push(...mentors);
    }

    // Load recruiters
    const recruitersPath = path.join(dataDir, 'recruiters.json');
    if (fs.existsSync(recruitersPath)) {
      const recruiters = JSON.parse(fs.readFileSync(recruitersPath, 'utf8'));
      users.push(...recruiters);
    }
  } catch (error) {
    console.error('Error loading users from JSON:', error);
  }

  return users;
};

// Helper function to generate next student ID
const generateStudentId = async () => {
  try {
    const lastStudent = await Student.find().sort({ id: -1 }).limit(1);
    if (lastStudent.length > 0) {
      const lastId = lastStudent[0].id;
      const num = parseInt(lastId.replace('STU', ''));
      return `STU${String(num + 1).padStart(3, '0')}`;
    }
    return 'STU001'; // Fallback
  } catch (error) {
    console.error('Error generating student ID:', error);
    return 'STU001';
  }
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, semester, cgpa } = req.body;

    // Validation
    if (!name || !email || !password || !department || !semester || !cgpa) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (semester < 1 || semester > 8) {
      return res.status(400).json({ error: 'Semester must be between 1 and 8' });
    }

    if (cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ error: 'CGPA must be between 0 and 10' });
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate student ID
    const studentId = await generateStudentId();

    // Create new student
    const newStudent = new Student({
      id: studentId,
      name,
      email,
      password: hashedPassword,
      department,
      semester: parseInt(semester),
      cgpa: parseFloat(cgpa),
      role: 'student'
    });

    await newStudent.save();

    // Generate token for auto-login
    const token = jwt.sign(
      { id: newStudent.id, email: newStudent.email, role: newStudent.role },
      process.env.JWT_SECRET || 'campus-placement-secret',
      { expiresIn: '24h' }
    );

    // Remove sensitive data
    const { password: _, ...studentWithoutPassword } = newStudent.toObject();

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: studentWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = null;

    // Check if MongoDB is connected
    if (isMongoConnected()) {
      // Use MongoDB models
      if (role === 'student' || !role) {
        user = await Student.findOne({ email }).lean();
      }
      if (!user && (role === 'admin' || !role)) {
        user = await Admin.findOne({ email }).lean();
      }
      if (!user && (role === 'mentor' || !role)) {
        user = await Mentor.findOne({ email }).lean();
      }
      if (!user && (role === 'recruiter' || !role)) {
        user = await Recruiter.findOne({ email }).lean();
      }
    }

    // Fallback to JSON files if user not found in MongoDB or MongoDB not connected
    if (!user) {
      const users = loadUsersFromJSON();
      user = users.find(u => u.email === email);

      // Filter by role if specified
      if (user && role && user.role !== role) {
        user = null;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, we'll accept any password
    // In production, use: const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = true; // Demo mode

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'campus-placement-secret',
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', requireHybridAuth, (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    // Ensure id field is present (use _id if id is missing)
    if (!userWithoutPassword.id && userWithoutPassword._id) {
      userWithoutPassword.id = userWithoutPassword._id.toString();
    }
    res.json({
      user: userWithoutPassword,
      id: userWithoutPassword.id || userWithoutPassword._id?.toString() || req.user.id
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (alias for profile)
router.get('/me', requireHybridAuth, (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    // Ensure id field is present (use _id if id is missing)
    if (!userWithoutPassword.id && userWithoutPassword._id) {
      userWithoutPassword.id = userWithoutPassword._id.toString();
    }
    res.json({
      user: userWithoutPassword,
      id: userWithoutPassword.id || userWithoutPassword._id?.toString() || req.user.id
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Demo login credentials endpoint (for development only)
router.get('/demo-credentials', (req, res) => {
  const demoUsers = [
    { role: 'student', email: 'aarav.sharma@college.edu', password: 'demo123', name: 'Sumit Pensalwar' },
    { role: 'student', email: 'priya.patel@college.edu', password: 'demo123', name: 'Priya Patel' },
    { role: 'mentor', email: 'rajesh.kumar@college.edu', password: 'demo123', name: 'Dr. Rajesh Kumar', department: 'CS' },
    { role: 'mentor', email: 'priyanka.singh@college.edu', password: 'demo123', name: 'Dr. Priyanka Singh', department: 'IT' },
    { role: 'mentor', email: 'amit.verma@college.edu', password: 'demo123', name: 'Prof. Amit Verma', department: 'Electronics' },
    { role: 'admin', email: 'sunita.mehta@college.edu', password: 'demo123', name: 'Dr. Sunita Mehta' },
    { role: 'recruiter', email: 'amit.singh@techcorp.com', password: 'demo123', name: 'Amit Singh' }
  ];

  res.json({
    message: 'Demo login credentials (Development only)',
    credentials: demoUsers
  });
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful. Please remove token from client.' });
});

// Verify token route
router.get('/verify', requireHybridAuth, (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json({
      valid: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});

router.get('/test-auth', requireHybridAuth, (req, res) => {
  res.json({
    ok: true,
    route: req.originalUrl,
    user: req.auth?.userId,
    template: req.auth?.template,
    authType: req.authType,
    session: req.auth?.sessionId || null
  });
});

module.exports = router;