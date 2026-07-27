const Employee = require('../models/Employee');
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
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

const createEmployee = async (req, res, next) => {
    try {
        const { name, email, phone, role, password, status } = req.body;

        const exists = await Employee.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const employee = new Employee({
            name, email, phone, role, password: hashedPassword, status
        });

        await employee.save();
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
        next(error);
    }
};

const updateEmployee = async (req, res, next) => {
    try {
        const { name, phone, role, status } = req.body;
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { name, phone, role, status },
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
