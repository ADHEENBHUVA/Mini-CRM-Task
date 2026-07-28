const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getLeads, createLead, updateLead, updateLeadStatus, deleteLead, getLeadDetails, addNote, addFollowup, markFollowupCompleted, updateLeadResult } = require('../controllers/leadController');
const { protect, admin } = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', protect, getLeads);
router.post('/', protect, admin, [
    body('companyName').notEmpty(),
    body('contactPerson').notEmpty(),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits.'),
    body('email').isEmail(),
    body('expectedBudget').isNumeric()
], validate, createLead);

router.patch('/:id/status', protect, [
    body('status').isIn(['Pending', 'Interested', 'Not Interested', 'Callback', 'Follow-up Scheduled', 'Lead Done', 'Lead Not Done', 'Won', 'Lost'])
], validate, updateLeadStatus);

router.put('/:id', protect, updateLead);
router.patch('/:id/result', protect, [
    body('result').isIn(['Lead Won', 'Lead Loss'])
], validate, updateLeadResult);
router.delete('/:id', protect, admin, deleteLead);

router.get('/:id', protect, getLeadDetails);
router.post('/:id/notes', protect, addNote);
router.post('/:id/followups', protect, addFollowup);
router.patch('/:id/followups/:followupId/completed', protect, markFollowupCompleted);

module.exports = router;
