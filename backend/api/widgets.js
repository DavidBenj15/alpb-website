import { Router } from "express";
import { validationMiddleware } from "../middleware/validation-middleware.ts";
import sendApiKeyEmail from "../services/emailService.js";
import pool from "../db.js";
import {
  addCategoryToWidgetSchema,
  editWidgetSchema,
  queryParamsSchema,
  registerWidgetSchema,
  removeCategoryFromWidgetSchema,
} from "../validators/schemas.ts";
import {
  createApprovedWidget,
  getUserData,
  generateApiKeyForUser,
  createUserWidgetRelation,
  getAllWidgets,
  registerWidget,
  removeRequest,
  updateWidget,
  deleteWidget,
} from "../services/widgetService.js";

const selectWidgetById = `
    SELECT *
    FROM widgets
    WHERE widget_id = $1
`;

const selectRequestById = `
    SELECT *
    FROM requests
    WHERE request_id = $1
`;

const router = Router();

// get all widgets
router.get(
  "/",
  validationMiddleware({ querySchema: queryParamsSchema }),
  async (req, res) => {
    try {
      const { widgetName, categories, page, limit } = req.query;

      const widgets = await getAllWidgets(widgetName, categories, page, limit);

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

    console.log({restrictedAccess})

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

router.post("/create", async (req, res) => {
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

    // if (metricType === "favorite") {
    //   const result = await pool.query(`
    //     INSERT INTO widget_favorites (widget_id, user_id)
    //     VALUES ($1, $2)
    //     RETURNING *
    //   `, [widgetId, userId]);

    //   return res.status(201).json({
    //     success: true,
    //     message: "Widget favorite metric recorded successfully",
    //     data: result.rows[0]
    //   })
    // }

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

export default router;
