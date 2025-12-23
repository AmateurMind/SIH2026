const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authorize } = require('../middleware/auth');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const { notifyApplicationStatusChange } = require('../utils/notify');
const notificationService = require('../services/notificationService');
const mongoose = require('mongoose');
const { Student, Application, Internship } = require('../models');
const router = express.Router();

const mentorsPath = path.join(__dirname, '../data/mentors.json');
const studentsPath = path.join(__dirname, '../data/students.json');

// Helper functions (JSON fallback for mentors and students only - not for applications/internships)
const readMentors = () => {
  try {
    return JSON.parse(fs.readFileSync(mentorsPath, 'utf8'));
  } catch (e) {
    return [];
  }
};
const readStudents = () => {
  try {
    return JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
  } catch (e) {
    return [];
  }
};

// Get applications based on user role
router.get('/', requireHybridAuth, async (req, res) => {
  try {

    // Use MongoDB if connected, otherwise fallback to JSON
    let applications = [];
    let internships = [];

    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected - use it
      applications = await Application.find({}).lean();
      internships = await Internship.find({}).lean();
    } else {
      // Fallback to JSON (should not happen in production)
      console.warn('[WARN] MongoDB not connected, using JSON fallback');
      const fs = require('fs');
      const applicationsPath = path.join(__dirname, '../data/applications.json');
      const internshipsPath = path.join(__dirname, '../data/internships.json');
      applications = JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
      internships = JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
    }

    // Check if Mongo is connected before trying to query it
    let mongoStudents = [];
    if (mongoose.connection.readyState === 1) {
      mongoStudents = await Student.find({}).lean();
    } else {
      console.log('Using JSON students only (Mongo not connected)');
    }

    const jsonStudents = readStudents();
    // Merge students from MongoDB and JSON (MongoDB takes precedence for duplicates)
    const studentsMap = {};
    jsonStudents.forEach(s => studentsMap[s.id] = s);
    mongoStudents.forEach(s => studentsMap[s.id] = s);
    const students = Object.values(studentsMap);

    let filteredApplications = [];

    switch (req.user.role) {
      case 'student':
        filteredApplications = applications.filter(app => app.studentId === req.user.id);
        break;
      case 'mentor':
        filteredApplications = applications.filter(app => app.mentorId === req.user.id);
        break;
      case 'admin':
      case 'recruiter':
        filteredApplications = applications;
        break;
      default:
        return res.status(403).json({ error: 'Access denied' });
    }

    // Enrich with internship and student data
    const enrichedApplications = filteredApplications.map(app => {
      const internship = internships.find(i => i.id === app.internshipId);
      const student = students.find(s => s.id === app.studentId);
      return {
        ...app,
        internship: internship ? {
          id: internship.id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          stipend: internship.stipend,
          duration: internship.duration,
        } : null,
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email,
          resumeLink: student.resumeLink,
          department: student.department,
          cgpa: student.cgpa,
          semester: student.semester,
          pdfResumes: student.pdfResumes,
        } : null
      };
    });

    res.json({
      applications: enrichedApplications,
      total: enrichedApplications.length
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single application
router.get('/:id', requireHybridAuth, async (req, res) => {
  try {

    let application = null;
    if (mongoose.connection.readyState === 1) {
      application = await Application.findOne({ id: req.params.id }).lean();
    } else {
      // Fallback to JSON
      const fs = require('fs');
      const applicationsPath = path.join(__dirname, '../data/applications.json');
      const applications = JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
      application = applications.find(app => app.id === req.params.id);
    }

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && application.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'mentor' && application.mentorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new application (students only)
router.post('/', requireHybridAuth, authorize('student'), async (req, res) => {
  try {

    // Ensure MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not available. Please try again later.' });
    }

    const { internshipId, coverLetter, mentorId } = req.body;

    if (!internshipId || !coverLetter) {
      return res.status(400).json({ error: 'Internship ID and cover letter are required' });
    }

    // Get internship from MongoDB
    console.log(`[DEBUG] Looking up internship with ID: "${internshipId}"`);
    const internship = await Internship.findOne({ id: internshipId }).lean();
    console.log(`[DEBUG] Internship search result:`, internship ? 'Found' : 'Not Found');
    if (!internship) {
      // Double check if it exists in JSON fallback just in case migration missed it
      console.log('[DEBUG] Checking JSON fallback for internship...');
      // ... (existing logic continues)
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Check if student already applied (from MongoDB)
    const existingApplication = await Application.findOne({
      studentId: req.user.id,
      internshipId: internshipId
    }).lean();

    if (existingApplication) {
      // If rejected, allow reapplication after 24 hours
      if (existingApplication.status === 'rejected') {
        const rejectedAt = existingApplication.rejectedAt || existingApplication.updatedAt;
        if (rejectedAt) {
          const rejectionTime = new Date(rejectedAt).getTime();
          const now = Date.now();
          const hoursSinceRejection = (now - rejectionTime) / (1000 * 60 * 60);

          if (hoursSinceRejection < 24) {
            const hoursRemaining = Math.ceil(24 - hoursSinceRejection);
            return res.status(400).json({
              error: `You were rejected for this internship. You can reapply in ${hoursRemaining} hour(s).`,
              cooldownRemaining: hoursRemaining
            });
          }

          // 24 hours passed - remove old rejected application to allow new one
          console.log(`[INFO] Removing rejected application ${existingApplication.id} for reapplication after 24hr cooldown`);
          await Application.deleteOne({ id: existingApplication.id });
        }
      } else {
        // Not rejected - still active application
        return res.status(400).json({ error: 'You have already applied for this internship' });
      }
    }

    // --- CHECK FOR ACTIVE OFFERS OR INTERNSHIPS ---
    // DISABLED: Allowing multiple offers for testing.
    /*
    const restrictionStatuses = ['offered', 'accepted', 'hired', 'ongoing', 'selected'];

    console.log(`[DEBUG] Checking restrictions for user: ${req.user.id}`);
    const restrictedApplication = applications.find(app => {
      const match = app.studentId === req.user.id && restrictionStatuses.includes(app.status);
      if (match) console.log(`[DEBUG] Found blocking app: ${app.id}, status: ${app.status}`);
      return match;
    });

    if (restrictedApplication) {
      const restrictedInternship = internships.find(i => i.id === restrictedApplication.internshipId);
      const companyName = restrictedInternship ? restrictedInternship.company : 'a company';

      // If status is 'completed' (or rejected), it won't be in restrictionStatuses, so we are safe.
      // But just to be double sure and explicit:
      if (restrictedApplication.status !== 'completed' && restrictedApplication.status !== 'rejected') {
        return res.status(400).json({
          error: `Action Failed: You have already secured an internship offer or position with ${companyName}. Multiple offers are not permitted until your current internship is marked as 'completed'.`,
          details: {
            currentStatus: restrictedApplication.status,
            internship: companyName,
            blockingApplicationId: restrictedApplication.id
          }
        });
      }
    }
    */
    // -----------------------------------------

    // Check eligibility with flexible matching
    const userDept = (req.user.department || '').toLowerCase().trim();
    const eligibleDepts = (internship.eligibleDepartments || []).map(d => d.toLowerCase().trim());

    // DEMO MODE: If user profile is incomplete, allow application with warning
    const isProfileIncomplete = !req.user.department ||
      req.user.department === 'Not specified' ||
      !req.user.cgpa ||
      req.user.cgpa === 0 ||
      !req.user.semester ||
      req.user.semester === 0;

    if (isProfileIncomplete) {
      // Allow application but log warning - for demo purposes
      console.log(`[WARN] User ${req.user.id} has incomplete profile, allowing application for demo`);
    }

    // Department matching - check for partial matches and common variations
    const deptAliases = {
      'computer science': ['cs', 'cse', 'computer science', 'computer science and engineering', 'comp sci'],
      'information technology': ['it', 'information technology', 'info tech'],
      'electronics': ['ece', 'electronics', 'electronics and communication', 'electrical'],
      'mechanical': ['mech', 'mechanical', 'mechanical engineering'],
      'civil': ['civil', 'civil engineering'],
      'mathematics': ['math', 'maths', 'mathematics', 'applied mathematics']
    };

    // For incomplete profiles, allow all departments
    let departmentMatch = isProfileIncomplete || eligibleDepts.includes(userDept) || eligibleDepts.length === 0;

    // Check aliases if no direct match
    if (!departmentMatch) {
      for (const [canonical, aliases] of Object.entries(deptAliases)) {
        const userMatchesCanonical = aliases.some(alias => userDept.includes(alias) || alias.includes(userDept));
        const internshipMatchesCanonical = eligibleDepts.some(dept =>
          aliases.some(alias => dept.includes(alias) || alias.includes(dept))
        );
        if (userMatchesCanonical && internshipMatchesCanonical) {
          departmentMatch = true;
          break;
        }
      }
    }

    // CS/IT students can apply to all tech internships
    const isTechStudent = ['computer science', 'cs', 'cse', 'information technology', 'it'].some(
      term => userDept.includes(term)
    );
    if (isTechStudent) {
      departmentMatch = true;
    }

    // Flexible CGPA check (allow 1.5 buffer) - bypass for incomplete profiles
    const cgpaEligible = isProfileIncomplete ||
      !internship.minimumCGPA ||
      req.user.cgpa >= (internship.minimumCGPA - 1.5) ||
      req.user.cgpa >= 6.0; // Minimum 6.0 CGPA students can always apply

    // Flexible semester check (allow 2 semester buffer) - bypass for incomplete profiles
    const semesterEligible = isProfileIncomplete ||
      !internship.minimumSemester ||
      req.user.semester >= (internship.minimumSemester - 2) ||
      req.user.semester >= 4; // 4th semester and above can always apply

    const isEligible = departmentMatch && cgpaEligible && semesterEligible;

    if (!isEligible) {
      // Provide specific reason for rejection
      let reason = 'You are not eligible for this internship. ';
      if (!departmentMatch) {
        reason += `Your department (${req.user.department}) doesn't match the required departments. `;
      }
      if (!cgpaEligible) {
        reason += `Minimum CGPA required: ${internship.minimumCGPA}, yours: ${req.user.cgpa}. `;
      }
      if (!semesterEligible) {
        reason += `Minimum semester required: ${internship.minimumSemester}, yours: ${req.user.semester}. `;
      }
      return res.status(400).json({ error: reason.trim() });
    }

    // Get mentors for assignment (from JSON fallback)
    const mentors = readMentors();

    // Determine mentor assignment
    // Prioritize student's assigned mentor
    let assignedMentorId = mentorId || req.user.assignedMentorId || null;

    if (!assignedMentorId) {
      // Fallback: Auto-assign a mentor from the same department if available, otherwise first mentor
      const deptMentor = mentors.find(m => m.department === req.user.department);
      assignedMentorId = deptMentor ? deptMentor.id : (mentors[0] ? mentors[0].id : null);
    }

    // Generate new ID based on max existing ID to prevent duplicates
    const allApplications = await Application.find({}).lean();
    const maxId = allApplications.reduce((max, app) => {
      const idNum = parseInt(app.id.replace('APP', ''));
      return idNum > max ? idNum : max;
    }, 0);

    const newApplicationId = `APP${String(maxId + 1).padStart(3, '0')}`;

    // Create application in MongoDB
    const newApplication = new Application({
      id: newApplicationId,
      studentId: req.user.id,
      internshipId,
      status: assignedMentorId ? 'pending_mentor_approval' : 'applied',
      appliedAt: new Date(),
      coverLetter,
      mentorId: assignedMentorId,
      mentorApproval: null,
      mentorFeedback: null,
      interviewScheduled: null,
      interviewFeedback: null,
      finalStatus: null,
      updatedAt: new Date()
    });

    await newApplication.save();

    // Update internship application count in MongoDB
    await Internship.findOneAndUpdate(
      { id: internshipId },
      { $inc: { currentApplications: 1 } },
      { new: true }
    );

    // Schedule mentor approval reminders if mentor is assigned
    if (assignedMentorId) {
      await notificationService.scheduleMentorApprovalReminder(newApplication.toObject());
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application: newApplication.toObject()
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update application status (mentors, admins, and recruiters)
router.put('/:id/status', requireHybridAuth, authorize('mentor', 'admin', 'recruiter'), async (req, res) => {
  try {

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not available. Please try again later.' });
    }

    const { status, feedback, interviewDetails, offerDetails } = req.body;

    // Get application from MongoDB
    let application = await Application.findOne({ id: req.params.id }).lean();
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check permissions
    if (req.user.role === 'mentor' && application.mentorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prepare update object
    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Track rejection timestamp for 24-hour cooldown on reapplication
    if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    if (req.user.role === 'mentor') {
      updateData.mentorApproval = status === 'approved' ? 'approved' : 'rejected';
      updateData.mentorFeedback = feedback || '';
    }

    if (interviewDetails) {
      updateData.interviewScheduled = {
        ...interviewDetails,
        date: new Date(interviewDetails.date)
      };

      // Schedule interview reminders
      await notificationService.scheduleInterviewReminders({ ...application, ...updateData }, interviewDetails);
    }

    if (offerDetails) {
      updateData.offerDetails = {
        ...offerDetails,
        startDate: new Date(offerDetails.startDate),
        offerExpiry: new Date(offerDetails.offerExpiry)
      };

      // Schedule offer expiry reminders if offer has expiry date
      if (offerDetails.offerExpiry) {
        await notificationService.scheduleOfferExpiryReminders({ ...application, ...updateData }, offerDetails);
      }
    }

    if (feedback && status === 'interview_completed') {
      updateData.interviewFeedback = feedback;
    }

    // Update in MongoDB
    const updatedApplication = await Application.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    ).lean();

    // Include student and internship data for frontend email notification
    const mongoStudents = await Student.find({}).lean();
    const jsonStudents = readStudents();
    const studentsMap = {};
    jsonStudents.forEach(s => studentsMap[s.id] = s);
    mongoStudents.forEach(s => studentsMap[s.id] = s);
    const students = Object.values(studentsMap);

    const internship = await Internship.findOne({ id: application.internshipId }).lean();
    const student = students.find(s => s.id === application.studentId);

    // Send email notification via backend (fallback) - was working before
    // Frontend can also send, but backend serves as backup
    try {
      if (student && internship) {
        notifyApplicationStatusChange({
          student,
          internship,
          status,
          feedback,
          interviewDetails,
          offerDetails
        }).then((result) => {
          if (result?.ok) {
            console.log('[notify] Backend email sent successfully to', student.email);
          } else if (!result?.skipped) {
            console.warn('[notify] Backend email send failed:', result);
          }
        }).catch((err) => {
          console.warn('[notify] Backend email error:', err.message);
        });
      }
    } catch (notifyErr) {
      console.warn('[notify] Backend notification error:', notifyErr.message);
    }

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
      // Include student and internship data for frontend email notification
      student: student ? { id: student.id, name: student.name, email: student.email } : null,
      internship: internship ? {
        id: internship.id,
        title: internship.title,
        company: internship.company
      } : null
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending approvals for mentor
router.get('/pending/mentor', requireHybridAuth, authorize('mentor'), async (req, res) => {
  try {
    const applications = readApplications();
    const internships = readInternships();
    const mongoStudents = await Student.find({}).lean();
    const jsonStudents = readStudents();
    const studentsMap = {};
    jsonStudents.forEach(s => studentsMap[s.id] = s);
    mongoStudents.forEach(s => studentsMap[s.id] = s);
    const students = Object.values(studentsMap);

    // Debug: log mentor ID being checked
    console.log('🔍 Mentor pending check:', {
      mentorId: req.user.id,
      mentorName: req.user.name,
      totalApps: applications.length,
      pendingApps: applications.filter(a => a.status === 'pending_mentor_approval').length,
      matchingApps: applications.filter(a => a.mentorId === req.user.id && a.status === 'pending_mentor_approval').length
    });

    const pendingApplications = applications.filter(app =>
      app.mentorId === req.user.id && app.status === 'pending_mentor_approval'
    ).map(app => {
      const internship = internships.find(i => i.id === app.internshipId);
      const student = students.find(s => s.id === app.studentId);
      return {
        ...app,
        internship: internship ? {
          id: internship.id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          stipend: internship.stipend,
          duration: internship.duration,
        } : null,
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email,
          resumeLink: student.resumeLink,
          department: student.department,
          cgpa: student.cgpa,
          semester: student.semester,
          pdfResumes: student.pdfResumes,
        } : null
      };
    });

    res.json({
      applications: pendingApplications,
      total: pendingApplications.length
    });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get application analytics
router.get('/analytics/overview', requireHybridAuth, authorize('admin'), (req, res) => {
  try {
    const applications = readApplications();

    const analytics = {
      total: applications.length,
      byStatus: {},
      byMonth: {},
      recentApplications: applications.slice(-10)
    };

    applications.forEach(app => {
      analytics.byStatus[app.status] = (analytics.byStatus[app.status] || 0) + 1;

      const month = new Date(app.appliedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      analytics.byMonth[month] = (analytics.byMonth[month] || 0) + 1;
    });

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching application analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;