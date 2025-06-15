const pool = require('../config/db');

// @desc    Create a new reservation request
// @route   POST /api/reservations
// @access  Private (requires authentication)
const createReservationRequest = async (req, res) => {
  const user_id = req.user.id; // From authMiddleware
  const { activity_id, child_profile_id, number_of_participants = 1, message_to_organizer } = req.body;

  // Validate required fields
  if (!activity_id) {
    return res.status(400).json({ message: 'Activity ID is required.' });
  }
  if (isNaN(parseInt(activity_id, 10))) {
    return res.status(400).json({ message: 'Invalid Activity ID format.' });
  }

  const numParticipants = parseInt(number_of_participants, 10);
  if (isNaN(numParticipants) || numParticipants <= 0) {
    return res.status(400).json({ message: 'Number of participants must be a positive integer.' });
  }

  let validChildProfileId = null;
  if (child_profile_id !== undefined && child_profile_id !== null) {
    validChildProfileId = parseInt(child_profile_id, 10);
    if (isNaN(validChildProfileId) || validChildProfileId <= 0) {
      return res.status(400).json({ message: 'Invalid Child Profile ID format.' });
    }
  }

  try {
    // If child_profile_id is provided, validate it
    if (validChildProfileId) {
      const childProfileResult = await pool.query(
        'SELECT id FROM child_profiles WHERE id = $1 AND parent_user_id = $2',
        [validChildProfileId, user_id]
      );
      if (childProfileResult.rows.length === 0) {
        return res.status(403).json({ message: 'Profil enfant non trouvé ou non autorisé pour cet utilisateur.' });
      }
    }

    // Check if activity exists and has enough spots
    const activityResult = await pool.query(
      'SELECT max_participants, current_participants FROM activities WHERE id = $1',
      [activity_id]
    );

    if (activityResult.rows.length === 0) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    const activity = activityResult.rows[0];
    const availableSpots = (activity.max_participants === null ? Infinity : activity.max_participants) - (activity.current_participants || 0);


    if (numParticipants > availableSpots) {
       if (activity.max_participants === null) {
         // This case should not be hit if availableSpots is Infinity, but as a safeguard
         return res.status(400).json({ message: 'Requested participants exceeds available capacity (though capacity is marked unlimited, this is an error).' });
       }
      return res.status(400).json({ 
        message: `Demande (${numParticipants}) excède les places disponibles (${availableSpots}). Il reste ${availableSpots > 0 ? availableSpots : 'aucune'} place(s).` 
      });
    }

    // Insert new reservation request
    const newReservation = await pool.query(
      `INSERT INTO reservation_requests 
       (user_id, activity_id, child_profile_id, number_of_participants, message_to_organizer, status, requested_at, last_updated_at) 
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW()) 
       RETURNING *`,
      [user_id, activity_id, validChildProfileId, numParticipants, message_to_organizer]
    );

    res.status(201).json(newReservation.rows[0]);

  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
        if (error.constraint && error.constraint.includes('reservation_requests_activity_id_fkey')) {
            return res.status(404).json({ message: 'Activity not found (foreign key constraint).' });
        }
        if (error.constraint && error.constraint.includes('reservation_requests_child_profile_id_fkey')) {
            // This should ideally be caught by the explicit check above, but as a fallback.
            return res.status(404).json({ message: 'Child profile not found (foreign key constraint).' });
        }
    }
    console.error('Error creating reservation request:', error);
    res.status(500).json({ message: 'Server error while processing reservation request.' });
  }
};

module.exports = {
  createReservationRequest,
};

// @desc    Get all reservation requests for the logged-in user, optionally filtered by child_profile_id
// @route   GET /api/reservations/me
// @access  Private (User must be logged in)
const getUserReservationRequests = async (req, res) => {
  const user_id = req.user.id; // From authMiddleware
  const { child_profile_id } = req.query;

  let validChildProfileId = null;
  if (child_profile_id !== undefined && child_profile_id !== null) {
    validChildProfileId = parseInt(child_profile_id as string, 10);
    if (isNaN(validChildProfileId) || validChildProfileId <= 0) {
      return res.status(400).json({ message: 'Invalid Child Profile ID format for filtering.' });
    }
  }

  try {
    // If child_profile_id is provided for filtering, validate its ownership
    if (validChildProfileId) {
      const childProfileResult = await pool.query(
        'SELECT id FROM child_profiles WHERE id = $1 AND parent_user_id = $2',
        [validChildProfileId, user_id]
      );
      if (childProfileResult.rows.length === 0) {
        return res.status(403).json({ message: 'Profil enfant non trouvé ou non autorisé pour filtrer les réservations.' });
      }
    }

    let queryText = `
      SELECT 
        rr.id AS reservation_id,
        rr.status AS reservation_status,
        rr.number_of_participants,
        rr.message_to_organizer,
        rr.organizer_response_message,
        rr.requested_at AS reservation_requested_at,
        rr.last_updated_at AS reservation_last_updated_at,
        rr.child_profile_id, 
        cp.first_name AS child_first_name,
        cp.last_name AS child_last_name,
        a.id AS activity_id,
        a.title AS activity_title,
        a.activity_date_text,
        a.location_name,
        a.address_city,
        a.header_image_url AS activity_header_image_url
        -- Select other activity fields as needed
      FROM reservation_requests rr
      JOIN activities a ON rr.activity_id = a.id
      LEFT JOIN child_profiles cp ON rr.child_profile_id = cp.id
      WHERE rr.user_id = $1 
    `;
    const queryParams: (string | number)[] = [user_id];
    let paramIndex = 2; // Start next param index from $2

    if (validChildProfileId) {
      queryText += ` AND rr.child_profile_id = $${paramIndex}`;
      queryParams.push(validChildProfileId);
      paramIndex++;
    }
    
    queryText += ' ORDER BY rr.requested_at DESC;';
    
    const { rows } = await pool.query(queryText, queryParams);
    
    res.status(200).json(rows);

  } catch (error) {
    console.error('Error fetching user reservation requests:', error);
    res.status(500).json({ message: 'Server error while fetching reservation requests.' });
  }
};

module.exports = {
  createReservationRequest,
  getUserReservationRequests, // Add new function to exports
};