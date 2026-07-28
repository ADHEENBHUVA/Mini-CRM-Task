const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    text: { type: String, required: true },
    type: {
        type: String,
        enum: ['Status Change', 'General Note', 'Follow-up Note', 'Win/Loss Reason'],
        default: 'General Note'
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
