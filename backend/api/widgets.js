import { Router } from "express";
import { validationMiddleware } from "../middleware/validation-middleware.js";
import pool from "../db.js";
import {
  addCategoryToWidgetSchema,
  editWidgetSchema,
  queryParamsSchema,
  registerWidgetSchema,
} from "../validators/schemas.js";
import {
  createApprovedWidget,
  getUserData,
  createUserWidgetRelation,
  getAllWidgets,
  registerWidget,
  updateWidget,
  deleteWidget,
} from "../services/widgetService.js";
import authGuard from "../middleware/auth-guard.js";

const selectWidgetById = `
    SELECT *
    FROM widgets
    WHERE widget_id = $1
`;

const router = Router();

// get all widgets
router.get(
  "/",
  validationMiddleware({ querySchema: queryParamsSchema }),
  async (req, res) => {
    try {
      const { widgetName, categories, page, limit, userId } = req.query;

      const widgets = await getAllWidgets(widgetName, categories, page, limit, userId);

      res.status(200).json({
        success: true,
        message: "Widgets retrieved successfully",
        data: widgets,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// edit a widget
router.patch(
  "/:id",
  validationMiddleware({ bodySchema: editWidgetSchema }),
  async (req, res) => {
    const { name, description, redirectLink, visibility, imageUrl, publicId, restrictedAccess } = req.body;

    try {
      const id = parseInt(req.params.id);

      // Ensure target widget exists
      const targetWidgetRes = await pool.query(selectWidgetById, [id]);
      if (targetWidgetRes.rowCount === 0) {
        res.status(404).json({
          success: false,
          message: "Widget not found",
        });
        return;
      }

      const updatedWidget = await updateWidget({
        id,
        name,
        description,
        redirectLink,
        visibility,
        imageUrl,
        publicId,
        restrictedAccess
      });

      res.status(200).json({
        success: true,
        message: "Widget updated successfully",
        data: updatedWidget,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Internal error: ${error.message}`,
      });
    }
  },
);

// delete a widget
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const targetWidgetRes = await pool.query(selectWidgetById, [id]);
    // Ensure target widget exists
    if (targetWidgetRes.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Widget does not exist",
      });
      return;
    }
    const deletedWidget = await deleteWidget(id);
    res.status(200).json({
      success: true,
      message: "Widget deleted successfully",
      data: deletedWidget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`,
    });
  }
});

router.post("/create", authGuard, async (req, res) => {
  try {
    const userId = req.body.userId;
    const widgetData = req.body;

    // Create widget directly using the existing approved widget logic
    const approvedID = await createApprovedWidget(widgetData);

    // Get user data
    const user = await getUserData(userId);
    const userEmail = user["email"];

    // Create user-widget relation
    const userWidgetRelation = await createUserWidgetRelation(
      userId,
      approvedID,
      "owner"
    );

    

    res.status(200).json({
      success: true,
      message: "Widget created and API key sent via email",
      data: userWidgetRelation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`,
    });
  }
});


// register a widget
router.post(
  "/register",
  validationMiddleware({ bodySchema: registerWidgetSchema }),
  async (req, res) => {
    const { widgetName, description, visibility, userId } = req.body; // Extract widget details and userId from the request body

    try {
      const requestedWidget = await registerWidget(
        userId,
        widgetName,
        description,
        visibility,
      );
      res.status(200).json({
        success: true,
        message: "Widget registration request was sent successfully",
        data: requestedWidget,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Internal error: ${error.message}`,
      });
    }
  },
);

// Get categories for a widget
router.get("/:id/categories", async (req, res) => {
  try {
    const widgetId = parseInt(req.params.id);

    // Check if widget exists
    const widgetExists = await pool.query(selectWidgetById, [widgetId]);
    if (widgetExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Widget not found"
      });
    }

    // Get all categories for this widget
    const categoriesResult = await pool.query(
      `SELECT c.* 
       FROM categories c
       JOIN widget_categories wc ON c.id = wc.category_id
       WHERE wc.widget_id = $1`,
      [widgetId]
    );

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categoriesResult.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
});

// Add a category to a widget
router.post("/:id/categories", validationMiddleware({ bodySchema: addCategoryToWidgetSchema }), async (req, res) => {
  try {
    const widgetId = parseInt(req.params.id);
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    // Check if widget exists
    const widgetExists = await pool.query(selectWidgetById, [widgetId]);
    if (widgetExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Widget not found"
      });
    }

    // Check if category exists
    const categoryExists = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [categoryId]
    );
    if (categoryExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Add relation to widget_categories
    const result = await pool.query(
      `INSERT INTO widget_categories (widget_id, category_id)
       VALUES ($1, $2)
       RETURNING *`,
      [widgetId, categoryId]
    );

    res.status(201).json({
      success: true,
      message: "Category added to widget successfully",
      data: result.rows[0]
    });
  } catch (error) {
    // Handle duplicate entry
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "This category is already associated with this widget"
      });
    }

    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
});

// Remove a category from a widget
router.delete("/:widgetId/categories/:categoryId", async (req, res) => {
  try {
    const widgetId = parseInt(req.params.widgetId);
    const categoryId = parseInt(req.params.categoryId);

    // Check if widget exists
    const widgetExists = await pool.query(selectWidgetById, [widgetId]);
    if (widgetExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Widget not found"
      });
    }

    // Delete the relation
    const result = await pool.query(
      `DELETE FROM widget_categories 
       WHERE widget_id = $1 AND category_id = $2
       RETURNING *`,
      [widgetId, categoryId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found for this widget"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category removed from widget successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
});

router.post("/metrics", async (req, res) => {
  try {
    const { widgetId, userId, metricType } = req.body;

    if (metricType === "launch") {
      const result = await pool.query(`
        INSERT INTO widget_launches (widget_id, user_id)
        VALUES ($1, $2)
        RETURNING *
      `, [widgetId, userId]);

      return res.status(201).json({
        success: true,
        message: "Widget launch metric recorded successfully",
        data: result.rows[0]
      })
    }

    else {throw new Error("Invalid metric type")}
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
})

router.get('/:widgetId/developers', async (req, res) => {
  try {
    const widgetId = parseInt(req.params.widgetId);
    const response = await pool.query(`
      SELECT uw.user_id, u.email, uw.role
      FROM user_widget as uw
      LEFT JOIN users as u
        ON u.user_id = uw.user_id
      WHERE uw.widget_id = $1
    `, [widgetId])

    return res.status(201).json({
      success: true,
      message: `Widget developers fetched successfully`,
      data: response.rows
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
})

router.get('/:widgetId/developers', async (req, res) => {
  try {
    const widgetId = parseInt(req.params.widgetId);
    const developerId = parseInt(req.body.developerId);

    // Check if developer is already added to widget
    const alreadyDevRes = await pool.query(`
      SELECT user_id
      FROM user_widget
      WHERE
        widget_id = $1
        AND user_id = $2
      `, [widgetId, developerId]);

    if (alreadyDevRes.rowCount > 0) {
      return res.status(500).json({
        success: false,
        message: `Error: user with id ${developerId} is already a collaborator on widget with id ${widgetId}`
      });
    }

    // Add dev
    await pool.query(`
      INSERT INTO user_widget (user_id, widget_id, role)
      VALUES ($1, $2, 'member')
    `, [developerId, widgetId])

    return res.status(201).json({
      success: true,
      message: `Widget developer with id ${developerId} added to widget with id ${widgetId}`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
})

// Add collaborator to widget
router.post("/:widgetId/collaborators", async (req, res) => {
  try {
    const widgetId = parseInt(req.params.widgetId);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Look up user by email
    const userQuery = 'SELECT user_id FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }
    
    const userId = userResult.rows[0].user_id;

    // Check if widget exists
    const widgetExists = await pool.query('SELECT widget_id FROM widgets WHERE widget_id = $1', [widgetId]);
    if (widgetExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Widget not found"
      });
    }

    // Check if user is already a collaborator
    const checkQuery = `
      SELECT * FROM user_widget 
      WHERE user_id = $1 AND widget_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [userId, widgetId]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator"
      });
    }

    // Add collaborator
    const query = `
      INSERT INTO user_widget (user_id, widget_id, role)
      VALUES ($1, $2, 'member')
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, widgetId]);
    
    // Get the user's email for the response
    const userDetails = await pool.query(
      'SELECT email FROM users WHERE user_id = $1',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: "Collaborator added successfully",
      data: {
        ...result.rows[0],
        email: userDetails.rows[0].email
      }
    });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({
      success: false,
      message: `Error adding collaborator: ${error.message}`
    });
  }
});

// Get widget collaborators
router.get("/:widgetId/collaborators", async (req, res) => {
  try {
    const widgetId = parseInt(req.params.widgetId);
    
    if (!widgetId) {
      return res.status(400).json({
        success: false,
        message: "widgetId is required"
      });
    }
    
    const query = `
      SELECT u.user_id, u.email, uw.role
      FROM user_widget uw
      JOIN users u ON u.user_id = uw.user_id
      WHERE uw.widget_id = $1
    `;
    
    const result = await pool.query(query, [widgetId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching collaborators: ${error.message}`
    });
  }
});

// Get teams with access to a widget
router.get("/:id/teams", async (req, res) => {
  try {
    const widgetId = parseInt(req.params.id);

    // Check if widget exists
    const widgetExists = await pool.query(selectWidgetById, [widgetId]);
    if (widgetExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Widget not found"
      });
    }

    // Get all teams with access to this widget - using "team" instead of "teams"
    const teamsResult = await pool.query(
      `SELECT t.* 
       FROM team t
       JOIN widget_team_access wta ON t.team_id = wta.team_id
       WHERE wta.widget_id = $1`,
      [widgetId]
    );

  
  
    // Return the raw team_id values without modification to preserve UUID format
    res.status(200).json({
      success: true,
      message: "Teams retrieved successfully",
      data: teamsResult.rows
    });
  } catch (error) {
    console.error(`Error getting teams for widget ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
});

// Update teams with access to a widget
router.put("/:id/teams", async (req, res) => {
  try {
    const widgetId = parseInt(req.params.id);
    const { teamIds } = req.body;

    if (!Array.isArray(teamIds)) {
      return res.status(400).json({
        success: false,
        message: "teamIds must be an array"
      });
    }

    // Check if widget exists
    const widgetExists = await pool.query(selectWidgetById, [widgetId]);
    if (widgetExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Widget not found"
      });
    }

    // Check if widget is private
    const widgetVisibility = widgetExists.rows[0].visibility;
    if (widgetVisibility.toLowerCase() !== 'private') {
      return res.status(400).json({
        success: false,
        message: "Only private widgets can have team access"
      });
    }

    // Start a transaction
    await pool.query('BEGIN');

    // Remove all existing team access for this widget
    await pool.query(
      `DELETE FROM widget_team_access WHERE widget_id = $1`,
      [widgetId]
    );

    // Add new team access - using individual inserts to handle errors better
    if (teamIds.length > 0) {
      for (const teamId of teamIds) {
        try {
          await pool.query(
            `INSERT INTO widget_team_access (widget_id, team_id) 
             VALUES ($1, $2) 
             ON CONFLICT (widget_id, team_id) DO NOTHING`,
            [widgetId, teamId]
          );
        } catch (insertError) {
          console.error(`Error adding team ${teamId}:`, insertError.message);
          // Continue with next team instead of failing completely
        }
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Widget team access updated successfully"
    });
  } catch (error) {
    // Rollback if error occurs
    try {
      await pool.query('ROLLBACK');
    } catch (rollbackError) {
      console.error("Error during rollback:", rollbackError);
    }
    
    console.error(`Error updating team access for widget ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
});

export default router;
