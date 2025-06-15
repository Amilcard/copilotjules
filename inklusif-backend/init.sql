-- Drop tables if they exist to ensure a clean slate (optional, use with caution)
-- DROP TABLE IF EXISTS activities;
-- DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL, -- For login and display
    email VARCHAR(255) UNIQUE NOT NULL, -- For login and communication
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),             -- User's first name
    last_name VARCHAR(255),              -- User's last name
    address_postal TEXT,                 -- User's postal address
    quotient_familial VARCHAR(50),       -- Family quotient information
    nombre_enfants INTEGER DEFAULT 0,    -- Number of children
    profile_complete BOOLEAN DEFAULT FALSE, -- Flag if profile details are filled
    google_id VARCHAR(255) UNIQUE,       -- Google OAuth User ID
    facebook_id VARCHAR(255) UNIQUE,     -- Facebook OAuth User ID
    role VARCHAR(50) DEFAULT 'individual', -- User role: 'individual', 'parent', 'admin'
    last_profile_completion_reminder_sent_at TIMESTAMP WITH TIME ZONE, -- Tracks when the last profile completion reminder was sent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_user_role CHECK (role IN ('individual', 'parent', 'admin')) -- Ensure valid roles
);

-- Create child_profiles table
-- Stores profiles of children linked to a parent user account.
CREATE TABLE IF NOT EXISTS child_profiles (
    id SERIAL PRIMARY KEY,
    parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Link to the parent in the users table
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    additional_info TEXT,                -- e.g., allergies, special needs, notes for organizers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
    -- A trigger should update updated_at on any change to the row.
);

-- Optional: Index for child_profiles table
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_id ON child_profiles(parent_user_id);


-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    type VARCHAR(100),                   -- Type or category of the activity (e.g., 'Sport', 'Culture')
    min_age INTEGER,                     -- Minimum suitable age for the activity
    max_age INTEGER,                     -- Maximum suitable age for the activity
    price DECIMAL(10, 2),                -- Price of the activity
    header_image_url TEXT,               -- URL for the main banner image of the activity
    activity_date_text TEXT,             -- Flexible text for date/time (e.g., "Tous les mercredis de 14h à 16h")
    location_name VARCHAR(255),          -- Name of the venue (e.g., "Gymnase Jean Moulin")
    address_street TEXT,                 -- Street address
    address_city VARCHAR(255),           -- City
    address_postal_code VARCHAR(20),     -- Postal code
    target_audience_text TEXT,           -- Detailed description of target audience
    financial_aid_text TEXT,             -- Detailed info on accepted financial aids
    eco_mobility_text TEXT,              -- Info on eco-friendly transport options
    schedule_text TEXT,                  -- Detailed schedule or slot information
    additional_info_text TEXT,           -- Any other relevant details for the activity
    max_participants INTEGER,            -- Maximum number of participants
    current_participants INTEGER DEFAULT 0, -- Current number of registered participants
    contact_email VARCHAR(255),          -- Specific contact email for the activity
    contact_phone VARCHAR(50),           -- Specific contact phone for the activity
    accepts_financial_aid BOOLEAN DEFAULT FALSE, -- Direct flag if any financial aid is accepted
    payment_options TEXT,                -- Information about payment methods or installments
    accessibility_info TEXT,             -- Information regarding accessibility for people with disabilities
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- Optional: Add a trigger to update 'updated_at' timestamp on activities table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant privileges if necessary (adjust 'your_db_user' accordingly)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- Create territory_notification_subscriptions table
CREATE TABLE IF NOT EXISTS territory_notification_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    territory_identifier VARCHAR(255) NOT NULL, -- e.g., postal code, city name
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_email_territory UNIQUE (email, territory_identifier) -- Prevent duplicate subscriptions
);

-- Optional: Add index for faster queries on territory_identifier if needed for notification sending
CREATE INDEX IF NOT EXISTS idx_territory_subscriptions_identifier ON territory_notification_subscriptions(territory_identifier);

-- Create reservation_requests table
CREATE TABLE IF NOT EXISTS reservation_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User making the request
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE, -- Activity being requested
    number_of_participants INTEGER DEFAULT 1, -- How many spots are requested
    status VARCHAR(50) DEFAULT 'pending',      -- e.g., 'pending', 'confirmed', 'cancelled_by_user', 'rejected_by_organizer'
    message_to_organizer TEXT,               -- Optional message from user to organizer
    organizer_response_message TEXT,         -- Optional response from organizer (for BO use)
    child_profile_id INTEGER REFERENCES child_profiles(id) ON DELETE SET NULL, -- Optional: links to a specific child if reservation is for them
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When the request was made
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Tracks updates to the request
    -- No unique constraint on (user_id, activity_id) for now, to allow multiple requests for different children or times.
);

-- Optional: Indexes for reservation_requests table
CREATE INDEX IF NOT EXISTS idx_reservation_user_id ON reservation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reservation_activity_id ON reservation_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON reservation_requests(status);


-- Insert some sample data (optional)
/*
INSERT INTO users (username, email, password_hash) VALUES
('john_doe', 'john.doe@example.com', 'hashed_password_1'),
('jane_smith', 'jane.smith@example.com', 'hashed_password_2');

INSERT INTO activities (user_id, title, description, latitude, longitude) VALUES
(1, 'Morning Run', 'A refreshing 5km run in the park.', 34.052235, -118.243683),
(2, 'Visit to the Museum', 'Exploring the new art exhibition.', 34.052235, -118.243683);
*/

SELECT 'Database initialization script completed successfully.' AS status;