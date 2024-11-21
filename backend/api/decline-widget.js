/**
 * Express router for handling the removal of widget requests.
 * Processes the removal of a widget request from the database, 
 * typically used to decline a widget request.
 */

import { Router } from 'express'; // Import the Router object from Express
import { removeRequest } from '../services/widgetService.js'; // Import the removeRequest service function

const router = Router(); // Create a new Express Router instance

/**
 * POST /
 * Endpoint for declining a widget request.
 * Removes the request from the database and sends a confirmation response.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The body of the request containing the requestId.
 * @param {string} req.body.requestId - The unique ID of the request to be removed.
 * @param {Object} res - The HTTP response object.
 */
router.post('/', async (req, res) => {
    const { requestId } = req.body; // Extract requestId from the request body

    try {  
        // Attempt to remove the request from the database
        const removedRequest = await removeRequest(requestId);

        // Respond with success message and the removed request data
        res.status(200).json({ 
            message: 'Request declined and removed', 
            removedRequest 
        });
    } catch (error) {
        // Catch and handle any errors during the operation
        res.status(500).json({ message: error.message });
    }
});

export default router; // Export the router for use in other parts of the application
