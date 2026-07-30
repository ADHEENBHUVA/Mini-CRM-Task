const express = require('express');
const router = express.Router();
const { getFollowups, getDueFollowupsCount, createFollowup, updateFollowup, forceFollowup, deleteFollowup, restoreFollowup } = require('../controllers/followupController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getFollowups);
router.get('/due', protect, getDueFollowupsCount);
router.post('/', protect, createFollowup);
router.put('/:id', protect, updateFollowup);
router.patch('/:id/force', protect, admin, forceFollowup);
router.delete('/:id', protect, deleteFollowup);
router.patch('/:id/restore', protect, restoreFollowup);

module.exports = router;
