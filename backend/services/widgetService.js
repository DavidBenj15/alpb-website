import pkg from "aws-sdk";
const { APIGateway } = pkg;
const apiGateway = new APIGateway({
  region: "us-east-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
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

export async function getAllWidgets(widget_name, categories, page = 1, limit = 50, userId) {
  try {
    // simple pagination and param sanitization
    const pageInt = Math.max(1, parseInt(page || 1, 10));
    const limitInt = Math.min(100, Math.max(1, parseInt(limit || 50, 10)));
    const offset = (pageInt - 1) * limitInt;

    // Determine user's team & role (reuse existing logic if available)
    let userTeamId = null;
    let userRole = null;
    if (userId) {
      try {
        const userResult = await pool.query("SELECT team_id, role FROM users WHERE user_id = $1", [parseInt(userId, 10)]);
        if (userResult.rows.length > 0) {
          userTeamId = userResult.rows[0].team_id || null;
          userRole = userResult.rows[0].role || null;
        }
      } catch (err) {
        console.error("Error fetching user team/role:", err);
      }
    }

    // Build base (lightweight) query: select widget rows only
    const baseParams = [];
    const baseConditions = ["(LOWER(w.visibility) = 'public' OR w.visibility IS NULL)"];
    if (userId) {
      baseParams.push(parseInt(userId, 10));
      baseConditions.push(`EXISTS (SELECT 1 FROM user_widget uw2 WHERE uw2.widget_id = w.widget_id AND uw2.user_id = $${baseParams.length})`);
    }
    if (userTeamId && userRole !== 'widget developer') {
      baseParams.push(userTeamId);
      baseConditions.push(`EXISTS (SELECT 1 FROM widget_team_access wta WHERE wta.widget_id = w.widget_id AND wta.team_id = $${baseParams.length})`);
    }

    // Optional: filter by widget_name (simple ILIKE)
    if (widget_name) {
      baseParams.push(`%${widget_name.toLowerCase()}%`);
      baseConditions.push(`LOWER(w.widget_name) ILIKE $${baseParams.length}`);
    }

    const baseQuery = `
      SELECT
        w.widget_id,
        w.widget_name,
        w.description,
        w.visibility,
        w.status,
        w.created_at,
        w.redirect_link,
        w.image_url,
        w.public_id,
        w.restricted_access
      FROM widgets w
      WHERE ${baseConditions.join(" OR ")}
      ORDER BY w.widget_id
      LIMIT $${baseParams.length + 1}
      OFFSET $${baseParams.length + 2}
    `;
    baseParams.push(limitInt, offset);

    const baseRes = await pool.query(baseQuery, baseParams);
    const baseRows = baseRes.rows;
    if (baseRows.length === 0) return [];

    const widgetIds = baseRows.map((r) => r.widget_id);

    // Fetch categories for these widgets
    const categoriesRes = await pool.query(
      `SELECT wc.widget_id, c.id, c.name, c.hex_code
       FROM widget_categories wc
       JOIN categories c ON c.id = wc.category_id
       WHERE wc.widget_id = ANY($1::int[])`,
      [widgetIds]
    );

    // Fetch developer relations
    const devsRes = await pool.query(
      `SELECT widget_id, user_id FROM user_widget WHERE widget_id = ANY($1::int[])`,
      [widgetIds]
    );

    // Fetch metrics for these widgets (all timeframes stored)
    const metricsRes = await pool.query(
      `SELECT widget_id, timeframe_type, total_launches, unique_launches
       FROM widget_metrics
       WHERE widget_id = ANY($1::int[])`,
      [widgetIds]
    );

    // Aggregate into maps for quick lookup
    const categoriesMap = new Map();
    for (const row of categoriesRes.rows) {
      const list = categoriesMap.get(row.widget_id) || [];
      list.push({ id: row.id, name: row.name, hex_code: row.hex_code });
      categoriesMap.set(row.widget_id, list);
    }

    const devsMap = new Map();
    for (const row of devsRes.rows) {
      const list = devsMap.get(row.widget_id) || [];
      list.push(row.user_id);
      devsMap.set(row.widget_id, list);
    }

    // Compute metrics structure expected by frontend
    const metricsMap = new Map();
    for (const row of metricsRes.rows) {
      const wId = row.widget_id;
      const m = metricsMap.get(wId) || {
        weeklyLaunches: 0, monthlyLaunches: 0, yearlyLaunches: 0, allTimeLaunches: 0,
        weeklyUniqueLaunches: 0, monthlyUniqueLaunches: 0, yearlyUniqueLaunches: 0, allTimeUniqueLaunches: 0
      };
      const t = row.timeframe_type;
      if (t === 'weekly') {
        m.weeklyLaunches = Math.max(m.weeklyLaunches, row.total_launches || 0);
        m.weeklyUniqueLaunches = Math.max(m.weeklyUniqueLaunches, row.unique_launches || 0);
      } else if (t === 'monthly') {
        m.monthlyLaunches = Math.max(m.monthlyLaunches, row.total_launches || 0);
        m.monthlyUniqueLaunches = Math.max(m.monthlyUniqueLaunches, row.unique_launches || 0);
      } else if (t === 'yearly') {
        m.yearlyLaunches = Math.max(m.yearlyLaunches, row.total_launches || 0);
        m.yearlyUniqueLaunches = Math.max(m.yearlyUniqueLaunches, row.unique_launches || 0);
      } else if (t === 'all_time') {
        m.allTimeLaunches = Math.max(m.allTimeLaunches, row.total_launches || 0);
        m.allTimeUniqueLaunches = Math.max(m.allTimeUniqueLaunches, row.unique_launches || 0);
      }
      metricsMap.set(wId, m);
    }

    // Assemble final cleaned data to match frontend expectations
    const cleaned = baseRows.map((w) => {
      const cats = (categoriesMap.get(w.widget_id) || []).map((c) => ({
        id: c.id,
        name: c.name,
        hex_code: c.hex_code,
      }));
      const devs = devsMap.get(w.widget_id) || [];
      const metrics = metricsMap.get(w.widget_id) || {
        weeklyLaunches: 0, monthlyLaunches: 0, yearlyLaunches: 0, allTimeLaunches: 0,
        weeklyUniqueLaunches: 0, monthlyUniqueLaunches: 0, yearlyUniqueLaunches: 0, allTimeUniqueLaunches: 0
      };

      return {
        widget_id: w.widget_id,
        widget_name: w.widget_name,
        description: w.description,
        visibility: w.visibility,
        redirect_link: w.redirect_link,
        image_url: w.image_url,
        public_id: w.public_id,
        restricted_access: w.restricted_access,
        developer_ids: devs,
        categories: cats,
        metrics
      };
    });

    // If the caller requested category filtering, apply it in JS (or you can add a subquery in baseQuery for strict DB filtering)
    if (categories && Array.isArray(categories) && categories.length > 0) {
      const wanted = new Set(categories.map((c) => Number(c)));
      return cleaned.filter((w) => (w.categories || []).some((c) => wanted.has(c.id)));
    }

    return cleaned;
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