const mongoose = require('mongoose');

const FollowupSchema = new mongoose.Schema({
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    followupDate: { type: Date, required: true },
    remarks: { type: String },
    nextFollowupDate: { type: Date },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Followup', FollowupSchema);
