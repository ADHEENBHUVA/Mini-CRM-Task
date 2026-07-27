const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    leadSource: { type: String },
    interestedService: { type: String },
    expectedBudget: { type: Number, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
        default: 'New'
    },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
