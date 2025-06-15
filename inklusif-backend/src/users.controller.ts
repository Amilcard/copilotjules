const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Database pool
require('dotenv').config({ path: '../../.env' });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      profile_complete: user.profile_complete || false // Include profile_complete status
    }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

// @desc    Register a new user (Initial registration)
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

  // Basic validation for core fields
  if (!username || !email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Please provide username, email, password, first name, and last name' });
  }

  try {
    // Check if user already exists (by username or email)
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const newUserResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name, profile_complete, created_at',
      [username, email, password_hash, first_name, last_name]
    );

    const newUser = newUserResult.rows[0];

    // Generate JWT
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        profile_complete: newUser.profile_complete,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials (email not found)' });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (password incorrect)' });
    }

    // Generate JWT
    const token = generateToken(user); // generateToken now includes profile_complete

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name, // Send back more profile info on login
        last_name: user.last_name,
        profile_complete: user.profile_complete,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Complete user profile
// @route   PUT /api/users/profile
// @access  Private
const completeUserProfile = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const { address_postal, quotient_familial, nombre_enfants } = req.body;

  // Basic validation (can be more extensive)
  if (address_postal === undefined && quotient_familial === undefined && nombre_enfants === undefined) {
    return res.status(400).json({ message: 'No profile data provided to update.' });
  }
  if (nombre_enfants !== undefined && (typeof nombre_enfants !== 'number' || nombre_enfants < 0)) {
      return res.status(400).json({ message: 'Number of children must be a non-negative integer.' });
  }

  try {
    // Build SET clause dynamically
    const fieldsToUpdate = {};
    if (address_postal !== undefined) fieldsToUpdate.address_postal = address_postal;
    if (quotient_familial !== undefined) fieldsToUpdate.quotient_familial = quotient_familial;
    if (nombre_enfants !== undefined) fieldsToUpdate.nombre_enfants = nombre_enfants;
    fieldsToUpdate.profile_complete = true; // Always set this to true on completion

    const fieldKeys = Object.keys(fieldsToUpdate);
    const fieldValues = Object.values(fieldsToUpdate);

    if (fieldKeys.length === 1 && fieldKeys[0] === 'profile_complete' && Object.keys(req.body).length === 0) {
      // If only profile_complete is set because no actual data was passed
      // We might still want to update profile_complete to true, or return current profile
       const currentUserState = await pool.query('SELECT id, username, email, first_name, last_name, address_postal, quotient_familial, nombre_enfants, profile_complete FROM users WHERE id = $1', [userId]);
       if(currentUserState.rows.length === 0) return res.status(404).json({message: "User not found"});
       
       if(currentUserState.rows[0].profile_complete) return res.status(200).json(currentUserState.rows[0]); // Already complete, no change
       
       // Else, mark as complete even if no new data for other fields
    }


    const setClause = fieldKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = $${fieldValues.length + 1} RETURNING id, username, email, first_name, last_name, address_postal, quotient_familial, nombre_enfants, profile_complete, created_at`;
    
    const updatedUserResult = await pool.query(query, [...fieldValues, userId]);

    if (updatedUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found or failed to update profile' });
    }
    
    const updatedUser = updatedUserResult.rows[0];
    const token = generateToken(updatedUser); // Generate new token with updated profile_complete status

    res.status(200).json({
        token, // Send new token so client has updated profile_complete status
        user: updatedUser 
    });

  } catch (error) {
    console.error('Error completing user profile:', error);
    // Check for specific DB errors if needed, e.g., invalid data type for nombre_enfants
    if (error.code === '22P02' && error.message.includes('nombre_enfants')) { // Example for invalid integer input
        return res.status(400).json({ message: 'Invalid value for number of children.' });
    }
    res.status(500).json({ message: 'Server error while completing profile' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  completeUserProfile,
};

// @desc    Handle social login callback (Google, Facebook, etc.)
// @route   GET /api/auth/google/callback, GET /api/auth/facebook/callback
// @access  Public (after social provider authentication)
const socialLoginCallback = (req, res) => {
  // req.user is populated by Passport's verify callback via done(null, user)
  if (!req.user) {
    // This case should ideally be handled by Passport's failureRedirect,
    // but as a fallback or if session: false behaves unexpectedly.
    return res.status(401).json({ message: 'Social authentication failed or user not provided.' });
  }

  const user = req.user;
  const token = generateToken(user); // Uses the existing generateToken function

  // Redirect to frontend with token.
  // The frontend will then store this token and redirect to the app's main page or dashboard.
  // Ensure FRONTEND_URL is configured in your .env file.
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Default if not set
  
  // Pass user data along with token for immediate use by frontend, reducing need for another fetch.
  // This is optional and depends on your frontend's needs.
  // Ensure sensitive data is not overly exposed.
  const userQueryParam = encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_complete: user.profile_complete,
      // Do NOT include password_hash or other sensitive IDs like google_id/facebook_id here
  }));

  // Consider using a more secure method than query parameters for token transfer if possible,
  // especially if the URL could be logged or shared.
  // For web, redirecting to a specific frontend path that handles token is common.
  // For mobile, custom schemes or other IPC mechanisms are used.
  res.redirect(`${frontendUrl}/auth/social-callback?token=${token}&user=${userQueryParam}`);
};

module.exports = {
  registerUser,
  loginUser,
  completeUserProfile,
  socialLoginCallback,
};

// --- Background Task / Utility Function ---

const pool = require('../config/db'); // Ensure pool is available if not already imported at top level

/**
 * Sends profile completion reminders to users who meet the criteria.
 * This function is intended to be called by a scheduler (e.g., cron job).
 * It logs actions instead of sending actual emails for this implementation.
 */
async function sendProfileCompletionReminders() {
  console.log('[ReminderTask] Starting profile completion reminder process...');
  let remindersSentCount = 0;

  try {
    const usersToRemind = await pool.query(
      `SELECT id, email, first_name FROM users 
       WHERE profile_complete = FALSE 
       AND (last_profile_completion_reminder_sent_at IS NULL OR last_profile_completion_reminder_sent_at <= NOW() - INTERVAL '48 hours')`
    );

    if (usersToRemind.rows.length === 0) {
      console.log('[ReminderTask] No users currently need a profile completion reminder.');
      return;
    }

    console.log(`[ReminderTask] Found ${usersToRemind.rows.length} user(s) needing a reminder.`);

    for (const user of usersToRemind.rows) {
      const reminderSubject = `Presque terminé ${user.first_name || 'cher utilisateur'} ! Revenez quand vous voulez pour finir ces étapes.`;
      console.log(`[ReminderTask] Reminder needed for user ID: ${user.id}, Email: ${user.email}. Subject: ${reminderSubject}`);
      console.log(`[ReminderTask] (Simulating email sending to ${user.email}...)`);
      
      // Update the last reminder sent timestamp
      await pool.query(
        'UPDATE users SET last_profile_completion_reminder_sent_at = NOW() WHERE id = $1',
        [user.id]
      );
      remindersSentCount++;
      console.log(`[ReminderTask] Updated last_profile_completion_reminder_sent_at for user ID: ${user.id}`);
    }

    console.log(`[ReminderTask] Processed ${remindersSentCount} reminder(s).`);

  } catch (error) {
    console.error('[ReminderTask] Error during profile completion reminder process:', error);
  } finally {
    console.log('[ReminderTask] Profile completion reminder process finished.');
  }
}

// For potential manual trigger or testing (not a route, just an example of how it might be called)
// if (require.main === module) { // Basic check if script is run directly
//   console.log("Manually triggering sendProfileCompletionReminders for testing...");
//   sendProfileCompletionReminders().then(() => {
//     console.log("Manual trigger finished.");
//     // If using pool directly, you might need to end it if it's a standalone script.
//     // pool.end(); 
//   }).catch(err => {
//     console.error("Error during manual trigger:", err);
//     // pool.end();
//   });
// }

// Note: The `pool` import might need adjustment if this controller doesn't already have it.
// It's typically imported at the top of the file. I'll assume it's available from previous context.
// If not, I'd add `const pool = require('../config/db');` at the top.
// The generateToken function is also in this file, so pool should be available.

// Exporting it just in case it's needed elsewhere, though primarily for scheduler.
module.exports.sendProfileCompletionReminders = sendProfileCompletionReminders;
