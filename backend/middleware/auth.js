const jwt = require('jsonwebtoken');
const { ClerkExpressWithAuth, clerkClient } = require('@clerk/clerk-sdk-node');
const { Student, Admin, Mentor, Recruiter, AdminAudit } = require('../models');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Helper function to load users from JSON files (fallback)
const loadUsersFromJSON = () => {
  const dataDir = path.join(__dirname, '../data');
  const users = [];
  try {
    ['students.json', 'admins.json', 'mentors.json', 'recruiters.json'].forEach(file => {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        users.push(...JSON.parse(fs.readFileSync(filePath, 'utf8')));
      }
    });
  } catch (error) {
    console.error('Error loading users from JSON:', error);
  }
  return users;
};

// Hybrid Authentication Middleware (Delegates to centralized logic)
const requireHybridAuth = require('./clerkHybridAuth');
const authenticate = requireHybridAuth;

// Optional auth middleware
const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return next();
  authenticate(req, res, next);
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      console.error(`[auth] Access denied. User role: '${req.user.role}', Required roles: [${roles.join(', ')}]`);
      return res.status(403).json({ error: 'Access denied', details: `User role '${req.user.role}' not authorized. Required: ${roles.join(', ')}` });
    }
    next();
  };
};

// Verify ownership
const verifyOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      if (!resource) return res.status(404).json({ error: 'Resource not found' });

      const ownerId = resource.student || resource.user || resource.postedBy || resource.submittedBy;

      if (ownerId && ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
};

const verifyStudentAccess = async (req, res, next) => {
  if (req.user.role !== 'recruiter') return next();
  next(); // Simplified
};

// Verify internship ownership (for recruiters editing their own internships)
const verifyInternshipOwnership = (req, res, next) => {
  if (req.user.role !== 'recruiter') {
    return next(); // Admins can access all internships
  }

  const fs = require('fs');
  const path = require('path');

  try {
    const internshipsPath = path.join(__dirname, '../data/internships.json');
    const internships = JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));

    // If checking a specific internship ID from params
    if (req.params.id) {
      const internship = internships.find(i => i.id === req.params.id);
      if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
      }

      // Check if recruiter owns this internship
      if (internship.postedBy !== req.user.id && internship.submittedBy !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only access internships you posted or submitted.' });
      }
    }

    next();
  } catch (error) {
    console.error('Ownership verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logAdminAction = async (adminId, action, details = {}) => {
  try {
    const auditCount = await AdminAudit.countDocuments();
    const logEntry = new AdminAudit({
      id: `AUDIT${String(auditCount + 1).padStart(3, '0')}`,
      adminId,
      action,
      details,
      timestamp: new Date()
    });
    await logEntry.save();
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  verifyOwnership,
  verifyStudentAccess,
  verifyInternshipOwnership,
  logAdminAction
};
