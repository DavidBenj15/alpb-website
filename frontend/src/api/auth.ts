import { LoginAPIRes } from "@/data/types";
import dotenv from "dotenv";

dotenv.config();

/**
 * Frontend API utility functions for user authentication and management.
 * Includes functions to sign up and log in users via the backend API.
 */
const DEBUG = false;
// Use empty string for relative paths when in development
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL 
  : '';

/**
 * Signs up a new user by sending their details to the backend API.
 *
 * @param {Object} data - User details for registration.
 * @param {string} data.email - The user's email address.
 * @param {string} data.password - The user's password.
 * @param {string} data.firstName - The user's first name.
 * @param {string} data.lastName - The user's last name.
 * @param {string} data.role - The user's role (e.g., "admin", "editor").
 * @param {string} data.teamId - The user's team ID.
 * @param {string} data.teamRole - The user's team role.
 * @param {string} data.inviteToken - The user's invite token.
 * @returns {Promise<Object>} - The response from the API if successful.
 * @throws {Error} - Throws an error if the API call fails or the response is not successful.
 */
export async function signUpUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  teamId?: string;
  teamRole?: string;
  inviteToken?: string;
}) {
  try {
    const startTime = performance.now();
    const response = await fetch(`${API_URL}/api/users/sign-up`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const endTime = performance.now();
    const authTime = endTime - startTime;
    DEBUG && console.log(`Time to sign up: ${authTime}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to sign up");
    }

    return result;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
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
    const response = await fetch(`${API_URL}/api/users/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const endTime = performance.now();
    const authTime = endTime - startTime;
    DEBUG && console.log(`Time to sign in: ${authTime}`);

    const res: LoginAPIRes = await response.json();

    if (!res.success) {
      throw new Error(res.message || "Login failed");
    }

    return res.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error; // Rethrow the error for handling in the caller
  }
};

export const logoutUser = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/users/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const res = await response.json();
    return res.success;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const validateSession = async () => {
  try {
    const response = await fetch(`${API_URL}/api/users/validate-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const res = await response.json();
    return res.success;
  } catch {
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  try {
    const response = await fetch(
      `${API_URL}/api/users/send-password-reset-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      },
    );
    const res = await response.json();
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const resetPassword = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/api/users/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const res = await response.json();
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
