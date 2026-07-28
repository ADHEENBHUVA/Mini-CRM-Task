const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adheen2')
    .then(() => console.log('MongoDB Connected to adheen2'))
    .catch(err => console.log(err));

const authRoutes = require('./src/routes/auth');
const employeeRoutes = require('./src/routes/employees');
const leadRoutes = require('./src/routes/leads');
const dashboardRoutes = require('./src/routes/dashboard');
const followupRoutes = require('./src/routes/followups');
const reportRoutes = require('./src/routes/reports');
const { errorHandler } = require('./src/middleware/errorHandler');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.send('CRM API Running'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
