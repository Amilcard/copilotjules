const express = require('express');
const { subscribeToTerritoryNotifications } = require('../controllers/territoryController');

const router = express.Router();

// @route   POST /api/territories/subscribe
// @desc    Subscribe to notifications for a specific territory
// @access  Public
router.post('/subscribe', subscribeToTerritoryNotifications);

module.exports = router;