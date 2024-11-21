/**
 * Express router for fetching pending widgets.
 * Provides an endpoint to retrieve widgets that are in a "pending" state.
 */

import { Router } from 'express'; // Import the Express Router
import { getPendingWidgets } from '../services/widgetService.js'; // Service function to fetch pending widgets

const router = Router(); // Create a new Express Router instance

/**
 * GET /
 * Endpoint to fetch all pending widgets.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response containing an array of pending widgets or an error message.
 */
router.get('/', async (req, res) => {
    try {
        // Fetch all pending widgets from the service layer
        const widgets = await getPendingWidgets();

        // Respond with a JSON object containing the widgets
        res.status(200).json(widgets);
    } catch (error) {
        // Handle errors and send a 500 status with an error message
        res.status(500).json({ message: error.message });
    }
});

export default router; // Export the router for use in the application
