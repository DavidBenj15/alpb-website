/**
 * Express router for user registration.
 * Handles the registration of a new user by creating a user in AWS Cognito and saving their information in a PostgreSQL database.
 */

import { Router } from 'express'; // Import the Express Router
import pkg from 'aws-sdk'; // AWS SDK for interacting with AWS services
import pool from '../db.js'; // PostgreSQL connection setup
import dotenv from 'dotenv'; // Environment variable management

const { CognitoIdentityServiceProvider } = pkg; // AWS Cognito service provider
dotenv.config(); // Load environment variables from a .env file

const router = Router(); // Create a new Express Router instance

// Configure AWS Cognito with the specified region
const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION, // AWS region, e.g., 'us-east-1'
});

/**
 * POST /
 * Endpoint for user registration.
 * Registers the user with AWS Cognito and saves their information in the PostgreSQL database.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing user registration details.
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.password - The user's password.
 * @param {string} req.body.firstName - The user's first name.
 * @param {string} req.body.lastName - The user's last name.
 * @param {string} req.body.role - The user's role.
 * @param {Object} res - The HTTP response object.
 */
router.post('/', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body; // Destructure user details from the request body

  // Define the parameters for AWS Cognito sign-up
  const params = {
    ClientId: process.env.COGNITO_APP_CLIENT_ID, // Cognito App Client ID
    Username: email, // The user's email serves as their Cognito username
    Password: password, // User's password
    UserAttributes: [ // User attributes to be stored in Cognito
      { Name: 'email', Value: email },
      { Name: 'given_name', Value: firstName },
      { Name: 'family_name', Value: lastName },
    ],
  };

  try {

    // Step 1: Register the user with AWS Cognito
    const cognitoResult = await cognito.signUp(params).promise();
    const cognitoUserId = cognitoResult.UserSub; // Get the Cognito User Sub ID

    // Step 2: Save the user's details in the PostgreSQL database
    const insertUserQuery = `
      INSERT INTO users (cognito_user_id, email, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id;
    `;
    const dbResult = await pool.query(insertUserQuery, [cognitoUserId, email, firstName, lastName, role]);

    // Step 3: Send a success response
    res.status(200).json({
      message: "User successfully registered and added to the database.",
      userId: dbResult.rows[0].user_id, // Database user ID
      cognitoUserId: cognitoUserId, // Cognito User Sub ID
    });
  } catch (error) {
    // Handle and log errors during the process
    console.error('Error registering user:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; // Export the router for use in the application

