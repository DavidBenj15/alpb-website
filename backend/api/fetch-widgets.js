/**
 * Express router for retrieving a list of widgets.
 * Handles fetching all widgets with optional query parameters for filtering, pagination, and validation.
 */

import { Router } from 'express'; // Import the Express Router
import { getAllWidgets } from '../services/widgetService.js'; // Service function for fetching widgets
import { validationMiddleware } from '../middleware/validation-middleware.js'; // Middleware for validating request data
import { queryParamasSchema } from '../validators/schemas.js'; // Validation schema for query parameters

const router = Router(); // Create a new Express Router instance

/**
 * GET /
 * Endpoint to retrieve all widgets.
 * Accepts optional query parameters for filtering by widget name, categories,
 * and for pagination (page and limit). Validates the query parameters using a schema.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.query - The query parameters sent with the request.
 * @param {string} [req.query.widgetName] - Optional filter for widgets by name.
 * @param {string[]} [req.query.categories] - Optional filter for widgets by categories (comma-separated values).
 * @param {number} [req.query.page=1] - Optional pagination parameter specifying the page number.
 * @param {number} [req.query.limit=10] - Optional pagination parameter specifying the number of widgets per page.
 * @param {Object} res - The HTTP response object.
 */
router.get('/', validationMiddleware(queryParamasSchema), async (req, res) => {
    try {
        // Destructure query parameters from the request
        const { widgetName, categories, page, limit } = req.query;

        // Call the service function to fetch widgets with the specified parameters
        const widgets = await getAllWidgets(widgetName, categories, page, limit);

        // Respond with the fetched widgets
        res.status(200).json(widgets);
    } catch (error) {
        // Handle errors and respond with an error message
        res.status(500).json({ message: error.message });
    }
});

export default router; // Export the router for use in the application
