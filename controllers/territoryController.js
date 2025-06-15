const pool = require('../config/db');
const validator = require('validator'); // Using validator library for email validation

// @desc    Subscribe to notifications for a specific territory
// @route   POST /api/territories/subscribe
// @access  Public
const subscribeToTerritoryNotifications = async (req, res) => {
  const { email, territory_identifier } = req.body;

  // Basic validation
  if (!email || !territory_identifier) {
    return res.status(400).json({ message: 'Email and territory identifier are required.' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (typeof territory_identifier !== 'string' || territory_identifier.trim().length === 0) {
      return res.status(400).json({ message: 'Territory identifier must be a non-empty string.' });
  }

  try {
    // Check if already subscribed
    const existingSubscription = await pool.query(
      'SELECT id FROM territory_notification_subscriptions WHERE email = $1 AND territory_identifier = $2',
      [email, territory_identifier]
    );

    if (existingSubscription.rows.length > 0) {
      return res.status(200).json({ message: 'You are already subscribed to notifications for this territory.' });
    }

    // Insert new subscription
    const newSubscription = await pool.query(
      'INSERT INTO territory_notification_subscriptions (email, territory_identifier) VALUES ($1, $2) RETURNING id, email, territory_identifier, subscribed_at',
      [email, territory_identifier]
    );

    res.status(201).json({ 
      message: 'Successfully subscribed to territory notifications.',
      subscription: newSubscription.rows[0] 
    });

  } catch (error) {
    // Handle potential unique constraint violation if race condition occurs despite check (uq_email_territory)
    if (error.code === '23505' && error.constraint === 'uq_email_territory') {
        return res.status(409).json({ message: 'You are already subscribed (concurrent request). Please check your subscriptions or try again if this was an error.' });
    }
    console.error('Error subscribing to territory notifications:', error);
    res.status(500).json({ message: 'Server error while processing subscription.' });
  }
};

module.exports = {
  subscribeToTerritoryNotifications,
};