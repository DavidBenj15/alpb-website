import pkg from 'aws-sdk';
const { APIGateway } = pkg;
const apiGateway = new APIGateway({ region: 'us-east-2' });
import pool from '../db.js';  // PostgreSQL connection setup

// Function to register a widget
export async function registerWidget(user_id, widgetName, description, visibility) {
    const query = `
      INSERT INTO requests (user_id, widget_name, description, visibility, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING request_id;
      `;
    try {
        // Insert the widget into the database
        console.log("MADE IT INSIDE THE REGISTER WIDGET WIDGETSERVICE RAHHH")
        const status = 'pending'
        const result = await pool.query(query, [user_id, widgetName, description, visibility, status]);
        const widgetId = result.rows[0].widget_id;
        console.log(`Widget registered with ID: ${widgetId}`);
        
        return { widgetId, message: 'Widget saved successfully and pending approval' };
    } catch (error) {
        console.error('Error registering widget:', error);
        throw new Error('Failed to register widget');
    }
}

export async function removeRequest(requestId) {
    const query = `DELETE FROM requests WHERE request_id = $1 RETURNING *;`;
    
    try {
        const result = await pool.query(query, [requestId]);
        if (result.rows.length === 0) {
            throw new Error('Request not found or already deleted.');
        }
        return result.rows[0]; // Return the deleted request data if necessary
    } catch (error) {
        console.error('Error deleting request:', error);
        throw error;
    }
}

export async function createUserWidgetRelation(userId, widgetId, apiKey, role = 'owner') {
    try {
        const query = `
            INSERT INTO user_widget (user_id, widget_id, api_key, role, joined_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *;
        `;
        const result = await pool.query(query, [userId, widgetId, apiKey, role]);
        return result.rows[0]; // Return the newly created relation
    } catch (error) {
        console.error('Error creating user-widget relation:', error.message);
        throw error;
    }
}

export async function generateApiKeyForUser(userId, email) {
    const params = {
        name: `ApiKey-${userId}`,
        description: `API key for ${email}`,
        enabled: true,
        generateDistinctId: true,
        stageKeys: [], // You can specify stages if needed
    };

    try {
        const apiKey = await apiGateway.createApiKey(params).promise();
        await associateApiKeyWithUsagePlan(apiKey.id, process.env.USAGE_PLAN_ID);
        await saveApiKeyToDatabase(userId, apiKey.id);
        return apiKey.id;
    } catch (err) {
        console.error('Error generating API Key:', err);
        throw new Error('Failed to generate API key');
    }
}

export async function associateApiKeyWithUsagePlan(apiKeyId, usagePlanId) {
    const params = {
        keyId: apiKeyId, 
        keyType: 'API_KEY',
        usagePlanId: usagePlanId
    };

    try {
        await apiGateway.createUsagePlanKey(params).promise();
        console.log('API Key associated with Usage Plan');
    } catch (err) {
        console.error('Error associating API Key with Usage Plan:', err);
    }
}

export async function saveApiKeyToDatabase(userId, apiKey) {
    const query = `
        UPDATE user_widget
        SET api_key = $1
        WHERE user_id = $2;
    `;
    await pool.query(query, [apiKey, userId]);
}

export async function getRequestData(requestId) {
    try {
        const query = `
            SELECT * FROM requests WHERE request_id = $1
        `;
        const result = await _query(query, [requestId]);

        if (result.rows.length === 0) {
            throw new Error('Request not found');
        }

        return result.rows[0]; // Return the request data
    } catch (error) {
        console.error('Error fetching request data:', error.message);
        throw error;
    }
}

export async function getUserData(userCognitoID) {
    try {
        const query = `
            SELECT * FROM users WHERE cognito_user_id = $1
        `;
        const result = await pool.query(query, [userCognitoID]);

        if (result.rows.length === 0) {
            throw new Error('Request not found');
        }

        return result.rows[0]; // Return the user data
    } catch (error) {
        console.error('Error fetching request data:', error.message);
        throw error;
    }
}


export async function createApprovedWidget(widgetData) {
    const { widget_name, description, visibility } = widgetData;
    try {
        const query = `
            INSERT INTO widgets (widget_name, description, visibility, status, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING widget_id;
        `;
        const result = await pool.query(query, [widget_name, description, visibility, 'approved']);

        return result.rows[0]; // Return the newly created widget ID
    } catch (error) {
        console.error('Error creating approved widget:', error.message);
        throw error;
    }
}


export async function getPendingWidgets() {
    const query = `
        SELECT * FROM requests`;
    const result = await pool.query(query);
    return result.rows;
}

export async function getAllWidgets() {
    // When we select * from widgets,
    // need to get all user_ids from user_widget where user_widget.widget_id === widgets.widget_id
    const widgetsQuery = `
        SELECT
            w.*,
            ARRAY_AGG(uw.user_id) AS developer_ids
        FROM
            widgets w
        LEFT JOIN
            user_widget uw ON w.widget_id = uw.widget_id
        GROUP BY
            w.widget_id;
        `;
    const result = await pool.query(widgetsQuery);
    return result.rows;
}
