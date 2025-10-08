/**
 * Utility functions for managing a user's favorite widgets.
 * Handles adding, removing, and retrieving favorite widget IDs stored in a PostgreSQL database.
 */

import pkg from "aws-sdk"; // Import AWS SDK
const { CognitoIdentityServiceProvider } = pkg;
import crypto from "crypto";
import pool from "../db.js";
import dotenv from "dotenv";
import { createPendingDeveloper } from "./developerService.js";

dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;

const cognito = new CognitoIdentityServiceProvider({ region: "us-east-2" });

export async function favoriteWidget(userId, widgetId) {
  const checkQuery = `
        SELECT fav_widgets_ids
        FROM users
        WHERE user_id = $1
    `;

  const addQuery = `
        UPDATE users
        SET fav_widgets_ids = array_append(fav_widgets_ids, $1)
        WHERE user_id = $2
    `;

  try {
    // Check if the widget is already in the user's favorites
    const { rows } = await pool.query(checkQuery, [userId]);

    if (rows[0]?.fav_widgets_ids.includes(widgetId)) {
      return { rows, message: "Widget already exists in favorites" };
    }

    // Add the widget to the user's favorites
    const result = await pool.query(addQuery, [widgetId, userId]);
    return {
      result,
      message: `Successfully added widget ${widgetId} as a favorite for user ${userId}`,
    };
  } catch (error) {
    console.error("Error favoriting widget:", error);
    throw new Error("Failed to favorite widget");
  }
}

export async function unfavoriteWidget(userId, widgetId) {
  const removeQuery = `
        UPDATE users
        SET fav_widgets_ids = array_remove(fav_widgets_ids, $1)
        WHERE user_id = $2
    `;

  try {
    // Remove the widget from the user's favorites
    const result = await pool.query(removeQuery, [widgetId, userId]);
    return { result, message: "Widget unfavorited successfully" };
  } catch (error) {
    console.error("Error unfavoriting widget:", error);
    throw new Error("Failed to unfavorite widget");
  }
}

export async function getFavorites(userId) {
  const selectQuery = `
        SELECT fav_widgets_ids
        FROM users
        WHERE user_id = $1
    `;

  try {
    // Fetch the user's favorite widget IDs
    const result = await pool.query(selectQuery, [userId]);
    const data = result.rows[0]?.fav_widgets_ids || []; // Return an empty array if no favorites are found
    return data;
  } catch (error) {
    console.error("Error fetching favorite widget ids:", error);
    throw new Error("Failed to fetch favorite widget ids");
  }
}

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16); // Initialization vector

export function encryptToken(payload) {
  const cipher = crypto.createCipheriv(algorithm, TOKEN_SECRET, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export async function createUser(userData) {
  const {
    cognitoUserId,
    email,
    first,
    last,
    role,
    teamId = null,  // Default to null if not provided
    teamRole = null // Default to null if not provided
  } = userData;

  const query = `
    INSERT INTO users (
      cognito_user_id,
      email,
      first_name,
      last_name,
      role,
      team_id,
      team_role,
      is_admin,
      fav_widgets_ids,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *
  `;

  const values = [
    cognitoUserId,
    email,
    first,
    last,
    role,
    teamId,
    teamRole,
    false,  // is_admin defaults to false
    []      // empty fav_widgets_ids array
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function signUpUserWithCognito(userData) {
  let { email, password, firstName, lastName, role, teamId, teamRole } = userData;
  email = email.toLowerCase();
  
  const params = {
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "given_name", Value: firstName },
      { Name: "family_name", Value: lastName }
    ]
  };

  try {
    const cognitoResult = await cognito.signUp(params).promise();
    const cognitoUserId = cognitoResult.UserSub;

    // For widget developers, add to pending table instead of users table
    if (role === 'widget developer') {
      // Use existing createPendingDeveloper function
      await createPendingDeveloper({
        email,
        firstName,
        lastName,
        cognitoUserId
      });

      return {
        userId: null,
        cognitoUserId,
        user: null,
        isDeveloper: true
      };
    }

    // For all other users, create user in database immediately
    const newUser = await createUser({
      cognitoUserId,
      email,
      first: firstName,
      last: lastName,
      role,
      teamId,
      teamRole
    });

    return {
      userId: newUser.user_id,
      cognitoUserId,
      user: newUser,
      isDeveloper: false
    };
  } catch (error) {
    throw new Error(`Cognito signup failed: ${error.message}`);
  }
}

export async function updateUser({
  id,
  first,
  last
}) {
  const updates = [];
  const values = [];
  let index = 1;

  // Dynamically construct query based on which parameters are defined
  if (first !== undefined) {
    if (first.length <= 0 || first.length > 50) {
      throw new Error('First name must be between 0 and 50 characters');
    }
    updates.push(`first_name = $${index++}`);
    values.push(first);
  }
  if (last !== undefined) {
    if (last.length <= 0 || last.length > 50) {
      throw new Error('Last name must be between 0 and 50 characters');
    }
    updates.push(`last_name = $${index++}`);
    values.push(last);
  }

  values.push(id);

  const editQuery = `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE user_id = $${index}
        RETURNING *
    `;

  try {
    if (updates.length > 0) {
      await pool.query(editQuery, values);
      return;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

