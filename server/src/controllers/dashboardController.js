const Lead = require('../models/Lead');
const Followup = require('../models/Followup');

exports.getDashboardStats = async (req, res) => {
    try {
        let leadQuery = {};
        if (req.user && req.user.role !== 'Admin') {
            leadQuery = { assignedEmployee: req.user.id };
        }

        // Count total leads
        const totalLeads = await Lead.countDocuments(leadQuery);

        // Count Won deals
        const wonDeals = await Lead.countDocuments({ ...leadQuery, status: 'Won' });

        // Count Pending (Anything not won/lost)
        const pendingLeads = await Lead.countDocuments({ ...leadQuery, status: { $nin: ['Won', 'Lost'] } });

        // Today's Follow-ups
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let followupQuery = {
            followupDate: {
                $gte: today,
                $lt: tomorrow
            },
            status: 'Pending'
        };

        if (req.user && req.user.role !== 'Admin') {
            const employeeLeads = await Lead.find({ assignedEmployee: req.user.id }).select('_id');
            const leadIds = employeeLeads.map(l => l._id);
            followupQuery.lead = { $in: leadIds };
        }

        const todaysFollowups = await Followup.countDocuments(followupQuery);

        // Lead Status Chart Data (Aggregate)
        const statusDistribution = await Lead.aggregate([
            { $match: leadQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        let formattedStatusData = statusDistribution.map(stat => ({
            name: stat._id,
            value: stat.count
        }));

        // Live 6-Month leads data mathematical aggregation
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        const monthlyData = [];
        // Generate chronological X-axis labels for the last 6 months
        for (let i = 5; i >= 0; i--) {
            let m = currentMonth - i;
            if (m < 0) m += 12;
            monthlyData.push({ name: monthNames[m], leads: 0 });
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Calculate strictly from the first day of the oldest month

        const monthlyAggregation = await Lead.aggregate([
            { $match: { ...leadQuery, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    leads: { $sum: 1 }
                }
            }
        ]);

        // Merge Live database matches straight into the chronological chart array
        monthlyAggregation.forEach(item => {
            const index = monthlyData.findIndex(m => m.name === monthNames[item._id - 1]);
            if (index !== -1) {
                monthlyData[index].leads = item.leads;
            }
        });

        res.json({
            ok: true,
            data: {
                totalLeads,
                wonDeals,
                pendingLeads,
                todaysFollowups,
                statusData: formattedStatusData,
                monthlyData
            }
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ ok: false, message: 'Server error fetching dashboard stats' });
    }
};
