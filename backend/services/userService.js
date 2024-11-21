/**
 * Utility functions for managing a user's favorite widgets.
 * Handles adding, removing, and retrieving favorite widget IDs stored in a PostgreSQL database.
 */

import pkg from 'aws-sdk'; // Import AWS SDK
const { APIGateway } = pkg; // Extract the API Gateway class
const apiGateway = new APIGateway({ region: 'us-east-2' }); // Initialize API Gateway (not directly used in this code)

import pool from '../db.js'; // PostgreSQL database connection

/**
 * Adds a widget to a user's list of favorite widgets.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} widgetId - The ID of the widget to add to favorites.
 * @returns {Object} - An object containing the query result and a success or duplicate message.
 * @throws {Error} - If the database operation fails.
 */
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
            return { rows, message: 'Widget already exists in favorites' };
        }

        // Add the widget to the user's favorites
        const result = await pool.query(addQuery, [widgetId, userId]);
        return { result, message: `Successfully added widget ${widgetId} as a favorite for user ${userId}` };
    } catch (error) {
        console.error('Error favoriting widget:', error);
        throw new Error('Failed to favorite widget');
    }
}

/**
 * Removes a widget from a user's list of favorite widgets.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} widgetId - The ID of the widget to remove from favorites.
 * @returns {Object} - An object containing the query result and a success message.
 * @throws {Error} - If the database operation fails.
 */
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
        console.error('Error unfavoriting widget:', error);
        throw new Error('Failed to unfavorite widget');
    }
}

/**
 * Retrieves a user's list of favorite widget IDs.
 *
 * @param {number} userId - The ID of the user.
 * @returns {Object} - An object containing the user's favorite widget IDs and a success message.
 * @throws {Error} - If the database operation fails.
 */
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
        return { data, message: "Favorite widget ids fetched successfully" };
    } catch (error) {
        console.error('Error fetching favorite widget ids:', error);
        throw new Error('Failed to fetch favorite widget ids');
    }
}
