const express = require('express');
const router = express.Router();
console.log('🔄 Integrations Router Loaded');

const { Student, Application, Internship } = require('../models');
const { notifyApplicationStatusChange } = require('../utils/notify');
const notificationService = require('../services/notificationService');

// Test route
router.get('/test', (req, res) => {
    console.log('[DEBUG] GET /api/integrations/test called');
    res.json({ message: 'Integrations API is working' });
});

// Help user if they send GET instead of POST
router.get('/update-status', (req, res) => {
    console.log('[DEBUG] GET /api/integrations/update-status called (Wrong Method)');
    res.status(405).json({
        error: 'Method Not Allowed',
        message: 'You are sending a GET request. Please change your n8n node Method to POST.'
    });
});

// Middleware to check API Key
const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.EXTERNAL_API_KEY || 'n8n-secret-key-123'; // Fallback for demo

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ error: 'Invalid API Key' });
    }
    next();
};

// Update application status by Email/Name and Internship ID/Title
router.post('/update-status', requireApiKey, async (req, res) => {
    try {
        console.log('[DEBUG] POST /update-status Body:', JSON.stringify(req.body, null, 2));
        console.log('[DEBUG] POST /update-status Headers:', JSON.stringify(req.headers, null, 2));
        const { studentEmail, studentName, internshipId, internshipTitle, status, feedback } = req.body;

        if ((!studentEmail && !studentName) || !status) {
            return res.status(400).json({
                error: 'Student identifier (email or name) and status are required',
                debug: {
                    receivedBody: req.body,
                    receivedQuery: req.query,
                    contentType: req.headers['content-type']
                }
            });
        }

        const searchIdentifier = studentEmail || studentName;
        console.log(`[DEBUG] Searching for student: ${searchIdentifier}`);

        // 1. Find Student in MongoDB
        let student = null;

        if (studentEmail) {
            student = await Student.findOne({
                email: { $regex: new RegExp(`^${studentEmail}$`, 'i') }
            }).lean();
        } else if (studentName) {
            // Case-insensitive fuzzy name match (first name or full name)
            student = await Student.findOne({
                name: { $regex: new RegExp(studentName, 'i') }
            }).lean();
        }

        if (!student) {
            console.log(`[DEBUG] Student not found: ${searchIdentifier}`);
            return res.status(404).json({ error: `Student '${searchIdentifier}' not found` });
        }
        console.log(`[DEBUG] Found student: ${student.id} (${student.name})`);

        // 2. Find Matching Internships (if provided)
        let matchingInternships = [];

        if (internshipId) {
            const found = await Internship.findOne({ id: internshipId }).lean();
            if (found) matchingInternships.push(found);
        } else if (internshipTitle) {
            // Find ALL internships with matching title
            matchingInternships = await Internship.find({
                title: { $regex: new RegExp(internshipTitle, 'i') }
            }).lean();
        }

        if (matchingInternships.length > 0) {
            console.log(`[DEBUG] Found ${matchingInternships.length} matching internships: ${matchingInternships.map(i => i.id).join(', ')}`);
        } else {
            console.log(`[DEBUG] No internships specified or found for title: ${internshipTitle}`);
        }

        // 3. Find the most relevant Application
        let query = { studentId: student.id };

        // If we have matching internships, filter applications to only those
        if (matchingInternships.length > 0) {
            query.internshipId = { $in: matchingInternships.map(i => i.id) };
        }

        // Get most recent application for this student (and internship if specified)
        const application = await Application.findOne(query)
            .sort({ appliedAt: -1 })
            .exec();

        if (!application) {
            console.log(`[DEBUG] No matching applications found for student ${student.id}`);
            return res.status(404).json({ error: 'Application not found for this student and internship' });
        }

        const internship = await Internship.findOne({ id: application.internshipId }).lean();
        console.log(`[DEBUG] Found latest application: ${application.id} for Internship ${internship?.id} (${internship?.title})`);

        // 4. Update Status
        const validStatuses = ['offered', 'rejected', 'interview_scheduled', 'shortlisted', 'hired', 'completed'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ error: 'Invalid status. Allowed: ' + validStatuses.join(', ') });
        }

        // "hired" automatically means "completed"
        let finalStatus = status.toLowerCase();
        if (finalStatus === 'hired') {
            finalStatus = 'completed';
        }

        // If already in this status, return success (prevents duplicate errors)
        if (application.status === finalStatus) {
            return res.json({
                success: true,
                message: `Application already has status ${finalStatus}`,
                data: {
                    student: student.name,
                    internship: internship ? internship.title : 'Unknown',
                    status: application.status
                }
            });
        }

        application.status = finalStatus;
        application.updatedAt = new Date();

        if (feedback) {
            application.interviewFeedback = feedback;
        }

        // Save to MongoDB
        await application.save();

        // 5. Send Notification (Email)
        try {
            await notifyApplicationStatusChange({
                student,
                internship,
                status: application.status,
                feedback
            });
        } catch (notifyError) {
            console.error('Failed to send notification:', notifyError);
        }

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
            data: {
                student: student.name,
                internship: internship ? internship.title : 'Unknown',
                status: application.status
            }
        });

    } catch (error) {
        console.error('Error in external update:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
