const mongoose = require('mongoose');

const FollowupSchema = new mongoose.Schema({
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    followupDate: { type: Date, required: true },
    followupTime: { type: String }, // e.g. "14:30"
    customerResponse: { type: String }, // optional text
    remarks: { type: String }, // Employee comments
    nextFollowupDate: { type: Date },
    status: {
        type: String,
        enum: ['Pending', 'Due Follow-up', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    adminForced: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Followup', FollowupSchema);
