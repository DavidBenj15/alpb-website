/**
 * Express router for handling updates to widgets.
 * Provides functionality for updating widget details such as name, description,
 * redirect link, and visibility, with validation applied to incoming requests.
 */

import { Router } from "express"; // Import the Express Router
import { updateWidget } from "../services/widgetService.js"; // Service function for updating widgets in the database
import { validationMiddleware } from '../middleware/validation-middleware.js'; // Middleware for validating request data
import { editWidgetSchema } from "../validators/schemas.js"; // Validation schema for widget updates

const router = Router(); // Create a new Express Router instance

/**
 * PATCH /:id
 * Endpoint for updating widget details.
 * Validates incoming request data against a predefined schema and updates
 * the widget details in the database.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing widget update data.
 * @param {string} req.params.id - The ID of the widget to update.
 * @param {Object} res - The HTTP response object.
 */
router.patch('/:id', validationMiddleware(editWidgetSchema), async (req, res) => {

    // Destructure widget update data from the request body
    const { name, description, redirectLink, visibility, imageUrl } = req.body;

    // Parse the widget ID from the request parameters
    const widgetId = Number(req.params.id);

    try {
        console.log(req.body)
        // Call the service function to update the widget in the database
        const result = await updateWidget({ 
            widgetId, 
            widgetName: name, 
            description, 
            redirectLink, 
            visibility,
            imageUrl
        });

        // Respond with the updated widget data
        res.status(200).json(result);
    } catch (error) {
        // Handle errors and respond with an error message
        res.status(500).json({ message: error.message });
    }
});

export default router; // Export the router for use in the application
