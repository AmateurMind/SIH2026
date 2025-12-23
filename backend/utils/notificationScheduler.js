const { ScheduledNotification } = require('../models');
const { sendEmail } = require('./notify');

class NotificationScheduler {
  constructor() { }

  generateNotificationId() {
    return `NOTIF_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  async scheduleNotification(notification) {
    const scheduledNotification = await ScheduledNotification.create({
      notificationId: this.generateNotificationId(),
      ...notification,
      status: 'pending',
      createdAt: new Date()
    });

    return scheduledNotification.notificationId;
  }

  // Schedule deadline reminder for internship applications
  async scheduleApplicationDeadlineReminder(internship, students) {
    const deadline = new Date(internship.applicationDeadline);
    const now = new Date();

    // Schedule reminders: 7 days, 3 days, 1 day, and 2 hours before deadline
    const reminderIntervals = [
      { days: 7, label: '7 days' },
      { days: 3, label: '3 days' },
      { days: 1, label: '1 day' },
      { hours: 2, label: '2 hours' }
    ];

    const operations = reminderIntervals.map(interval => {
      let reminderTime;
      if (interval.days) {
        reminderTime = new Date(deadline.getTime() - (interval.days * 24 * 60 * 60 * 1000));
      } else if (interval.hours) {
        reminderTime = new Date(deadline.getTime() - (interval.hours * 60 * 60 * 1000));
      }

      if (reminderTime > now) {
        return Promise.all(students.map(student => this.scheduleNotification({
          type: 'deadline_reminder',
          scheduledTime: reminderTime.toISOString(),
          recipientEmail: student.email,
          recipientName: student.name,
          subject: `⏰ ${interval.label} left to apply - ${internship.title}`,
          message: this.generateDeadlineReminderMessage(student, internship, interval.label),
          metadata: {
            internshipId: internship.id,
            studentId: student.id,
            reminderType: interval.label
          },
          createdBy: 'system'
        })));
      }

      return Promise.resolve();
    });

    await Promise.all(operations);
  }

  // Schedule mentor approval reminder
  async scheduleMentorApprovalReminder(application, mentor, internship, student) {
    const now = new Date();

    // Remind mentor after 24 hours, then every 48 hours
    const reminderTimes = [
      new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
      new Date(now.getTime() + 72 * 60 * 60 * 1000), // 72 hours (3 days)
      new Date(now.getTime() + 120 * 60 * 60 * 1000) // 120 hours (5 days)
    ];

    for (let index = 0; index < reminderTimes.length; index++) {
      const reminderTime = reminderTimes[index];
      await this.scheduleNotification({
        type: 'mentor_approval_reminder',
        scheduledTime: reminderTime.toISOString(),
        recipientEmail: mentor.email,
        recipientName: mentor.name,
        subject: `📋 Pending Approval Required - ${student.name} for ${internship.title}`,
        message: this.generateMentorApprovalReminderMessage(mentor, student, internship, index + 1),
        metadata: {
          applicationId: application.id,
          mentorId: mentor.id,
          studentId: student.id,
          internshipId: internship.id,
          reminderNumber: index + 1
        },
        createdBy: 'system'
      });
    }
  }

  // Schedule interview reminder
  async scheduleInterviewReminder(application, student, internship, interviewDetails) {
    const interviewDate = new Date(interviewDetails.date);
    const now = new Date();

    // Remind 24 hours and 2 hours before interview
    const reminderTimes = [
      new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
      new Date(interviewDate.getTime() - 2 * 60 * 60 * 1000)   // 2 hours before
    ];

    for (let index = 0; index < reminderTimes.length; index++) {
      const reminderTime = reminderTimes[index];
      if (reminderTime > now) {
        await this.scheduleNotification({
          type: 'interview_reminder',
          scheduledTime: reminderTime.toISOString(),
          recipientEmail: student.email,
          recipientName: student.name,
          subject: `📅 Interview Reminder - ${internship.title} at ${internship.company}`,
          message: this.generateInterviewReminderMessage(student, internship, interviewDetails, index === 0 ? '24 hours' : '2 hours'),
          metadata: {
            applicationId: application.id,
            studentId: student.id,
            internshipId: internship.id,
            interviewDate: interviewDetails.date,
            reminderType: index === 0 ? '24h' : '2h'
          },
          createdBy: 'system'
        });
      }
    }
  }

  // Process due notifications
  async processDueNotifications(limit = 100) {
    const now = new Date();
    const dueNotifications = await ScheduledNotification.find({
      status: 'pending',
      scheduledTime: { $lte: now }
    })
      .sort({ scheduledTime: 1 })
      .limit(limit);

    for (const notification of dueNotifications) {
      try {
        await this.sendScheduledNotification(notification);
        notification.status = 'sent';
        notification.sentAt = new Date();
        notification.error = undefined;
        await notification.save();
      } catch (error) {
        console.error('Error sending scheduled notification:', error);
        notification.status = 'failed';
        notification.error = error.message;
        notification.failedAt = new Date();
        await notification.save();
      }
    }

    return dueNotifications.length;
  }

  // Send a scheduled notification
  async sendScheduledNotification(notification) {
    return await sendEmail({
      to: notification.recipientEmail,
      subject: notification.subject,
      message: notification.message,
      fromName: 'Campus Placement Portal',
      replyTo: 'placements@college.edu'
    });
  }

  // Generate deadline reminder message
  generateDeadlineReminderMessage(student, internship, timeLeft) {
    return `Hello ${student.name},

This is a friendly reminder that the application deadline for "${internship.title}" at ${internship.company} is approaching.

⏰ Time Remaining: ${timeLeft}
📅 Deadline: ${new Date(internship.applicationDeadline).toLocaleString()}

Internship Details:
• Position: ${internship.title}
• Company: ${internship.company}
• Location: ${internship.location}
• Stipend: ${internship.stipend}
• Duration: ${internship.duration}

Don't miss this opportunity! Apply now through the Campus Placement Portal.

Best regards,
Campus Placement Cell`;
  }

  // Generate mentor approval reminder message
  generateMentorApprovalReminderMessage(mentor, student, internship, reminderNumber) {
    const urgencyText = reminderNumber === 1 ? 'gentle' : reminderNumber === 2 ? 'important' : 'urgent';

    return `Dear ${mentor.name},

This is a ${urgencyText} reminder that the following application requires your approval:

Student: ${student.name} (${student.email})
Department: ${student.department}
CGPA: ${student.cgpa}

Internship: ${internship.title}
Company: ${internship.company}

The student is waiting for your decision. Please log in to the mentor portal to approve or reject this application.

${reminderNumber > 2 ? '⚠️ This application has been pending for over 5 days. Please take action soon.' : ''}

Thank you,
Campus Placement Cell`;
  }

  // Generate interview reminder message
  generateInterviewReminderMessage(student, internship, interviewDetails, timeUntil) {
    return `Hello ${student.name},

Your interview is scheduled in ${timeUntil}!

📅 Interview Details:
• Date & Time: ${new Date(interviewDetails.date).toLocaleString()}
• Position: ${internship.title}
• Company: ${internship.company}
• Mode: ${interviewDetails.mode || 'Not specified'}
${interviewDetails.location ? `• Location: ${interviewDetails.location}` : ''}
${interviewDetails.meetingLink ? `• Meeting Link: ${interviewDetails.meetingLink}` : ''}
${interviewDetails.interviewer ? `• Interviewer: ${interviewDetails.interviewer}` : ''}

📝 Preparation Tips:
• Review your application and resume
• Research the company and role
• Prepare questions about the internship
• Test your technology if it's a virtual interview
• Arrive 5-10 minutes early

Good luck with your interview!

Best regards,
Campus Placement Cell`;
  }

  // Clean up old notifications (older than 30 days)
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await ScheduledNotification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      status: { $ne: 'pending' }
    });
  }

  // Get notification statistics
  async getNotificationStats() {
    const [total, pending, sent, failed, cancelled, byType] = await Promise.all([
      ScheduledNotification.countDocuments(),
      ScheduledNotification.countDocuments({ status: 'pending' }),
      ScheduledNotification.countDocuments({ status: 'sent' }),
      ScheduledNotification.countDocuments({ status: 'failed' }),
      ScheduledNotification.countDocuments({ status: 'cancelled' }),
      ScheduledNotification.aggregate([
        {
          $group: {
            _id: '$type',
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
          }
        }
      ])
    ]);

    const typeStats = {};
    byType.forEach(type => {
      typeStats[type._id] = {
        pending: type.pending,
        sent: type.sent,
        failed: type.failed,
        cancelled: type.cancelled
      };
    });

    return {
      total,
      pending,
      sent,
      failed,
      cancelled,
      byType: typeStats
    };
  }

  async getScheduledNotifications(filter = {}, limit = 50) {
    return ScheduledNotification.find(filter)
      .sort({ scheduledTime: -1 })
      .limit(limit)
      .lean();
  }

  async getUserNotifications(email, limit = 20) {
    return ScheduledNotification.find({
      recipientEmail: email
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async cancelNotification(notificationId, userId) {
    const notification = await ScheduledNotification.findOne({ notificationId });
    if (!notification) {
      return null;
    }

    notification.status = 'cancelled';
    notification.cancelledAt = new Date();
    notification.cancelledBy = userId;
    await notification.save();

    return notification.toObject();
  }
}

// Singleton instance
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;