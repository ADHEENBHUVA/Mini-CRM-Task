const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_minicrm_jwt';

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password, loginAs } = req.body;

        // --- MOCK OVERRIDE for quick demo access ---
        const safeEmail = email ? email.toLowerCase().trim() : '';
        if (safeEmail === 'admin@nextbuy.com' || safeEmail === 'admin@minicrm.com' || safeEmail === 'admin') {
            if (loginAs === 'Employee') {
                return res.status(403).json({ message: 'Access Denied: Cannot use mock admin credentials in the Employee Portal.' });
            }
            const token = jwt.sign({ id: 'mockadmin123', email: safeEmail, role: 'Admin' }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({
                message: 'Login successful',
                token,
                user: { id: 'mockadmin123', email: safeEmail, name: 'Super Admin', role: 'Admin' }
            });
        }
        // -------------------------------------------

        let user;
        let isEmployee = false;

        if (loginAs === 'Employee') {
            const Employee = require('../models/Employee');
            user = await Employee.findOne({ email });
            isEmployee = true;
        } else {
            user = await User.findOne({ email });
            // Fallback for Admin portal if an employee tries to log in
            if (!user) {
                const Employee = require('../models/Employee');
                user = await Employee.findOne({ email });
                isEmployee = true;
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (isEmployee && user.isDeleted) {
            return res.status(403).json({ message: 'Account deactivated. Please contact administrator.' });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // 3. Create and assign JWT token
        const role = isEmployee ? user.role : 'Admin';
        const name = user.name || (isEmployee ? 'Employee' : 'Admin');

        const token = jwt.sign({ id: user._id, email: user.email, role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email, name, role }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Setup a simple test register route so we can create our initial user
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during register:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
