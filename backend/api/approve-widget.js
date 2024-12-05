/**
 * Express router for handling widget approval and API key generation.
 * Processes widget approval requests, generates API keys for users,
 * creates user-widget relations, and sends the API key via email.
 */

import express from 'express'; // Import the Express framework
import { 
    getRequestData, 
    createApprovedWidget, 
    getUserData, 
    generateApiKeyForUser, 
    createUserWidgetRelation 
} from '../services/widgetService.js'; // Import services related to widgets and users
import sendApiKeyEmail from '../services/emailService.js'; // Import the email service for sending API keys
import { logWithFunctionName } from '../utils/logging.js';

const DEBUG = true;

const router = express.Router(); // Create a new Express router instance

/**
 * POST /
 * Handles widget approval requests.
 * Extracts the requestId from the request body, processes the widget approval,
 * generates an API key for the user, creates a user-widget relation,
 * and sends the API key via email to the user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post('/', async (req, res) => {
    const { requestId } = req.body; // Extract requestId from the request body
    DEBUG && logWithFunctionName({requestId});
    try { 
        // Retrieve the request data based on requestId
        const requestData = await getRequestData(requestId);
        DEBUG && logWithFunctionName({requestData});
        // Extract the user's Cognito ID from the request data
        const userCognitoID = requestData['user_id'];

        // Create an approved widget based on the request data
        const approvedWidgetID = await createApprovedWidget(requestData);
        const widgetID = approvedWidgetID['widget_id']; // Extract the widget ID

        // Retrieve user data using the user's Cognito ID
        const userData = await getUserData(userCognitoID);
        const userID = userData['user_id']; // Extract the user ID
        const userEmail = userData['email']; // Extract the user's email
        DEBUG && logWithFunctionName({userID, userEmail});
        // Generate an API key for the user
        const apiKey = await generateApiKeyForUser(userID, userEmail);
        DEBUG && logWithFunctionName({apiKey});
        // Create a relation between the user and the widget
        const userWidgetRelation = await createUserWidgetRelation(userID, widgetID, apiKey);
        DEBUG && logWithFunctionName(userWidgetRelation);
        // Send the API key to the user via email
        await sendApiKeyEmail(userEmail, apiKey);

        // Send a success response with a message and the user-widget relation data
        res.status(200).json({ 
            message: 'Widget approved, user-widget relation created, and API key sent via email', 
            userWidgetRelation 
        });
    } catch (error) {
        // Handle errors and send an error response
        res.status(500).json({ message: error.message });
    }
});

export default router; // Export the router to be used in other parts of the application

