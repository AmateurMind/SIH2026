const mongoose = require('mongoose');

const scheduledNotificationSchema = new mongoose.Schema({
    notificationId: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    recipientEmail: { type: String, required: true },
    recipientName: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: String },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'cancelled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    sentAt: { type: Date },
    failedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: String },
    error: { type: String }
});

scheduledNotificationSchema.index({ status: 1, scheduledTime: 1 });
scheduledNotificationSchema.index({ createdAt: 1 });

module.exports = mongoose.model('ScheduledNotification', scheduledNotificationSchema);

