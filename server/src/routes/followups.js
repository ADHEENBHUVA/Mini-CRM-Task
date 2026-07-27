const express = require('express');
const router = express.Router();
const { getFollowups, getDueFollowupsCount, createFollowup, updateFollowup } = require('../controllers/followupController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFollowups);
router.get('/due', protect, getDueFollowupsCount);
router.post('/', protect, createFollowup);
router.put('/:id', protect, updateFollowup);

module.exports = router;
