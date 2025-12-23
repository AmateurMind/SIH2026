const express = require('express');
const fs = require('fs');
const path = require('path');
const { authorize } = require('../middleware/auth');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const router = express.Router();

const { Application, Internship, Student } = require('../models');

// Faculty events and Student events are still JSON-based for now (as per user scope not mentioning them)
// But we should protect against file read errors more robustly or consider migrating them too.
// For now, only Applications and Internships are critical to be DB-based.

const facultyEventsPath = path.join(__dirname, '../data/faculty_events.json');
const studentEventsPath = path.join(__dirname, '../data/student_events.json');
const availabilityPath = path.join(__dirname, '../data/availability.json'); // Keep availability JSON for now

const readFacultyEvents = () => {
  if (!fs.existsSync(facultyEventsPath)) return [];
  try { return JSON.parse(fs.readFileSync(facultyEventsPath, 'utf8')); } catch (e) { return []; }
};
const readStudentEvents = () => {
  if (!fs.existsSync(studentEventsPath)) return [];
  try { return JSON.parse(fs.readFileSync(studentEventsPath, 'utf8')); } catch (e) { return []; }
};


// Get calendar events for the authenticated user
router.get('/events', requireHybridAuth, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const facultyEvents = readFacultyEvents(); // Still JSON

    console.log(`[Calendar] Fetching events for User: ${req.user.id} (${req.user.role})`);

    // Fetch Applications and Internships from MongoDB
    let userApplications = [];
    if (req.user.role === 'student') {
      userApplications = await Application.find({ studentId: req.user.id }).lean();
    } else if (req.user.role === 'mentor') {
      userApplications = await Application.find({ mentorId: req.user.id }).lean();
    } else if (req.user.role === 'admin' || req.user.role === 'recruiter') {
      userApplications = await Application.find({}).lean();
    }

    // Get unique internship IDs and student IDs to batch fetch
    const internshipIds = [...new Set(userApplications.map(app => app.internshipId))];
    const studentIds = [...new Set(userApplications.map(app => app.studentId))];

    const internships = await Internship.find({ id: { $in: internshipIds } }).lean();
    const students = await Student.find({ id: { $in: studentIds } }).lean();

    console.log(`[Calendar] Found ${userApplications.length} applications.`);

    const events = [];

    userApplications.forEach(app => {
      const internship = internships.find(i => i.id === app.internshipId);
      const student = students.find(s => s.id === app.studentId);


      const companyName = internship ? internship.company : 'Unknown Company';
      const internshipTitle = internship ? internship.title : 'Unknown Role';
      const studentName = student ? student.name : 'Unknown Student';
      const eventTime = new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 1. Application Date Event
      // Format: "Student Name - Internship Title (Time)"
      // If user is student, we might want "Applied: Title", but user request implies specific format.
      // Assuming this requested format is primarily for Mentors/Admins seeing many students.
      // If it's a student viewing their own, "Sumit - ..." is redundant but acceptable. 
      // Let's stick to the requested format mostly.

      let eventTitle = '';
      if (req.user.role === 'student') {
        eventTitle = `Applied: ${internshipTitle}`;
      } else {
        eventTitle = `${studentName} - ${internshipTitle}`;
      }

      events.push({
        id: `app-${app.id}`,
        type: 'application_submitted',
        title: eventTitle,
        company: companyName,
        date: app.appliedAt,
        time: eventTime,
        location: 'Online',
        applicationId: app.id,
        status: app.status
      });

      // 2. Internship Start and End Dates (only for accepted/offered applications)
      const acceptedStatuses = ['offered', 'approved', 'selected', 'hired', 'interning', 'completed'];
      if (internship && internship.startDate && acceptedStatuses.includes(app.status?.toLowerCase())) {
        // Start Date
        events.push({
          id: `start-${app.id}`,
          type: 'internship_start',
          title: `Starts: ${internshipTitle}`,
          company: companyName,
          date: internship.startDate,
          time: '09:00 AM',
          location: internship.location || 'On-site',
          internshipId: internship.id
        });

        // Calculate End Date
        let endDateObj = null;
        if (internship.duration) {
          const durationStr = internship.duration.toString().toLowerCase();
          const durationNum = parseInt(durationStr);

          if (!isNaN(durationNum)) {
            const start = new Date(internship.startDate);
            if (durationStr.includes('week')) {
              endDateObj = new Date(start.getTime() + durationNum * 7 * 24 * 60 * 60 * 1000);
            } else {
              // Default to months if "month" is present or just a number
              endDateObj = new Date(start);
              endDateObj.setMonth(endDateObj.getMonth() + durationNum);
            }
          }
        }

        // End Date Event
        if (endDateObj) {
          events.push({
            id: `end-${app.id}`,
            type: 'internship_end',
            title: `Ends: ${internshipTitle}`,
            company: companyName,
            date: endDateObj.toISOString(),
            time: '05:00 PM',
            location: internship.location || 'On-site',
            internshipId: internship.id
          });
        }
      }
    });

    // Add Faculty Events
    // Mentors should only see their OWN events + generic university events (if no createdBy)
    // Admins see all
    facultyEvents.forEach(event => {
      let isVisible = true;
      if (req.user.role === 'mentor') {
        // Show if created by this mentor OR if it's a global event (no createdBy)
        // Assuming undefined createdBy means global/admin event
        isVisible = !event.createdBy || event.createdBy === req.user.id;
      }

      if (isVisible) {
        events.push({
          ...event,
          type: 'faculty_event' // consistent type
        });
      }
    });

    // Add Student Personal Events (only for the specific student)
    if (req.user.role === 'student') {
      const studentEvents = readStudentEvents();
      const myEvents = studentEvents.filter(e => e.studentId === req.user.id);

      myEvents.forEach(event => {
        events.push({
          ...event,
          type: 'student_personal_event', // distinctive type
          company: event.company || 'Personal'
        });
      });
    }

    // Filter by date range if provided
    let filteredEvents = events;
    if (startDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.date) >= new Date(startDate));
    }
    if (endDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.date) <= new Date(endDate));
    }

    // Filter by type if provided
    if (type && type !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }

    // Sort by date
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      events: filteredEvents,
      total: filteredEvents.length,
      summary: {
        applications: filteredEvents.filter(e => e.type === 'application_submitted').length,
        starts: filteredEvents.filter(e => e.type === 'internship_start').length,
        ends: filteredEvents.filter(e => e.type === 'internship_end').length,
        faculty: filteredEvents.filter(e => e.type === 'faculty_event').length
      }
    });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a faculty event
router.post('/faculty-events', requireHybridAuth, (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, date, time, location } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const currentEvents = readFacultyEvents();
    const newEvent = {
      id: `evt-${Date.now()}`,
      type: 'faculty_event',
      title,
      description,
      date,
      time: time || '12:00 PM',
      location: location || 'TBD',
      company: 'University Event',
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    currentEvents.push(newEvent);
    fs.writeFileSync(facultyEventsPath, JSON.stringify(currentEvents, null, 2));

    res.status(201).json({ message: 'Event added successfully', event: newEvent });
  } catch (error) {
    console.error('Error adding faculty event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a faculty event
router.delete('/faculty-events/:id', requireHybridAuth, (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    let currentEvents = readFacultyEvents();
    const eventIndex = currentEvents.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    currentEvents.splice(eventIndex, 1);
    fs.writeFileSync(facultyEventsPath, JSON.stringify(currentEvents, null, 2));

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a student personal event
router.post('/student-events', requireHybridAuth, (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, date, time, location } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const currentEvents = readStudentEvents();
    const newEvent = {
      id: `std-evt-${Date.now()}`,
      type: 'student_personal_event',
      title,
      description,
      date,
      time: time || 'All Day',
      location: location || 'Personal',
      company: 'Personal Event',
      studentId: req.user.id,
      createdAt: new Date().toISOString()
    };

    currentEvents.push(newEvent);
    fs.writeFileSync(studentEventsPath, JSON.stringify(currentEvents, null, 2));

    res.status(201).json({ message: 'Event added successfully', event: newEvent });
  } catch (error) {
    console.error('Error adding student event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a student personal event
router.delete('/student-events/:id', requireHybridAuth, (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    let currentEvents = readStudentEvents();
    const eventIndex = currentEvents.findIndex(e => e.id === id && e.studentId === req.user.id);

    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    currentEvents.splice(eventIndex, 1);
    fs.writeFileSync(studentEventsPath, JSON.stringify(currentEvents, null, 2));

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting student event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get calendar summary/stats
router.get('/summary', requireHybridAuth, async (req, res) => {
  try {
    let userApplications = [];
    if (req.user.role === 'student') {
      userApplications = await Application.find({ studentId: req.user.id }).lean();
    } else {
      userApplications = await Application.find({}).lean(); // Admin/All
    }

    // We need all internships to check deadlines, not just the ones applied to
    // But for performance, maybe just fetch active ones with deadlines
    const internships = await Internship.find({ status: 'active', applicationDeadline: { $exists: true } }).lean();

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Count upcoming interviews
    const upcomingInterviews = userApplications.filter(app => {
      if (!app.interviewScheduled) return false;
      const interviewDate = new Date(app.interviewScheduled.date);
      return interviewDate >= now;
    }).length;

    // Count interviews this week
    const interviewsThisWeek = userApplications.filter(app => {
      if (!app.interviewScheduled) return false;
      const interviewDate = new Date(app.interviewScheduled.date);
      return interviewDate >= now && interviewDate <= weekFromNow;
    }).length;

    // Count active deadlines
    const activeDeadlines = internships.filter(i => {
      if (i.status !== 'active' || !i.applicationDeadline) return false;
      return new Date(i.applicationDeadline) >= now;
    }).length;

    // Count urgent deadlines (within 3 days)
    const urgentDeadlines = internships.filter(i => {
      if (i.status !== 'active' || !i.applicationDeadline) return false;
      const deadline = new Date(i.applicationDeadline);
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 3;
    }).length;

    // Count pending offers
    const pendingOffers = userApplications.filter(app =>
      app.status === 'offered' && app.offerDetails?.offerExpiry
    ).length;

    res.json({
      upcomingInterviews,
      interviewsThisWeek,
      activeDeadlines,
      urgentDeadlines,
      pendingOffers,
      nextEvent: null // Can be populated with the next upcoming event
    });
  } catch (error) {
    console.error('Error fetching calendar summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create availability slots (for interview scheduling)
router.post('/availability', requireHybridAuth, (req, res) => {
  try {
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Slots array is required' });
    }

    // Store availability slots (would typically be in database)
    const availabilityPath = path.join(__dirname, '../data/availability.json');
    let availability = {};

    if (fs.existsSync(availabilityPath)) {
      availability = JSON.parse(fs.readFileSync(availabilityPath, 'utf8'));
    }

    availability[req.user.id] = {
      userId: req.user.id,
      role: req.user.role,
      slots: slots.map(slot => ({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable !== false
      })),
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(availabilityPath, JSON.stringify(availability, null, 2));

    res.json({
      message: 'Availability updated successfully',
      slots: availability[req.user.id].slots
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get availability for a user
router.get('/availability/:userId?', requireHybridAuth, (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const availabilityPath = path.join(__dirname, '../data/availability.json');

    if (!fs.existsSync(availabilityPath)) {
      return res.json({ slots: [] });
    }

    const availability = JSON.parse(fs.readFileSync(availabilityPath, 'utf8'));
    const userAvailability = availability[userId];

    if (!userAvailability) {
      return res.json({ slots: [] });
    }

    // Filter to only show future slots
    const futureSlots = userAvailability.slots.filter(slot =>
      new Date(slot.date) >= new Date()
    );

    res.json({
      userId: userAvailability.userId,
      slots: futureSlots,
      updatedAt: userAvailability.updatedAt
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate ICS file for calendar export
router.get('/export/ics', requireHybridAuth, async (req, res) => {
  try {
    const facultyEvents = readFacultyEvents();

    let userApplications = [];
    let internships = [];

    if (req.user.role === 'student') {
      userApplications = await Application.find({ studentId: req.user.id }).lean();
    } else {
      userApplications = await Application.find({}).lean();
    }

    // For ICS we need internships related to applications PLUS generic deadlines maybe?
    // Let's fetch all active internships for the deadline events
    internships = await Internship.find({ status: 'active' }).lean();

    // Also need internships for the applications to get titles
    const appInternshipIds = userApplications.map(a => a.internshipId);
    const relatedInternships = await Internship.find({ id: { $in: appInternshipIds } }).lean();

    // Merge lists avoiding duplicates
    const allInternships = [...internships];
    relatedInternships.forEach(ri => {
      if (!allInternships.find(i => i.id === ri.id)) {
        allInternships.push(ri);
      }
    });

    // Build ICS content
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusBuddy//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:CampusBuddy Events'
    ];

    // Add interview events
    userApplications.forEach(app => {
      if (app.interviewScheduled) {
        const internship = allInternships.find(i => i.id === app.internshipId);
        const date = new Date(app.interviewScheduled.date);
        const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:interview-${app.id}@campusbuddy`,
          `DTSTAMP:${dateStr}`,
          `DTSTART:${dateStr}`,
          `SUMMARY:Interview - ${internship?.title || 'Unknown'}`,
          `DESCRIPTION:Interview at ${internship?.company || 'Unknown Company'}\\n${app.interviewScheduled.mode === 'online' ? 'Online Interview' : 'Location: ' + (app.interviewScheduled.location || 'TBD')}`,
          app.interviewScheduled.meetingLink ? `URL:${app.interviewScheduled.meetingLink}` : '',
          `LOCATION:${app.interviewScheduled.mode === 'online' ? 'Online' : (app.interviewScheduled.location || 'TBD')}`,
          'END:VEVENT'
        );
      }
    });

    // Add deadline events
    internships.filter(i => i.status === 'active' && i.applicationDeadline).forEach(internship => {
      const date = new Date(internship.applicationDeadline);
      if (date >= new Date()) {
        const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:deadline-${internship.id}@campusbuddy`,
          `DTSTAMP:${dateStr}`,
          `DTSTART:${dateStr}`,
          `SUMMARY:Application Deadline - ${internship.title}`,
          `DESCRIPTION:Application deadline for ${internship.title} at ${internship.company}`,
          'END:VEVENT'
        );
      }
    });

    // Add faculty events to ICS
    facultyEvents.forEach(event => {
      const date = new Date(event.date);
      const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@campusbuddy`,
        `DTSTAMP:${dateStr}`,
        `DTSTART:${dateStr}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || 'University Event'}`,
        `LOCATION:${event.location || 'Campus'}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=campusbuddy-calendar.ics');
    res.send(icsContent.filter(line => line).join('\r\n'));
  } catch (error) {
    console.error('Error exporting calendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
