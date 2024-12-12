import dotenv from "dotenv";

dotenv.config();

/**
 * Frontend API utility functions for user authentication and management.
 * Includes functions to sign up and log in users via the backend API.
 */
const DEBUG = false;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Signs up a new user by sending their details to the backend API.
 *
 * @param {Object} data - User details for registration.
 * @param {string} data.email - The user's email address.
 * @param {string} data.password - The user's password.
 * @param {string} data.firstName - The user's first name.
 * @param {string} data.lastName - The user's last name.
 * @param {string} data.role - The user's role (e.g., "admin", "editor").
 * @returns {Promise<Object>} - The response from the API if successful.
 * @throws {Error} - Throws an error if the API call fails or the response is not successful.
 */
export async function signUpUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  try {
    const startTime = performance.now();
    const response = await fetch(`${API_URL}/api/register-user`, {
      method: "POST", // HTTP POST request
      headers: {
        "Content-Type": "application/json", // Content type for JSON payload
      },
      body: JSON.stringify(data), // Convert user data to JSON format
    });
    const endTime = performance.now();
    const authTime = endTime - startTime;
    DEBUG && console.log(`Time to sign up: ${authTime}`);

    const result = await response.json(); // Parse the JSON response

    if (!response.ok) {
      // Handle unsuccessful responses
      throw new Error(result.message || "Failed to sign up");
    }

    return result; // Return the API response for successful signup
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error; // Rethrow the error for handling in the caller
  }
}

/**
 * Logs in a user by sending their credentials to the backend API.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - The user data and tokens if login is successful.
 * @throws {Error} - Throws an error if the API call fails or the response is not successful.
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const startTime = performance.now();
    const response = await fetch(`${API_URL}/api/login-user`, {
      method: "POST", // HTTP POST request
      headers: {
        "Content-Type": "application/json", // Content type for JSON payload
      },
      body: JSON.stringify({ email, password }), // Convert credentials to JSON format
    });
    const endTime = performance.now();
    const authTime = endTime - startTime;
    DEBUG && console.log(`Time to sign in: ${authTime}`);

    const data = await response.json(); // Parse the JSON response

    if (response.ok) {
      // Handle successful responses
      // Optionally, store tokens or user data in localStorage or a state manager
      return data; // Return the user data for frontend handling
    } else {
      // Handle unsuccessful responses
      throw new Error(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
    throw error; // Rethrow the error for handling in the caller
  }
};
