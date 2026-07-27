const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

// Simple validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, createEmployee);

router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
