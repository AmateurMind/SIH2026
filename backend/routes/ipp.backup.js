const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const { sendEvaluationRequestEmail, sendStudentNotificationEmail } = require('../utils/emailService');
const { generateCertificate, generateQRCode } = require('../utils/certificateGenerator');
const { uploadToCloudinary } = require('../utils/cloudinary');
const Student = require('../models/Student');

console.log('🔵 IPP Routes module loaded (JSON File System)');
console.log('🔵 Defining IPP routes...');

// Data Paths
const ippsPath = path.join(__dirname, '../data/ipps.json');
const applicationsPath = path.join(__dirname, '../data/applications.json');
const internshipsPath = path.join(__dirname, '../data/internships.json');
const studentsPath = path.join(__dirname, '../data/students.json');

// File upload configuration for IPP documents
const ippDocumentUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const isPdf = file.mimetype === 'application/pdf';
        const isImage = file.mimetype && file.mimetype.startsWith('image/');
        if (isPdf || isImage) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF or image files are allowed'));
        }
    }
});

const ippUploadMiddleware = (req, res, next) => {
    const uploader = ippDocumentUpload.single('document');
    uploader(req, res, (err) => {
        if (err) {
            const isFileSizeError = err.code === 'LIMIT_FILE_SIZE';
            const statusCode = isFileSizeError || err.message === 'Only PDF or image files are allowed' ? 400 : 500;
            const message = isFileSizeError ? 'File size must be less than 10MB' : err.message;
            return res.status(statusCode).json({ error: message });
        }
        next();
    });
};

// Helper functions to read/write data
const readIPPs = () => {
    if (!fs.existsSync(ippsPath)) return [];
    return JSON.parse(fs.readFileSync(ippsPath, 'utf8'));
};
const writeIPPs = (data) => fs.writeFileSync(ippsPath, JSON.stringify(data, null, 2));

const readApplications = () => JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
const writeApplications = (data) => fs.writeFileSync(applicationsPath, JSON.stringify(data, null, 2));

const readInternships = () => JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));

const readStudents = () => JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
const writeStudents = (data) => fs.writeFileSync(studentsPath, JSON.stringify(data, null, 2));

// Helper function to generate unique IPP ID
const generateIPPId = (studentId, internshipId) => {
    const year = new Date().getFullYear();
    return `IPP-${studentId}-${internshipId}-${year}`;
};

// Helper function to generate magic link token
const generateMagicToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Helper function to calculate overall rating
const calculateOverallRating = (companyEval, facultyAssessment) => {
    let totalScore = 0;
    let count = 0;

    // Technical skills average
    if (companyEval?.technicalSkills) {
        const techSkills = Object.values(companyEval.technicalSkills).filter(v => v);
        if (techSkills.length > 0) {
            totalScore += techSkills.reduce((a, b) => a + b, 0) / techSkills.length;
            count++;
        }
    }

    // Soft skills average
    if (companyEval?.softSkills) {
        const softSkills = Object.values(companyEval.softSkills).filter(v => v);
        if (softSkills.length > 0) {
            totalScore += softSkills.reduce((a, b) => a + b, 0) / softSkills.length;
            count++;
        }
    }

    // Faculty learning outcomes
    if (facultyAssessment?.learningOutcomes) {
        const learning = Object.values(facultyAssessment.learningOutcomes).filter(v => typeof v === 'number');
        if (learning.length > 0) {
            totalScore += learning.reduce((a, b) => a + b, 0) / learning.length;
            count++;
        }
    }

    return count > 0 ? (totalScore / count).toFixed(2) : 0;
};

// Helper function to calculate performance grade
const calculateGrade = (rating) => {
    if (rating >= 9.5) return 'A+';
    if (rating >= 9) return 'A';
    if (rating >= 8.5) return 'B+';
    if (rating >= 8) return 'B';
    if (rating >= 7.5) return 'C+';
    if (rating >= 7) return 'C';
    if (rating >= 6) return 'D';
    return 'F';
};

// Helper function to calculate academic grade from rating (O, A+, A, etc.)
const calculateAcademicGrade = (rating) => {
    const score = parseFloat(rating);
    if (score >= 9.0) return 'O'; // Outstanding
    if (score >= 8.5) return 'A+'; // Excellent
    if (score >= 8.0) return 'A'; // Very Good
    if (score >= 7.5) return 'B+'; // Good
    if (score >= 7.0) return 'B'; // Above Average
    if (score >= 6.0) return 'C'; // Average
    if (score >= 5.0) return 'P'; // Pass
    return 'F'; // Fail
};

// Test route to verify router is working
router.get('/test', (req, res) => {
    res.json({ message: 'IPP router is working (JSON Mode)!' });
});

// Upload supporting document (images/PDF) for IPP submission
router.post('/:ippId/upload-document', requireHybridAuth, ippUploadMiddleware, async (req, res) => {
    try {
        const { ippId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const ipps = readIPPs();
        const ipp = ipps.find(i => i.ippId === ippId);

        if (!ipp) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        const isStudentOwner = req.user.role === 'student' && ipp.studentId === req.user.id;
        const isPrivilegedRole = ['admin', 'mentor', 'faculty'].includes(req.user.role);

        if (!isStudentOwner && !isPrivilegedRole) {
            return res.status(403).json({ error: 'You are not allowed to upload documents for this IPP' });
        }

        const base64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64}`;

        const safeIppId = ippId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';

        const uploadResult = await uploadToCloudinary(dataURI, {
            folder: `campus_buddy/ipp_documents/${safeIppId}`,
            resource_type: resourceType,
            public_id: `doc_${Date.now()}`
        });

        if (!uploadResult.success) {
            return res.status(500).json({
                error: 'Failed to upload document',
                details: uploadResult.error
            });
        }

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            fileUrl: uploadResult.url,
            publicId: uploadResult.publicId,
            resourceType: uploadResult.resourceType,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
            originalName: req.file.originalname
        });
    } catch (error) {
        console.error('Error uploading IPP document:', error);
        const statusCode = error.message === 'Only PDF or image files are allowed' ? 400 : 500;
        res.status(statusCode).json({ error: 'Failed to upload document', details: error.message });
    }
});

// 1. CREATE IPP - Initialize new IPP (Student-initiated or Admin)
router.post('/create', requireHybridAuth, async (req, res) => {
    console.log('📝 IPP Create endpoint hit');
    console.log('User:', req.user);
    console.log('Body:', req.body);

    try {
        const { studentId, internshipId, applicationId } = req.body;
        const resolvedStudentId = studentId || req.user?.id;

        const applications = readApplications();
        const internships = readInternships();
        const ipps = readIPPs();
        const students = readStudents();

        const eligibleStatuses = new Set(['accepted', 'offered', 'approved', 'selected']);
        let applicationIndex = -1;
        let application = null;

        if (applicationId) {
            applicationIndex = applications.findIndex(app => app.id === applicationId);
            application = applicationIndex !== -1 ? applications[applicationIndex] : null;
        }

        if (!application) {
            applicationIndex = applications.findIndex(app =>
                app.studentId === resolvedStudentId &&
                app.internshipId === internshipId &&
                eligibleStatuses.has((app.status || '').toLowerCase())
            );
            application = applicationIndex !== -1 ? applications[applicationIndex] : null;
        }

        if (!application) {
            return res.status(404).json({
                error: 'Application not found',
                message: 'Please ensure you have an accepted/offered application for this internship before creating an IPP.'
            });
        }

        const resolvedApplicationId = application.id;

        // Get internship details
        const internship = internships.find(i => i.id === internshipId);
        if (!internship) {
            return res.status(404).json({ error: 'Internship not found' });
        }

        // Check if IPP already exists
        const existingIPP = ipps.find(ipp => ipp.studentId === studentId && ipp.internshipId === internshipId);
        if (existingIPP) {
            return res.status(400).json({ error: 'IPP already exists for this internship' });
        }

        // Generate unique IPP ID
        if (!resolvedStudentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        const ippId = generateIPPId(resolvedStudentId, internshipId);

        // Create new IPP
        const newIPP = {
            ippId,
            studentId: resolvedStudentId,
            internshipId,
            applicationId: resolvedApplicationId,
            internshipDetails: {
                company: internship.company,
                role: internship.title,
                domain: internship.eligibleDepartments?.[0] || 'General',
                startDate: application.internshipStartDate || internship.startDate,
                endDate: application.internshipCompletionDate || new Date().toISOString(),
                duration: internship.duration,
                location: internship.location,
                workMode: internship.workMode
            },
            status: 'pending_mentor_eval',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        ipps.push(newIPP);
        writeIPPs(ipps);

        // Update application
        applications[applicationIndex] = {
            ...application,
            ippStatus: 'in_progress',
            ippId: ippId,
            updatedAt: new Date().toISOString()
        };
        writeApplications(applications);

        // Update student
        const studentIndex = students.findIndex(s => s.id === resolvedStudentId);
        if (studentIndex !== -1) {
            const student = students[studentIndex];
            if (!student.internshipPassports) {
                student.internshipPassports = [];
            }
            student.internshipPassports.push(ippId);
            writeStudents(students);
        }

        res.status(201).json({
            success: true,
            message: 'IPP created successfully',
            ippId,
            data: newIPP
        });

    } catch (error) {
        console.error('Error creating IPP:', error);
        res.status(500).json({ error: 'Failed to create IPP', details: error.message });
    }
});

// 1.5 GET ALL IPPs (Admin/Faculty) - with optional status filter
router.get('/', requireHybridAuth, async (req, res) => {
    try {
        const { status } = req.query;
        let ipps = readIPPs();
        const jsonStudents = readStudents();

        if (status) {
            ipps = ipps.filter(ipp => ipp.status === status);
        }

        // Get MongoDB students as well (for Clerk users)
        let mongoStudents = [];
        try {
            mongoStudents = await Student.find({}).lean();
        } catch (err) {
            console.log('MongoDB not available, using JSON students only');
        }

        // Merge students from both sources
        const studentsMap = {};
        jsonStudents.forEach(s => { studentsMap[s.id] = s; });
        mongoStudents.forEach(s => { studentsMap[s.id] = s; });

        // Populate student details for each IPP
        ipps = ipps.map(ipp => {
            const student = studentsMap[ipp.studentId];
            return {
                ...ipp,
                studentDetails: student ? {
                    name: student.name || (student.firstName ? student.firstName + ' ' + (student.lastName || '') : ''),
                    email: student.email,
                    department: student.department,
                    semester: student.semester,
                    enrollmentNumber: student.enrollmentNumber || student.rollNumber
                } : { name: 'Unknown Student', email: '' }
            };
        });

        // Sort by updatedAt desc
        ipps.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.json({
            success: true,
            count: ipps.length,
            data: ipps
        });
    } catch (error) {
        console.error('Error fetching all IPPs:', error);
        res.status(500).json({ error: 'Failed to fetch IPPs', details: error.message });
    }
});

// 2. GET IPP by ID
router.get('/:ippId', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const ipps = readIPPs();

        // Validate IPP ID format
        if (!ippId || ippId.length < 10 || !ippId.includes('-')) {
            return res.status(400).json({
                error: 'Invalid IPP ID format',
                message: 'IPP ID should follow format: IPP-{studentId}-{internshipId}-{year}'
            });
        }

        const ipp = ipps.find(i => i.ippId === ippId);
        if (!ipp) {
            return res.status(404).json({
                error: 'IPP not found',
                message: `No IPP found with ID: ${ippId}`
            });
        }

        res.json({ success: true, data: ipp });

    } catch (error) {
        console.error('Error fetching IPP:', error);
        res.status(500).json({ error: 'Failed to fetch IPP', details: error.message });
    }
});

// 3. GET all IPPs for a student
router.get('/student/:studentId', requireHybridAuth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const ipps = readIPPs();

        const studentIPPs = ipps.filter(ipp => ipp.studentId === studentId);
        studentIPPs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: studentIPPs.length,
            data: studentIPPs
        });

    } catch (error) {
        console.error('Error fetching student IPPs:', error);
        res.status(500).json({ error: 'Failed to fetch IPPs', details: error.message });
    }
});

// 4. SEND EVALUATION REQUEST - Generate magic link for company mentor
router.post('/:ippId/send-evaluation-request', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const { mentorEmail, mentorName } = req.body;

        const ipps = readIPPs();
        const ippIndex = ipps.findIndex(i => i.ippId === ippId);

        if (ippIndex === -1) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        const ipp = ipps[ippIndex];

        // Generate magic link token (valid for 7 days)
        const token = generateMagicToken();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        ipp.mentorAccessToken = token;
        ipp.mentorAccessTokenExpiry = expiryDate.toISOString();

        // Pre-populate mentor details
        if (!ipp.companyMentorEvaluation) {
            ipp.companyMentorEvaluation = {
                mentorEmail,
                mentorName
            };
        }

        // Update IPP
        ipps[ippIndex] = ipp;
        writeIPPs(ipps);

        // Get student details for email
        const students = readStudents();
        const student = students.find(s => s.id === ipp.studentId);

        // For mentors, use SuperAdmin URL (localhost:5174 in development)
        const superAdminUrl = process.env.SUPERADMIN_URL || 'http://localhost:5174';
        const magicLink = `${superAdminUrl}/mentor/evaluate/${ippId}?token=${token}&email=${encodeURIComponent(mentorEmail)}&name=${encodeURIComponent(mentorName)}`;

        try {
            // Send email to mentor
            await sendEvaluationRequestEmail(
                mentorEmail,
                mentorName,
                magicLink,
                student?.name || 'Student',
                ipp.internshipDetails?.company || 'Company',
                ipp.internshipDetails?.role || 'Internship Role'
            );

            console.log('Evaluation request email sent to:', mentorEmail);

        } catch (emailError) {
            console.error('Failed to send email, but IPP created:', emailError);
        }

        res.json({
            success: true,
            message: 'Evaluation request sent successfully',
            magicLink // Keep for debugging, remove in production
        });

    } catch (error) {
        console.error('Error sending evaluation request:', error);
        res.status(500).json({ error: 'Failed to send request', details: error.message });
    }
});

// 5. SUBMIT COMPANY MENTOR EVALUATION (uses magic link token)
router.put('/:ippId/company-evaluation', async (req, res) => {
    try {
        const { ippId } = req.params;
        const { token, evaluation } = req.body;

        const ipps = readIPPs();
        const ippIndex = ipps.findIndex(i => i.ippId === ippId);

        if (ippIndex === -1) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        const ipp = ipps[ippIndex];

        // Verify magic link token
        if (ipp.mentorAccessToken !== token) {
            return res.status(401).json({
                error: 'Invalid or expired evaluation link',
                message: 'This evaluation link is not valid. Please contact the placement cell for a new link.'
            });
        }

        if (new Date() > new Date(ipp.mentorAccessTokenExpiry)) {
            return res.status(401).json({
                error: 'Evaluation link has expired',
                message: 'This evaluation link has expired. Please contact the placement cell for a new link.',
                expiredAt: ipp.mentorAccessTokenExpiry
            });
        }

        // Update company mentor evaluation
        ipp.companyMentorEvaluation = {
            ...ipp.companyMentorEvaluation,
            ...evaluation,
            submittedAt: new Date().toISOString()
        };

        if (!ipp.verification) ipp.verification = {};
        ipp.verification.companyVerified = true;
        ipp.verification.companyVerifiedBy = evaluation.mentorEmail;
        ipp.verification.companyVerifiedAt = new Date().toISOString();

        // Update status
        ipp.status = 'pending_student_submission';

        ipps[ippIndex] = ipp;
        writeIPPs(ipps);

        res.json({
            success: true,
            message: 'Evaluation submitted successfully',
            data: ipp
        });

    } catch (error) {
        console.error('Error submitting evaluation:', error);
        res.status(500).json({ error: 'Failed to submit evaluation', details: error.message });
    }
});

// 6. SUBMIT STUDENT DOCUMENTATION
router.put('/:ippId/student-submission', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const { submission } = req.body;

        const ipps = readIPPs();
        const ippIndex = ipps.findIndex(i => i.ippId === ippId);

        if (ippIndex === -1) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        const ipp = ipps[ippIndex];

        // Update student submission
        ipp.studentSubmission = {
            ...ipp.studentSubmission,
            ...submission,
            submittedAt: new Date().toISOString()
        };

        // Auto-approve since we have both mentor evaluation and student submission
        ipp.status = 'verified';

        // Calculate overall rating from mentor evaluation
        const overallRating = calculateOverallRating(ipp.companyMentorEvaluation, null);
        ipp.summary = {
            overallRating: parseFloat(overallRating),
            performanceGrade: calculateAcademicGrade(overallRating),
            employabilityScore: Math.round(parseFloat(overallRating) * 10),
            completedAt: new Date().toISOString()
        };

        // Generate certificate automatically
        try {
            const students = readStudents();
            const student = students.find(s => s.id === ipp.studentId);
            const ippWithStudent = { ...ipp, studentDetails: { name: student?.name || 'Student' } };

            const certificateResult = await generateCertificate(ippWithStudent);
            const qrCodeDataURL = await generateQRCode(certificateResult.certificateId, ippId);

            ipp.certificate = {
                certificateId: certificateResult.certificateId,
                certificateUrl: certificateResult.downloadUrl,
                qrCode: qrCodeDataURL,
                generatedAt: new Date().toISOString()
            };
        } catch (certError) {
            console.error('Error generating certificate:', certError);
        }

        ipps[ippIndex] = ipp;
        writeIPPs(ipps);

        // Send notification email to student
        try {
            const students = readStudents();
            const student = students.find(s => s.id === ipp.studentId);
            if (student?.email) {
                await sendStudentNotificationEmail(
                    student.email,
                    student.name,
                    ippId,
                    'verified'
                );
            }
        } catch (emailError) {
            console.error('Failed to send student notification email:', emailError);
        }

        res.json({
            success: true,
            message: 'Submission successful! Your IPP has been verified and certificate generated.',
            data: ipp
        });

    } catch (error) {
        console.error('Error submitting student documentation:', error);
        res.status(500).json({ error: 'Failed to submit', details: error.message });
    }
});

// 7. SUBMIT FACULTY ASSESSMENT
router.put('/:ippId/faculty-assessment', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const { assessment } = req.body;

        const ipps = readIPPs();
        const ippIndex = ipps.findIndex(i => i.ippId === ippId);

        if (ippIndex === -1) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        const ipp = ipps[ippIndex];

        // Update faculty assessment
        ipp.facultyMentorAssessment = {
            ...ipp.facultyMentorAssessment,
            ...assessment,
            submittedAt: new Date().toISOString()
        };

        if (!ipp.verification) ipp.verification = {};
        ipp.verification.facultyApproved = true;
        ipp.verification.facultyApprovedBy = req.user.id;
        ipp.verification.facultyApprovedAt = new Date().toISOString();

        // If approved, move to verified status
        if (assessment.approvalStatus === 'approved') {
            ipp.status = 'verified';
            ipp.verification.finalStatus = 'verified';
        } else {
            ipp.status = 'pending_student_submission'; // Send back to student
            ipp.verification.finalStatus = 'rejected';
        }

        ipps[ippIndex] = ipp;
        writeIPPs(ipps);

        res.json({
            success: true,
            message: 'Assessment submitted successfully',
            data: ipp
        });

    } catch (error) {
        console.error('Error submitting faculty assessment:', error);
        res.status(500).json({ error: 'Failed to submit assessment', details: error.message });
    }
});

// 8. VERIFY & PUBLISH IPP (Final step - generates certificate, QR, etc.)
router.post('/:ippId/verify', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;

        const ipps = readIPPs();
        const ippIndex = ipps.findIndex(i => i.ippId === ippId);

        if (ippIndex === -1) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        const ipp = ipps[ippIndex];

        // Calculate summary
        const overallRating = calculateOverallRating(
            ipp.companyMentorEvaluation,
            ipp.facultyMentorAssessment
        );

        ipp.summary = {
            overallRating: parseFloat(overallRating),
            performanceGrade: calculateGrade(parseFloat(overallRating)),
            skillGrowthScore: 0, // Will be calculated when skill assessment is done
            employabilityScore: parseFloat(overallRating) * 10, // Simple calculation
            recommendationStrength: overallRating >= 8 ? 'Strong' : overallRating >= 6 ? 'Moderate' : 'Weak'
        };

        // Generate certificate and QR code
        try {
            const students = readStudents();
            const student = students.find(s => s.id === ipp.studentId);
            const ippWithStudent = { ...ipp, studentDetails: { name: student?.name || 'Student' } };

            const certificateResult = await generateCertificate(ippWithStudent);
            const qrCodeDataURL = await generateQRCode(certificateResult.certificateId, ippId);

            ipp.certificate = {
                certificateId: certificateResult.certificateId,
                certificateUrl: certificateResult.downloadUrl,
                qrCode: qrCodeDataURL,
                generatedAt: new Date().toISOString()
            };
        } catch (certError) {
            console.error('Error generating certificate:', certError);
            // Continue without certificate if generation fails
            ipp.certificate = {
                certificateId: `CERT-${ippId}`,
                certificateUrl: '',
                qrCode: '',
                generatedAt: new Date().toISOString(),
                error: 'Certificate generation failed'
            };
        }

        // Create public profile URL
        ipp.sharing = {
            publicProfileUrl: `/ipp/view/${ippId}`,
            isPublic: true,
            viewCount: 0
        };

        ipp.status = 'published';
        ipp.publishedAt = new Date().toISOString();
        if (!ipp.verification) ipp.verification = {};
        ipp.verification.placementCellApproved = true;
        ipp.verification.placementCellApprovedBy = req.user.id;
        ipp.verification.placementCellApprovedAt = new Date().toISOString();

        ipps[ippIndex] = ipp;
        writeIPPs(ipps);

        // Update student stats
        const students = readStudents();
        const studentIndex = students.findIndex(s => s.id === ipp.studentId);
        if (studentIndex !== -1) {
            const student = students[studentIndex];
            student.totalInternshipsCompleted = (student.totalInternshipsCompleted || 0) + 1;

            // Update average rating
            const allIPPs = ipps.filter(i => i.studentId === student.id && i.summary?.overallRating);

            if (allIPPs.length > 0) {
                const avgRating = allIPPs.reduce((sum, i) => sum + (i.summary?.overallRating || 0), 0) / allIPPs.length;
                student.averageInternshipRating = parseFloat(avgRating.toFixed(2));
                student.employabilityScore = parseFloat((avgRating * 10).toFixed(2));
            }

            writeStudents(students);
        }

        // Update application status
        const applications = readApplications();
        const appIndex = applications.findIndex(a => a.id === ipp.applicationId);
        if (appIndex !== -1) {
            applications[appIndex].ippStatus = 'completed';
            writeApplications(applications);
        }

        // Send notification email to student
        try {
            const student = students.find(s => s.id === ipp.studentId);
            if (student?.email) {
                await sendStudentNotificationEmail(
                    student.email,
                    student.name,
                    ippId,
                    'published'
                );
            }
        } catch (emailError) {
            console.error('Failed to send publication notification email:', emailError);
        }

        res.json({
            success: true,
            message: 'IPP verified and published',
            publicUrl: ipp.sharing.publicProfileUrl,
            data: ipp
        });

    } catch (error) {
        console.error('Error verifying IPP:', error);
        res.status(500).json({ error: 'Failed to verify IPP', details: error.message });
    }
});

// 9. PUBLIC VIEW - No authentication required
router.get('/public/:ippId', async (req, res) => {
    try {
        const { ippId } = req.params;
        const ipps = readIPPs();

        const ipp = ipps.find(i => i.ippId === ippId && i.sharing?.isPublic);

        if (!ipp) {
            return res.status(404).json({ error: 'IPP not found or not public' });
        }

        // Increment view count
        if (!ipp.sharing) ipp.sharing = {};
        ipp.sharing.viewCount = (ipp.sharing.viewCount || 0) + 1;

        // Find index and update
        const ippIndex = ipps.findIndex(i => i.ippId === ippId);
        if (ippIndex !== -1) {
            ipps[ippIndex] = ipp;
            writeIPPs(ipps);
        }

        res.json({
            success: true,
            data: ipp
        });

    } catch (error) {
        console.error('Error fetching public IPP:', error);
        res.status(500).json({ error: 'Failed to fetch IPP', details: error.message });
    }
});

// Serve certificate files
router.get('/certificate/:certificateId', (req, res) => {
    try {
        const { certificateId } = req.params;
        const filePath = path.join(__dirname, '../certificates', `${certificateId}.pdf`);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${certificateId}.pdf"`);
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ error: 'Certificate not found' });
        }
    } catch (error) {
        console.error('Error serving certificate:', error);
        res.status(500).json({ error: 'Failed to serve certificate' });
    }
});

// 10. SAVE SKILL ASSESSMENT
router.put('/:ippId/skill-assessment', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const { skillAssessment, skillAssessmentNotes, skillGrowthScore, assessedBy, assessedAt } = req.body;

        const ipps = readIPPs();
        const ippIndex = ipps.findIndex(i => i.ippId === ippId);

        if (ippIndex === -1) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        const ipp = ipps[ippIndex];

        // Update skill assessment
        ipp.skillAssessment = skillAssessment;
        ipp.skillAssessmentNotes = skillAssessmentNotes;
        if (!ipp.summary) ipp.summary = {};
        ipp.summary.skillGrowthScore = skillGrowthScore;
        ipp.skillAssessmentMetadata = {
            assessedBy,
            assessedAt
        };

        ipps[ippIndex] = ipp;
        writeIPPs(ipps);

        res.json({
            success: true,
            message: 'Skill assessment saved successfully',
            data: ipp
        });

    } catch (error) {
        console.error('Error saving skill assessment:', error);
        res.status(500).json({ error: 'Failed to save skill assessment', details: error.message });
    }
});

module.exports = router;
