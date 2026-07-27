const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/errorHandler'); // using the existing JWT protect if available

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
