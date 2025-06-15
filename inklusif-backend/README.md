# Dune Backend

This directory contains the Node.js Express backend for the DUNE application.

## Prerequisites

- Node.js (v18 or later recommended)
- npm
- Docker (for running PostgreSQL)
- A code editor (e.g., VS Code)

## Getting Started

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository_url>
    cd dune-app/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and update the placeholder values, especially for the database connection:
        -   `DB_USER`: Your PostgreSQL username (e.g., `dune_user`)
        -   `DB_HOST`: `localhost` (if running Docker locally)
        -   `DB_DATABASE`: The name of your database (e.g., `dune_db`)
        -   `DB_PASSWORD`: Your PostgreSQL password
        -   `DB_PORT`: `5432` (or your configured PostgreSQL port)
        -   `PORT`: The port the backend server will run on (e.g., `3001`)
        -   Ensure social auth variables (GOOGLE_*, FACEBOOK_*) and `FRONTEND_URL` are also set up as described later.

4.  **Start PostgreSQL using Docker:**
    -   Make sure Docker Desktop is running.
    -   Navigate to the root directory of the project (where `docker-compose.yml` is located).
    -   Run the following command to start the PostgreSQL container in detached mode:
        ```bash
        docker-compose up -d
        ```
    -   To check if the container is running:
        ```bash
        docker-compose ps
        ```
        You should see the `dune_postgres_db` container running.

5.  **Initialize the Database Schema:**
    -   Once the PostgreSQL container is running, create the tables by connecting to the database and running the `backend/sql/init.sql` script.
    -   **Using `psql` via Docker (Recommended):**
        ```bash
        docker-compose exec postgres_db psql -U your_db_user -d dune_db -f /path/to/your/dune-app/backend/sql/init.sql 
        ```
        *(Adjust the path to `init.sql` based on where you run the command from, or mount it as described in previous README versions if preferred.)*
    -   **Using a Database GUI Tool:** Connect using the details from your `.env` file and execute the content of `backend/sql/init.sql`.

6.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server should now run on `http://localhost:3001` (or your configured `PORT`).

## Available Scripts

-   `npm start`: Starts the development server using `nodemon`.
-   `npm test`: (Not yet configured) Runs tests.

## Project Structure
```
backend/
├── src/
│   ├── config/         # Database (db.js) & Passport (passportSetup.js) configuration
│   ├── controllers/    # Request handlers (userController, activityController, reservationController, childProfileController, etc.)
│   ├── middleware/     # Custom middleware (authMiddleware)
│   ├── routes/         # API route definitions
│   └── server.js       # Express server setup
├── sql/
│   └── init.sql        # Database schema initialization
├── .env.example        # Example environment variables
├── .gitignore          # Files to ignore for git
├── package.json
└── README.md
```

## API Endpoints

### General
-   `GET /api`: Returns `{ message: "DUNE API is running!" }`.

### User Authentication (`/api/users`)
-   **`POST /api/users/register`**: Registers a new user.
    -   Request Body: `{ "username", "email", "password", "first_name", "last_name" }`.
    -   Response (201): `{ "token", "user": { id, username, email, first_name, last_name, profile_complete, role, ... } }`.
-   **`POST /api/users/login`**: Logs in an existing user.
    -   Request Body: `{ "email" (or "username"), "password" }`.
    -   Response (200): `{ "token", "user": { id, username, email, first_name, last_name, profile_complete, role, ... } }`.
-   **`PUT /api/users/profile`** (Protected): Completes/updates user profile.
    -   Request Body: `{ "address_postal"?, "quotient_familial"?, "nombre_enfants"? }`.
    -   Response (200): `{ "token", "user": { ...updated user object... } }`.

### Child Profile Management (`/api/me/children`)
These endpoints allow authenticated users (parents) to manage profiles for their children. All routes require authentication.
-   **`POST /api/me/children`** (Protected): Adds a new child profile. Auto-updates user role to 'parent' if 'individual'.
    -   Request Body: `{ "first_name", "last_name", "date_of_birth" (YYYY-MM-DD), "additional_info"? }`.
    -   Response (201): The created child profile object.
-   **`GET /api/me/children`** (Protected): Retrieves all child profiles for the user.
    -   Response (200): Array of child profile objects.
-   **`PUT /api/me/children/:child_profile_id`** (Protected): Updates a child profile.
    -   Request Body: Subset of `first_name`, `last_name`, `date_of_birth`, `additional_info`.
    -   Response (200): The updated child profile object.
-   **`DELETE /api/me/children/:child_profile_id`** (Protected): Deletes a child profile.
    -   Response (204): No content.

### Activity Management (`/api/activities`)
(Full documentation for request/response bodies including all detailed fields can be found by inspecting controller code or previous README versions.)
-   **`POST /api/activities`** (Protected): Create a new activity. All detailed fields are optional in request.
-   **`GET /api/activities`** (Public): Get a list of all activities, with extensive filtering and sorting. All detailed fields included in response.
-   **`GET /api/activities/:id`** (Public): Get a single activity by ID, including all detailed fields.
-   **`PUT /api/activities/:id`** (Protected): Update an activity. Any subset of detailed fields can be sent.
-   **`DELETE /api/activities/:id`** (Protected): Delete an activity.

### Reservation Requests (`/api/reservations`)
Allows authenticated users to request a reservation for an activity.
-   **`POST /api/reservations`** (Protected)
    -   Description: Creates a new 'pending' reservation request.
    -   Request Body:
        ```json
        {
            "activity_id": 123, // Mandatory
            "child_profile_id": 7, // Optional: ID of child if booking for them
            "number_of_participants": 1, // Optional, defaults to 1
            "message_to_organizer": "Message for organizer." // Optional
        }
        ```
    -   Response (201): The created reservation request object (includes `child_profile_id` if provided).
    -   Errors: 400 (validation, no spots), 401 (unauthorized), 403 (child profile not authorized/found), 404 (activity not found).
-   **`GET /api/reservations/me`** (Protected)
    -   Description: Retrieves authenticated user's reservation requests. Can be optionally filtered to show reservations for a specific child of that user.
    -   Requires: JWT Authentication Token.
    -   **Query Parameters**:
        -   `child_profile_id` (optional, integer): If provided, filters the results to show only reservation requests made for the specified child. The child profile must belong to the authenticated user.
    -   **Example Usage**:
        -   To get all reservations for the user (self and all children): `/api/reservations/me`
        -   To get reservations specifically for child with ID 123: `/api/reservations/me?child_profile_id=123`
    -   Response (Success 200 - OK): An array of reservation request objects. Each object includes details of the reservation, selected information about the associated activity, and (if applicable) details of the child for whom the reservation was made.
        ```json
        [
            {
                "reservation_id": 1, "reservation_status": "pending", ...,
                "child_profile_id": 7, "child_first_name": "Léo", "child_last_name": "Dupont",
                "activity_id": 123, "activity_title": "Football U10", ...
            }
        ]
        ```
        -   Returns an empty array `[]` if the user has no (matching) reservation requests.
        -   `child_first_name` and `child_last_name` will be `null` if `child_profile_id` was `null` for that reservation (i.e., reservation for the parent).
    -   Response (Error 400 - Bad Request): If `child_profile_id` is provided in an invalid format.
    -   Response (Error 401 - Unauthorized): If the user is not authenticated.
    -   Response (Error 403 - Forbidden): If `child_profile_id` is provided but does not belong to a child of the authenticated user, or the child profile is not found.
    -   Response (Error 500 - Server Error): For other server-side issues.


### Territory Notification Subscriptions (`/api/territories`)
-   **`POST /api/territories/subscribe`** (Public): Subscribe to notifications for a territory.

### Reporting (`/api/reporting`) (Protected)
-   **`GET /api/reporting/stats`**: Basic app stats.

### Social Authentication (`/api/auth/...`)
-   Google & Facebook OAuth routes.

## Authentication Middleware
Protected routes require a JWT in `Authorization: Bearer <token>` header.

## Database Schema Changes
The `init.sql` script defines the database schema. Key tables and recent additions:
-   **`users` table**: Includes `role` ('individual', 'parent', 'admin').
-   **`child_profiles` table (New)**: Stores child data linked to `parent_user_id`.
-   **`activities` table**: Includes numerous detailed fields for activity information.
-   **`reservation_requests` table**: Includes `child_profile_id` (nullable FK to `child_profiles.id`).
-   **`territory_notification_subscriptions` table**: For territory-based notification sign-ups.

**Parent/Child Model (Iteration 1)**:
-   Parents have `role='parent'`. Children are profiles under parents. Reservations can link to a child.

**Important**: Manually apply `init.sql` changes to existing local databases.

### Profile Completion Reminder System (Conceptual)
A utility function `sendProfileCompletionReminders` exists for scheduled (e.g., cron) execution.

(More details on environment variables for social auth can be found in `.env.example`)
