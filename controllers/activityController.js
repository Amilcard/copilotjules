const pool = require('../config/db');

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
  const user_id = req.user.id; // From authMiddleware
  const {
    title, description, latitude, longitude, type, min_age, max_age, price,
    header_image_url, activity_date_text, location_name, address_street,
    address_city, address_postal_code, target_audience_text, financial_aid_text,
    eco_mobility_text, schedule_text, additional_info_text, max_participants,
    contact_email, contact_phone, accepts_financial_aid, payment_options, accessibility_info
    // current_participants defaults to 0 in DB, not typically set on creation by user
  } = req.body;

  // Core requirements
  if (!title || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Title, latitude, and longitude are required' });
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Latitude and longitude must be numbers' });
  }
  // Optional fields basic validation (can be expanded)
  if (min_age !== undefined && (typeof min_age !== 'number' || min_age < 0)) return res.status(400).json({ message: 'Min age must be a non-negative number.' });
  if (max_age !== undefined && (typeof max_age !== 'number' || max_age < 0)) return res.status(400).json({ message: 'Max age must be a non-negative number.' });
  if (price !== undefined && (typeof price !== 'number' || price < 0)) return res.status(400).json({ message: 'Price must be a non-negative number.' });
  if (max_participants !== undefined && (typeof max_participants !== 'number' || max_participants <= 0)) return res.status(400).json({ message: 'Max participants must be a positive number.' });
  if (accepts_financial_aid !== undefined && typeof accepts_financial_aid !== 'boolean') return res.status(400).json({message: 'Accepts financial aid must be a boolean.'});


  const fields = [
    'user_id', 'title', 'description', 'latitude', 'longitude', 'type', 'min_age', 'max_age', 'price',
    'header_image_url', 'activity_date_text', 'location_name', 'address_street',
    'address_city', 'address_postal_code', 'target_audience_text', 'financial_aid_text',
    'eco_mobility_text', 'schedule_text', 'additional_info_text', 'max_participants',
    'contact_email', 'contact_phone', 'accepts_financial_aid', 'payment_options', 'accessibility_info'
  ];
  
  const values = [
    user_id, title, description, latitude, longitude, type, min_age, max_age, price,
    header_image_url, activity_date_text, location_name, address_street,
    address_city, address_postal_code, target_audience_text, financial_aid_text,
    eco_mobility_text, schedule_text, additional_info_text, max_participants,
    contact_email, contact_phone, accepts_financial_aid, payment_options, accessibility_info
  ];

  const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
  const queryText = `INSERT INTO activities (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;

  try {
    const newActivity = await pool.query(queryText, values);
    res.status(201).json(newActivity.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Server error while creating activity' });
  }
};

// @desc    Get all activities, optionally filtered and sorted
// @route   GET /api/activities
// @access  Public
const getActivities = async (req, res) => {
  const { 
    q: searchQuery, type, age, max_price, 
    latitude, longitude, radius,
    sortBy, sortOrder 
  } = req.query;

  let lat = parseFloat(latitude as string);
  let lon = parseFloat(longitude as string);
  const rad = parseFloat(radius as string);

  try {
    let selectExpressions = 'a.*';
    const queryParams = [];
    const whereClauses = [];
    let paramIndex = 1;
    let orderByClause = 'ORDER BY a.created_at DESC'; // Default ordering (aliased table 'a')

    if (!isNaN(lat) && !isNaN(lon)) {
      selectExpressions += `, (
        6371 * acos(
            cos(radians($${paramIndex})) * cos(radians(a.latitude)) *
            cos(radians(a.longitude) - radians($${paramIndex + 1})) +
            sin(radians($${paramIndex})) * sin(radians(a.latitude))
        )
      ) AS distance`;
      queryParams.push(lat, lon);
      paramIndex += 2;
    } else {
      selectExpressions += ', NULL AS distance'; 
    }
    
    let queryText = `SELECT ${selectExpressions} FROM activities a`;

    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
      whereClauses.push(`(a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex})`);
      queryParams.push(`%${searchQuery.trim()}%`);
      paramIndex++;
    }

    if (type && typeof type === 'string' && type.trim() !== '') {
      whereClauses.push(`a.type = $${paramIndex}`);
      queryParams.push(type.trim());
      paramIndex++;
    }

    if (age && !isNaN(parseInt(age, 10))) {
      const ageInt = parseInt(age, 10);
      whereClauses.push(`(a.min_age IS NULL OR a.min_age <= $${paramIndex}) AND (a.max_age IS NULL OR a.max_age >= $${paramIndex})`);
      queryParams.push(ageInt);
      paramIndex++;
    }
    
    if (max_price && !isNaN(parseFloat(max_price))) {
      const maxPriceFloat = parseFloat(max_price);
      if (maxPriceFloat === 0) {
        whereClauses.push(`(a.price IS NULL OR a.price <= $${paramIndex})`);
      } else {
        whereClauses.push(`(a.price IS NULL OR a.price <= $${paramIndex})`);
      }
      queryParams.push(maxPriceFloat);
      paramIndex++;
    }

    if (!isNaN(lat) && !isNaN(lon) && !isNaN(rad) && rad > 0) {
      // Assumes $1 and $2 are user's lat/lon for distance calculation
      whereClauses.push(`(
        6371 * acos(
            cos(radians($1)) * cos(radians(a.latitude)) *
            cos(radians(a.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(a.latitude))
        )
      ) < $${paramIndex}`); 
      queryParams.push(rad);
      paramIndex++;
    }

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }

    const allowedSortBy = ['date', 'popularity', 'price', 'distance'];
    const sortDir = (sortOrder === 'asc' || sortOrder === 'ASC') ? 'ASC' : 'DESC';

    if (sortBy && allowedSortBy.includes(sortBy as string)) {
      switch (sortBy) {
        case 'date':
          orderByClause = `ORDER BY a.created_at ${sortDir}`;
          break;
        case 'price':
          orderByClause = `ORDER BY a.price ${sortDir} NULLS LAST`;
          break;
        case 'popularity':
          orderByClause = `ORDER BY a.title ${sortDir}`; // Placeholder
          break;
        case 'distance':
          if (!isNaN(lat) && !isNaN(lon)) {
            orderByClause = `ORDER BY distance ${sortDir}, a.created_at DESC`;
          }
          break;
      }
    }
    
    queryText += ` ${orderByClause}`;
    
    const activities = await pool.query(queryText, queryParams);
    res.status(200).json(activities.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    if (error.message.includes("invalid input syntax")) {
        return res.status(400).json({ message: "Invalid input for one or more filter parameters." });
    }
    res.status(500).json({ message: 'Server error while fetching activities' });
  }
};

// @desc    Get a single activity by ID
// @route   GET /api/activities/:id
// @access  Public (for now)
const getActivityById = async (req, res) => {
  const { id } = req.params;
  try {
    // Ensure all fields, including new ones, are selected.
    // If distance calculation is needed based on user's current location (not provided here), it's more complex.
    // For now, just selects all table fields.
    const activity = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);
    if (activity.rows.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json(activity.rows[0]);
  } catch (error) {
    console.error('Error fetching activity by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id; // from authMiddleware
  const { 
    title, description, latitude, longitude, type, min_age, max_age, price,
    header_image_url, activity_date_text, location_name, address_street,
    address_city, address_postal_code, target_audience_text, financial_aid_text,
    eco_mobility_text, schedule_text, additional_info_text, max_participants,
    current_participants, // System might update this, user less likely but possible for some roles
    contact_email, contact_phone, accepts_financial_aid, payment_options, accessibility_info
  } = req.body;

  // Basic validation for core modifiable fields (examples)
  if (latitude !== undefined && typeof latitude !== 'number') return res.status(400).json({message: 'Latitude must be a number'});
  if (longitude !== undefined && typeof longitude !== 'number') return res.status(400).json({message: 'Longitude must be a number'});
  if (min_age !== undefined && (typeof min_age !== 'number' || min_age < 0)) return res.status(400).json({ message: 'Min age must be a non-negative number.'});
  if (max_age !== undefined && (typeof max_age !== 'number' || max_age < 0)) return res.status(400).json({ message: 'Max age must be a non-negative number.'});
  if (price !== undefined && (typeof price !== 'number' || price < 0)) return res.status(400).json({ message: 'Price must be a non-negative number.'});
  if (max_participants !== undefined && (typeof max_participants !== 'number' || max_participants <= 0)) return res.status(400).json({ message: 'Max participants must be a positive number.' });
  if (current_participants !== undefined && (typeof current_participants !== 'number' || current_participants < 0)) return res.status(400).json({ message: 'Current participants must be a non-negative number.' });
  if (accepts_financial_aid !== undefined && typeof accepts_financial_aid !== 'boolean') return res.status(400).json({message: 'Accepts financial aid must be a boolean.'});


  try {
    const activityResult = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);
    if (activityResult.rows.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const activity = activityResult.rows[0];
    if (activity.user_id !== user_id) {
      return res.status(403).json({ message: 'User not authorized to update this activity' });
    }

    const fieldsToUpdate: Record<string, any> = { updated_at: new Date() };
    
    // Helper to add field to update if it's provided in request body
    const addIfProvided = (fieldName: string, value: any) => {
      if (value !== undefined) fieldsToUpdate[fieldName] = value;
    };

    addIfProvided('title', title);
    addIfProvided('description', description);
    addIfProvided('latitude', latitude);
    addIfProvided('longitude', longitude);
    addIfProvided('type', type);
    addIfProvided('min_age', min_age);
    addIfProvided('max_age', max_age);
    addIfProvided('price', price);
    addIfProvided('header_image_url', header_image_url);
    addIfProvided('activity_date_text', activity_date_text);
    addIfProvided('location_name', location_name);
    addIfProvided('address_street', address_street);
    addIfProvided('address_city', address_city);
    addIfProvided('address_postal_code', address_postal_code);
    addIfProvided('target_audience_text', target_audience_text);
    addIfProvided('financial_aid_text', financial_aid_text);
    addIfProvided('eco_mobility_text', eco_mobility_text);
    addIfProvided('schedule_text', schedule_text);
    addIfProvided('additional_info_text', additional_info_text);
    addIfProvided('max_participants', max_participants);
    addIfProvided('current_participants', current_participants);
    addIfProvided('contact_email', contact_email);
    addIfProvided('contact_phone', contact_phone);
    addIfProvided('accepts_financial_aid', accepts_financial_aid);
    addIfProvided('payment_options', payment_options);
    addIfProvided('accessibility_info', accessibility_info);
    
    const fieldKeys = Object.keys(fieldsToUpdate);
    if (fieldKeys.length === 1 && fieldKeys[0] === 'updated_at') { 
        return res.status(200).json(activity); // No actual data fields were passed to update
    }
    
    const setClauseParts = fieldKeys.map((key, index) => `${key} = $${index + 1}`);
    const queryValues = fieldKeys.map(key => fieldsToUpdate[key]);
    
    const updateQueryText = `UPDATE activities SET ${setClauseParts.join(', ')} WHERE id = $${queryValues.length + 1} RETURNING *`;
    queryValues.push(id);

    const updatedActivityResult = await pool.query(updateQueryText, queryValues);
    res.status(200).json(updatedActivityResult.rows[0]);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error while updating activity' });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const activityResult = await pool.query('SELECT user_id FROM activities WHERE id = $1', [id]);
    if (activityResult.rows.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activityResult.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: 'User not authorized to delete this activity' });
    }

    await pool.query('DELETE FROM activities WHERE id = $1', [id]);
    res.status(204).send(); 
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error while deleting activity' });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
};
