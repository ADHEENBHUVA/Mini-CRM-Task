const Lead = require('../models/Lead');
const Followup = require('../models/Followup');

exports.getLeadReport = async (req, res) => {
    try {
        const { filter, startDate, endDate, status, employeeId } = req.query;
        let query = {};

        const isAdmin = req.user && (req.user.role === 'Admin' || req.user.role === 'Master Admin');
        if (!isAdmin) {
            query.assignedEmployee = req.user.id;
        } else if (employeeId) {
            query.assignedEmployee = employeeId;
        }

        if (status) query.status = status;

        const now = new Date();
        if (filter === 'Today') {
            const start = new Date(now.setHours(0, 0, 0, 0));
            const end = new Date(now.setHours(23, 59, 59, 999));
            query.createdAt = { $gte: start, $lte: end };
        } else if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const leads = await Lead.find(query)
            .populate('assignedEmployee', 'name email department')
            .sort({ createdAt: -1 });

        res.json({ ok: true, data: leads });
    } catch (error) {
        console.error('Error in getLeadReport:', error);
        res.status(500).json({ ok: false, message: 'Server error generating lead report' });
    }
};

exports.getFollowupReport = async (req, res) => {
    try {
        const { filter, startDate, endDate, status, employeeId } = req.query;
        let query = {};

        const isAdmin = req.user && (req.user.role === 'Admin' || req.user.role === 'Master Admin');
        if (!isAdmin) {
            query.employee = req.user.id;
        } else if (employeeId) {
            query.employee = employeeId;
        }

        if (status) query.status = status;

        const now = new Date();
        if (filter === 'Today') {
            const start = new Date(now.setHours(0, 0, 0, 0));
            const end = new Date(now.setHours(23, 59, 59, 999));
            query.followupDate = { $gte: start, $lte: end };
        } else if (startDate && endDate) {
            query.followupDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const followups = await Followup.find(query)
            .populate('lead', 'companyName contactPerson result')
            .populate('employee', 'name')
            .sort({ followupDate: -1 });

        res.json({ ok: true, data: followups });
    } catch (error) {
        console.error('Error in getFollowupReport:', error);
        res.status(500).json({ ok: false, message: 'Server error generating followup report' });
    }
};
