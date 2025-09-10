import pkg from "aws-sdk";
const { APIGateway } = pkg;
const apiGateway = new APIGateway({ region: "us-east-2" });
import pool from "../db.js";
import { logWithFunctionName } from "../utils/logging.js";

const selectWidgetById = `
    SELECT *
    FROM WIDGETS
    WHERE widget_id = $1
`;

const DEBUG = true;

// Function to register a widget
export async function registerWidget(
  userId,
  widgetName,
  description,
  visibility,
  widgetProps,
) {
  const query = `
        INSERT INTO requests (user_id, widget_name, description, visibility, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
  try {
    // Add a pending widget to the 'requests' table
    const status = "pending";
    const result = await pool.query(query, [
      userId,
      widgetName,
      description,
      visibility,
      status,
    ]);
    const requestedWidget = result.rows[0];

    return requestedWidget;
  } catch (error) {
    console.error("Error registering widget:", error);
    throw new Error("Failed to register widget");
  }
}

export async function updateWidget({
  id,
  name,
  description,
  redirectLink,
  visibility,
  imageUrl,
  publicId,
  restrictedAccess
}) {
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    const updates = [];
    const values = [];
    let index = 1;

    // Dynamically construct query based on which parameters are defined
    if (name !== undefined) {
      updates.push(`widget_name = $${index++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${index++}`);
      values.push(description);
    }
    if (redirectLink !== undefined) {
      updates.push(`redirect_link = $${index++}`);
      values.push(redirectLink);
    }
    
    // Get current visibility
    let currentVisibility = null;
    if (visibility !== undefined) {
      const currentWidget = await pool.query(selectWidgetById, [id]);
      if (currentWidget.rows.length > 0) {
        currentVisibility = currentWidget.rows[0].visibility;
      }
      
      updates.push(`visibility = $${index++}`);
      values.push(visibility);
    }
    
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${index++}`);
      values.push(imageUrl);
    }
    if (publicId !== undefined) {
      updates.push(`public_id = $${index++}`);
      values.push(publicId);
    }
    if (restrictedAccess !== undefined) {
      updates.push(`restricted_access = $${index++}`);
      values.push(restrictedAccess);
    }

    values.push(id);

    let updatedWidget;
    if (updates.length === 0) {
      // There are no fields to update
      const res = await pool.query(selectWidgetById, [id]);
      updatedWidget = res.rows[0];
    } else {
      const editQuery = `
        UPDATE widgets
        SET ${updates.join(", ")}
        WHERE widget_id = $${index}
        RETURNING *
      `;
      
      const res = await pool.query(editQuery, values);
      updatedWidget = res.rows[0];
      
      // If visibility changed from private to public, remove team access
      if (currentVisibility && 
          currentVisibility.toLowerCase() === 'private' && 
          visibility && 
          visibility.toLowerCase() === 'public') {
        await pool.query(
          `DELETE FROM widget_team_access WHERE widget_id = $1`,
          [id]
        );
      }
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    return updatedWidget;
  } catch (error) {
    // Rollback if error occurs
    await pool.query('ROLLBACK');
    console.error("Error updating widget:", error);
    throw new Error("Failed to update widget");
  }
}

export async function removeRequest(requestId) {
  const query = `DELETE FROM requests WHERE request_id = $1 RETURNING *;`;

  try {
    const result = await pool.query(query, [requestId]);
    if (result.rowCount === 0) {
      throw new Error("Pending widget not found");
    }
    return result.rows[0]; // Return the deleted request data if necessary
  } catch (error) {
    console.error("Error deleting request:", error);
    throw error;
  }
}

export async function createUserWidgetRelation(
  user_id,
  widgetId,
  role = "owner",
) {
  try {
    const query = `
            INSERT INTO user_widget (user_id, widget_id, role, joined_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `;
    const result = await pool.query(query, [user_id, widgetId, role]);
    return result.rows[0]; // Return the newly created relation
  } catch (error) {
    console.error("Error creating user-widget relation:", error.message);
    throw error;
  }
}

export async function generateApiKeyForUser(user_id, email) {
  const params = {
    name: `ApiKey-${user_id}`,
    description: `API key for ${email}`,
    enabled: true,
    generateDistinctId: true,
    stageKeys: [], // You can specify stages if needed
  };


  DEBUG && logWithFunctionName(params);

  try {
    const apiKey = await apiGateway.createApiKey(params).promise();
    DEBUG && logWithFunctionName(apiKey);
    if (!apiKey.id) {
      throw new Error("Failed to generate API key: no ID returned");
    }
    await associateApiKeyWithUsagePlan(apiKey.id, process.env.USAGE_PLAN_ID);
    await saveApiKeyToDatabase(user_id, apiKey.id);
    return apiKey.value;
  } catch (err) {
    DEBUG && logWithFunctionName(err);
    throw new Error("Failed to generate API key");
  }
}

export async function associateApiKeyWithUsagePlan(apiKeyId, usagePlanId) {
  const params = {
    keyId: apiKeyId,
    keyType: "API_KEY",
    usagePlanId: usagePlanId,
  };
  DEBUG && logWithFunctionName(params);
  try {
    await apiGateway.createUsagePlanKey(params).promise();
  } catch (err) {
    console.error("Error associating API Key with Usage Plan:", err);
  }
}

export async function saveApiKeyToDatabase(user_id, apiKey) {
  const query = `
        UPDATE users
        SET api_key = $1
        WHERE user_id = $2;
    `;
  await pool.query(query, [apiKey, user_id]);
}

export async function getRequestData(request_id) {
  try {
    const query = `
            SELECT * FROM requests WHERE request_id = $1
        `;
    const result = await pool.query(query, [request_id]);

    if (result.rows.length === 0) {
      throw new Error("Pending widget not found");
    }

    return result.rows[0]; // Return the request data
  } catch (error) {
    console.error("Error fetching request data:", error.message);
    throw error;
  }
}

export async function getUserData(userId) {
  try {
    const query = `
            SELECT * FROM users WHERE user_id = $1
        `;
    const result = await pool.query(query, [userId]);

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }

    return result.rows[0]; // Return the user data
  } catch (error) {
    console.error("Error fetching request data:", error.message);
    throw error;
  }
}

export async function createApprovedWidget({
  widget_name,
  description,
  visibility,
  selectedTeams = [],
}) {
  try {
    
    const query = `
            INSERT INTO widgets (widget_name, description, visibility, status, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING widget_id;
        `;
  
    const result = await pool.query(query, [
      widget_name,
      description,
      visibility,
      "approved",
    ]);

    const widgetId = result.rows[0].widget_id;
    
    // If it's a private widget, handle team access
    if (visibility === "private" && selectedTeams && selectedTeams.length > 0) {
      // Create team access records
      for (const teamId of selectedTeams) {
        await addTeamWidgetAccess(widgetId, teamId);
      }
    }

    return widgetId;
  } catch (error) {
    console.error("Error creating approved widget:", error);
    throw new Error("Failed to create approved widget");
  }
}

// Function to add team access to a widget
export async function addTeamWidgetAccess(widgetId, teamId) {
  try {
    // Convert widgetId to integer, but keep teamId as UUID
    const widgetIdInt = parseInt(widgetId, 10);
    
    if (isNaN(widgetIdInt)) {
      throw new Error(`Invalid widget ID (${widgetId})`);
    }
      
    const query = `
      INSERT INTO widget_team_access (widget_id, team_id)
      VALUES ($1, $2)
      ON CONFLICT (widget_id, team_id) DO NOTHING
      RETURNING *;
    `;
    
    const result = await pool.query(query, [widgetIdInt, teamId]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error adding team ${teamId} access to widget ${widgetId}:`, error);
    throw new Error("Failed to add team access to widget");
  }
}

// Function to remove team access from a widget
export async function removeTeamWidgetAccess(widgetId, teamId) {
  try {
    const query = `
      DELETE FROM widget_team_access
      WHERE widget_id = $1 AND team_id = $2
      RETURNING *;
    `;
    
    const result = await pool.query(query, [widgetId, teamId]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error removing team ${teamId} access from widget ${widgetId}:`, error);
    throw new Error("Failed to remove team access from widget");
  }
}

// Function to get all teams with access to a widget
export async function getTeamsWithWidgetAccess(widgetId) {
  try {
    const query = `
      SELECT t.* 
      FROM team t
      JOIN widget_team_access wta ON t.team_id = wta.team_id
      WHERE wta.widget_id = $1;
    `;
    
    const result = await pool.query(query, [widgetId]);
    return result.rows;
  } catch (error) {
    console.error(`Error getting teams with access to widget ${widgetId}:`, error);
    throw new Error("Failed to get teams with widget access");
  }
}

export async function getAllWidgets(widget_name, categories, page, limit, userId) {
  try {
    // Get user's team id if available
    let userTeamId = null;
    if (userId) {
      try {
        // Convert userId to integer in case it's a string
        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
          throw new Error("Invalid userId format");
        }
        
        const userResult = await pool.query(
          "SELECT team_id FROM users WHERE user_id = $1",
          [userIdInt]
        );
        
        if (userResult.rows.length > 0 && userResult.rows[0].team_id) {
          userTeamId = userResult.rows[0].team_id;
        }
      } catch (error) {
        console.error("Error getting user's team:", error);
        // Continue with userTeamId as null
      }
    }

    // Enhanced debug log

    // Debug query to check visibility values in the widgets table
    const checkVisibilityQuery = `SELECT widget_id, widget_name, visibility FROM widgets`;
    const visibilityResult = await pool.query(checkVisibilityQuery);
    // Get user's role
    let userRole = null;
    if (userId) {
      try {
        const userRoleResult = await pool.query(
          "SELECT role FROM users WHERE user_id = $1",
          [parseInt(userId, 10)]
        );
        
        if (userRoleResult.rows.length > 0) {
          userRole = userRoleResult.rows[0].role;
        }
      } catch (error) {
        console.error("Error getting user's role:", error);
      }
    }
    
    let publicWidgetsQuery = `
      SELECT
          w.*,
          ARRAY_AGG(DISTINCT uw.user_id) AS developer_ids,
          COALESCE(
              JSON_AGG(
                  DISTINCT JSONB_BUILD_OBJECT('id', c.id, 'name', c.name, 'hex_code', c.hex_code)
              ) FILTER (WHERE c.name IS NOT NULL),
              '[]'
          ) AS categories,
      FROM
          widgets w
      LEFT JOIN
          user_widget uw ON w.widget_id = uw.widget_id
      LEFT JOIN 
          widget_categories AS wc ON w.widget_id = wc.widget_id
      LEFT JOIN
          categories AS c ON wc.category_id = c.id
      WHERE 
          (LOWER(w.visibility) = 'public' OR w.visibility IS NULL)`;
    
    // If userId is provided, include widgets they are developers for
    if (userId) {
      publicWidgetsQuery += ` OR EXISTS (
        SELECT 1 FROM user_widget uw2 
        WHERE uw2.widget_id = w.widget_id 
        AND uw2.user_id = $1)`;
    }
      
    publicWidgetsQuery += `
      GROUP BY 
          w.widget_id, w.widget_name, w.description, w.visibility, w.status, w.created_at, 
          w.redirect_link, w.image_url, w.public_id, w.restricted_access
    `;

    // If user has a team, get private widgets accessible to that team
    let privateWidgetsPromise = Promise.resolve([]);
    if (userTeamId && userRole !== 'widget developer') {  // Widget developers get their widgets via the public query
      const privateWidgetsQuery = `
        SELECT
            w.*,
            ARRAY_AGG(DISTINCT uw.user_id) AS developer_ids,
            COALESCE(
                JSON_AGG(
                    DISTINCT JSONB_BUILD_OBJECT('id', c.id, 'name', c.name, 'hex_code', c.hex_code)
                ) FILTER (WHERE c.name IS NOT NULL),
                '[]'
            ) AS categories,
        FROM
            widgets w
        JOIN
            widget_team_access wta ON w.widget_id = wta.widget_id 
        LEFT JOIN
            user_widget uw ON w.widget_id = uw.widget_id
        LEFT JOIN 
            widget_categories AS wc ON w.widget_id = wc.widget_id
        LEFT JOIN
            categories AS c ON wc.category_id = c.id
        WHERE 
            LOWER(w.visibility) = 'private' AND wta.team_id = $1
        GROUP BY 
            w.widget_id, w.widget_name, w.description, w.visibility, w.status, w.created_at, 
            w.redirect_link, w.image_url, w.public_id, w.restricted_access
      `;
      
      privateWidgetsPromise = pool.query(privateWidgetsQuery, [userTeamId])
        .then(result => result.rows);
    }

    // Execute queries in parallel
    const [publicWidgets, privateWidgets] = await Promise.all([
      pool.query(publicWidgetsQuery, userId ? [parseInt(userId, 10)] : []).then(result => result.rows),
      privateWidgetsPromise
    ]);

    // Combine results
    const allWidgets = [...publicWidgets, ...privateWidgets];
    
    return allWidgets;
  } catch (error) {
    console.error("Error fetching widgets:", error);
    throw new Error(`Failed to fetch widgets: ${error.message}`);
  }
}

// Helper function to check if a team has access to a widget
// This is a stub that will be replaced with actual DB call later
async function checkTeamWidgetAccess(widgetId, teamId) {
  try {
    const query = `
      SELECT 1 FROM widget_team_access 
      WHERE widget_id = $1 AND team_id = $2
      LIMIT 1
    `;
    
    const result = await pool.query(query, [widgetId, teamId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking team access for widget ${widgetId}:`, error);
    return false;
  }
}

export async function deleteWidget(id) {
  const widgetsQuery = `DELETE FROM widgets WHERE widget_id = $1 RETURNING *`;
  const result = await pool.query(widgetsQuery, [id]);
  const deletedWidget = result.rows[0];

  return deletedWidget;
}