import pool from "../db.js";
import { createUser } from "./userService.js";
import { generateApiKeyForUser } from "./widgetService.js";
import { sendApiKeyEmail } from "./emailService.js";
import cognito from "../cognito.js";

export async function disableCognitoAccount(email) {
  try {
    // Disable developer account
    await cognito.adminDisableUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email.toLowerCase()
    }).promise();
  } catch (error) {
    throw new Error(`Failed to disable Cognito account: ${error.message}`);
  }
}

export async function createPendingDeveloper({email, firstName, lastName, cognitoUserId}) {
  try {
    // Add to pending developers table (no passwords stored)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const pendingResult = await client.query(`
        INSERT INTO pending_developers
        (email, first_name, last_name, cognito_user_id, email_confirmed, status, created_at)
        VALUES ($1, $2, $3, $4, false, 'pending', CURRENT_TIMESTAMP)
        RETURNING request_id
      `, [email.toLowerCase(), firstName, lastName, cognitoUserId]);

      await client.query('COMMIT');
      return pendingResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw new Error(`Email confirmation failed: ${error.message}`);
  }
}

export async function approveDeveloper(requestId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get pending developer details
    const developerResult = await client.query(`
      SELECT * FROM pending_developers WHERE request_id = $1
    `, [requestId]);

    if (developerResult.rowCount === 0) {
      throw new Error('Pending developer not found');
    }

    const developer = developerResult.rows[0];

    // Enable the Cognito account
    await cognito.adminEnableUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: developer.email
    }).promise();

    // Create user in our database
    const newUser = await createUser({
      cognitoUserId: developer.cognito_user_id,
      email: developer.email,
      first: developer.first_name,
      last: developer.last_name,
      role: 'widget developer'
    });

    // Generate API key
    const apiKey = await generateApiKeyForUser(newUser.user_id, developer.email);

    // Send API key email
    await sendApiKeyEmail(developer.email, apiKey);

    // Remove from pending_developers
    await client.query(`
      DELETE FROM pending_developers WHERE request_id = $1
    `, [requestId]);

    await client.query('COMMIT');
    return { apiKey, userId: newUser.user_id };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function declineDeveloper(requestId, email) {
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM pending_developers WHERE request_id = $1`,
      [requestId]);
    await client.query('COMMIT');
    // Delete the Cognito account
    await cognito.adminDeleteUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email
    }).promise();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getPendingDevelopers() {
  const result = await pool.query(`
    SELECT request_id, email, first_name, last_name, cognito_user_id, email_confirmed, status, created_at
    FROM pending_developers
    WHERE status = 'pending' AND email_confirmed = true
    ORDER BY created_at DESC
  `);
  return result.rows;
}