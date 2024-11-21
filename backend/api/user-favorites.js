/**
 * Express router for managing user widget favorites.
 * Provides endpoints to add a widget to favorites, remove a widget from favorites,
 * and retrieve the list of a user's favorite widgets.
 */

import { Router } from "express"; // Import the Express Router
import { favoriteWidget, getFavorites, unfavoriteWidget } from "../services/userService.js"; // Service functions for managing favorites
import { validationMiddleware } from '../middleware/validation-middleware.js'; // Middleware for validating requests
import { updateUserSchema, favoriteWidgetSchema } from "../validators/schemas.js"; // Validation schemas

const router = Router(); // Create a new Express Router instance

/**
 * PATCH /add-favorite/:userId
 * Endpoint to add a widget to the user's list of favorites.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.params - The route parameters.
 * @param {number} req.params.userId - The ID of the user adding the favorite.
 * @param {Object} req.body - The request body containing the widget ID.
 * @param {number} req.body.widgetId - The ID of the widget to add to favorites.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response with the result of adding the widget to favorites.
 */
router.patch('/add-favorite/:userId', 
    // Optional validation middleware for stricter input validation
    // validationMiddleware(updateUserSchema),
    // validationMiddleware(favoriteWidgetSchema),
    async (req, res) => {
        const userId = parseInt(req.params.userId); // Extract and parse user ID from route parameters
        const widgetId = parseInt(req.body.widgetId); // Extract and parse widget ID from request body
        try {
            // Add the widget to the user's favorites
            const result = await favoriteWidget(userId, widgetId);
            res.status(201).json(result); // Send a success response with the result
        } catch (error) {
            // Handle errors and respond with an error message
            res.status(500).json({ message: error.message });
        }
    }
);

/**
 * PATCH /remove-favorite/:userId
 * Endpoint to remove a widget from the user's list of favorites.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.params - The route parameters.
 * @param {number} req.params.userId - The ID of the user removing the favorite.
 * @param {Object} req.body - The request body containing the widget ID.
 * @param {number} req.body.widgetId - The ID of the widget to remove from favorites.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response with the result of removing the widget from favorites.
 */
router.patch('/remove-favorite/:userId', 
    // Optional validation middleware for stricter input validation
    // validationMiddleware(updateUserSchema),
    // validationMiddleware(favoriteWidgetSchema),
    async (req, res) => {
        const userId = parseInt(req.params.userId); // Extract and parse user ID from route parameters
        const widgetId = parseInt(req.body.widgetId); // Extract and parse widget ID from request body
        try {
            // Remove the widget from the user's favorites
            const result = await unfavoriteWidget(userId, widgetId);
            res.status(201).json(result); // Send a success response with the result
        } catch (error) {
            // Handle errors and respond with an error message
            res.status(500).json({ message: error.message });
        }
    }
);

/**
 * GET /:userId
 * Endpoint to retrieve a user's list of favorite widgets.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.params - The route parameters.
 * @param {number} req.params.userId - The ID of the user whose favorites are being retrieved.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response with the user's list of favorite widgets.
 */
router.get('/:userId',
    async (req, res) => {
        const userId = parseInt(req.params.userId); // Extract and parse user ID from route parameters
        try {
            // Fetch the user's list of favorite widgets
            const result = await getFavorites(userId);
            res.status(200).json(result); // Send a success response with the list of favorites
        } catch (error) {
            // Handle errors and respond with an error message
            res.status(500).json({ message: error.message });
        }
    }
);

export default router; // Export the router for use in the application
