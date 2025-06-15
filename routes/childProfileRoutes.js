const express = require('express');
const {
  addChildProfile,
  getChildProfiles,
  updateChildProfile,
  deleteChildProfile,
} = require('../controllers/childProfileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file are protected and pertain to the authenticated user's children.
// Base path for these routes will be /api/me/children (defined in server.js)

// POST /api/me/children - Add a new child profile
router.post('/', protect, addChildProfile);

// GET /api/me/children - Get all child profiles for the logged-in user
router.get('/', protect, getChildProfiles);

// PUT /api/me/children/:child_profile_id - Update a specific child profile
router.put('/:child_profile_id', protect, updateChildProfile);

// DELETE /api/me/children/:child_profile_id - Delete a specific child profile
router.delete('/:child_profile_id', protect, deleteChildProfile);

module.exports = router;
