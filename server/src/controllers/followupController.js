const Followup = require('../models/Followup');
const Lead = require('../models/Lead');

// Get all followups for the logged-in employee (or all for Admin)
exports.getFollowups = async (req, res) => {
    try {
        // Auto-update past pending followups to Due Follow-up
        await Followup.updateMany(
            { status: 'Pending', followupDate: { $lte: new Date() } },
            { $set: { status: 'Due Follow-up' } }
        );

        let query = {};
        if (req.user.role === 'Employee') {
            query.employee = req.user.id;
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
        // Auto-update past pending followups to Due Follow-up
        await Followup.updateMany(
            { status: 'Pending', followupDate: { $lte: new Date() } },
            { $set: { status: 'Due Follow-up' } }
        );

        let query = { status: 'Due Follow-up' };

        if (req.user.role === 'Employee') {
            query.employee = req.user.id;
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
        const { status, remarks, nextFollowupDate, leadStatus } = req.body;

        const followup = await Followup.findById(req.params.id);
        if (!followup) return res.status(404).json({ message: 'Followup not found' });

        if (req.user.role === 'Employee' && followup.employee.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        followup.status = status || followup.status;
        followup.remarks = remarks || followup.remarks;
        followup.nextFollowupDate = nextFollowupDate || followup.nextFollowupDate;

        await followup.save();

        if (leadStatus) {
            const lead = await Lead.findById(followup.lead);
            if (lead) {
                if (leadStatus === 'Lead Done') {
                    lead.result = 'Lead Won';
                    lead.status = 'Lead Done';
                } else if (leadStatus === 'Lead Not Done') {
                    if (!remarks) {
                        return res.status(400).json({ message: 'Comment is mandatory for Lead Not Done' });
                    }
                    lead.result = 'Lead Loss';
                    lead.status = 'Lead Not Done';
                } else {
                    lead.status = leadStatus;
                }

                // Set the next followup date on the lead if provided
                if (nextFollowupDate) {
                    lead.nextFollowupDate = nextFollowupDate;
                }

                await lead.save();

                if (remarks) {
                    const Comment = require('../models/Comment');
                    await new Comment({
                        lead: lead._id,
                        employee: req.user.id,
                        text: remarks,
                        type: (leadStatus === 'Lead Done' || leadStatus === 'Lead Not Done') ? 'Win/Loss Reason' : 'Follow-up Note'
                    }).save();
                }
            }
        }

        res.status(200).json(followup);
    } catch (error) {
        res.status(500).json({ message: 'Error updating followup', error });
    }
};

// Admin forces a followup
exports.forceFollowup = async (req, res) => {
    try {
        const followup = await Followup.findById(req.params.id);
        if (!followup) return res.status(404).json({ message: 'Followup not found' });

        followup.adminForced = true;
        followup.status = 'Due Follow-up';
        await followup.save();

        res.status(200).json({ message: 'Followup forced', followup });
    } catch (error) {
        res.status(500).json({ message: 'Error forcing followup', error });
    }
};
