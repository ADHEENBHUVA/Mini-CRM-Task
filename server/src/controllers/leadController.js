const Lead = require('../models/Lead');

const getLeads = async (req, res, next) => {
    try {
        const query = {};

        // If the logged in user is a Standard Employee, lock down the visibility scope
        if (req.user && (req.user.role === 'Employee' || req.user.role === 'Standard')) {
            query.assignedEmployee = req.user.id;
        }
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
        if (req.user && req.user.role === 'Employee') {
            lead.assignedEmployee = req.user.id;
        }

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

        if (req.user && req.user.role === 'Employee') {
            if (!lead.assignedEmployee || lead.assignedEmployee.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to modify this lead' });
            }
        }

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

const updateLeadResult = async (req, res, next) => {
    try {
        const { result, comment } = req.body;
        const lead = await Lead.findById(req.params.id);

        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (req.user && req.user.role === 'Employee') {
            if (!lead.assignedEmployee || lead.assignedEmployee.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to modify this lead' });
            }
        }

        if (result === 'Lead Loss' && !comment) {
            return res.status(400).json({ message: 'Comment is mandatory when lead is lost' });
        }

        lead.result = result;
        lead.status = result === 'Lead Won' ? 'Lead Done' : 'Lead Not Done';
        await lead.save();

        if (comment) {
            const Comment = require('../models/Comment');
            const newComment = new Comment({
                lead: lead._id,
                employee: (req.user && req.user.role !== 'Admin' && req.user.role !== 'Master Admin') ? req.user.id : null,
                text: comment,
                type: 'Win/Loss Reason'
            });
            await newComment.save();
        }

        res.json({ message: 'Lead result updated successfully', lead });
    } catch (error) {
        next(error);
    }
};

const updateLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (req.user && req.user.role === 'Employee') {
            if (!lead.assignedEmployee || lead.assignedEmployee.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to modify this lead' });
            }
        }

        const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Lead updated completely', lead: updatedLead });
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

const getLeadDetails = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id).populate('assignedEmployee', 'name email role');
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (req.user && req.user.role === 'Employee') {
            if (!lead.assignedEmployee || lead.assignedEmployee._id.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to access this lead' });
            }
        }

        const Note = require('../models/Note');
        const Followup = require('../models/Followup');

        const notes = await Note.find({ lead: lead._id }).populate('createdBy', 'name role').sort({ createdAt: 1 });
        const followups = await Followup.find({ lead: lead._id }).sort({ followupDate: 1 });

        res.json({ lead, notes, followups });
    } catch (error) {
        next(error);
    }
};

const addNote = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (req.user && req.user.role === 'Employee') {
            if (!lead.assignedEmployee || lead.assignedEmployee.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to add notes' });
            }
        }

        const Note = require('../models/Note');
        const newNote = new Note({
            lead: req.params.id,
            note: req.body.note,
            createdBy: (req.user && req.user.role !== 'Admin' && req.user.role !== 'Master Admin') ? req.user.id : null
        });
        await newNote.save();
        res.status(201).json({ message: 'Note added successfully', note: newNote });
    } catch (error) {
        next(error);
    }
};

const addFollowup = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (req.user && req.user.role === 'Employee') {
            if (!lead.assignedEmployee || lead.assignedEmployee.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to add followups' });
            }
        }

        const Followup = require('../models/Followup');
        const { followupDate, followupTime, customerResponse, remarks, nextFollowupDate, employeeId } = req.body;

        let targetEmployee = req.user.id;
        if (req.user.role === 'Admin' || req.user.role === 'Master Admin') {
            targetEmployee = employeeId || lead.assignedEmployee;
        }

        const newFollowup = new Followup({
            lead: req.params.id,
            employee: targetEmployee,
            followupDate,
            followupTime,
            customerResponse,
            remarks,
            nextFollowupDate
        });
        await newFollowup.save();
        res.status(201).json({ message: 'Followup scheduled successfully', followup: newFollowup });
    } catch (error) {
        next(error);
    }
};

const markFollowupCompleted = async (req, res, next) => {
    try {
        const Followup = require('../models/Followup');
        const followup = await Followup.findById(req.params.followupId);
        if (!followup) return res.status(404).json({ message: 'Not found' });
        followup.status = 'Completed';
        await followup.save();
        res.json({ message: 'Followup completed', followup });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeads,
    createLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    getLeadDetails,
    addNote,
    addFollowup,
    markFollowupCompleted,
    updateLeadResult
};
