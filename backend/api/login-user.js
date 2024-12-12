/**
 * Express router for user login and authentication.
 * Authenticates users with AWS Cognito, retrieves additional user information from a PostgreSQL database,
 * and returns both the Cognito tokens and custom user data.
 */

import { Router } from 'express'; // Import the Express Router
import pkg from 'aws-sdk'; // AWS SDK for interacting with AWS services
import pool from '../db.js'; // PostgreSQL connection setup
import dotenv from 'dotenv'; // Environment variable management

const { CognitoIdentityServiceProvider } = pkg; // AWS Cognito service provider
dotenv.config(); // Load environment variables from a .env file

const router = Router(); // Create a new Express Router instance

// Configure AWS SDK for Cognito
const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION, // AWS region, e.g., 'us-east-1'
});

/**
 * POST /
 * Endpoint for user login and authentication.
 * Authenticates the user with AWS Cognito, retrieves custom user data from the database,
 * and returns the authentication tokens along with additional user information.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing user login credentials.
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The HTTP response object.
 */
router.post('/', async (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request body

  // Cognito parameters for authentication
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH', // Specifies the authentication flow
    ClientId: process.env.COGNITO_APP_CLIENT_ID, // Cognito App Client ID
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    // Step 1: Authenticate user with Cognito
    const cognitoResult = await cognito.initiateAuth(params).promise();
    const { AccessToken, IdToken, RefreshToken } = cognitoResult.AuthenticationResult;

    // Step 2: Query your database for additional user information
    const userEmailQuery = 'SELECT * FROM users WHERE email = $1';
    const dbResult = await pool.query(userEmailQuery, [email]);

    if (dbResult.rows.length === 0) {
      // Handle case where user is not found in the database
      return res.status(404).json({ message: 'User not found in the database' });
    }

    const user = dbResult.rows[0]; // User data retrieved from the database

    // Step 3: Return the combined data (Cognito tokens + custom database info)
    res.status(200).json({
      authData: {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        cognitoUserId: user["cognito_user_id"],
      },
      user: {
        id: user.user_id,
        first: user.first_name,
        last: user.last_name,
        email: user.email,
        role: user.role,
        favWidgetsIds: user.fav_widgets_ids,
      }
    });

  } catch (error) {
    // Log and handle errors during authentication
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router; // Export the router for use in the application

