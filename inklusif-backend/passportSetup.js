const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const pool = require('./db'); // Assuming your db connection pool is here
const { v4: uuidv4 } = require('uuid'); // For generating random password hash if needed

// Load environment variables
require('dotenv').config({ path: '../../.env' });

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    console.warn("Google OAuth environment variables are not fully set. Google login will not work.");
}
if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET || !process.env.FACEBOOK_CALLBACK_URL) {
    console.warn("Facebook OAuth environment variables are not fully set. Facebook login will not work.");
}


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google Profile:', JSON.stringify(profile, null, 2)); // Log the profile
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        return done(new Error("Email not found in Google profile"), null);
      }

      // Check if user already exists with this Google ID or email
      let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [profile.id, email]);
      let user = userResult.rows[0];

      if (user) {
        // User exists, link Google ID if not already linked and email matches
        if (!user.google_id && user.email === email) {
          userResult = await pool.query('UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *', [profile.id, user.id]);
          user = userResult.rows[0];
        }
        return done(null, user);
      } else {
        // User does not exist, create a new user
        const username = profile.displayName || email.split('@')[0] + `_${profile.provider.slice(0,2)}`; // Generate a username
        // Ensure username uniqueness (simple retry mechanism, might need improvement for production)
        let uniqueUsername = username;
        let attempts = 0;
        while(attempts < 5) {
            const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [uniqueUsername]);
            if(existingUsername.rows.length === 0) break;
            uniqueUsername = `${username}${Math.floor(Math.random() * 1000)}`;
            attempts++;
        }
        if(attempts === 5) return done(new Error("Failed to generate a unique username."), null);


        const newUser = {
          email: email,
          first_name: profile.name && profile.name.givenName ? profile.name.givenName : '',
          last_name: profile.name && profile.name.familyName ? profile.name.familyName : '',
          username: uniqueUsername,
          // For social logins, password_hash is not directly used for login.
          // Set a long, random, unusable password hash. User can later set a password via "forgot password" flow if they wish.
          password_hash: uuidv4() + uuidv4(), // Placeholder, not for direct login
          google_id: profile.id,
          profile_complete: false // Or determine based on available data
        };

        const savedUserResult = await pool.query(
          'INSERT INTO users (email, first_name, last_name, username, password_hash, google_id, profile_complete) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [newUser.email, newUser.first_name, newUser.last_name, newUser.username, newUser.password_hash, newUser.google_id, newUser.profile_complete]
        );
        return done(null, savedUserResult.rows[0]);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'displayName'] // Request these fields
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Facebook Profile:', JSON.stringify(profile, null, 2));
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      // Facebook might not always return an email if user privacy settings are strict.
      // Handle cases where email might be null or use profile.id as primary fallback.
      if (!email && !profile.id) { // if no email and no id, cannot proceed
        return done(new Error("Required ID and Email not found in Facebook profile"), null);
      }
      
      // Check if user already exists with this Facebook ID or email (if email exists)
      let queryText = 'SELECT * FROM users WHERE facebook_id = $1';
      let queryParams = [profile.id];
      if (email) {
          queryText += ' OR email = $2';
          queryParams.push(email);
      }
      
      let userResult = await pool.query(queryText, queryParams);
      let user = userResult.rows[0];

      if (user) {
        // User exists, link Facebook ID if not linked and email matches (if email was part of query)
        if (!user.facebook_id && ( (email && user.email === email) || !email ) ) { // if no email in profile, link if IDs match
          userResult = await pool.query('UPDATE users SET facebook_id = $1 WHERE id = $2 RETURNING *', [profile.id, user.id]);
          user = userResult.rows[0];
        }
        return done(null, user);
      } else {
        // User does not exist, create a new user
        // Ensure email is present or handle its absence. For this example, we'll make email mandatory for new account creation.
        if (!email) {
            // Potentially redirect user to a page saying "We couldn't get your email from Facebook. Please register manually or try Google."
            return done(new Error("Email is required to create a new account via Facebook, but was not provided."), null);
        }

        let username = profile.displayName || (profile.name ? `${profile.name.givenName}${profile.name.familyName}` : '') || email.split('@')[0] + `_fb`;
        // Ensure username uniqueness
        let uniqueUsername = username.replace(/\s/g, ''); // remove spaces
        let attempts = 0;
        while(attempts < 5) {
            const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [uniqueUsername]);
            if(existingUsername.rows.length === 0) break;
            uniqueUsername = `${username.replace(/\s/g, '')}${Math.floor(Math.random() * 1000)}`;
            attempts++;
        }
        if(attempts === 5) return done(new Error("Failed to generate a unique username for Facebook user."), null);
        
        const newUser = {
          email: email,
          first_name: profile.name && profile.name.givenName ? profile.name.givenName : '',
          last_name: profile.name && profile.name.familyName ? profile.name.familyName : '',
          username: uniqueUsername,
          password_hash: uuidv4() + uuidv4(), // Placeholder
          facebook_id: profile.id,
          profile_complete: false 
        };

        const savedUserResult = await pool.query(
          'INSERT INTO users (email, first_name, last_name, username, password_hash, facebook_id, profile_complete) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [newUser.email, newUser.first_name, newUser.last_name, newUser.username, newUser.password_hash, newUser.facebook_id, newUser.profile_complete]
        );
        return done(null, savedUserResult.rows[0]);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

// These are typically used for session-based authentication.
// For a token-based (JWT) approach where user info is put in JWT after social auth,
// these might not be strictly necessary if session: false is used in passport.authenticate.
// However, Passport still requires them, even if not actively used for session persistence.
passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize user by ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return done(new Error('User not found during deserialization'));
    }
    done(null, userResult.rows[0]); // Deserialize user object
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;