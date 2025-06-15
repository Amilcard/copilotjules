const pool = require('../config/db');
const validator = require('validator'); // For date validation, etc.

// Helper function to update user role to 'parent' if they are 'individual'
const updateUserRoleToParent = async (userId) => {
  try {
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'individual') {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['parent', userId]);
      console.log(`User role updated to 'parent' for user ID: ${userId}`);
    }
  } catch (error) {
    console.error(`Error updating user role to 'parent' for user ID ${userId}:`, error);
    // Non-critical error for the main flow of adding a child, so just log it.
    // Alternatively, could throw and make it part of a transaction.
  }
};

// @desc    Add a new child profile for the authenticated user
// @route   POST /api/me/children
// @access  Private
const addChildProfile = async (req, res) => {
  const parent_user_id = req.user.id; // From authMiddleware
  const { first_name, last_name, date_of_birth, additional_info } = req.body;

  // Validation
  if (!first_name || !last_name || !date_of_birth) {
    return res.status(400).json({ message: 'First name, last name, and date of birth are required.' });
  }
  if (!validator.isDate(date_of_birth, { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] })) {
    return res.status(400).json({ message: 'Invalid date of birth format. Please use YYYY-MM-DD.' });
  }

  try {
    // Attempt to update user role to 'parent' if they are 'individual'
    // This is done non-atomically for simplicity here. In a production system, this might be part of a transaction.
    await updateUserRoleToParent(parent_user_id);

    const newChildProfile = await pool.query(
      `INSERT INTO child_profiles (parent_user_id, first_name, last_name, date_of_birth, additional_info, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING *`,
      [parent_user_id, first_name, last_name, date_of_birth, additional_info]
    );

    res.status(201).json(newChildProfile.rows[0]);
  } catch (error) {
    console.error('Error adding child profile:', error);
    res.status(500).json({ message: 'Server error while adding child profile.' });
  }
};

// @desc    Get all child profiles for the authenticated user
// @route   GET /api/me/children
// @access  Private
const getChildProfiles = async (req, res) => {
  const parent_user_id = req.user.id;

  try {
    const childProfiles = await pool.query(
      'SELECT * FROM child_profiles WHERE parent_user_id = $1 ORDER BY first_name ASC, created_at DESC',
      [parent_user_id]
    );
    res.status(200).json(childProfiles.rows); // Returns empty array if none
  } catch (error) {
    console.error('Error fetching child profiles:', error);
    res.status(500).json({ message: 'Server error while fetching child profiles.' });
  }
};

// @desc    Update a specific child profile for the authenticated user
// @route   PUT /api/me/children/:child_profile_id
// @access  Private
const updateChildProfile = async (req, res) => {
  const parent_user_id = req.user.id;
  const { child_profile_id } = req.params;
  const { first_name, last_name, date_of_birth, additional_info } = req.body;

  if (isNaN(parseInt(child_profile_id, 10))) {
      return res.status(400).json({ message: 'Invalid child profile ID format.' });
  }
  if (date_of_birth && !validator.isDate(date_of_birth, { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] })) {
    return res.status(400).json({ message: 'Invalid date of birth format. Please use YYYY-MM-DD.' });
  }

  try {
    // Check ownership first
    const ownershipCheck = await pool.query(
        'SELECT id FROM child_profiles WHERE id = $1 AND parent_user_id = $2',
        [child_profile_id, parent_user_id]
    );
    if (ownershipCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Unauthorized or child profile not found.' });
    }

    // Build SET clause dynamically
    const fieldsToUpdate: Record<string, any> = { updated_at: new Date() };
    if (first_name !== undefined) fieldsToUpdate.first_name = first_name;
    if (last_name !== undefined) fieldsToUpdate.last_name = last_name;
    if (date_of_birth !== undefined) fieldsToUpdate.date_of_birth = date_of_birth;
    if (additional_info !== undefined) fieldsToUpdate.additional_info = additional_info;

    const fieldKeys = Object.keys(fieldsToUpdate);
    if (fieldKeys.length === 1 && fieldKeys[0] === 'updated_at' && Object.keys(req.body).length === 0) {
        const currentProfile = await pool.query('SELECT * FROM child_profiles WHERE id = $1', [child_profile_id]);
        return res.status(200).json(currentProfile.rows[0]); // No actual data fields were passed
    }
    
    const setClauseParts = fieldKeys.map((key, index) => `${key} = $${index + 1}`);
    const queryValues = fieldKeys.map(key => fieldsToUpdate[key]);
    
    const updateQueryText = `UPDATE child_profiles SET ${setClauseParts.join(', ')} WHERE id = $${queryValues.length + 1} AND parent_user_id = $${queryValues.length + 2} RETURNING *`;
    queryValues.push(child_profile_id, parent_user_id);

    const updatedProfile = await pool.query(updateQueryText, queryValues);

    if (updatedProfile.rows.length === 0) {
      // This case might be redundant due to prior ownership check, but good for safety
      return res.status(404).json({ message: 'Child profile not found or update failed.' });
    }
    res.status(200).json(updatedProfile.rows[0]);

  } catch (error) {
    console.error('Error updating child profile:', error);
    res.status(500).json({ message: 'Server error while updating child profile.' });
  }
};

// @desc    Delete a specific child profile for the authenticated user
// @route   DELETE /api/me/children/:child_profile_id
// @access  Private
const deleteChildProfile = async (req, res) => {
  const parent_user_id = req.user.id;
  const { child_profile_id } = req.params;

  if (isNaN(parseInt(child_profile_id, 10))) {
      return res.status(400).json({ message: 'Invalid child profile ID format.' });
  }

  try {
    const deleteResult = await pool.query(
      'DELETE FROM child_profiles WHERE id = $1 AND parent_user_id = $2 RETURNING id',
      [child_profile_id, parent_user_id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(403).json({ message: 'Unauthorized or child profile not found.' });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Error deleting child profile:', error);
    res.status(500).json({ message: 'Server error while deleting child profile.' });
  }
};

module.exports = {
  addChildProfile,
  getChildProfiles,
  updateChildProfile,
  deleteChildProfile,
};