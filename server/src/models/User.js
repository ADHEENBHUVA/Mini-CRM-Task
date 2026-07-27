const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'New Employee'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Sales Rep', 'Support Team'],
        default: 'Sales Rep'
    },
    department: {
        type: String,
        enum: ['Sales', 'Support', 'IT', 'Management'],
        default: 'Sales'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
