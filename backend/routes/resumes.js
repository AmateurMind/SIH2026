const express = require('express');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const { Student, Resume } = require('../models');
const router = express.Router();

// Get student resume - generates PDF on-the-fly from MongoDB data
router.get('/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;

    let student;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }
    if (!student) {
      student = await Student.findOne({ id: studentId });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Role-based access control
    const canAccess = checkResumeAccess(req.user, student);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions to view this resume.' });
    }

    // Fetch the latest resume for this student
    const resume = await Resume.findOne({ userId: student._id }).sort({ lastModified: -1 });

    // Generate PDF resume on-the-fly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${student.name.replace(/\s+/g, '_')}_resume.pdf"`);
    res.setHeader('Cache-Control', 'private, no-cache');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Use resume data if available, otherwise fallback to student profile data
    const data = resume || {
      personalInfo: {
        fullName: student.name,
        email: student.email,
        phone: student.phone,
        location: student.address
      },
      education: [{
        degree: 'Bachelor of Technology',
        fieldOfStudy: student.department,
        description: `Semester: ${student.semester}, CGPA: ${student.cgpa}`
      }],
      skills: student.skills || [],
      projects: [],
      achievements: []
    };

    // Header
    doc.fontSize(28).fillColor('#2563eb').text(data.personalInfo.fullName || student.name, { align: 'center' });
    doc.fontSize(16).fillColor('#6b7280').text(data.personalInfo.email || student.email, { align: 'center' });
    doc.fontSize(14).text(data.personalInfo.phone || student.phone || 'Phone not provided', { align: 'center' });
    doc.moveDown(2);

    // Personal Information
    doc.fontSize(18).fillColor('#1f2937').text('Personal Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#374151');

    if (resume) {
      if (data.personalInfo.location) doc.text(`Location: ${data.personalInfo.location}`);
      if (data.personalInfo.linkedIn) doc.text(`LinkedIn: ${data.personalInfo.linkedIn}`);
      if (data.personalInfo.website) doc.text(`Website: ${data.personalInfo.website}`);
    } else {
      doc.text(`Department: ${student.department}`);
      doc.text(`Semester: ${student.semester}`);
      doc.text(`CGPA: ${student.cgpa}`);
      if (student.address) doc.text(`Address: ${student.address}`);
    }
    doc.moveDown(1.5);

    // Education
    if (data.education && data.education.length > 0) {
      doc.fontSize(18).fillColor('#1f2937').text('Education', { underline: true });
      doc.moveDown(0.5);
      data.education.forEach(edu => {
        doc.fontSize(14).fillColor('#2563eb').text(edu.institution || 'University');
        doc.fontSize(12).fillColor('#374151');
        doc.text(`${edu.degree} in ${edu.fieldOfStudy}`);
        if (edu.startDate || edu.endDate) doc.text(`${edu.startDate || ''} - ${edu.endDate || 'Present'}`);
        if (edu.gpa) doc.text(`GPA: ${edu.gpa}`);
        if (edu.description) doc.text(edu.description);
        doc.moveDown(0.5);
      });
      doc.moveDown(1);
    }

    // Skills
    const skills = data.skills || student.skills;
    if (skills && skills.length > 0) {
      doc.fontSize(18).fillColor('#1f2937').text('Technical Skills', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#374151');
      const skillsText = Array.isArray(skills) ? skills.join(', ') : skills;
      doc.text(skillsText, { width: 500, lineGap: 2 });
      doc.moveDown(1.5);
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
      doc.fontSize(18).fillColor('#1f2937').text('Projects', { underline: true });
      doc.moveDown(0.5);

      data.projects.forEach((project, index) => {
        doc.fontSize(14).fillColor('#2563eb').text(project.title);
        doc.fontSize(12).fillColor('#374151');
        if (project.description) doc.text(project.description, { width: 500 });
        if (project.technologies && project.technologies.length > 0) {
          doc.text(`Technologies: ${project.technologies.join(', ')}`, { width: 500 });
        }
        if (project.githubLink) {
          doc.fillColor('#2563eb').text(`GitHub: ${project.githubLink}`, { link: project.githubLink });
        }
        if (index < data.projects.length - 1) doc.moveDown(1);
      });
      doc.moveDown(1.5);
    }

    // Achievements
    if (data.achievements && data.achievements.length > 0) {
      doc.fontSize(18).fillColor('#1f2937').text('Achievements', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#374151');

      data.achievements.forEach((achievement, index) => {
        doc.text(`• ${achievement}`);
      });
      doc.moveDown(1.5);
    }

    // Footer
    doc.fontSize(10).fillColor('#9ca3af');
    doc.text(`Generated on ${new Date().toLocaleDateString()} via Campus Placement Portal`, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user can access student's resume
function checkResumeAccess(user, targetStudent) {
  switch (user.role) {
    case 'student':
      // Students can only view their own resume
      return user._id.toString() === targetStudent._id.toString();

    case 'admin':
    case 'mentor':
    case 'recruiter':
      return true;

    default:
      return false;
  }
}

// Get student basic info (for resume access verification)
router.get('/:studentId/info', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;

    let student;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }
    if (!student) {
      student = await Student.findOne({ id: studentId });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Role-based access control
    const canAccess = checkResumeAccess(req.user, student);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if resume exists in MongoDB
    const resumeCount = await Resume.countDocuments({ userId: student._id });

    // Return basic info needed for resume viewing
    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      cgpa: student.cgpa,
      hasResume: resumeCount > 0
    });

  } catch (error) {
    console.error('Error fetching student info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;