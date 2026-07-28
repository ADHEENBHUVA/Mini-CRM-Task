const express = require('express');
const router = express.Router();
const { protect, admin, restrictToSelfOrAdmin } = require('../middleware/authMiddleware');
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

router.get('/', protect, admin, getEmployees);
router.get('/:id', protect, restrictToSelfOrAdmin, getEmployeeById);

const employeeValidationRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be exactly 10 numeric digits.'),
    body('password').optional().isLength({ min: 8, max: 16 }).withMessage('Password must be between 8-16 characters')
        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character.')
];

router.post('/', protect, admin, employeeValidationRules, validate, createEmployee);

router.put('/:id', protect, restrictToSelfOrAdmin, employeeValidationRules, validate, updateEmployee);
router.delete('/:id', protect, admin, deleteEmployee);

module.exports = router;
