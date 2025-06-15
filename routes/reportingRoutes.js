const express = require('express');
const { getBasicStats } = require('../controllers/reportingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/reporting/stats
// @desc    Get basic application statistics
// @access  Private (should be Admin in future, currently any authenticated user)
router.get('/stats', protect, getBasicStats);

module.exports = router;