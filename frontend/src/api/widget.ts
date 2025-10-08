/**
 * Frontend API utility functions for managing widgets and interacting with the backend.
 * Includes functions to register, fetch, approve, decline, and update widgets.
 */

import { jwtDecode } from "jwt-decode";
import {
  PendingWidget,
  PendingWidgetsAPIRes,
  RegisterWidgetDataType,
  WidgetType,
  CategoryType,
} from "@/data/types";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerWidget = async (
  widgetData: RegisterWidgetDataType,
  userId: number,
): Promise<any> => {
  try {
    // Attach user ID to the payload
    const dataToSend = {
      ...widgetData,
      userId,
    };

    const response = await fetch(`${API_URL}/api/widgets/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    const res = await response.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return await res.data;
  } catch (error: any) {
    console.error("Error registering widget:", error.message || error);
    throw error;
  }
};

export const fetchPendingWidgets = async (): Promise<PendingWidget[]> => {
  try {
    const response = await fetch(`${API_URL}/api/widgets/pending`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const res: PendingWidgetsAPIRes = await response.json();
    if (!res.success || !res.data) {
      throw new Error(res.message);
    }
    return res.data;
  } catch (error) {
    console.error("Error fetching pending widgets:", error);
    throw error;
  }
};

export const approveWidget = async (requestId: string): Promise<string> => {
  try {
    const response = await fetch(
      `${API_URL}/api/widgets/pending/${requestId}/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );

    const res = await response.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return res.data.apiKey;
  } catch (error) {
    console.error("Error approving widget:", error);
    throw error;
  }
};

export const declineWidget = async (requestId: string): Promise<string> => {
  try {
    const response = await fetch(
      `${API_URL}/api/widgets/pending/${requestId}/decline`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );

    const res = await response.json();

    if (!res.success) {
      throw new Error(res.message);
    }

    return `Widget ${requestId} declined.`;
  } catch (error) {
    console.error("Error declining widget:", error);
    throw error;
  }
};

export const fetchWidgets = async (userId?: string): Promise<WidgetType[]> => {
  try {
    const url = userId 
      ? `${API_URL}/api/widgets?userId=${userId}` 
      : `${API_URL}/api/widgets`;
      
    const response = await fetch(url);
    const res = await response.json();
    if (!res.success) {
      throw new Error(res.message);
    }

    const data = res.data;

    // Normalize the data for frontend consumption
    const cleanedData = data.map((w: any) => ({
      id: w.widget_id,
      name: w.widget_name || "Unnamed Widget",
      description: w.description || "",
      widgetId: w.widget_id || "",
      visibility: w.visibility || "Public",
      redirectLink: w.redirect_link || "",
      imageUrl: w.image_url || undefined,
      developerIds: w.developer_ids || [],
      publicId: w.public_id,
      restrictedAccess: w.restricted_access,
      categories: (w.categories || []).map(
        (category: {
          id: number;
          name: string;
          hex_code: string | undefined;
        }) => ({
          id: category.id,
          name: category.name,
          hexCode: category.hex_code,
        }),
      ),
      metrics: w.metrics,
    }));
    return cleanedData;
  } catch (error) {
    console.error("Error fetching widgets:", error);
    throw error;
  }
};

export const updateWidget = async ({
  id,
  name,
  description,
  redirectLink,
  visibility,
  imageUrl,
  publicId,
  restrictedAccess,
  categories,
}: WidgetType): Promise<Response> => {
  try {
    const response = await fetch(`${API_URL}/api/widgets/${id}`, {
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
        publicId,
        restrictedAccess,
      }),
    });

    const res = await response.json();
    if (!res.success) {
      throw new Error(res.message);
    }

    return res.data;
  } catch (error) {
    console.error("Error updating widget:", error);
    throw error;
  }
};

export const addCategoryToWidget = async (
  widgetId: number,
  categoryId: number,
): Promise<Response> => {
  try {
    const response = await fetch(
      `${API_URL}/api/widgets/${widgetId}/categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId,
        }),
      },
    );

    const res = await response.json();
    if (!res.success) {
      throw new Error(res.message);
    }

    return res.data;
  } catch (error) {
    console.error("Error adding category to widget:", error);
    throw error;
  }
};

export const removeCategoryFromWidget = async (
  widgetId: number,
  categoryId: number,
): Promise<Response> => {
  try {

    const response = await fetch(
      `${API_URL}/api/widgets/${widgetId}/categories/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const res = await response.json();
    if (!res.success) {
      throw new Error(res.message);
    }

    return res.data;
  } catch (error) {
    console.error("Error removing category from widget:", error);
    throw error;
  }
};

export const recordWidgetInteraction = async (
  widgetId: number,
  userId: number,
  metricType: string,
): Promise<Response> => {
  try {
    const response = await fetch(`${API_URL}/api/widgets/metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        widgetId,
        userId,
        metricType,
      }),
    });

    const res = await response.json();
    if (!res.success) {
      throw new Error(res.message);
    }

    return res.data;
  } catch (error) {
    console.error("Error recording widget interaction:", error);
    throw error;
  }
};

export const getWidgetCollaborators = async (
  widgetId: number,
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_URL}/api/widgets/${widgetId}/developers`,
    );

    const res = await response.json();
    if (!res.success) {
      throw new Error(res.message);
    }
    return res.data;
  } catch (error) {
    console.error("Error creating widget:", error);
    throw error;
  }
};

export async function addWidgetCollaborator(widgetId: number, email: string) {
  const response = await fetch(
    `${API_URL}/api/widgets/${widgetId}/collaborators`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
  );

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}

export async function deleteWidget(widgetId: number) {
  try {
    const response = await fetch(`${API_URL}/api/widgets/${widgetId}`, {
      method: "DELETE",
    });

    const res = await response.json();
    if (!res.success) {
      throw new Error(res.message);
    }
  } catch (error) {
    console.error("Error deleting widget:", error);
    throw error;
  }
}

export async function getWidgetTeamAccess(widgetId: number): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/widgets/${widgetId}/teams`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

  
    // Return the raw team_id values without modification
    return data.data.map((team: { team_id: any }) => team.team_id);
  } catch (error) {
    console.error("Error fetching widget team access:", error);
    return [];
  }
}

export async function updateWidgetTeamAccess(widgetId: number, teamIds: string[]): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/widgets/${widgetId}/teams`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamIds }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error updating widget team access:", error);
    throw error;
  }
}
