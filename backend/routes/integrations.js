const express = require('express');
const router = express.Router();
console.log('🔄 Integrations Router Loaded');

const fs = require('fs');
const path = require('path');
const { Student } = require('../models');
const { notifyApplicationStatusChange } = require('../utils/notify');
const notificationService = require('../services/notificationService');

const applicationsPath = path.join(__dirname, '../data/applications.json');
const internshipsPath = path.join(__dirname, '../data/internships.json');
const studentsPath = path.join(__dirname, '../data/students.json');

const readApplications = () => JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
const writeApplications = (applications) => fs.writeFileSync(applicationsPath, JSON.stringify(applications, null, 2));
const readInternships = () => JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
const readStudents = () => JSON.parse(fs.readFileSync(studentsPath, 'utf8'));

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

// Update application status by Email and Internship ID/Title
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

        // 1. Find Student
        const jsonStudents = readStudents();
        const mongoStudents = await Student.find({}).lean();

        // Merge lists to find student
        let student = null;

        if (studentEmail) {
            student = jsonStudents.find(s => s.email.toLowerCase() === studentEmail.toLowerCase());
            if (!student) {
                student = mongoStudents.find(s => s.email.toLowerCase() === studentEmail.toLowerCase());
            }
        } else if (studentName) {
            // Case-insensitive fuzzy name match
            student = jsonStudents.find(s => s.name.toLowerCase().includes(studentName.toLowerCase()));
            if (!student) {
                student = mongoStudents.find(s => s.name.toLowerCase().includes(studentName.toLowerCase()));
            }
        }

        if (!student) {
            console.log(`[DEBUG] Student not found: ${searchIdentifier}`);
            return res.status(404).json({ error: `Student '${searchIdentifier}' not found` });
        }
        console.log(`[DEBUG] Found student: ${student.id} (${student.name})`);

        // 2. Find Matching Internships
        const internships = readInternships();
        let matchingInternships = [];

        if (internshipId) {
            const found = internships.find(i => i.id === internshipId);
            if (found) matchingInternships.push(found);
        } else if (internshipTitle) {
            // Find ALL internships with matching title
            matchingInternships = internships.filter(i =>
                i.title.toLowerCase().includes(internshipTitle.toLowerCase())
            );
        }

        if (matchingInternships.length > 0) {
            console.log(`[DEBUG] Found ${matchingInternships.length} matching internships: ${matchingInternships.map(i => i.id).join(', ')}`);
        } else {
            console.log(`[DEBUG] No internships found for title: ${internshipTitle}`);
        }

        // 3. Find the most relevant Application
        const applications = readApplications();
        let application = null;
        let internship = null;

        // Filter applications for this student
        let studentApps = applications.filter(app => app.studentId === student.id);

        // If we have matching internships, filter applications to only those
        if (matchingInternships.length > 0) {
            studentApps = studentApps.filter(app =>
                matchingInternships.some(i => i.id === app.internshipId)
            );
        }

        // Sort by appliedAt (descending) to get the latest one
        studentApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

        if (studentApps.length > 0) {
            application = studentApps[0];
            internship = internships.find(i => i.id === application.internshipId);
            console.log(`[DEBUG] Found latest application: ${application.id} for Internship ${internship?.id} (${internship?.title})`);
        } else {
            console.log(`[DEBUG] No matching applications found for student ${student.id}`);
            return res.status(404).json({ error: 'Application not found for this student and internship' });
        }

        // 4. Update Status
        const validStatuses = ['offered', 'rejected', 'interview_scheduled', 'shortlisted'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ error: 'Invalid status. Allowed: ' + validStatuses.join(', ') });
        }

        application.status = status.toLowerCase();
        application.updatedAt = new Date().toISOString();

        if (feedback) {
            application.interviewFeedback = feedback;
        }

        // Write back
        const appIndex = applications.findIndex(a => a.id === application.id);
        applications[appIndex] = application;
        writeApplications(applications);

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
