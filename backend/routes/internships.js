const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authorize, optionalAuth, verifyInternshipOwnership, logAdminAction } = require('../middleware/auth');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const notificationService = require('../services/notificationService');
const router = express.Router();

const internshipsPath = path.join(__dirname, '../data/internships.json');
const applicationsPath = path.join(__dirname, '../data/applications.json');
const Internship = require('../models/Internship');

// Helper function to read internships
const readInternships = () => { }; // Deprecated
const writeInternships = () => { }; // Deprecated
const readApplications = () => { }; // Deprecated



// Get all internships (with optional filtering)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      department,
      skills,
      location,
      workMode,
      company,
      status = 'active',
      minStipend,
      maxStipend,
      recommended
    } = req.query;

    let query = {};

    // Build MongoDB query
    if (status) query.status = status;

    // Admin/Submitter filters handled by query modifications
    if (status === 'submitted') {
      if (!req.user || req.user.role !== 'admin') {
        // If not admin, can't see submitted unless looking at own (handled in my-postings)
        // ideally return empty or handle strictly
        return res.json({ internships: [], total: 0 });
      }
    }

    if (status === 'rejected') {
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.query.submittedBy)) { // simplified check
        // Logic for rejected visibility is complex in existing memory filter
        // replicating strict behavior:
        // if user is not admin, only show if they are the submitter (which usually implies fetching 'my-postings')
        // For general feed, rejected shouldn't show up usually
      }
    }


    if (department) {
      query.eligibleDepartments = { $elemMatch: { $regex: new RegExp(department.trim(), 'i') } };
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (workMode) {
      query.workMode = workMode;
    }

    if (company) {
      query.company = { $regex: new RegExp(company, 'i') };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      // Find internships that have at least one of the required skills matching the search
      query.requiredSkills = {
        $elemMatch: {
          $in: skillsArray.map(s => new RegExp(s, 'i'))
        }
      };
    }

    // Stipend filtering - strictly speaking complex with regex stored in DB
    // Skipping strict stipend query logic for now to match current simple functionality or fetch all and filter

    // Fetch from MongoDB
    let internships = await Internship.find(query).lean();

    // Post-query filtering for Stipend (since it's string in DB: "₹20,000/month")
    if (minStipend || maxStipend) {
      internships = internships.filter(internship => {
        const stipendMatch = internship.stipend ? internship.stipend.match(/(\d+,?\d*)/) : null;
        if (stipendMatch) {
          const stipendAmount = parseInt(stipendMatch[1].replace(/,/g, ''));
          if (minStipend && stipendAmount < parseInt(minStipend)) return false;
          if (maxStipend && stipendAmount > parseInt(maxStipend)) return false;
        }
        return true;
      });
    }

    // If user is authenticated and is a student, add recommendation scores and application status
    if (req.user && req.user.role === 'student') {
      // Need applications to check 'hasApplied'
      // We assume Application model is available via requires or we verify against MongoDB Application collection
      const Application = require('../models/Application');
      const studentApplications = await Application.find({ studentId: req.user.id }).lean();

      internships = internships.map(internship => {
        // ... (Keep existing recommendation scoring logic)
        // Make skills matching case-insensitive for better matching
        const skillMatch = (internship.requiredSkills && req.user.skills) ?
          internship.requiredSkills.filter(skill =>
            skill && req.user.skills.some(userSkill =>
              userSkill && userSkill.toLowerCase().trim() === skill.toLowerCase().trim()
            )
          ).length : 0;

        const departmentMatch = true; // Demo mode preserved

        // Lenient requirements for demo
        const cgpaEligible = req.user.cgpa >= Math.max(0, internship.minimumCGPA - 2.0);
        const semesterEligible = req.user.semester >= Math.max(1, internship.minimumSemester - 4);

        const recommendationScore = (
          (skillMatch / (internship.requiredSkills.length || 1)) * 40 +
          (departmentMatch ? 30 : 0) +
          (cgpaEligible ? 20 : 0) +
          (semesterEligible ? 10 : 0)
        );

        // Check if student has already applied
        const existingApp = studentApplications.find(app => app.internshipId === internship.id);

        let hasApplied = !!existingApp;
        let rejectionCooldown = null;

        if (existingApp && existingApp.status === 'rejected') {
          const rejectedAt = existingApp.rejectedAt || existingApp.updatedAt;
          if (rejectedAt) {
            const rejectionTime = new Date(rejectedAt).getTime();
            const now = Date.now();
            const hoursSinceRejection = (now - rejectionTime) / (1000 * 60 * 60);

            if (hoursSinceRejection >= 24) {
              hasApplied = false;
            } else {
              rejectionCooldown = Math.ceil(24 - hoursSinceRejection);
            }
          }
        }

        return {
          ...internship,
          recommendationScore: Math.round(recommendationScore),
          isEligible: departmentMatch && cgpaEligible && semesterEligible,
          hasApplied: hasApplied,
          rejectionCooldown: rejectionCooldown
        };
      });

      // Sort by recommendation score
      if (recommended === 'true') {
        internships.sort((a, b) => b.recommendationScore - a.recommendationScore);
      }
    }

    res.json({
      internships: internships,
      total: internships.length,
      filters: { department, skills, location, workMode, company, status }
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get internships posted/submitted by current recruiter (must be before /:id route)
// Get internships posted/submitted by current recruiter (must be before /:id route)
router.get('/my-postings', requireHybridAuth, authorize('recruiter'), async (req, res) => {
  try {
    // Include both submitted and posted internships by the recruiter
    const myInternships = await Internship.find({
      $or: [
        { postedBy: req.user.id },
        { submittedBy: req.user.id }
      ]
    }).lean();

    res.json({
      internships: myInternships,
      total: myInternships.length
    });
  } catch (error) {
    console.error('Error fetching recruiter internships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending internship submissions (admin only) - placed BEFORE dynamic :id route to avoid conflicts
// Get pending internship submissions (admin only) - placed BEFORE dynamic :id route to avoid conflicts
router.get('/pending', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const pendingInternships = await Internship.find({ status: 'submitted' }).lean();

    res.json({
      internships: pendingInternships,
      total: pendingInternships.length
    });
  } catch (error) {
    console.error('Error fetching pending internships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single internship by ID
// Get single internship by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const internship = await Internship.findOne({ id: req.params.id }).lean();

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Add recommendation score and application status if user is a student
    if (req.user && req.user.role === 'student') {
      const Application = require('../models/Application');
      const studentApplications = await Application.find({ studentId: req.user.id }).lean();

      // Make skills matching case-insensitive for better matching
      const skillMatch = (internship.requiredSkills && req.user.skills) ?
        internship.requiredSkills.filter(skill =>
          skill && req.user.skills.some(userSkill =>
            userSkill && userSkill.toLowerCase().trim() === skill.toLowerCase().trim()
          )
        ).length : 0;
      // ULTRA-FLEXIBLE DEMO MODE: Allow ALL students to apply to ALL internships
      const departmentMatch = true;

      // Ultra-lenient requirements for demo
      const cgpaEligible = req.user.cgpa >= Math.max(0, internship.minimumCGPA - 2.0); // Allow 2.0 CGPA buffer
      const semesterEligible = req.user.semester >= Math.max(1, internship.minimumSemester - 4); // Allow 4 semester buffer

      const recommendationScore = (
        (skillMatch / (internship.requiredSkills.length || 1)) * 40 +
        (departmentMatch ? 30 : 0) +
        (cgpaEligible ? 20 : 0) +
        (semesterEligible ? 10 : 0)
      );

      // Check if student has already applied to this internship
      const existingApp = studentApplications.find(app => app.internshipId === internship.id);

      let hasApplied = !!existingApp;
      let rejectionCooldown = null;

      // If rejected, check if 24-hour cooldown has passed
      if (existingApp && existingApp.status === 'rejected') {
        const rejectedAt = existingApp.rejectedAt || existingApp.updatedAt;
        if (rejectedAt) {
          const rejectionTime = new Date(rejectedAt).getTime();
          const now = Date.now();
          const hoursSinceRejection = (now - rejectionTime) / (1000 * 60 * 60);

          if (hoursSinceRejection >= 24) {
            hasApplied = false;
          } else {
            rejectionCooldown = Math.ceil(24 - hoursSinceRejection);
          }
        }
      }

      internship.recommendationScore = Math.round(recommendationScore);
      internship.isEligible = departmentMatch && cgpaEligible && semesterEligible;
      internship.hasApplied = hasApplied;
      internship.rejectionCooldown = rejectionCooldown;
    }

    res.json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper to generate next ID
const generateId = async () => {
  const internships = await Internship.find({}, 'id').lean();
  if (!internships || internships.length === 0) return 'INT100';

  const maxId = internships.reduce((max, i) => {
    const match = i.id.match(/INT(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 99);

  return `INT${String(maxId + 1).padStart(3, '0')}`;
};

// Create new internship (admin only - direct posting)
// Create new internship (admin only - direct posting)
router.post('/', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requiredSkills,
      eligibleDepartments,
      minimumSemester,
      minimumCGPA,
      stipend,
      duration,
      location,
      workMode,
      applicationDeadline,
      startDate,
      endDate,
      maxApplications
    } = req.body;

    // Validation
    if (!title || !company || !description || !requiredSkills || !eligibleDepartments) {
      return res.status(400).json({
        error: 'Missing required fields: title, company, description, requiredSkills, eligibleDepartments'
      });
    }

    // Admin directly posting internships
    const finalCompany = company;
    const finalCompanyLogo = req.body.companyLogo;
    const newId = await generateId();

    const newInternship = new Internship({
      id: newId,
      title,
      company: finalCompany,
      companyLogo: finalCompanyLogo,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      preferredSkills: req.body.preferredSkills || [],
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : [eligibleDepartments],
      minimumSemester: minimumSemester || 4,
      minimumCGPA: minimumCGPA || 6.0,
      stipend,
      duration,
      location,
      workMode: workMode || 'On-site',
      applicationDeadline,
      startDate,
      endDate,
      maxApplications: maxApplications || 50,
      currentApplications: 0,
      status: 'active',
      companyDescription: req.body.companyDescription || '',
      requirements: req.body.requirements || [],
      benefits: req.body.benefits || [],
      createdAt: new Date(),
      postedBy: req.user.id,
      postedByRole: req.user.role,
      submittedBy: null,
      approvedBy: req.user.id,
      submittedAt: null,
      approvedAt: new Date(),
      adminNotes: '',
      recruiterNotes: '',
      rejectionReason: ''
    });

    await newInternship.save();

    // Schedule deadline reminders for eligible students
    if (newInternship.status === 'active' && newInternship.applicationDeadline) {
      await notificationService.scheduleInternshipDeadlineReminders(newInternship.toObject());
    }

    // Log admin action
    logAdminAction(req.user.id, 'CREATE_INTERNSHIP', {
      internshipId: newInternship.id,
      title: newInternship.title,
      company: newInternship.company
    });

    res.status(201).json({
      message: 'Internship created successfully',
      internship: newInternship
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit internship for approval (recruiters only)
// Submit internship for approval (recruiters only)
router.post('/submit', requireHybridAuth, authorize('recruiter'), async (req, res) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      eligibleDepartments,
      minimumSemester,
      minimumCGPA,
      stipend,
      duration,
      location,
      workMode,
      applicationDeadline,
      startDate,
      endDate,
      maxApplications,
      companyDescription,
      requirements,
      benefits,
      recruiterNotes
    } = req.body;

    // Validation
    if (!title || !description || !requiredSkills || !eligibleDepartments) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, requiredSkills, eligibleDepartments'
      });
    }

    // Auto-fill company info from recruiter profile
    const finalCompany = req.user.company || 'Company Name';
    const finalCompanyLogo = req.user.companyLogo || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100`;
    const newId = await generateId();

    // Helper to parse DD-MM-YYYY or YYYY-MM-DD
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      // If already ISO format (YYYY-MM-DD...)
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(dateStr);

      // If DD-MM-YYYY
      const parts = dateStr.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
      if (parts) {
        // parts[1] is day, parts[2] is month, parts[3] is year
        return new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
      }
      return new Date(dateStr); // Fallback
    };

    const newSubmission = new Internship({
      id: newId,
      title,
      company: finalCompany,
      companyLogo: finalCompanyLogo,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      preferredSkills: req.body.preferredSkills || [],
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : [eligibleDepartments],
      minimumSemester: minimumSemester || 4,
      minimumCGPA: minimumCGPA || 6.0,
      stipend,
      duration,
      location,
      workMode: workMode || 'On-site',
      applicationDeadline: parseDate(applicationDeadline),
      startDate: parseDate(startDate),
      endDate: parseDate(endDate),
      maxApplications,
      currentApplications: 0,
      status: 'submitted', // Submitted for approval
      companyDescription: companyDescription || '',
      requirements: requirements || [],
      benefits: benefits || [],
      createdAt: new Date(),
      postedBy: null, // Will be set when approved
      postedByRole: null,
      submittedBy: req.user.id,
      approvedBy: null,
      submittedAt: new Date(),
      approvedAt: null,
      adminNotes: '',
      recruiterNotes: recruiterNotes || '',
      rejectionReason: ''
    });

    console.log('[DEBUG] Submit Internship payload:', JSON.stringify(req.body, null, 2));

    await newSubmission.save();

    res.status(201).json({
      message: 'Internship submitted for approval successfully',
      internship: newSubmission
    });
  } catch (error) {
    console.error('Error submitting internship:', error);
    // Print validation errors specifically
    if (error.name === 'ValidationError') {
      console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ error: error.message, details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Approve internship submission (admin only)
// Approve internship submission (admin only)
router.put('/:id/approve', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const internship = await Internship.findOne({ id: req.params.id });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Check if internship is in submitted status
    if (internship.status !== 'submitted') {
      return res.status(400).json({ error: 'Internship is not in submitted status' });
    }

    // Update internship to approved status
    internship.status = 'active';
    internship.postedBy = internship.submittedBy;
    internship.postedByRole = 'recruiter';
    internship.approvedBy = req.user.id;
    internship.approvedAt = new Date();
    internship.adminNotes = adminNotes || '';
    internship.updatedAt = new Date();

    await internship.save();

    // Log admin action
    logAdminAction(req.user.id, 'APPROVE_INTERNSHIP', {
      internshipId: req.params.id,
      title: internship.title,
      submittedBy: internship.submittedBy,
      adminNotes
    });

    res.json({
      message: 'Internship approved successfully',
      internship: internship
    });
  } catch (error) {
    console.error('Error approving internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject internship submission (admin only)
// Reject internship submission (admin only)
router.put('/:id/reject', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const internship = await Internship.findOne({ id: req.params.id });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Check if internship is in submitted status
    if (internship.status !== 'submitted') {
      return res.status(400).json({ error: 'Internship is not in submitted status' });
    }

    // Update internship to rejected status
    internship.status = 'rejected';
    internship.approvedBy = req.user.id;
    internship.approvedAt = new Date();
    internship.adminNotes = adminNotes || '';
    internship.rejectionReason = rejectionReason;
    internship.updatedAt = new Date();

    await internship.save();

    // Log admin action
    logAdminAction(req.user.id, 'REJECT_INTERNSHIP', {
      internshipId: req.params.id,
      title: internship.title,
      submittedBy: internship.submittedBy,
      rejectionReason,
      adminNotes
    });

    res.json({
      message: 'Internship rejected',
      internship: internship
    });
  } catch (error) {
    console.error('Error rejecting internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update internship (admin and recruiter with ownership verification)
// Update internship (admin and recruiter with ownership verification)
router.put('/:id', requireHybridAuth, authorize('admin', 'recruiter'), verifyInternshipOwnership, async (req, res) => {
  try {
    const internship = await Internship.findOne({ id: req.params.id });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Additional check: Recruiters can only edit approved internships, not submitted ones
    if (req.user.role === 'recruiter' && internship.status === 'submitted') {
      return res.status(403).json({ error: 'Cannot edit internship while it is pending approval.' });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'description', 'requiredSkills', 'preferredSkills',
      'eligibleDepartments', 'minimumSemester', 'minimumCGPA',
      'stipend', 'duration', 'location', 'workMode',
      'applicationDeadline', 'startDate', 'endDate',
      'maxApplications', 'companyDescription', 'requirements',
      'benefits', 'adminNotes', 'recruiterNotes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        internship[field] = req.body[field];
      }
    });

    internship.updatedAt = new Date();

    const updatedInternship = await internship.save();

    // Log admin action if admin is updating
    if (req.user.role === 'admin') {
      logAdminAction(req.user.id, 'UPDATE_INTERNSHIP', {
        internshipId: req.params.id,
        title: updatedInternship.title
      });
    }

    res.json({
      message: 'Internship updated successfully',
      internship: updatedInternship
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete internship (admin and recruiter with ownership verification)
// Delete internship (admin and recruiter with ownership verification)
router.delete('/:id', requireHybridAuth, authorize('admin', 'recruiter'), verifyInternshipOwnership, async (req, res) => {
  try {
    const internship = await Internship.findOne({ id: req.params.id });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    await Internship.deleteOne({ id: req.params.id });

    // Log admin action if admin is deleting
    if (req.user.role === 'admin') {
      logAdminAction(req.user.id, 'DELETE_INTERNSHIP', {
        internshipId: req.params.id,
        title: internship.title
      });
    }

    res.json({
      message: 'Internship deleted successfully',
      internship: internship
    });
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get internship statistics (admin only)
// Get internship statistics (admin only)
router.get('/stats/overview', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const internships = await Internship.find({});

    const stats = {
      total: internships.length,
      active: internships.filter(i => i.status === 'active').length,
      inactive: internships.filter(i => i.status === 'inactive').length,
      byLocation: {},
      byCompany: {},
      totalApplications: internships.reduce((sum, i) => sum + i.currentApplications, 0)
    };

    internships.forEach(internship => {
      if (internship.location) stats.byLocation[internship.location] = (stats.byLocation[internship.location] || 0) + 1;
      if (internship.company) stats.byCompany[internship.company] = (stats.byCompany[internship.company] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching internship stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;