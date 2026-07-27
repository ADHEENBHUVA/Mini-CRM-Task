const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getLeads, createLead, updateLead, updateLeadStatus, deleteLead, getLeadDetails, addNote, addFollowup, markFollowupCompleted } = require('../controllers/leadController');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', getLeads);
router.post('/', [
    body('companyName').notEmpty(),
    body('contactPerson').notEmpty(),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits.'),
    body('email').isEmail(),
    body('expectedBudget').isNumeric()
], validate, createLead);

router.patch('/:id/status', [
    body('status').isIn(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'])
], validate, updateLeadStatus);

router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

router.get('/:id', getLeadDetails);
router.post('/:id/notes', addNote);
router.post('/:id/followups', addFollowup);
router.patch('/:id/followups/:followupId/completed', markFollowupCompleted);

module.exports = router;
