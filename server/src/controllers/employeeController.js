const Employee = require('../models/Employee');
const Lead = require('../models/Lead');
const bcrypt = require('bcrypt');

const getEmployees = async (req, res, next) => {
    try {
        const { viewDeleted } = req.query;
        let query = {};
        if (viewDeleted === 'true') {
            query.isDeleted = true;
        } else {
            query.isDeleted = { $ne: true };
        }

        const employees = await Employee.find(query).select('-password');
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
        const won = leads.filter(l => l.status === 'Won' || l.status === 'Lead Done' || l.result === 'Lead Won').length;
        const lost = leads.filter(l => l.status === 'Lost' || l.status === 'Lead Not Done' || l.result === 'Lead Loss').length;
        const active = leads.filter(l => !['Won', 'Lost', 'Lead Done', 'Lead Not Done'].includes(l.status)).length;

        const Followup = require('../models/Followup');
        const followups = await Followup.find({ employee: employee._id }).populate('lead', 'companyName status').sort({ nextFollowupDate: 1 });

        res.json({
            employee,
            stats: { total, won, lost, active },
            leads,
            followups
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
            if (req.user && req.user.role === 'Employee') {
                const { oldPassword } = req.body;
                if (!oldPassword) {
                    return res.status(400).json({ message: 'Current password is required to change it.' });
                }
                const employeeRecord = await Employee.findById(req.params.id);
                const isMatch = await bcrypt.compare(oldPassword, employeeRecord.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Incorrect current password.' });
                }
            }
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
        const employee = await Employee.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee removed successfully' });
    } catch (error) {
        next(error);
    }
};

const restoreEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee restored successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee
};
