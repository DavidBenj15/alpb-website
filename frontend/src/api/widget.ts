/**
 * Frontend API utility functions for managing widgets and interacting with the backend.
 * Includes functions to register, fetch, approve, decline, and update widgets.
 */

import { jwtDecode } from "jwt-decode"; // For decoding JWT tokens
import { WidgetType } from "@/data/types"; // Importing WidgetType interface
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Interface for Widget Data used in registration.
 */
export interface WidgetData {
  user_id: string; // The ID of the user creating the widget
  widgetName: string; // The name of the widget
  description: string; // A description of the widget
  visibility: string; // Visibility status ('Public', 'Private', etc.)
}

/**
 * Registers a new widget by sending data to the backend API.
 *
 * @param {WidgetData} widgetData - The widget details to be registered.
 * @param {string} idToken - JWT token for authentication.
 * @returns {Promise<any>} - Response data from the API.
 * @throws {Error} - Throws an error if the API call fails or the response is not successful.
 */
export const registerWidget = async (
  widgetData: any,
  idToken: string,
): Promise<any> => {
  try {
    // Decode the token to extract user ID
    const decodedToken: any = jwtDecode(idToken);
    const userId = decodedToken.sub;

    // Attach user ID to the payload
    const dataToSend = {
      ...widgetData,
      userId,
    };

    const response = await fetch(`${API_URL}/api/register-widget`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to register widget");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error registering widget:", error.message || error);
    throw error;
  }
};

/**
 * Interface for a widget request.
 */
export interface Request {
  request_id: string; // The unique ID of the request
  widget_name: string; // The name of the widget
  description: string; // A description of the widget
  visibility: string; // Visibility status ('Public', 'Private', etc.)
  status: string; // The status of the request ('Pending', 'Approved', etc.)
  user_id: string; // The ID of the user who submitted the request
}

/**
 * Fetches all pending widgets from the backend API.
 *
 * @returns {Promise<Request[]>} - An array of pending widget requests.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const fetchPendingWidgets = async (): Promise<Request[]> => {
  try {
    const response = await fetch(`${API_URL}/api/pending-widgets`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching pending widgets:", error);
    throw error;
  }
};

/**
 * Approves a widget request by sending the request ID to the backend API.
 *
 * @param {string} requestId - The ID of the widget request to approve.
 * @returns {Promise<string>} - The API key or a success message.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const approveWidget = async (requestId: string): Promise<string> => {
  try {
    //TODO change this back to deployed server
    const response = await fetch(`${API_URL}/api/approve-widget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to approve widget");
    }

    const data = await response.json();
    return data.apiKey || `Widget ${requestId} approved.`;
  } catch (error) {
    console.error("Error approving widget:", error);
    throw error;
  }
};

/**
 * Declines a widget request by sending the request ID to the backend API.
 *
 * @param {string} requestId - The ID of the widget request to decline.
 * @returns {Promise<string>} - A success message.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const declineWidget = async (requestId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/decline-widget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to decline widget");
    }

    return `Widget ${requestId} declined.`;
  } catch (error) {
    console.error("Error declining widget:", error);
    throw error;
  }
};

/**
 * Fetches all widgets from the backend API.
 *
 * @returns {Promise<WidgetType[]>} - An array of all widgets.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const fetchWidgets = async (): Promise<WidgetType[]> => {
  try {
    const response = await fetch(`${API_URL}/api/fetch-widgets`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize the data for frontend consumption
    const cleanedData = data.map((w: any) => ({
      id: w.widget_id,
      name: w.widget_name || "Unnamed Widget",
      description: w.description || "",
      widgetId: w.widget_id || "",
      visibility: w.visibility || "Public",
      redirectUrl: w.redirect_link || "",
      imageUrl: w.image_url || undefined,
      developerIds: w.developer_ids || [],
    }));

    return cleanedData;
  } catch (error) {
    console.error("Error fetching widgets:", error);
    throw error;
  }
};

/**
 * Updates an existing widget by sending the updated details to the backend API.
 *
 * @param {WidgetType} widgetData - The updated widget details.
 * @returns {Promise<Response>} - The response from the API.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const updateWidget = async ({
  id,
  name,
  description,
  redirectLink,
  visibility,
  imageUrl,
}: WidgetType): Promise<Response> => {
  try {
    const response = await fetch(`${API_URL}/api/edit-widget/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        redirectLink,
        visibility,
        imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update widget");
    }

    return response;
  } catch (error) {
    console.error("Error updating widget:", error);
    throw error;
  }
};
