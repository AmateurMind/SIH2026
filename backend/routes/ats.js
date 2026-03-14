const express = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const { Student, Resume } = require('../models');
const atsService = require('../services/atsService');
const resumeParser = require('../services/resumeParser');
const axios = require('axios');

const router = express.Router();

// Configure multer for PDF/DOCX resume upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'), false);
        }
    }
});

/**
 * POST /api/ats/analyze
 * Upload and analyze a resume for ATS compatibility
 * Students can analyze their own resumes
 */
router.post('/analyze', authenticate, authorize('student'), upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { jobDescription } = req.body;

        // Find the student
        const student = await Student.findOne({ id: req.user.id });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Parse the resume file
        let parsedResume;
        try {
            parsedResume = await resumeParser.parseResume(req.file.buffer, req.file.originalname);
        } catch (parseError) {
            console.error('Resume parsing error:', parseError);
            return res.status(400).json({ 
                error: 'Failed to parse resume file',
                details: parseError.message 
            });
        }

        // Analyze the resume text (now async — uses Groq AI)
        const analysis = await atsService.analyzeResume(parsedResume.text, jobDescription || null);

        // Save the resume to database with ATS analysis
        const resume = new Resume({
            userId: student._id,
            title: req.file.originalname.replace(/\.[^/.]+$/, ''), // Remove extension
            template: 'analyzed',
            personalInfo: {
                fullName: student.name,
                email: student.email,
                phone: student.phone
            },
            atsScore: analysis.score,
            atsAnalysis: {
                score: analysis.score,
                issues: analysis.issues,
                suggestions: analysis.suggestions,
                details: analysis.details,
                analyzedAt: new Date()
            }
        });

        await resume.save();

        // Update student's latest ATS score
        student.atsScore = analysis.score;
        student.atsAnalyzedAt = new Date();
        student.atsResumeId = resume._id;
        await student.save();

        res.status(201).json({
            success: true,
            message: 'Resume analyzed successfully',
            atsScore: analysis.score,
            analysis: {
                score: analysis.score,
                issues: analysis.issues,
                suggestions: analysis.suggestions,
                details: analysis.details,
                scoreBreakdown: analysis.scoreBreakdown || null
            },
            aiInsights: analysis.aiInsights ? {
                modelUsed: analysis.aiInsights._modelUsed || null,
                executiveSummary: analysis.aiInsights.executiveSummary,
                candidateScore: analysis.aiInsights.candidateScore,
                candidateScoreReason: analysis.aiInsights.candidateScoreReason,
                projectQuality: analysis.aiInsights.projectQuality,
                strengths: analysis.aiInsights.strengths || [],
                priorityFixes: analysis.aiInsights.priorityFixes || [],
                rewrittenBullets: analysis.aiInsights.rewrittenBullets || [],
                redFlags: analysis.aiInsights.redFlags || []
            } : null,
            resumeId: resume._id,
            analyzedAt: new Date()
        });

    } catch (error) {
        console.error('ATS analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze resume' });
    }
});

/**
 * GET /api/ats/my-score
 * Get current student's ATS score
 */
router.get('/my-score', authenticate, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ id: req.user.id });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get the latest resume with ATS analysis
        const latestResume = await Resume.findOne({ 
            userId: student._id,
            atsScore: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 });

        // If no explicit AI analysis exists OR a newer base resume was uploaded, compute dynamically
        let dynamicAtsResult = null;
        if (student.pdfResumes && student.pdfResumes.length > 0) {
            // Get the most recently uploaded base resume
            const latestPdf = student.pdfResumes.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
            
            if (!latestResume || new Date(latestPdf.uploadedAt) > new Date(latestResume.createdAt)) {
                try {
                // Download file from Cloudinary (or wherever filePath points)
                const response = await axios.get(latestPdf.filePath, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                
                // Parse resume
                const parsedResume = await resumeParser.parseResume(buffer, latestPdf.originalName || latestPdf.filename);
                
                // Analyze it dynamically (NOT saved to DB)
                const analysis = await atsService.analyzeResume(parsedResume.text, null);
                
                // Construct a dynamic result to match what frontend expects from `latestResume`
                dynamicAtsResult = {
                    _id: 'dynamic-' + latestPdf._id, // Fake ID for frontend
                    title: latestPdf.originalName || 'Base Resume',
                    atsScore: analysis.score,
                    atsAnalysis: {
                        score: analysis.score,
                        issues: analysis.issues,
                        suggestions: analysis.suggestions,
                        details: analysis.details,
                        scoreBreakdown: analysis.scoreBreakdown || null,
                        analyzedAt: new Date()
                    },
                    aiInsights: analysis.aiInsights || null
                };
            } catch (err) {
                console.error("Failed to dynamically calculate ATS score:", err);
                // Fail silently, return null for ATS score
            }
            }
        }

        res.json({
            success: true,
            atsScore: dynamicAtsResult ? dynamicAtsResult.atsScore : (latestResume ? latestResume.atsScore : student.atsScore),
            atsAnalyzedAt: dynamicAtsResult ? dynamicAtsResult.atsAnalysis.analyzedAt : (latestResume ? student.atsAnalyzedAt : student.atsAnalyzedAt),
            resumeId: dynamicAtsResult ? dynamicAtsResult._id : (latestResume ? student.atsResumeId : student.atsResumeId),
            latestResume: dynamicAtsResult ? dynamicAtsResult : (latestResume ? {
                _id: latestResume._id,
                title: latestResume.title,
                atsScore: latestResume.atsScore,
                atsAnalysis: latestResume.atsAnalysis,
                aiInsights: latestResume.aiInsights
            } : null)
        });

    } catch (error) {
        console.error('Get ATS score error:', error);
        res.status(500).json({ error: 'Failed to get ATS score' });
    }
});

/**
 * GET /api/ats/my-analysis
 * Get detailed ATS analysis for student's latest resume
 */
router.get('/my-analysis', authenticate, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ id: req.user.id });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get the latest resume with ATS analysis
        const latestResume = await Resume.findOne({ 
            userId: student._id,
            atsScore: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 });

        if (!latestResume) {
            return res.status(404).json({ 
                error: 'No analyzed resume found',
                message: 'Please upload a resume to get ATS analysis'
            });
        }

        res.json({
            success: true,
            resume: {
                _id: latestResume._id,
                title: latestResume.title,
                atsScore: latestResume.atsScore,
                atsAnalysis: latestResume.atsAnalysis,
                createdAt: latestResume.createdAt
            }
        });

    } catch (error) {
        console.error('Get ATS analysis error:', error);
        res.status(500).json({ error: 'Failed to get ATS analysis' });
    }
});

/**
 * GET /api/ats/student/:studentId
 * Get a specific student's ATS score (for faculty/admin)
 */
router.get('/student/:studentId', authenticate, authorize('admin', 'mentor'), async (req, res) => {
    try {
        const { studentId } = req.params;

        let student;
        if (require('mongoose').Types.ObjectId.isValid(studentId)) {
            student = await Student.findById(studentId);
        }
        if (!student) {
            student = await Student.findOne({ id: studentId });
        }

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get the latest resume with ATS analysis
        const latestResume = await Resume.findOne({ 
            userId: student._id,
            atsScore: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 });

        // If no explicit AI analysis exists OR a newer base resume was uploaded, compute dynamically
        let dynamicAtsResult = null;
        if (student.pdfResumes && student.pdfResumes.length > 0) {
            // Get the most recently uploaded base resume
            const latestPdf = student.pdfResumes.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
            
            if (!latestResume || new Date(latestPdf.uploadedAt) > new Date(latestResume.createdAt)) {
                try {
                // Download file from Cloudinary (or wherever filePath points)
                const response = await axios.get(latestPdf.filePath, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                
                // Parse resume
                const parsedResume = await resumeParser.parseResume(buffer, latestPdf.originalName || latestPdf.filename);
                
                // Analyze it dynamically (NOT saved to DB)
                const analysis = await atsService.analyzeResume(parsedResume.text, null);
                
                // Construct a dynamic result to match what frontend expects
                dynamicAtsResult = {
                    _id: 'dynamic-' + latestPdf._id,
                    title: latestPdf.originalName || 'Base Resume',
                    atsScore: analysis.score,
                    atsAnalysis: {
                        score: analysis.score,
                        issues: analysis.issues,
                        suggestions: analysis.suggestions,
                        details: analysis.details,
                        scoreBreakdown: analysis.scoreBreakdown || null,
                        analyzedAt: new Date()
                    },
                    aiInsights: analysis.aiInsights || null
                };
            } catch (err) {
                console.error("Failed to dynamically calculate ATS score for student:", err);
            }
            }
        }

        res.json({
            success: true,
            student: {
                _id: student._id,
                id: student.id,
                name: student.name,
                email: student.email,
                department: student.department,
                semester: student.semester
            },
            atsScore: dynamicAtsResult ? dynamicAtsResult.atsScore : (latestResume ? student.atsScore : student.atsScore),
            atsAnalyzedAt: dynamicAtsResult ? dynamicAtsResult.atsAnalysis.analyzedAt : (latestResume ? student.atsAnalyzedAt : student.atsAnalyzedAt),
            resumeId: dynamicAtsResult ? dynamicAtsResult._id : (latestResume ? student.atsResumeId : student.atsResumeId),
            latestResume: dynamicAtsResult ? dynamicAtsResult : (latestResume ? {
                _id: latestResume._id,
                title: latestResume.title,
                atsScore: latestResume.atsScore,
                atsAnalysis: latestResume.atsAnalysis,
                aiInsights: latestResume.aiInsights
            } : null)
        });

    } catch (error) {
        console.error('Get student ATS score error:', error);
        res.status(500).json({ error: 'Failed to get student ATS score' });
    }
});

/**
 * GET /api/ats/students/list
 * Get list of all students with their ATS scores (for faculty/admin)
 */
router.get('/students/list', authenticate, authorize('admin', 'mentor'), async (req, res) => {
    try {
        const { page = 1, limit = 20, department, sortBy = 'atsScore', order = 'desc' } = req.query;

        // Build query
        const query = {};
        if (department) {
            query.department = department;
        }

        // Build sort
        const sortOrder = order === 'asc' ? 1 : -1;
        const sort = {};
        if (sortBy === 'atsScore') {
            sort.atsScore = sortOrder;
        } else if (sortBy === 'name') {
            sort.name = sortOrder;
        } else if (sortBy === 'analyzedAt') {
            sort.atsAnalyzedAt = sortOrder;
        } else {
            sort.atsScore = sortOrder;
        }

        const students = await Student.find(query)
            .select('id name email department semester atsScore atsAnalyzedAt')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Student.countDocuments(query);

        res.json({
            success: true,
            students: students.map(s => ({
                _id: s._id,
                id: s.id,
                name: s.name,
                email: s.email,
                department: s.department,
                semester: s.semester,
                atsScore: s.atsScore,
                atsAnalyzedAt: s.atsAnalyzedAt
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get students list error:', error);
        res.status(500).json({ error: 'Failed to get students list' });
    }
});

/**
 * GET /api/ats/students/top
 * Get top students by ATS score (for faculty/admin)
 */
router.get('/students/top', authenticate, authorize('admin', 'mentor'), async (req, res) => {
    try {
        const { limit = 10, minScore = 0 } = req.query;

        const students = await Student.find({
            atsScore: { $gte: parseInt(minScore), $ne: null }
        })
            .select('id name email department atsScore atsAnalyzedAt')
            .sort({ atsScore: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: students.length,
            students: students.map(s => ({
                _id: s._id,
                id: s.id,
                name: s.name,
                email: s.email,
                department: s.department,
                atsScore: s.atsScore,
                atsAnalyzedAt: s.atsAnalyzedAt
            }))
        });

    } catch (error) {
        console.error('Get top students error:', error);
        res.status(500).json({ error: 'Failed to get top students' });
    }
});

/**
 * GET /api/ats/stats
 * Get ATS statistics for the platform (for faculty/admin)
 */
router.get('/stats', authenticate, authorize('admin', 'mentor'), async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const studentsWithResume = await Student.countDocuments({
            atsScore: { $ne: null }
        });
        
        const avgScore = await Student.aggregate([
            { $match: { atsScore: { $ne: null } } },
            { $group: { _id: null, avg: { $avg: '$atsScore' } } }
        ]);

        const scoreDistribution = await Student.aggregate([
            { $match: { atsScore: { $ne: null } } },
            {
                $bucket: {
                    groupBy: '$atsScore',
                    boundaries: [0, 25, 50, 75, 90, 101],
                    default: 'Other',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalStudents,
                studentsWithResume,
                studentsWithoutResume: totalStudents - studentsWithResume,
                averageScore: avgScore[0] ? Math.round(avgScore[0].avg) : 0,
                scoreDistribution: scoreDistribution.map(d => ({
                    range: d._id,
                    count: d.count
                }))
            }
        });

    } catch (error) {
        console.error('Get ATS stats error:', error);
        res.status(500).json({ error: 'Failed to get ATS statistics' });
    }
});

/**
 * POST /api/ats/analyze-text
 * Analyze resume text directly (for testing or re-analysis)
 */
router.post('/analyze-text', authenticate, authorize('student'), async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;

        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        const analysis = atsService.analyzeResume(resumeText, jobDescription || null);

        res.json({
            success: true,
            atsScore: analysis.score,
            analysis: {
                score: analysis.score,
                issues: analysis.issues,
                suggestions: analysis.suggestions,
                details: analysis.details
            }
        });

    } catch (error) {
        console.error('ATS text analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze resume text' });
    }
});

module.exports = router;
