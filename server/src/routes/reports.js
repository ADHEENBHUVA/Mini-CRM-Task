const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leads', protect, reportController.getLeadReport);
router.get('/followups', protect, reportController.getFollowupReport);

module.exports = router;
