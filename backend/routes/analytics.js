const express = require('express');
const { authorize } = require('../middleware/auth');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const {
  Student,
  Internship,
  Application,
  Feedback,
  Recruiter
} = require('../models');
const router = express.Router();

// Dashboard analytics for admins
router.get('/dashboard', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    // Get basic counts using MongoDB aggregation
    const [studentsStats, internshipsStats, applicationsStats, totalRecruiters] = await Promise.all([
      Student.aggregate([
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            placedStudents: {
              $sum: { $cond: { if: { $or: [{ $eq: ['$isPlaced', true] }, { $eq: ['$placementStatus', 'placed'] }] }, then: 1, else: 0 } }
            },
            studentsByDepartment: {
              $push: '$department'
            }
          }
        }
      ]),
      Internship.find({}).select('status requiredSkills'),
      Application.find({}).select('status internshipId appliedAt interviewScheduled'),
      Recruiter.countDocuments({})
    ]);

    const totalStudents = studentsStats[0]?.totalStudents || 0;
    const placedStudents = studentsStats[0]?.placedStudents || 0;
    const unplacedStudents = totalStudents - placedStudents;
    const activeInternships = internshipsStats.filter(i => i.status === 'active').length;
    const totalApplications = applicationsStats.length;

    // Application status breakdown using aggregation
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          applied: { $sum: { $cond: { if: { $eq: ['$_id', 'applied'] }, then: '$count', else: 0 } } },
          pending_mentor_approval: { $sum: { $cond: { if: { $eq: ['$_id', 'pending_mentor_approval'] }, then: '$count', else: 0 } } },
          approved: { $sum: { $cond: { if: { $eq: ['$_id', 'approved'] }, then: '$count', else: 0 } } },
          rejected: { $sum: { $cond: { if: { $eq: ['$_id', 'rejected'] }, then: '$count', else: 0 } } },
          interview_scheduled: { $sum: { $cond: { if: { $eq: ['$_id', 'interview_scheduled'] }, then: '$count', else: 0 } } },
          interviewed: { $sum: { $cond: { if: { $eq: ['$_id', 'interviewed'] }, then: '$count', else: 0 } } },
          offered: { $sum: { $cond: { if: { $eq: ['$_id', 'offered'] }, then: '$count', else: 0 } } },
          accepted: { $sum: { $cond: { if: { $eq: ['$_id', 'accepted'] }, then: '$count', else: 0 } } },
          declined: { $sum: { $cond: { if: { $eq: ['$_id', 'declined'] }, then: '$count', else: 0 } } }
        }
      }
    ]);

    // Students by department
    const studentsByDepartment = {};
    if (studentsStats[0]?.studentsByDepartment) {
      studentsStats[0].studentsByDepartment.forEach(dept => {
        studentsByDepartment[dept] = (studentsByDepartment[dept] || 0) + 1;
      });
    }

    // Recent activities (last 10 applications)
    const recentActivitiesResult = await Application
      .find({})
      .sort({ appliedAt: -1 })
      .limit(10)
      .lean();

    // Manually lookup student and internship data since we use custom string IDs
    const recentActivities = await Promise.all(recentActivitiesResult.map(async (app) => {
      const [student, internship] = await Promise.all([
        Student.findOne({ id: app.studentId }).select('name').lean(),
        Internship.findOne({ id: app.internshipId }).select('title company').lean()
      ]);
      return {
        id: app.id,
        student: student?.name || 'Unknown Student',
        internship: internship?.title || 'Unknown Internship',
        company: internship?.company || 'Unknown Company',
        status: app.status,
        appliedAt: app.appliedAt
      };
    }));

    // Upcoming interviews
    const upcomingInterviewsResult = await Application
      .find({
        'interviewScheduled.date': { $gt: new Date() }
      })
      .sort({ 'interviewScheduled.date': 1 })
      .limit(5)
      .lean();

    const upcomingInterviews = await Promise.all(upcomingInterviewsResult.map(async (app) => {
      const [student, internship] = await Promise.all([
        Student.findOne({ id: app.studentId }).select('name').lean(),
        Internship.findOne({ id: app.internshipId }).select('title company').lean()
      ]);
      return {
        id: app.id,
        student: student?.name || 'Unknown Student',
        internship: internship?.title || 'Unknown Internship',
        company: internship?.company || 'Unknown Company',
        date: app.interviewScheduled?.date,
        mode: app.interviewScheduled?.mode
      };
    }));

    // Top companies by applications
    const topCompaniesResult = await Application.aggregate([
      {
        $lookup: {
          from: 'internships',
          localField: 'internshipId',
          foreignField: 'id',
          as: 'internship'
        }
      },
      {
        $unwind: '$internship'
      },
      {
        $group: {
          _id: '$internship.company',
          applications: { $sum: 1 }
        }
      },
      {
        $sort: { applications: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const topCompanies = topCompaniesResult.map(item => ({
      company: item._id,
      applications: item.applications
    }));

    const analytics = {
      overview: {
        totalStudents,
        activeInternships,
        totalApplications,
        placedStudents,
        unplacedStudents,
        unplacedStudents,
        totalRecruiters,
        placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0
      },
      applicationsByStatus: applicationsByStatus[0] || {
        applied: 0,
        pending_mentor_approval: 0,
        approved: 0,
        rejected: 0,
        interview_scheduled: 0,
        interviewed: 0,
        offered: 0,
        accepted: 0,
        declined: 0
      },
      studentsByDepartment,
      recentActivities,
      upcomingInterviews,
      topCompanies,
      monthlyTrends: await getMonthlyTrends(),
      skillsDemand: getSkillsDemand(internshipsStats)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student analytics
router.get('/student/:studentId', requireHybridAuth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permission
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fallback Mode Check
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const fs = require('fs');
      const path = require('path');

      const loadData = (file) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(__dirname, '../data', file), 'utf8'));
        } catch (e) { return []; }
      };

      const applications = loadData('applications.json');
      const internships = loadData('internships.json');
      const feedback = loadData('feedback.json');

      const studentApplications = applications
        .filter(app => app.studentId === studentId)
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .map(app => {
          const internship = internships.find(i => i.id === app.internshipId);
          return {
            ...app,
            internshipId: internship ? { title: internship.title, company: internship.company } : null
          };
        });

      const studentFeedback = feedback.filter(f => f.studentId === studentId);

      const applicationsByStatus = {};
      studentApplications.forEach(app => {
        applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
      });

      let averageRating = 0;
      if (studentFeedback.length > 0) {
        const totalRating = studentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0);
        averageRating = Math.round((totalRating / studentFeedback.length) * 10) / 10;
      }

      const skillsSet = new Set();
      studentFeedback.forEach(f => {
        if (f.suggestions) skillsSet.add(f.suggestions);
      });

      const applicationHistory = studentApplications.map(app => ({
        id: app.id,
        internship: app.internshipId?.title || 'Unknown',
        company: app.internshipId?.company || 'Unknown',
        status: app.status,
        appliedAt: app.appliedAt
      }));

      const students = loadData('students.json');
      const student = students.find(s => s.id === studentId);

      return res.json({
        totalApplications: studentApplications.length,
        applicationsByStatus,
        averageRating,
        skillsDeveloped: Array.from(skillsSet),
        skills: student ? student.skills : [],
        totalBadges: student ? (student.achievements || []).length : 0,
        applicationHistory,
        feedback: studentFeedback
      });
    }

    // Get student applications with internship details
    const studentApplications = await Application
      .find({ studentId })
      .populate('internshipId', 'title company')
      .sort({ appliedAt: -1 });

    // Get student feedback
    const studentFeedback = await Feedback.find({ studentId });

    // Calculate application status breakdown
    const applicationsByStatus = {};
    studentApplications.forEach(app => {
      applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
    });

    // Calculate average rating from feedback
    let averageRating = 0;
    if (studentFeedback.length > 0) {
      const totalRating = studentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0);
      averageRating = Math.round((totalRating / studentFeedback.length) * 10) / 10;
    }

    // Extract skills developed
    const skillsSet = new Set();
    studentFeedback.forEach(f => {
      if (f.suggestions) {
        // Assuming skills developed are in suggestions field
        // This might need adjustment based on actual schema
        skillsSet.add(f.suggestions);
      }
    });

    const applicationHistory = studentApplications.map(app => ({
      id: app.id,
      internship: app.internshipId?.title || 'Unknown',
      company: app.internshipId?.company || 'Unknown',
      status: app.status,
      appliedAt: app.appliedAt
    }));

    // Get student details for skills and achievements
    const student = await Student.findOne({ id: studentId }).select('skills achievements');

    const analytics = {
      totalApplications: studentApplications.length,
      applicationsByStatus,
      averageRating,
      skillsDeveloped: Array.from(skillsSet), // Keep for backward compatibility
      skills: student ? student.skills : [], // Add profile skills
      totalBadges: student ? (student.achievements || []).length : 0,
      applicationHistory,
      feedback: studentFeedback
    };

    res.json(analytics);
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get monthly trends
async function getMonthlyTrends() {
  const monthlyResult = await Application.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$appliedAt' },
          month: { $month: '$appliedAt' },
          monthName: {
            $dateToString: {
              format: '%b %Y',
              date: '$appliedAt'
            }
          }
        },
        applications: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        month: '$_id.monthName',
        applications: 1
      }
    }
  ]);

  return monthlyResult;
}

// Helper function to get skills demand
function getSkillsDemand(internships) {
  const skillsMap = {};

  internships.forEach(internship => {
    internship.requiredSkills.forEach(skill => {
      skillsMap[skill] = (skillsMap[skill] || 0) + 1;
    });
  });

  return Object.entries(skillsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill, demand]) => ({ skill, demand }));
}

// Recruiter analytics (limited to their own internships)
router.get('/recruiter', requireHybridAuth, authorize('recruiter'), async (req, res) => {
  try {
    // Get only recruiter's internships
    const recruiterInternships = await Internship.find({
      $or: [
        { postedBy: req.user.id },
        { submittedBy: req.user.id }
      ]
    });

    const recruiterInternshipIds = recruiterInternships.map(i => i.id);

    // Get applications for recruiter's internships
    const recruiterApplicationsRaw = await Application
      .find({
        internshipId: { $in: recruiterInternshipIds }
      })
      .sort({ appliedAt: -1 })
      .lean();

    // Manually lookup student and internship data
    const recruiterApplications = await Promise.all(recruiterApplicationsRaw.map(async (app) => {
      const [student, internship] = await Promise.all([
        Student.findOne({ id: app.studentId }).select('name').lean(),
        Internship.findOne({ id: app.internshipId }).select('title company').lean()
      ]);
      return {
        ...app,
        studentId: student || { name: 'Unknown Student' },
        internshipId: internship || { title: 'Unknown Internship', company: 'Unknown Company' }
      };
    }));

    // Basic counts
    const totalInternships = recruiterInternships.length;
    const activeInternships = recruiterInternships.filter(i => i.status === 'active').length;
    const pendingInternships = recruiterInternships.filter(i => i.status === 'submitted').length;
    const totalApplications = recruiterApplications.length;

    // Application status breakdown using aggregation
    const applicationsByStatusResult = await Application.aggregate([
      {
        $match: { internshipId: { $in: recruiterInternshipIds } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          applied: { $sum: { $cond: { if: { $eq: ['$_id', 'applied'] }, then: '$count', else: 0 } } },
          pending_mentor_approval: { $sum: { $cond: { if: { $eq: ['$_id', 'pending_mentor_approval'] }, then: '$count', else: 0 } } },
          approved: { $sum: { $cond: { if: { $eq: ['$_id', 'approved'] }, then: '$count', else: 0 } } },
          rejected: { $sum: { $cond: { if: { $eq: ['$_id', 'rejected'] }, then: '$count', else: 0 } } },
          interview_scheduled: { $sum: { $cond: { if: { $eq: ['$_id', 'interview_scheduled'] }, then: '$count', else: 0 } } },
          interviewed: { $sum: { $cond: { if: { $eq: ['$_id', 'interviewed'] }, then: '$count', else: 0 } } },
          offered: { $sum: { $cond: { if: { $eq: ['$_id', 'offered'] }, then: '$count', else: 0 } } },
          accepted: { $sum: { $cond: { if: { $eq: ['$_id', 'accepted'] }, then: '$count', else: 0 } } },
          declined: { $sum: { $cond: { if: { $eq: ['$_id', 'declined'] }, then: '$count', else: 0 } } }
        }
      }
    ]);

    const applicationsByStatus = applicationsByStatusResult[0] || {
      applied: 0,
      pending_mentor_approval: 0,
      approved: 0,
      rejected: 0,
      interview_scheduled: 0,
      interviewed: 0,
      offered: 0,
      accepted: 0,
      declined: 0
    };

    // Applications per internship
    const applicationsByInternship = recruiterInternships.map(internship => {
      const internshipApps = recruiterApplications.filter(app =>
        (app.internshipId?.id || app.internshipId) === internship.id
      );
      return {
        internshipId: internship.id,
        title: internship.title,
        totalApplications: internshipApps.length,
        approvedApplications: internshipApps.filter(app => app.status === 'approved').length,
        rejectedApplications: internshipApps.filter(app => app.status === 'rejected').length
      };
    });

    // Recent activities (last 10 applications to recruiter's internships)
    const recentActivities = recruiterApplications
      .slice(0, 10)
      .map(app => ({
        id: app.id,
        student: app.studentId?.name || 'Unknown Student',
        internship: app.internshipId?.title || 'Unknown Internship',
        status: app.status,
        appliedAt: app.appliedAt
      }));

    // Performance metrics
    const performanceMetrics = {
      averageApplicationsPerInternship: totalInternships > 0 ? Math.round(totalApplications / totalInternships) : 0,
      approvalRate: totalApplications > 0 ? Math.round((applicationsByStatus.approved / totalApplications) * 100) : 0,
      responseTime: await calculateAverageResponseTime(recruiterApplications)
    };

    // Monthly trends for recruiter
    const monthlyTrendsForRecruiter = await Application.aggregate([
      {
        $match: { internshipId: { $in: recruiterInternshipIds } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' },
            monthName: {
              $dateToString: {
                format: '%b %Y',
                date: '$appliedAt'
              }
            }
          },
          applications: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.monthName',
          applications: 1
        }
      }
    ]);

    const analytics = {
      overview: {
        totalInternships,
        activeInternships,
        pendingInternships,
        totalApplications
      },
      applicationsByStatus,
      applicationsByInternship,
      recentActivities,
      performanceMetrics,
      monthlyTrends: monthlyTrendsForRecruiter
    };

    res.json(analytics);
  } catch (error) {
    console.error('Recruiter analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate average response time
async function calculateAverageResponseTime(applications) {
  if (!applications.length) return 0;

  const applicationIds = applications.map(app => app.id);

  const responseTimeResult = await Application.aggregate([
    {
      $match: {
        id: { $in: applicationIds },
        status: { $ne: 'applied' },
        processedAt: { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        averageResponseTime: {
          $avg: {
            $divide: [
              { $subtract: ['$processedAt', '$appliedAt'] },
              1000 * 60 * 60 // Convert ms to hours
            ]
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const result = responseTimeResult[0];
  return result ? Math.round(result.averageResponseTime) : 0;
}

module.exports = router;
