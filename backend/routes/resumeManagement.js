const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Resume } = require('../models');

const router = express.Router();

// Get all resumes for authenticated user
router.get('/list', authenticate, authorize('student'), async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id })
            .select('-__v')
            .sort({ lastModified: -1 });

        res.json({
            success: true,
            count: resumes.length,
            resumes
        });
    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({ error: 'Failed to fetch resumes' });
    }
});

// Create new resume
router.post('/create', authenticate, authorize('student'), async (req, res) => {
    try {
        const {
            title,
            template,
            accentColor,
            personalInfo,
            summary,
            education,
            experience,
            projects,
            skills,
            achievements
        } = req.body;

        // Validate required fields
        if (!personalInfo?.fullName || !personalInfo?.email) {
            return res.status(400).json({
                error: 'Personal information (name and email) is required'
            });
        }

        const resume = new Resume({
            userId: req.user.id,
            title: title || 'My Resume',
            template: template || 'modern',
            accentColor: accentColor || '#2563eb',
            personalInfo,
            summary: summary || '',
            education: education || [],
            experience: experience || [],
            projects: projects || [],
            skills: skills || [],
            achievements: achievements || []
        });

        await resume.save();

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            resume
        });
    } catch (error) {
        console.error('Create resume error:', error);
        res.status(500).json({ error: 'Failed to create resume' });
    }
});

// Get single resume by ID
router.get('/:resumeId', authenticate, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check if user owns this resume or if it's public
        if (resume.userId.toString() !== req.user.id && !resume.isPublic) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({
            success: true,
            resume
        });
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({ error: 'Failed to fetch resume' });
    }
});

// Update resume
router.put('/update/:resumeId', authenticate, authorize('student'), async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update fields
        const allowedUpdates = [
            'title',
            'template',
            'accentColor',
            'personalInfo',
            'summary',
            'education',
            'experience',
            'projects',
            'skills',
            'achievements',
            'customSections'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                resume[field] = req.body[field];
            }
        });

        // Increment version
        resume.version += 1;

        await resume.save();

        res.json({
            success: true,
            message: 'Resume updated successfully',
            resume
        });
    } catch (error) {
        console.error('Update resume error:', error);
        res.status(500).json({ error: 'Failed to update resume' });
    }
});

// Delete resume
router.delete('/delete/:resumeId', authenticate, authorize('student'), async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await Resume.findByIdAndDelete(req.params.resumeId);

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({ error: 'Failed to delete resume' });
    }
});

// Toggle resume visibility (public/private)
router.patch('/:resumeId/visibility', authenticate, authorize('student'), async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Check ownership
        if (resume.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { isPublic } = req.body;
        resume.isPublic = isPublic !== undefined ? isPublic : !resume.isPublic;
        await resume.save();

        res.json({
            success: true,
            message: `Resume is now ${resume.isPublic ? 'public' : 'private'}`,
            isPublic: resume.isPublic,
            publicUrl: resume.isPublic ? `/view/${resume._id}` : null
        });
    } catch (error) {
        console.error('Toggle visibility error:', error);
        res.status(500).json({ error: 'Failed to update visibility' });
    }
});

// Get public resume (no authentication required)
router.get('/public/:resumeId', async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.resumeId)
            .populate('userId', 'name email');

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        if (!resume.isPublic) {
            return res.status(403).json({ error: 'This resume is private' });
        }

        res.json({
            success: true,
            resume
        });
    } catch (error) {
        console.error('Get public resume error:', error);
        res.status(500).json({ error: 'Failed to fetch resume' });
    }
});

// Get all resumes for a specific student (admin/recruiter only)
router.get('/student/:studentId', authenticate, authorize('admin', 'recruiter'), async (req, res) => {
    try {
        const { Student } = require('../models');

        // Verify student exists
        const student = await Student.findOne({ id: req.params.studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get all resumes for this student
        const resumes = await Resume.find({ userId: student._id })
            .select('_id title template accentColor isPublic createdAt lastModified version')
            .sort({ lastModified: -1 })
            .lean();

        res.json({
            success: true,
            student: {
                _id: student._id,
                id: student.id,
                name: student.name,
                email: student.email,
                department: student.department
            },
            count: resumes.length,
            resumes
        });
    } catch (error) {
        console.error('Get student resumes error:', error);
        res.status(500).json({ error: 'Failed to fetch student resumes' });
    }
});

module.exports = router;
