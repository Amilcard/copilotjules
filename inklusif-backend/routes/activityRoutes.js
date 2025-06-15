const express = require('express');
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getActivities);
router.get('/:id', getActivityById);

// Private routes (require authentication)
router.post('/', protect, createActivity);
router.put('/:id', protect, updateActivity);
router.delete('/:id', protect, deleteActivity);


module.exports = router;