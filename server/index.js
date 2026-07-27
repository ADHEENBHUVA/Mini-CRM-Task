const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/minicrm')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const authRoutes = require('./src/routes/auth');
const employeeRoutes = require('./src/routes/employees');
const leadRoutes = require('./src/routes/leads');
const { errorHandler } = require('./src/middleware/errorHandler');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leads', leadRoutes);

app.get('/', (req, res) => res.send('CRM API Running'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
