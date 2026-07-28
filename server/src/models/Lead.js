const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true }, // Customer Name
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String },
    leadSource: { type: String },
    interestedService: { type: String },
    expectedBudget: { type: Number, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: {
        type: String,
        enum: ['New', 'Pending', 'Contacted', 'Qualified', 'Proposal Sent', 'Interested', 'Not Interested', 'Callback', 'Follow-up Scheduled', 'Lead Done', 'Lead Not Done'],
        default: 'New'
    },
    result: {
        type: String,
        enum: ['Pending', 'Lead Won', 'Lead Loss'],
        default: 'Pending'
    },
    nextFollowupDate: { type: Date },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    description: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
