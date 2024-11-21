/**
 * Express router for retrieving user data.
 * Handles requests to fetch user information based on a user ID.
 */

import { Router } from 'express'; // Import the Express Router
import { getUserData } from '../services/widgetService.js'; // Service function to retrieve user data

const router = Router(); // Create a new Express Router instance

/**
 * GET /
 * Endpoint to retrieve user data.
 * Extracts the user ID from the request body, fetches the user's data from the database,
 * and returns the user data in the response.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the user ID.
 * @param {string} req.body.id - The unique identifier of the user.
 * @param {Object} res - The HTTP response object.
 */
router.get('/', async (req, res) => {
    const { id } = req.body; // Extract user ID from the request body

    try {
        // Fetch user data using the provided user ID
        const user = await getUserData(id);

        // Respond with the retrieved user data
        res.status(200).json(user);
    } catch (error) {
        // Handle errors and respond with an error message
        res.status(500).json({ message: error.message });
    }
});

export default router; // Export the router for use in the application
