const express = require('express');
const multer = require('multer');
const path = require('path');
const { authorize, verifyStudentAccess } = require('../middleware/auth');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const { Student, Application, Internship } = require('../models');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicId } = require('../utils/cloudinary');
const router = express.Router();

// Configure multer for memory storage (temporary - will upload to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Configure multer for PDF resume uploads
const pdfUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Create a new student (admin only)
router.post('/', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      semester = 1,
      cgpa = 0,
      skills = [],
      resumeLink = '',
      phone = '',
      address = '',
      dateOfBirth = '',
      profilePicture = ''
    } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ error: 'name, email, and department are required' });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    const studentCount = await Student.countDocuments();
    const newStudent = new Student({
      id: `STU${String(studentCount + 1).padStart(3, '0')}`,
      name,
      email,
      password: '$2a$10$example.hash.here',
      role: 'student',
      department,
      semester: parseInt(semester),
      cgpa: parseFloat(cgpa),
      skills: Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean),
      resumeLink,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      profilePicture,
      projects: [],
      achievements: [],
      isPlaced: false,
      placementStatus: 'active'
    });

    await newStudent.save();
    const { password, ...rest } = newStudent.toObject();
    res.status(201).json({ message: 'Student created', student: rest });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quick demo route to add a test student (development only)
router.post('/demo-add', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const testStudent = new Student({
      id: `STU${String(count + 1).padStart(3, '0')}`,
      name: req.body.name || `Test Student ${count + 1}`,
      email: req.body.email || `test${count + 1}@college.edu`,
      password: '$2a$10$example.hash.here',
      role: 'student',
      department: req.body.department || 'Computer Science',
      semester: parseInt(req.body.semester || 5),
      cgpa: parseFloat(req.body.cgpa || 7.5),
      skills: req.body.skills || ['JavaScript', 'React'],
      resumeLink: req.body.resumeLink || 'https://example.com/resume.pdf',
      phone: req.body.phone || '+91-9000000000',
      address: req.body.address || 'Demo Address',
      dateOfBirth: new Date(req.body.dateOfBirth || '2002-01-01'),
      profilePicture: req.body.profilePicture || '',
      projects: [],
      achievements: [],
      isPlaced: false,
      placementStatus: 'active'
    });
    await testStudent.save();
    const { password, ...rest } = testStudent.toObject();
    res.status(201).json({ message: 'Demo student added', student: rest });
  } catch (err) {
    console.error('Demo add error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all students (admin/mentor/recruiter only)
router.get('/', requireHybridAuth, authorize('admin', 'mentor', 'recruiter'), verifyStudentAccess, async (req, res) => {
  try {
    const { department, semester, skills, cgpa } = req.query;

    // Build query filter
    let query = {};

    // For recruiters, only show students who applied to their internships
    if (req.user.role === 'recruiter' && req.allowedStudents) {
      query.id = { $in: req.allowedStudents };
    }

    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (cgpa) query.cgpa = { $gte: parseFloat(cgpa) };
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    const students = await Student.find(query).select('-password').lean();

    // Add application context for recruiters
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      if (req.user.role === 'recruiter' && req.allowedStudents) {
        try {
          const studentApplications = await Application.find({
            studentId: student.id,
            internshipId: { $in: req.recruiterInternships }
          }).lean();

          const applicationContext = await Promise.all(studentApplications.map(async (app) => {
            const internship = await Internship.findOne({ id: app.internshipId }).select('title').lean();
            return {
              internshipId: app.internshipId,
              internshipTitle: internship?.title || 'Unknown',
              applicationStatus: app.status,
              appliedAt: app.appliedAt
            };
          }));

          student.applicationContext = applicationContext;
        } catch (error) {
          console.error('Error adding application context:', error);
          student.applicationContext = [];
        }
      }
      return student;
    }));

    res.json({ students: enrichedStudents, total: enrichedStudents.length });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student profile
router.get('/profile', requireHybridAuth, authorize('student'), (req, res) => {
  try {
    const { password, ...studentData } = req.user;
    res.json(studentData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile picture
router.post('/upload-profile-picture', requireHybridAuth, authorize('student'), upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to base64 for Cloudinary upload
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(dataURI, {
      folder: 'campus_buddy/profile_pictures',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    if (!uploadResult.success) {
      return res.status(500).json({ error: 'Failed to upload to cloud storage' });
    }

    // Delete old profile picture from Cloudinary if exists
    if (req.user.profilePicture) {
      const oldPublicId = extractPublicId(req.user.profilePicture);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId, 'image');
      }
    }

    // Update student's profile picture in database
    const updatedStudent = await Student.findOneAndUpdate(
      { id: req.user.id },
      {
        profilePicture: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId
      },
      { new: true }
    );

    res.json({
      message: 'Profile picture uploaded successfully',
      imageUrl: uploadResult.url
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Update student profile
router.put('/profile', requireHybridAuth, authorize('student'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id; // Don't allow ID changes
    delete updateData.email; // Don't allow email changes
    delete updateData.role; // Don't allow role changes
    updateData.updatedAt = new Date();

    const updatedStudent = await Student.findOneAndUpdate(
      { id: req.user.id },
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Profile updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload PDF resume (student only) - Only 1 resume allowed per student
router.post('/upload-pdf-resume', requireHybridAuth, authorize('student'), pdfUpload.single('pdfResume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student already has a resume
    if (student.pdfResumes && student.pdfResumes.length > 0) {
      return res.status(400).json({ error: 'You can only upload one resume. Please delete the existing resume first.' });
    }

    // Convert buffer to base64 for Cloudinary upload
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(dataURI, {
      folder: 'campus_buddy/resumes',
      resource_type: 'raw', // For PDFs
      public_id: `resume_${student.id}_${Date.now()}`
    });

    if (!uploadResult.success) {
      return res.status(500).json({ error: 'Failed to upload to cloud storage' });
    }

    // Add the PDF resume to the student's pdfResumes array
    const resumeData = {
      filename: uploadResult.publicId,
      originalName: req.file.originalname,
      filePath: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      fileSize: req.file.size,
      uploadedAt: new Date()
    };

    student.pdfResumes.push(resumeData);

    // Extract skills from PDF
    let extractedSkills = [];
    let extractedText = '';
    try {
      const { PDFParse } = require('pdf-parse');
      const pdfParser = new PDFParse({ data: req.file.buffer });
      const data = await pdfParser.getText();
      extractedText = data.text;

      // Common technical skills to look for (Regex fallback)
      const COMMON_SKILLS = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'TypeScript',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
        'HTML', 'CSS', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
        'Machine Learning', 'Deep Learning', 'Data Analysis', 'TensorFlow', 'PyTorch',
        'Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Time Management',
        // Added from User Resume (Explicit)
        'OpenCV', 'Pandas', 'Panda', 'Streamlit'
      ];

      // Extract skills using Regex
      COMMON_SKILLS.forEach(skill => {
        // Escape special characters in skill name
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Check if skill starts/ends with word character to determine if \b is needed
        const startsWithWord = /^\w/.test(skill);
        const endsWithWord = /\w$/.test(skill);

        let pattern = escapedSkill;
        if (startsWithWord) pattern = `\\b${pattern}`;
        if (endsWithWord) pattern = `${pattern}\\b`;

        // For C++ and C#, we want to ensure they are not part of a larger word if possible, 
        // but \b won't work. We can look for whitespace or punctuation or EOL.
        // However, the simple boundary check above is a good improvement over the previous broken one.

        const regex = new RegExp(pattern, 'i');
        if (regex.test(extractedText)) {
          extractedSkills.push(skill);
        }
      });

      // Update student skills
      if (extractedSkills.length > 0) {
        const currentSkills = student.skills || [];
        // Merge and deduplicate (case-insensitive)
        const newSkills = [...currentSkills];
        extractedSkills.forEach(skill => {
          if (!newSkills.some(existing => existing.toLowerCase() === skill.toLowerCase())) {
            newSkills.push(skill);
          }
        });
        student.skills = newSkills;
      }
    } catch (extractionError) {
      console.error('Skill extraction failed:', extractionError);
      // Continue even if extraction fails
    }

    await student.save();

    res.json({
      message: 'PDF resume uploaded successfully',
      resume: resumeData
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get student's PDF resumes (student only)
router.get('/my-pdf-resumes', requireHybridAuth, authorize('student'), async (req, res) => {
  try {
    // Handle both MongoDB _id and custom id field
    let student;
    if (req.user._id) {
      student = await Student.findById(req.user._id).select('pdfResumes');
    }
    if (!student && req.user.id) {
      student = await Student.findOne({ id: req.user.id }).select('pdfResumes');
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ resumes: student.pdfResumes || [] });
  } catch (error) {
    console.error('Get PDF resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Delete PDF resume (student only)
router.delete('/pdf-resume/:resumeId', requireHybridAuth, authorize('student'), async (req, res) => {
  try {
    const { resumeId } = req.params;
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const resumeIndex = student.pdfResumes.findIndex(r => r._id.toString() === resumeId);
    if (resumeIndex === -1) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Remove from database
    const deletedResume = student.pdfResumes[resumeIndex];
    student.pdfResumes.splice(resumeIndex, 1);
    await student.save();

    // Delete from Cloudinary
    if (deletedResume.cloudinaryPublicId) {
      await deleteFromCloudinary(deletedResume.cloudinaryPublicId, 'raw');
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete PDF resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Get student directory with pagination, search, and filters (admin/recruiter/mentor only)
router.get('/directory', requireHybridAuth, authorize('admin', 'recruiter', 'mentor'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      department = '',
      semester = '',
      skills = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query filter
    let query = {};

    // Search by name, email, or department
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Filter by semester
    if (semester) {
      query.semester = parseInt(semester);
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    // Fetch students with pagination
    const students = await Student.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get resume count for each student
    const { Resume } = require('../models');
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      const resumeCount = await Resume.countDocuments({ userId: student._id });
      const latestResume = await Resume.findOne({ userId: student._id })
        .sort({ lastModified: -1 })
        .select('_id title')
        .lean();

      return {
        _id: student._id,
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        year: student.year,
        semester: student.semester,
        cgpa: student.cgpa,
        profilePicture: student.profilePicture,
        skills: student.skills || [],
        resumeCount,
        latestResumeId: latestResume?._id || null,
        latestResumeTitle: latestResume?.title || null,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      };
    }));

    res.json({
      success: true,
      students: enrichedStudents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Student directory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student directory'
    });
  }
});

// Get single student by ID (admin/recruiter/mentor only)
router.get('/:id', requireHybridAuth, authorize('admin', 'recruiter', 'mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    let student;
    // Try to find by MongoDB _id first
    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id).select('-password').lean();
    }
    // If not found, try to find by custom id field (STU001, etc.)
    if (!student) {
      student = await Student.findOne({ id }).select('-password').lean();
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;