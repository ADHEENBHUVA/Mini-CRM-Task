const Lead = require('../models/Lead');
const Followup = require('../models/Followup');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
    try {
        const isAdmin = req.user && (req.user.role === 'Admin' || req.user.role === 'Master Admin' || req.user.role === 'Superadmin');
        let leadQuery = { isDeleted: { $ne: true } };
        let followupQuery = {};

        if (!isAdmin) {
            leadQuery = { isDeleted: { $ne: true }, assignedEmployee: new mongoose.Types.ObjectId(req.user.id) };
            followupQuery = { employee: new mongoose.Types.ObjectId(req.user.id) };
        }

        const { filter, startDate, endDate, specificDate } = req.query;

        let dateQuery = {};
        const now = new Date();
        if (filter === 'Today') {
            const start = new Date(now.setHours(0, 0, 0, 0));
            const end = new Date(now.setHours(23, 59, 59, 999));
            dateQuery = { createdAt: { $gte: start, $lte: end } };
        } else if (filter === 'Yesterday') {
            const start = new Date(now);
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            dateQuery = { createdAt: { $gte: start, $lte: end } };
        } else if (filter === 'Current Month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            dateQuery = { createdAt: { $gte: start } };
        } else if (filter === 'Specific Date' && specificDate) {
            const start = new Date(specificDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            dateQuery = { createdAt: { $gte: start, $lte: end } };
        } else if (filter === 'Custom Range' && startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateQuery = { createdAt: { $gte: new Date(startDate), $lte: end } };
        }

        const totalLeads = await Lead.countDocuments({ ...leadQuery, ...dateQuery });
        const assignedLeads = await Lead.countDocuments({ ...leadQuery, ...dateQuery, assignedEmployee: { $exists: true, $ne: null } });
        const wonDeals = await Lead.countDocuments({ ...leadQuery, ...dateQuery, result: 'Lead Won' });
        const lostDeals = await Lead.countDocuments({ ...leadQuery, ...dateQuery, result: 'Lead Loss' });
        const pendingLeads = await Lead.countDocuments({ ...leadQuery, ...dateQuery, result: 'Pending' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysLeads = await Lead.countDocuments({ ...leadQuery, createdAt: { $gte: today, $lt: tomorrow } });

        const todaysFollowups = await Followup.countDocuments({ ...followupQuery, followupDate: { $gte: today, $lt: tomorrow } });
        const completedFollowups = await Followup.countDocuments({ ...followupQuery, status: 'Completed' });
        const pendingFollowups = await Followup.countDocuments({ ...followupQuery, status: 'Pending' });
        const dueFollowups = await Followup.countDocuments({ ...followupQuery, status: 'Due Follow-up' });
        const overdueFollowups = await Followup.countDocuments({ ...followupQuery, followupDate: { $lt: today }, status: { $in: ['Pending', 'Due Follow-up'] } });

        let activeEmployees = 0;
        let inactiveEmployees = 0;

        if (isAdmin) {
            activeEmployees = await Employee.countDocuments({ status: 'Active', isDeleted: { $ne: true } });
            inactiveEmployees = await Employee.countDocuments({ status: 'Inactive', isDeleted: { $ne: true } });
        }

        const winRate = totalLeads > 0 ? ((wonDeals / totalLeads) * 100).toFixed(2) : 0;
        const lossRate = totalLeads > 0 ? ((lostDeals / totalLeads) * 100).toFixed(2) : 0;
        const conversionRate = assignedLeads > 0 ? ((wonDeals / assignedLeads) * 100).toFixed(2) : 0;

        const statusDistribution = await Lead.aggregate([
            { $match: leadQuery },
            { $group: { _id: '$result', count: { $sum: 1 } } }
        ]);

        let formattedStatusData = statusDistribution.map(stat => {
            let labelName = stat._id || 'Unknown';
            if (labelName === 'Lead Won') labelName = 'Won Deal';
            if (labelName === 'Lead Loss') labelName = 'Lost Deal';
            if (labelName === 'Pending') labelName = 'Pending Deals';

            return {
                name: labelName,
                value: stat.count
            };
        });

        // Fetch Monthly Data for the Bar Chart
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(1); // Set to 1st to prevent month rollover
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyActivity = await Lead.aggregate([
            { $match: { ...leadQuery, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    leads: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let monthlyData = [];

        // Populate the last 6 months to ensure chart displays nicely even if no leads exist
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1); // Set to 1st to prevent month rollover
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1; // 1-12
            const found = monthlyActivity.find(x => x._id === m);
            monthlyData.push({
                name: monthNames[d.getMonth()],
                leads: found ? found.leads : 0
            });
        }

        // Add Employee Performance aggregation
        let employeePerformance = [];
        if (isAdmin) {
            employeePerformance = await Lead.aggregate([
                { $match: { isDeleted: { $ne: true }, assignedEmployee: { $ne: null } } },
                {
                    $group: {
                        _id: '$assignedEmployee',
                        won: { $sum: { $cond: [{ $eq: ['$result', 'Lead Won'] }, 1, 0] } },
                        lost: { $sum: { $cond: [{ $eq: ['$result', 'Lead Loss'] }, 1, 0] } }
                    }
                },
                {
                    $lookup: {
                        from: 'employees',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'employee'
                    }
                },
                { $unwind: '$employee' },
                {
                    $project: {
                        name: '$employee.name',
                        won: 1,
                        lost: 1,
                        _id: 0
                    }
                }
            ]);
        }

        return res.status(200).json({
            ok: true,
            data: {
                totalLeads,
                assignedLeads,
                wonDeals,
                lostDeals,
                pendingLeads,
                todaysLeads,
                todaysFollowups,
                completedFollowups,
                pendingFollowups,
                dueFollowups,
                overdueFollowups,
                activeEmployees,
                inactiveEmployees,
                winRate,
                lossRate,
                conversionRate,
                statusData: formattedStatusData,
                monthlyData,
                employeePerformance
            }
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ ok: false, message: 'Server error fetching dashboard stats' });
    }
};

exports.getChartData = async (req, res) => {
    try {
        const { filter, startDate, endDate, specificDate } = req.query;
        let dateQuery = {};

        const now = new Date();
        if (filter === 'Today') {
            const start = new Date(now.setHours(0, 0, 0, 0));
            const end = new Date(now.setHours(23, 59, 59, 999));
            dateQuery = { createdAt: { $gte: start, $lte: end } };
        } else if (filter === 'Yesterday') {
            const start = new Date(now);
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            dateQuery = { createdAt: { $gte: start, $lte: end } };
        } else if (filter === 'Current Month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            dateQuery = { createdAt: { $gte: start } };
        } else if (filter === 'Specific Date' && specificDate) {
            const start = new Date(specificDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            dateQuery = { createdAt: { $gte: start, $lte: end } };
        } else if (filter === 'Custom Range' && startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateQuery = { createdAt: { $gte: new Date(startDate), $lte: end } };
        }

        const isAdmin = req.user && (req.user.role === 'Admin' || req.user.role === 'Master Admin');
        let baseQuery = { isDeleted: { $ne: true }, ...dateQuery };
        if (!isAdmin) {
            baseQuery.assignedEmployee = req.user.id;
        }

        // Won vs Loss Pie Chart
        const wonLostData = await Lead.aggregate([
            { $match: { ...baseQuery, result: { $in: ['Lead Won', 'Lead Loss'] } } },
            { $group: { _id: '$result', value: { $sum: 1 } } }
        ]);

        // Lead Sources Chart
        const sourceData = await Lead.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$leadSource', value: { $sum: 1 } } }
        ]);

        // Employee Performance Ranking (Admin Only)
        let employeeRanking = [];
        if (isAdmin) {
            employeeRanking = await Lead.aggregate([
                { $match: { ...baseQuery, result: 'Lead Won', assignedEmployee: { $exists: true, $ne: null } } },
                { $group: { _id: '$assignedEmployee', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);
            await Employee.populate(employeeRanking, { path: '_id', select: 'name' });
            employeeRanking = employeeRanking.map(e => ({ name: e._id ? e._id.name : 'Unknown', value: e.count }));
        }

        res.json({
            ok: true,
            data: {
                wonLost: wonLostData.map(d => ({ name: d._id, value: d.value })),
                sources: sourceData.map(d => ({ name: d._id || 'Unknown', value: d.value })),
                rankings: employeeRanking
            }
        });
    } catch (error) {
        console.error('Error in getChartData:', error);
        res.status(500).json({ ok: false, message: 'Server error fetching chart data' });
    }
};
