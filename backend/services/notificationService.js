const notificationScheduler = require('../utils/notificationScheduler');
const { Student, Mentor, Internship } = require('../models');

class NotificationService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.processingInterval = 60000; // Check every minute
    this.startTime = null;
  }

  // Start the notification processing service
  start() {
    if (this.isRunning) {
      console.log('[NotificationService] Service already running');
      return;
    }

    console.log('[NotificationService] Starting notification service...');
    this.isRunning = true;
    this.startTime = Date.now();

    // Process immediately on start
    this.processNotifications();

    // Set up interval processing
    this.intervalId = setInterval(() => {
      this.processNotifications();
    }, this.processingInterval);

    // Clean up old notifications daily
    setInterval(() => {
      notificationScheduler.cleanupOldNotifications();
    }, 24 * 60 * 60 * 1000); // Once per day

    console.log('[NotificationService] Service started successfully');
  }

  // Stop the notification processing service
  stop() {
    if (!this.isRunning) {
      console.log('[NotificationService] Service not running');
      return;
    }

    console.log('[NotificationService] Stopping notification service...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('[NotificationService] Service stopped');
  }

  // Process due notifications
  async processNotifications() {
    try {
      const processedCount = await notificationScheduler.processDueNotifications();
      if (processedCount > 0) {
        console.log(`[NotificationService] Processed ${processedCount} notifications`);
      }
      return processedCount;
    } catch (error) {
      console.error('[NotificationService] Error processing notifications:', error);
      throw error;
    }
  }

  // Schedule application deadline reminders for a new internship
  async scheduleInternshipDeadlineReminders(internship) {
    try {
      const eligibleStudents = await Student.find({
        department: { $in: internship.eligibleDepartments },
        cgpa: { $gte: internship.minimumCGPA },
        semester: { $gte: internship.minimumSemester }
      }).lean();

      if (eligibleStudents.length > 0) {
        await notificationScheduler.scheduleApplicationDeadlineReminder(internship, eligibleStudents);
        console.log(`[NotificationService] Scheduled deadline reminders for ${eligibleStudents.length} eligible students`);
      }
    } catch (error) {
      console.error('[NotificationService] Error scheduling deadline reminders:', error);
    }
  }

  // Schedule mentor approval reminder for a new application
  async scheduleMentorApprovalReminder(application) {
    try {
      const [mentor, internship, student] = await Promise.all([
        Mentor.findOne({ id: application.mentorId }).lean(),
        Internship.findOne({ id: application.internshipId }).lean(),
        Student.findOne({ id: application.studentId }).lean()
      ]);

      if (mentor && internship && student) {
        await notificationScheduler.scheduleMentorApprovalReminder(application, mentor, internship, student);
        console.log(`[NotificationService] Scheduled mentor approval reminders for application ${application.id}`);
      }
    } catch (error) {
      console.error('[NotificationService] Error scheduling mentor approval reminder:', error);
    }
  }

  // Schedule interview reminders
  async scheduleInterviewReminders(application, interviewDetails) {
    try {
      const [internship, student] = await Promise.all([
        Internship.findOne({ id: application.internshipId }).lean(),
        Student.findOne({ id: application.studentId }).lean()
      ]);

      if (internship && student) {
        await notificationScheduler.scheduleInterviewReminder(application, student, internship, interviewDetails);
        console.log(`[NotificationService] Scheduled interview reminders for application ${application.id}`);
      }
    } catch (error) {
      console.error('[NotificationService] Error scheduling interview reminders:', error);
    }
  }

  // Get service status
  async getStatus() {
    const stats = await notificationScheduler.getNotificationStats();
    return {
      isRunning: this.isRunning,
      processingInterval: this.processingInterval,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      stats
    };
  }

  // Send immediate notification (for testing or urgent notifications)
  async sendImmediateNotification(notification) {
    try {
      const result = await notificationScheduler.sendScheduledNotification(notification);
      console.log('[NotificationService] Immediate notification sent:', result);
      return result;
    } catch (error) {
      console.error('[NotificationService] Error sending immediate notification:', error);
      throw error;
    }
  }

  // Schedule placement offer expiry reminders
  async scheduleOfferExpiryReminders(application, offerDetails) {
    try {
      if (!offerDetails.offerExpiry) return;

      const [student, internship] = await Promise.all([
        Student.findOne({ id: application.studentId }).lean(),
        Internship.findOne({ id: application.internshipId }).lean()
      ]);

      if (student && internship) {
        const expiryDate = new Date(offerDetails.offerExpiry);
        const now = new Date();

        // Remind 3 days, 1 day, and 6 hours before expiry
        const reminderTimes = [
          new Date(expiryDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days
          new Date(expiryDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day
          new Date(expiryDate.getTime() - 6 * 60 * 60 * 1000)       // 6 hours
        ];

        const timeLabels = ['3 days', '1 day', '6 hours'];
        for (let index = 0; index < reminderTimes.length; index++) {
          const reminderTime = reminderTimes[index];
          if (reminderTime > now) {
            await notificationScheduler.scheduleNotification({
              type: 'offer_expiry_reminder',
              scheduledTime: reminderTime.toISOString(),
              recipientEmail: student.email,
              recipientName: student.name,
              subject: `⚠️ Offer Expires in ${timeLabels[index]} - ${internship.title}`,
              message: this.generateOfferExpiryMessage(student, internship, offerDetails, timeLabels[index]),
              metadata: {
                applicationId: application.id,
                studentId: student.id,
                internshipId: internship.id,
                reminderType: timeLabels[index]
              }
            });
          }
        }

        console.log(`[NotificationService] Scheduled offer expiry reminders for application ${application.id}`);
      }
    } catch (error) {
      console.error('[NotificationService] Error scheduling offer expiry reminders:', error);
    }
  }

  // Generate offer expiry reminder message
  generateOfferExpiryMessage(student, internship, offerDetails, timeLeft) {
    return `Hello ${student.name},

Your internship offer is expiring soon!

⏰ Time Remaining: ${timeLeft}
📅 Offer Expires: ${new Date(offerDetails.offerExpiry).toLocaleString()}

Offer Details:
• Position: ${internship.title}
• Company: ${internship.company}
• Stipend: ${offerDetails.stipend}
• Duration: ${offerDetails.duration}
• Start Date: ${new Date(offerDetails.startDate).toDateString()}

Please log in to your student portal to accept or decline this offer before it expires.

Don't miss out on this opportunity!

Best regards,
Campus Placement Cell`;
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;