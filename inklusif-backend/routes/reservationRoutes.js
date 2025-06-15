const express = require('express');
const { createReservationRequest, getUserReservationRequests } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/reservations
// @desc    Create a new reservation request for an activity
// @access  Private (User must be logged in)
router.post('/', protect, createReservationRequest);

// @route   GET /api/reservations/me
// @desc    Get all reservation requests for the currently logged-in user
// @access  Private (User must be logged in)
router.get('/me', protect, getUserReservationRequests);

module.exports = router;