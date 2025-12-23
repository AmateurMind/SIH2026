const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const applicationsFilePath = path.join(__dirname, '../data/applications.json');
const crypto = require('crypto');
const multer = require('multer');
const mult = require('multer');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const { sendEvaluationRequestEmail, sendStudentNotificationEmail } = require('../utils/emailService');
const { generateCertificate, generateQRCode } = require('../utils/certificateGenerator');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Import Mongoose Models
const InternshipPerformancePassport = require('../models/InternshipPerformancePassport');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Student = require('../models/Student');

console.log('🔵 IPP Routes module loaded (Hybrid Mode)');

// Helper: Load JSON Data safely
const loadJsonData = (file) => {
    try {
        const filePath = path.join(__dirname, '../data', file);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error(`Error loading ${file}:`, e.message);
    }
    return [];
};

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

// Helper function to generate unique IPP ID
const generateIPPId = (studentId, internshipId) => {
    const year = new Date().getFullYear();
    // Sanitize IDs to ensure they are safe for URLs/Filenames
    const safeStudentId = studentId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `IPP-${safeStudentId}-${internshipId}-${year}`;
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
        const techSkills = Object.values(companyEval.technicalSkills).filter(v => typeof v === 'number');
        if (techSkills.length > 0) {
            totalScore += techSkills.reduce((a, b) => a + b, 0) / techSkills.length;
            count++;
        }
    }

    // Soft skills average
    if (companyEval?.softSkills) {
        const softSkills = Object.values(companyEval.softSkills).filter(v => typeof v === 'number');
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

// Test route to verify router is working
router.get('/test', (req, res) => {
    res.json({ message: 'IPP router is working (Hybrid Mode)!' });
});

// Upload supporting document (images/PDF) for IPP submission
router.post('/:ippId/upload-document', requireHybridAuth, ippUploadMiddleware, async (req, res) => {
    try {
        const { ippId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Try Mongo
        let ipp = await InternshipPerformancePassport.findOne({ ippId });
        // Fallback JSON
        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            // We can't strictly modify the JSON file via this object if we load it this way, 
            // but for checking permissions it's fine. 
            // Limitation: Uploading document updates the DB primarily. 
            // If checking existence is enough:
            ipp = jsonIPPs.find(i => i.ippId === ippId);
        }

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

    try {
        const { studentId, internshipId, applicationId } = req.body;
        const resolvedStudentId = studentId || req.user?.id;
        const mongoose = require('mongoose');

        // Helper: JSON Fallback Logic
        const runJsonFallback = () => {
            console.log('📝 Creating IPP in Fallback Mode (JSON)');

            const applications = loadJsonData('applications.json');
            const internships = loadJsonData('internships.json');
            let ipps = loadJsonData('ipps.json');

            let app = null;
            if (applicationId) {
                app = applications.find(a => a.id === applicationId);
            }
            if (!app) {
                app = applications.find(a =>
                    a.studentId === resolvedStudentId &&
                    a.internshipId === internshipId &&
                    ['accepted', 'offered', 'approved', 'selected', 'completed'].includes(a.status)
                );
            }

            if (!app) {
                return res.status(404).json({
                    error: 'Application not found',
                    message: 'Please ensure you have an accepted/offered/completed application.'
                });
            }

            const internship = internships.find(i => i.id === internshipId);
            if (!internship) return res.status(404).json({ error: 'Internship not found' });

            const existingIPP = ipps.find(ipp => ipp.studentId === resolvedStudentId && ipp.internshipId === internshipId);
            if (existingIPP) {
                return res.status(400).json({ error: 'IPP already exists', ippId: existingIPP.ippId });
            }

            const ippId = generateIPPId(resolvedStudentId, internshipId);

            const newIPP = {
                ippId,
                studentId: resolvedStudentId,
                internshipId,
                applicationId: app.id,
                internshipDetails: {
                    company: internship.company,
                    role: internship.title,
                    domain: internship.eligibleDepartments?.[0] || 'General',
                    startDate: app.internshipStartDate || internship.startDate,
                    endDate: app.internshipCompletionDate || new Date().toISOString(),
                    duration: internship.duration,
                    location: internship.location,
                    workMode: internship.workMode
                },
                status: 'pending_mentor_eval',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            ipps.push(newIPP);
            fs.writeFileSync(path.join(__dirname, '../data/ipps.json'), JSON.stringify(ipps, null, 2));

            // Update application
            const appIndex = applications.findIndex(a => a.id === app.id);
            if (appIndex !== -1) {
                applications[appIndex].ippStatus = 'in_progress';
                applications[appIndex].ippId = ippId;
                applications[appIndex].updatedAt = new Date().toISOString();
                fs.writeFileSync(path.join(__dirname, '../data/applications.json'), JSON.stringify(applications, null, 2));
            }

            return res.status(201).json({
                success: true,
                message: 'IPP created successfully (Fallback)',
                ippId,
                data: newIPP
            });
        };

        // 1. If MongoDB is not connected, run fallback immediately
        if (mongoose.connection.readyState !== 1) {
            return runJsonFallback();
        }

        // 2. If MongoDB IS connected, try to find the application there first
        const eligibleStatuses = ['accepted', 'offered', 'approved', 'selected', 'completed'];
        let application = null;

        if (applicationId) {
            try {
                application = await Application.findOne({ id: applicationId });
            } catch (e) { console.warn('Mongo findOne error:', e); }
        }

        if (!application) {
            application = await Application.findOne({
                studentId: resolvedStudentId,
                internshipId: internshipId,
                status: { $in: eligibleStatuses }
            });
        }

        // 3. CRITICAL FALLBACK: If application NOT found in Mongo (empty DB?), try fallback logic
        if (!application) {
            console.log('⚠️ Application not found in MongoDB. Trying local JSON fallback...');
            return runJsonFallback();
        }

        // --- Standard MongoDB Logic continues below ---

        const resolvedApplicationId = application.id;

        // Get internship details
        const internship = await Internship.findOne({ id: internshipId });
        if (!internship) {
            return res.status(404).json({ error: 'Internship not found' });
        }

        // Check if IPP already exists
        const existingIPP = await InternshipPerformancePassport.findOne({
            studentId: resolvedStudentId,
            internshipId: internshipId
        });

        if (existingIPP) {
            // Self-heal: Ensure Application has the link in MongoDB
            await Application.findOneAndUpdate(
                { id: resolvedApplicationId },
                { ippStatus: 'in_progress', ippId: existingIPP.ippId, updatedAt: new Date() }
            );

            // Self-heal: Sync JSON if missing (Hybrid Mode Fix)
            try {
                if (fs.existsSync(applicationsFilePath)) {
                    const appsData = JSON.parse(fs.readFileSync(applicationsFilePath, 'utf8'));
                    const appIndex = appsData.findIndex(a => a.id === resolvedApplicationId);

                    if (appIndex !== -1) {
                        appsData[appIndex].ippStatus = 'in_progress';
                        appsData[appIndex].ippId = existingIPP.ippId;
                        // Preserve or update updatedAt? Updating is safer for cache busting
                        appsData[appIndex].updatedAt = new Date().toISOString();
                        fs.writeFileSync(applicationsFilePath, JSON.stringify(appsData, null, 2));
                        console.log(`✅ [Self-Heal] Synced existing IPP ${existingIPP.ippId} to applications.json`);
                    }
                }
            } catch (jsonError) {
                console.error('Self-heal JSON sync failed:', jsonError);
            }

            return res.json({
                success: true,
                message: 'IPP already existed. Links restored.',
                ippId: existingIPP.ippId,
                data: existingIPP
            });
        }

        // Generate unique IPP ID
        if (!resolvedStudentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        const ippId = generateIPPId(resolvedStudentId, internshipId);

        // Create new IPP
        const newIPP = new InternshipPerformancePassport({
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
            status: 'pending_mentor_eval'
        });

        await newIPP.save();

        // Update application
        await Application.findOneAndUpdate(
            { id: resolvedApplicationId },
            {
                ippStatus: 'in_progress',
                ippId: ippId,
                updatedAt: new Date()
            }
        );

        // SYNC WITH JSON FILE (Critical for hybrid mode)
        try {
            if (fs.existsSync(applicationsFilePath)) {
                const appsData = JSON.parse(fs.readFileSync(applicationsFilePath, 'utf8'));
                const appIndex = appsData.findIndex(a => a.id === resolvedApplicationId);

                if (appIndex !== -1) {
                    appsData[appIndex].ippStatus = 'in_progress';
                    appsData[appIndex].ippId = ippId;
                    appsData[appIndex].updatedAt = new Date().toISOString();
                    fs.writeFileSync(applicationsFilePath, JSON.stringify(appsData, null, 2));
                    console.log(`✅ Synced IPP ${ippId} to applications.json for APP ${resolvedApplicationId}`);
                }
            }
        } catch (jsonError) {
            console.error('⚠️ Failed to sync IPP to applications.json:', jsonError);
        }

        // Update student
        await Student.findOneAndUpdate(
            { id: resolvedStudentId },
            { $addToSet: { internshipPassports: ippId } }
        );

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
        const { status, company } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (company) {
            query['internshipDetails.company'] = { $regex: company, $options: 'i' };
        }

        // 1. Fetch Mongo
        let ipps = [];
        try {
            ipps = await InternshipPerformancePassport.find(query).sort({ updatedAt: -1 }).lean();
        } catch (e) {
            console.warn('Mongo fetch error:', e);
        }

        // 2. Fetch JSON
        let jsonIPPs = loadJsonData('ipps.json');
        if (status) {
            jsonIPPs = jsonIPPs.filter(i => i.status === status);
        }
        if (company) {
            jsonIPPs = jsonIPPs.filter(i => i.internshipDetails?.company?.toLowerCase().includes(company.toLowerCase()));
        }

        // 3. Merge (Dedupe by ippId, prefer Mongo)
        const ippMap = new Map();
        jsonIPPs.forEach(i => ippMap.set(i.ippId, i));
        ipps.forEach(i => ippMap.set(i.ippId, i));

        let mergedIPPs = Array.from(ippMap.values());

        // Populate student details
        const studentIds = [...new Set(mergedIPPs.map(ipp => ipp.studentId))];

        let students = [];
        try {
            students = await Student.find({ id: { $in: studentIds } }).lean();
        } catch (e) { }

        // Fallback for students too if empty
        if (students.length < studentIds.length) {
            const jsonStudents = loadJsonData('students.json').filter(s => studentIds.includes(s.id));
            const studentMap = new Map();
            jsonStudents.forEach(s => studentMap.set(s.id, s));
            students.forEach(s => studentMap.set(s.id, s));
            students = Array.from(studentMap.values());
        }

        const studentsMap = {};
        students.forEach(s => { studentsMap[s.id] = s; });

        mergedIPPs = mergedIPPs.map(ipp => {
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

        // Sort by date desc
        mergedIPPs.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

        res.json({
            success: true,
            count: mergedIPPs.length,
            data: mergedIPPs
        });
    } catch (error) {
        console.error('Error fetching all IPPs:', error);
        res.status(500).json({ error: 'Failed to fetch IPPs', details: error.message });
    }
});

// 2. GET all IPPs for a student (Specific route must come before generic :ippId)
router.get('/student/:studentId', requireHybridAuth, async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Fetch Mongo
        let mongoIPPs = [];
        try {
            mongoIPPs = await InternshipPerformancePassport.find({ studentId }).sort({ createdAt: -1 }).lean();
        } catch (e) {
            console.warn('Mongo fetch error:', e);
        }

        // 2. Fetch JSON
        let jsonIPPs = [];
        try {
            const all = loadJsonData('ipps.json');
            jsonIPPs = all.filter(i => i.studentId === studentId);
        } catch (e) {
            console.error('JSON fetch error:', e);
        }

        // 3. Merge
        const ippMap = new Map();
        // Set JSON first
        jsonIPPs.forEach(i => ippMap.set(i.ippId, i));
        // Overwrite with Mongo
        mongoIPPs.forEach(i => ippMap.set(i.ippId, i));

        const mergedIPPs = Array.from(ippMap.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: mergedIPPs.length,
            data: mergedIPPs
        });

    } catch (error) {
        console.error('Error fetching student IPPs:', error);
        res.status(500).json({ error: 'Failed to fetch IPPs', details: error.message });
    }
});

// 3. GET IPP by ID (Generic route comes last)
router.get('/:ippId', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;

        if (!ippId) {
            return res.status(400).json({ error: 'IPP ID is required' });
        }

        // Try Mongo
        let ipp = await InternshipPerformancePassport.findOne({ ippId }).lean();

        // Try JSON if not found
        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            ipp = jsonIPPs.find(i => i.ippId === ippId);
        }

        if (!ipp) {
            return res.status(404).json({
                error: 'IPP not found',
                message: `No IPP found with ID: ${ippId}`
            });
        }

        // Fetch student details
        let student = await Student.findOne({ id: ipp.studentId }).lean();
        if (!student) {
            const jsonStudents = loadJsonData('students.json');
            student = jsonStudents.find(s => s.id === ipp.studentId);
        }

        if (student) {
            ipp.studentDetails = {
                name: student.name,
                email: student.email,
                department: student.department,
                semester: student.semester
            };
        }

        res.json({ success: true, data: ipp });

    } catch (error) {
        console.error('Error fetching IPP:', error);
        res.status(500).json({ error: 'Failed to fetch IPP', details: error.message });
    }
});

// 4. SEND EVALUATION REQUEST
router.post('/:ippId/send-evaluation-request', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const { mentorEmail, mentorName } = req.body;

        let ipp = await InternshipPerformancePassport.findOne({ ippId });

        // JSON fallback handling
        let isJsonOnly = false;
        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            const jsonIPP = jsonIPPs.find(i => i.ippId === ippId);
            if (jsonIPP) {
                isJsonOnly = true;
                ipp = jsonIPP;
            }
        }

        if (!ipp) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        // Generate magic link token
        const token = generateMagicToken();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        ipp.mentorAccessToken = token;
        ipp.mentorAccessTokenExpiry = expiryDate;

        if (!ipp.companyMentorEvaluation) ipp.companyMentorEvaluation = {};
        ipp.companyMentorEvaluation.mentorEmail = mentorEmail;
        ipp.companyMentorEvaluation.mentorName = mentorName;

        if (isJsonOnly) {
            const jsonIPPs = loadJsonData('ipps.json');
            const index = jsonIPPs.findIndex(i => i.ippId === ippId);
            if (index !== -1) {
                jsonIPPs[index] = { ...jsonIPPs[index], ...ipp };
                fs.writeFileSync(path.join(__dirname, '../data/ipps.json'), JSON.stringify(jsonIPPs, null, 2));
            }
        } else {
            await ipp.save();
        }

        // Get student details
        let student = await Student.findOne({ id: ipp.studentId });
        if (!student) {
            const jsonStudents = loadJsonData('students.json');
            student = jsonStudents.find(s => s.id === ipp.studentId);
        }

        const superAdminUrl = process.env.SUPERADMIN_URL || 'http://localhost:5174';
        const magicLink = `${superAdminUrl}/mentor/evaluate/${ippId}?token=${token}&email=${encodeURIComponent(mentorEmail)}&name=${encodeURIComponent(mentorName)}`;

        try {
            await sendEvaluationRequestEmail(
                mentorEmail,
                mentorName,
                magicLink,
                student?.name || 'Student',
                ipp.internshipDetails?.company || 'Company',
                ipp.internshipDetails?.role || 'Internship Role'
            );
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        res.json({
            success: true,
            message: 'Evaluation request sent successfully',
            magicLink
        });

    } catch (error) {
        console.error('Error sending evaluation request:', error);
        res.status(500).json({ error: 'Failed to send request', details: error.message });
    }
});

// 5. SUBMIT COMPANY MENTOR EVALUATION
router.put('/:ippId/company-evaluation', async (req, res) => {
    try {
        const { ippId } = req.params;
        const { token, evaluation } = req.body;

        let ipp = await InternshipPerformancePassport.findOne({ ippId });
        let isJsonOnly = false;

        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            const jsonIPP = jsonIPPs.find(i => i.ippId === ippId);
            if (jsonIPP) {
                isJsonOnly = true;
                ipp = jsonIPP;
            }
        }

        if (!ipp) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        // Debug logging
        console.log(`[Evaluation] Verifying token for IPP ${ippId}`, {
            expectedLimit: ipp.mentorAccessToken ? ipp.mentorAccessToken.substring(0, 5) + '...' : 'NONE',
            received: token ? token.substring(0, 5) + '...' : 'NONE'
        });

        // Only enforce token if it exists on the IPP (Backward compatibility)
        if (ipp.mentorAccessToken && ipp.mentorAccessToken !== token) {
            console.warn(`[Evaluation] Invalid token. Expected: ${ipp.mentorAccessToken}, Got: ${token}`);
            return res.status(401).json({ error: 'Invalid token or link expired' });
        }

        ipp.companyMentorEvaluation = {
            ...ipp.companyMentorEvaluation,
            ...evaluation,
            submittedAt: new Date()
        };

        if (!ipp.verification) ipp.verification = {};
        ipp.verification.companyVerified = true;
        ipp.verification.companyVerifiedBy = evaluation.mentorEmail;
        ipp.verification.companyVerifiedAt = new Date();
        ipp.status = 'pending_student_submission';

        if (isJsonOnly) {
            const jsonIPPs = loadJsonData('ipps.json');
            const index = jsonIPPs.findIndex(i => i.ippId === ippId);
            if (index !== -1) {
                jsonIPPs[index] = { ...jsonIPPs[index], ...ipp };
                fs.writeFileSync(path.join(__dirname, '../data/ipps.json'), JSON.stringify(jsonIPPs, null, 2));
            }
        } else {
            await ipp.save();
        }

        res.json({ success: true, message: 'Evaluation submitted successfully', data: ipp });

    } catch (error) {
        console.error('Error submitting evaluation:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// 6. SUBMIT STUDENT DOCUMENTATION
router.put('/:ippId/student-submission', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const { submission } = req.body;

        let ipp = await InternshipPerformancePassport.findOne({ ippId });
        let isJsonOnly = false;

        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            const jsonIPP = jsonIPPs.find(i => i.ippId === ippId);
            if (jsonIPP) {
                isJsonOnly = true;
                ipp = jsonIPP;
            }
        }

        if (!ipp) {
            return res.status(404).json({ error: 'IPP not found' });
        }

        ipp.studentSubmission = {
            ...ipp.studentSubmission,
            ...submission,
            submittedAt: new Date()
        };

        // Auto-Verify & Generate Certificate
        ipp.status = 'verified';

        // 1. Calculate Ratings & Grade
        const overallRating = calculateOverallRating(ipp.companyMentorEvaluation, ipp.facultyMentorAssessment);
        const grade = calculateGrade(overallRating);

        ipp.summary = {
            overallRating: overallRating,
            performanceGrade: grade,
            employabilityScore: (overallRating * 10).toFixed(0) // Simple calculation for now
        };

        // 2. Fetch Student Details for Certificate
        let student = await Student.findOne({ id: ipp.studentId });
        if (!student) {
            const jsonStudents = loadJsonData('students.json');
            student = jsonStudents.find(s => s.id === ipp.studentId);
        }

        if (student) {
            // Prepare data for generator (Merge document with student details)
            const ippForCert = {
                ...ipp.toObject ? ipp.toObject() : ipp,
                studentDetails: {
                    name: student.name || `${student.firstName} ${student.lastName}`,
                    email: student.email,
                    department: student.department
                }
            };

            // 3. Generate Certificate
            try {
                const certResult = await generateCertificate(ippForCert);
                ipp.certificateUrl = certResult.downloadUrl;
                ipp.certificateGeneratedAt = new Date();
                console.log('✅ Certificate generated automatically:', certResult.fileName);
            } catch (certError) {
                console.error('❌ Certificate generation failed:', certError);
                // We don't fail the request, just log it. Admin can regen later if needed.
            }
        }

        if (isJsonOnly) {
            const jsonIPPs = loadJsonData('ipps.json');
            const index = jsonIPPs.findIndex(i => i.ippId === ippId);
            if (index !== -1) {
                jsonIPPs[index] = { ...jsonIPPs[index], ...ipp };
                fs.writeFileSync(path.join(__dirname, '../data/ipps.json'), JSON.stringify(jsonIPPs, null, 2));
            }
        } else {
            await ipp.save();
        }

        res.json({
            success: true,
            message: 'Submission successful & Certificate Generated',
            certificateUrl: ipp.certificateUrl
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// 7. SUBMIT FACULTY ASSESSMENT
router.put('/:ippId/faculty-assessment', requireHybridAuth, async (req, res) => {
    try {
        const { ippId } = req.params;
        const { assessment } = req.body;

        let ipp = await InternshipPerformancePassport.findOne({ ippId });
        let isJsonOnly = false;

        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            const jsonIPP = jsonIPPs.find(i => i.ippId === ippId);
            if (jsonIPP) {
                isJsonOnly = true;
                ipp = jsonIPP;
            }
        }

        if (!ipp) return res.status(404).json({ error: 'IPP not found' });

        ipp.facultyMentorAssessment = {
            ...ipp.facultyMentorAssessment,
            ...assessment,
            submittedAt: new Date()
        };

        if (!ipp.verification) ipp.verification = {};
        ipp.verification.facultyApproved = true;
        ipp.verification.facultyApprovedBy = req.user.id;
        ipp.verification.facultyApprovedAt = new Date();

        if (assessment.approvalStatus === 'approved') {
            ipp.status = 'verified';
            ipp.verification.finalStatus = 'verified';

            // --- CERTIFICATE GENERATION LOGIC ---
            // 1. Calculate Ratings & Grade
            const overallRating = calculateOverallRating(ipp.companyMentorEvaluation, ipp.facultyMentorAssessment);
            const grade = calculateGrade(overallRating);

            ipp.summary = {
                overallRating: overallRating,
                performanceGrade: grade,
                employabilityScore: (overallRating * 10).toFixed(0)
            };

            // 2. Fetch Student Details
            let student = await Student.findOne({ id: ipp.studentId });
            if (!student) {
                const jsonStudents = loadJsonData('students.json');
                student = jsonStudents.find(s => s.id === ipp.studentId);
            }

            if (student) {
                const ippForCert = {
                    ...ipp.toObject ? ipp.toObject() : ipp,
                    studentDetails: {
                        name: student.name || `${student.firstName} ${student.lastName}`,
                        email: student.email,
                        department: student.department
                    }
                };

                // 3. Generate Certificate
                try {
                    const certResult = await generateCertificate(ippForCert);
                    ipp.certificateUrl = certResult.downloadUrl;
                    ipp.certificateGeneratedAt = new Date();
                    console.log('✅ Certificate generated automatically (Faculty):', certResult.fileName);
                } catch (certError) {
                    console.error('❌ Certificate generation failed:', certError);
                }
            }
            // ------------------------------------

        } else {
            ipp.status = 'pending_student_submission'; // Send back?
            ipp.verification.finalStatus = 'rejected';
        }

        if (isJsonOnly) {
            const jsonIPPs = loadJsonData('ipps.json');
            const index = jsonIPPs.findIndex(i => i.ippId === ippId);
            if (index !== -1) {
                jsonIPPs[index] = { ...jsonIPPs[index], ...ipp };
                fs.writeFileSync(path.join(__dirname, '../data/ipps.json'), JSON.stringify(jsonIPPs, null, 2));
            }
        } else {
            await ipp.save();
        }

        res.json({ success: true, message: 'Assessment submitted', data: ipp });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// 8. VERIFY (REMOVED/DEPRECATED - Auto-Verify enabled)
// Kept as a dummy or certificate-regeneration endpoint if needed in future
router.post('/:ippId/verify', requireHybridAuth, async (req, res) => {
    return res.status(200).json({
        message: 'Manual verification is deprecated. Certificates are generated automatically upon completion.'
    });
});

module.exports = router;