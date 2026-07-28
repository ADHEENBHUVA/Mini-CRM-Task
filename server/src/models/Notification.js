const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be an Employee or Admin depending on role
    userModel: { type: String, enum: ['Employee', 'User'], required: true }, // Distinguish admins vs employees
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // e.g. /leads/1234
    isRead: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ['Lead Assigned', 'Lead Updated', 'Lead Completed', 'Follow-up Due', 'Activity'],
        default: 'Activity'
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
