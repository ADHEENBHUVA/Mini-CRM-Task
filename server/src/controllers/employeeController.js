const Employee = require('../models/Employee');
const Lead = require('../models/Lead');
const bcrypt = require('bcrypt');

const getEmployees = async (req, res, next) => {
    try {
        const employees = await Employee.find().select('-password');
        res.json(employees);
    } catch (error) {
        next(error);
    }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id).select('-password');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const leads = await Lead.find({ assignedEmployee: employee._id }).sort({ createdAt: -1 });
        const total = leads.length;
        const won = leads.filter(l => l.status === 'Won').length;
        const lost = leads.filter(l => l.status === 'Lost').length;
        const active = leads.filter(l => !['Won', 'Lost'].includes(l.status)).length;

        res.json({
            employee,
            stats: { total, won, lost, active },
            leads
        });
    } catch (error) {
        next(error);
    }
};

const createEmployee = async (req, res, next) => {
    try {
        const { name, email, phone, role, department, password, status } = req.body;

        const exists = await Employee.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const employee = new Employee({
            name, email, phone, role, department, password: hashedPassword, status
        });

        await employee.save();
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
        next(error);
    }
};

const updateEmployee = async (req, res, next) => {
    try {
        const { name, email, phone, role, department, status, password } = req.body;

        let updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (phone) updateFields.phone = phone;

        // Only admins can change role, department, and status
        if (req.user && (req.user.role === 'Admin' || req.user.role === 'Master Admin')) {
            if (role) updateFields.role = role;
            if (department) updateFields.department = department;
            if (status) updateFields.status = status;
        }

        if (password && password.trim() !== '') {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        ).select('-password');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

const deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee removed successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
