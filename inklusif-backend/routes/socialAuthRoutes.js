const express = require('express');
const passport = require('passport'); // Passport instance from passportSetup.js
const userController = require('../controllers/userController');

const router = express.Router();

// Google OAuth Routes
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { 
    // failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`, // Redirect to frontend login on failure
    failureMessage: true, // Send failure message to be handled by custom callback or error handler
    session: false 
  }),
  userController.socialLoginCallback // If auth succeeds, this controller handles JWT generation & redirect
);


// Facebook OAuth Routes
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'], session: false })
);

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    // failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=facebook_auth_failed`,
    failureMessage: true,
    session: false
  }),
  userController.socialLoginCallback
);

// A route to check if authentication failed and redirect with a message
// This is an alternative if failureRedirect directly in passport.authenticate is tricky with dynamic frontend URLs
// Or if you want to pass more structured error info.
// For now, the socialLoginCallback will handle success, and failureRedirect is commented out.
// If passport.authenticate fails before hitting socialLoginCallback, it will respond based on its config.
// If failureMessage: true, then req.session.messages (if sessions active) or potentially req.flash (if connect-flash used)
// would contain messages. With session: false, this is less straightforward.
// The most common way is failureRedirect, or a custom callback for authenticate.
// Let's rely on the default behavior of passport.authenticate for failures if socialLoginCallback is not reached.
// If `socialLoginCallback` is reached but `req.user` is not there, it sends a 401.

module.exports = router;