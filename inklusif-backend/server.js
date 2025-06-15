const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Import Routes
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const reportingRoutes = require('./routes/reportingRoutes');
const socialAuthRoutes = require('./routes/socialAuthRoutes');
const territoryRoutes = require('./routes/territoryRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const childProfileRoutes = require('./routes/childProfileRoutes'); // Import child profile routes
const passport = require('./config/passportSetup'); 

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.get('/api', (req, res) => { 
  res.json({ message: "DUNE API is running!" });
});

// Mount Routers
app.use('/api/users', userRoutes); 
app.use('/api/activities', activityRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/territories', territoryRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/me/children', childProfileRoutes); // Mount child profile routes
app.use('/api', socialAuthRoutes); 


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});