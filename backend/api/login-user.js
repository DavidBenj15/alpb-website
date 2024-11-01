const express = require('express');
const AWS = require('aws-sdk');
const pool = require('../db');  // PostgreSQL connection setup
require('dotenv').config();

const router = express.Router();

// Configure AWS SDK for Cognito
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION,  // Replace with your region, e.g., 'us-east-1'
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // Cognito parameters for authentication
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
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
    const query = 'SELECT * FROM users WHERE email = $1';
    const dbResult = await pool.query(query, [email]);

    if (dbResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found in the database' });
    }

    const user = dbResult.rows[0];  // User data from the database
    // Step 3: Return the combined data (Cognito tokens + custom database info)
    res.status(200).json({
      accessToken: AccessToken,
      idToken: IdToken,
      refreshToken: RefreshToken,
      role: user.role,  // Example: custom user role from the database
      user: user,  // Additional user data
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
