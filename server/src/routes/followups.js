const express = require('express');
const router = express.Router();
const { getFollowups, getDueFollowupsCount, createFollowup, updateFollowup, forceFollowup } = require('../controllers/followupController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getFollowups);
router.get('/due', protect, getDueFollowupsCount);
router.post('/', protect, createFollowup);
router.put('/:id', protect, updateFollowup);
router.patch('/:id/force', protect, admin, forceFollowup);

module.exports = router;
