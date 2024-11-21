/**
 * Entry point for the Express.js backend server.
 * This file sets up middleware, routes, and starts the server.
 */

import express, { json } from 'express'; // Express.js framework for creating APIs
import cors from 'cors'; // Middleware to enable Cross-Origin Resource Sharing
import dotenv from "dotenv"; // For managing environment variables
dotenv.config(); // Load environment variables from a `.env` file

// Importing API route handlers
import registerWidgetRoute from './api/register-widget.js';
import approveWidgetRoute from './api/approve-widget.js';
import registerUserRoute from './api/register-user.js';
import loginUserRoute from './api/login-user.js';
import pendingWidgets from './api/pending-widgets.js';
import declineRequestRoute from './api/decline-widget.js';
import fetchAllWidgetRoute from './api/fetch-widgets.js';
import fetchUserByCognitoId from './api/fetch-user.js';
import editWidgetRouter from './api/edit-widget.js';
import userFavoritesRouter from './api/user-favorites.js';

// Initialize the Express app
const app = express();

// ---------------------------------------------------
// Middleware Setup
// ---------------------------------------------------

/**
 * Enable CORS (Cross-Origin Resource Sharing).
 * Required if the frontend and backend are hosted on different domains or ports.
 */
app.use(cors());

/**
 * Parse incoming JSON requests.
 * Adds the parsed data to `req.body`.
 */
app.use(json());

// ---------------------------------------------------
// API Routes
// ---------------------------------------------------

/**
 * Route: `/api/register-widget`
 * Handles widget registration requests.
 */
app.use('/api/register-widget', registerWidgetRoute);

/**
 * Route: `/api/approve-widget`
 * Handles requests to approve widgets.
 */
app.use('/api/approve-widget', approveWidgetRoute);

/**
 * Route: `/api/register-user`
 * Handles user registration requests.
 */
app.use('/api/register-user', registerUserRoute);

/**
 * Route: `/api/login-user`
 * Handles user login requests.
 */
app.use('/api/login-user', loginUserRoute);

/**
 * Route: `/api/pending-widgets`
 * Fetches widgets that are pending approval.
 */
app.use('/api/pending-widgets', pendingWidgets);

/**
 * Route: `/api/decline-widget`
 * Handles requests to decline widget submissions.
 */
app.use('/api/decline-widget', declineRequestRoute);

/**
 * Route: `/api/fetch-widgets`
 * Fetches all widgets, optionally filtered by criteria.
 */
app.use('/api/fetch-widgets', fetchAllWidgetRoute);

/**
 * Route: `/api/fetch-user`
 * Fetches user details by Cognito ID.
 */
app.use('/api/fetch-user', fetchUserByCognitoId);

/**
 * Route: `/api/edit-widget`
 * Handles requests to edit widget details.
 */
app.use('/api/edit-widget', editWidgetRouter);

/**
 * Route: `/api/user-favorites`
 * Manages user favorites, such as adding or removing widgets.
 */
app.use('/api/user-favorites', userFavoritesRouter);

// ---------------------------------------------------
// Root Route
// ---------------------------------------------------

/**
 * Route: `/`
 * Health check route to ensure the server is running.
 */
app.get('/', (req, res) => {
    res.send('Server is running');
});

// ---------------------------------------------------
// Server Initialization
// ---------------------------------------------------

/**
 * The port on which the server will run.
 * Defaults to 3001 if not specified in the environment variables.
 */
const PORT = process.env.PORT || 3001;

/**
 * Start the server and listen for incoming requests.
 */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


