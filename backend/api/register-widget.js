/**
 * Express router for widget registration.
 * Handles the registration of a new widget and associates it with a user.
 */

import { Router } from 'express'; // Import the Express Router
import { registerWidget } from '../services/widgetService.js'; // Service function for widget registration

const router = Router(); // Create a new Express Router instance

/**
 * POST /
 * Endpoint for registering a new widget.
 * Associates the widget with a user and stores the widget details in the database.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing widget details.
 * @param {string} req.body.widgetName - The name of the widget.
 * @param {string} req.body.description - A description of the widget.
 * @param {string} req.body.visibility - The visibility status of the widget (e.g., "public" or "private").
 * @param {string} req.body.userId - The ID of the user registering the widget.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response with the result of the widget registration.
 */
router.post('/', async (req, res) => {
    const { widgetName, description, visibility, userId } = req.body; // Extract widget details and userId from the request body

    try {
        // Call the service function to register the widget and associate it with the user
        const result = await registerWidget(userId, widgetName, description, visibility);
        console.log({result});
        // Respond with the result of the registration
        res.status(200).json(result);
    } catch (error) {
        // Handle errors and send a 500 status with an error message
        res.status(500).json({ message: error.message });
    }
});

export default router; // Export the router for use in the application


