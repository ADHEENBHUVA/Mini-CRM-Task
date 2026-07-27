const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getLeads, createLead, updateLeadStatus, deleteLead } = require('../controllers/leadController');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', getLeads);
router.post('/', [
    body('companyName').notEmpty(),
    body('contactPerson').notEmpty(),
    body('phone').notEmpty(),
    body('email').isEmail(),
    body('expectedBudget').isNumeric()
], validate, createLead);

router.patch('/:id/status', [
    body('status').isIn(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'])
], validate, updateLeadStatus);

router.delete('/:id', deleteLead);

module.exports = router;
