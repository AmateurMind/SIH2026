const express = require('express');
const { authorize } = require('../middleware/auth');
const requireHybridAuth = require('../middleware/clerkHybridAuth');
const notificationService = require('../services/notificationService');
const notificationScheduler = require('../utils/notificationScheduler');
const { ScheduledNotification } = require('../models');

const router = express.Router();

// Get notification service status (admin only)
router.get('/status', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const status = await notificationService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting notification status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification statistics (admin only)
router.get('/stats', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const stats = await notificationScheduler.getNotificationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send test notification (admin only)
router.post('/test', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'Email, subject, and message are required' });
    }

    const testNotification = {
      recipientEmail: email,
      subject,
      message
    };

    const result = await notificationService.sendImmediateNotification(testNotification);

    res.json({
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Get scheduled notifications (admin only)
router.get('/scheduled', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const notifications = await notificationScheduler.getScheduledNotifications(filter, parsedLimit);

    res.json({
      notifications,
      total: notifications.length,
      filters: { type, status, limit: parsedLimit }
    });
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user-specific notifications (students, mentors)
router.get('/my-notifications', requireHybridAuth, async (req, res) => {
  try {
    const notifications = await notificationScheduler.getUserNotifications(req.user.email);

    res.json({
      notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Schedule notification - POST /api/notifications
router.post('/', requireHybridAuth, async (req, res) => {
  try {
    const { title, message, sendAt, recipientEmail } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const notificationEmail = recipientEmail || req.user.email;
    const scheduledTime = sendAt ? new Date(sendAt) : new Date();

    const notificationId = await notificationScheduler.scheduleNotification({
      type: 'manual',
      scheduledTime,
      recipientEmail: notificationEmail,
      recipientName: req.user.name,
      subject: title,
      message,
      metadata: {
        createdBy: req.user.id || req.user.email
      },
      createdBy: req.user.id || req.user.email
    });

    const notification = await ScheduledNotification.findOne({ notificationId }).lean();

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({ error: 'Failed to schedule notification' });
  }
});

// Get all notifications - GET /api/notifications
router.get('/', requireHybridAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.$or = [
        { recipientEmail: req.user.email },
        { createdBy: req.user.id || req.user.email },
        { 'metadata.createdBy': req.user.id || req.user.email }
      ];
    }

    const notifications = await ScheduledNotification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel notification - POST /api/notifications/:id/cancel
router.post('/:id/cancel', requireHybridAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await ScheduledNotification.findOne({ notificationId: id });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (req.user.role !== 'admin' &&
      notification.recipientEmail !== req.user.email &&
      notification.createdBy !== (req.user.id || req.user.email) &&
      notification.metadata?.createdBy !== (req.user.id || req.user.email)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cancelled = await notificationScheduler.cancelNotification(id, req.user.id || req.user.email);

    res.json({
      message: 'Notification cancelled successfully',
      notification: cancelled
    });
  } catch (error) {
    console.error('Error cancelling notification:', error);
    res.status(500).json({ error: 'Failed to cancel notification' });
  }
});

// Manual notification processing (admin only, for debugging)
router.post('/process', requireHybridAuth, authorize('admin'), async (req, res) => {
  try {
    const processedCount = await notificationService.processNotifications();

    res.json({
      message: 'Manual notification processing completed',
      processedCount
    });
  } catch (error) {
    console.error('Error processing notifications manually:', error);
    res.status(500).json({ error: 'Failed to process notifications' });
  }
});

module.exports = router;