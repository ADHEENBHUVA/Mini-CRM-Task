const Lead = require('../models/Lead');

const getLeads = async (req, res, next) => {
    try {
        const query = {};

        // Handling Search and Filters
        if (req.query.status) query.status = req.query.status;
        if (req.query.priority) query.priority = req.query.priority;
        if (req.query.search) {
            query.$or = [
                { companyName: new RegExp(req.query.search, 'i') },
                { phone: new RegExp(req.query.search, 'i') }
            ];
        }

        const leads = await Lead.find(query).populate('assignedEmployee', 'name email');
        res.json(leads);
    } catch (error) {
        next(error);
    }
};

const createLead = async (req, res, next) => {
    try {
        const lead = new Lead(req.body);
        lead.status = 'New'; // Explicit default per spec
        await lead.save();
        res.status(201).json({ message: 'Lead created successfully', lead });
    } catch (error) {
        next(error);
    }
};

const updateLeadStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const lead = await Lead.findById(req.params.id);

        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        // Business logic validation for Won/Lost states
        if (lead.status === 'Won') {
            return res.status(400).json({ message: 'Cannot modify a Won lead' });
        }

        if (status === 'Won' && lead.status !== 'Proposal Sent') {
            return res.status(400).json({ message: 'Lead must be at "Proposal Sent" stage before marking as Won' });
        }

        lead.status = status;
        await lead.save();
        res.json({ message: 'Lead status updated', lead });
    } catch (error) {
        next(error);
    }
};

const deleteLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (lead.status === 'Won') {
            return res.status(400).json({ message: 'Cannot delete a Won lead' });
        }

        await lead.deleteOne();
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeads,
    createLead,
    updateLeadStatus,
    deleteLead
};
