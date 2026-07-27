const Followup = require('../models/Followup');
const Lead = require('../models/Lead');

// Get all followups for the logged-in employee (or all for Admin)
exports.getFollowups = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Master Admin' && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
            // Find all leads assigned to this employee
            const leads = await Lead.find({ assignedEmployee: req.user.id }).select('_id');
            const leadIds = leads.map(l => l._id);
            query = { lead: { $in: leadIds } };
        }

        const followups = await Followup.find(query).populate('lead', 'contactPerson companyName email phone').sort({ nextFollowupDate: 1 });
        res.status(200).json(followups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching followups', error });
    }
};

// Check for "Due" followups when an employee logs in / dashboard mounts
exports.getDueFollowupsCount = async (req, res) => {
    try {
        let query = { status: 'Pending', followupDate: { $lte: new Date() } };

        if (req.user.role !== 'Master Admin' && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
            const leads = await Lead.find({ assignedEmployee: req.user.id }).select('_id');
            const leadIds = leads.map(l => l._id);
            query = { ...query, lead: { $in: leadIds } };
        }

        const dueCount = await Followup.countDocuments(query);
        res.status(200).json({ count: dueCount });
    } catch (error) {
        res.status(500).json({ message: 'Error validating due followups', error });
    }
};

// Create a new Followup from LeadDetails
exports.createFollowup = async (req, res) => {
    try {
        const { leadId, followupDate, remarks, nextFollowupDate } = req.body;

        const newFollowup = new Followup({
            lead: leadId,
            followupDate,
            remarks,
            nextFollowupDate
        });

        await newFollowup.save();
        res.status(201).json({ message: 'Followup created successfully', followup: newFollowup });
    } catch (error) {
        res.status(500).json({ message: 'Error creating followup', error });
    }
};

// Complete a followup
exports.updateFollowup = async (req, res) => {
    try {
        const updatedFollowup = await Followup.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, remarks: req.body.remarks, nextFollowupDate: req.body.nextFollowupDate },
            { new: true }
        );
        res.status(200).json(updatedFollowup);
    } catch (error) {
        res.status(500).json({ message: 'Error updating followup', error });
    }
};
