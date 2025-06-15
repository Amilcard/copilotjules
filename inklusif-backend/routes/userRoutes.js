const express = require('express');
const { registerUser, loginUser, completeUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Assuming authMiddleware is in ../middleware

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user (initial simplified registration)
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   PUT /api/users/profile
// @desc    Complete or update user profile with additional details
// @access  Private
router.put('/profile', protect, completeUserProfile);


module.exports = router;