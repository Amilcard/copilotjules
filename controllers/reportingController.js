const pool = require('../config/db');

// @desc    Get basic application statistics
// @route   GET /api/reporting/stats
// @access  Private (should be Admin in the future)
const getBasicStats = async (req, res) => {
  // In a real application, you would check if req.user.role === 'admin' here
  // For now, any authenticated user can access it as per current authMiddleware.
  
  try {
    const totalUsersResult = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const totalActivitiesResult = await pool.query('SELECT COUNT(*) AS total_activities FROM activities');

    const stats = {
      totalUsers: parseInt(totalUsersResult.rows[0].total_users, 10),
      totalActivities: parseInt(totalActivitiesResult.rows[0].total_activities, 10),
      // Add more stats as needed, e.g., activities per user, most active user, etc.
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching basic stats:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
};

module.exports = {
  getBasicStats,
};