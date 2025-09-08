
import { Router } from "express";
import pkg from "aws-sdk";
import dotenv from "dotenv";
import pool from "../db.js";
import {
  encryptToken,
  favoriteWidget,
  getFavorites,
  unfavoriteWidget,
  createUser,
  signUpUserWithCognito,
  updateUser,
} from "../services/userService.js";
import { getUserData } from "../services/widgetService.js";
import authGuard from "../middleware/auth-guard.js";
import { validationMiddleware } from "../middleware/validation-middleware.js";
import { generateTokenSchema } from "../validators/schemas.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

dotenv.config();
const { CognitoIdentityServiceProvider } = pkg;
const cognito = new CognitoIdentityServiceProvider({ region: "us-east-2" });
const JWT_SECRET = process.env.JWT_SECRET;
const COGNITO_USER_POOL_ID = process.env.USER_POOL_ID;
const router = Router();

/**
 * GET /users
 * Retrieve user data by ID.
 */
router.get("/", async (req, res) => {
  const { id } = req.body;
  try {
    const user = await getUserData(id);
    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /sign-up
 * Register a new user.
 */
router.post("/sign-up", async (req, res) => {
  try {
    const result = await signUpUserWithCognito(req.body);
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      userId: result.userId,
      data: result.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error registering user"
    });
  }
});

/**
 * POST /sign-in
 * Authenticate a user.
 */
router.post("/sign-in", async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  };
  try {
    const authResult = await cognito.initiateAuth(params).promise();
    const { AccessToken, IdToken, RefreshToken } =
      authResult.AuthenticationResult;

    const query = "SELECT * FROM users WHERE email = $1";
    const dbResult = await pool.query(query, [email]);
    if (dbResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const user = dbResult.rows[0];

    req.session.user = user; // IMPORTANT stores session in req body

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        authData: {
          acceessToken: AccessToken,
          idToken: IdToken,
          refreshToken: RefreshToken
        },
        user: {
          email: user.email,
          first: user.first_name,
          last: user.last_name,
          role: user.role,
          id: user.user_id,
          teamId: user.team_id,
          teamRole: user.team_role,
          is_admin: user.is_admin
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    // If there's no data in the session, nothing to do
    if (!req.session || !req.session.user) {
      return res.status(200).json({ 
        success: true,
        message: 'Already logged out' 
      });
    }

    // Destroy the session in database
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Failed to complete logout' });
      }

      // Clear the session cookie
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: false, // TODO change to true for prod
        sameSite: 'strict'
      });

      res.status(200).json({ 
        success: true,
        message: 'Successfully logged out' 
      });
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during logout' 
    });
  }
});

/**
 * PATCH /users/:userId/add-favorite
 * Add a widget to a user's favorites.
 */
router.patch("/:userId/add-favorite", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const widgetId = parseInt(req.body.widgetId);
  try {
    const result = await favoriteWidget(userId, widgetId);
    res.status(201).json({
      success: true,
      message: "Widget added to favorites",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PATCH /users/:userId/remove-favorite
 * Remove a widget from a user's favorites.
 */
router.patch("/:userId/remove-favorite", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const widgetId = parseInt(req.body.widgetId);
  try {
    const result = await unfavoriteWidget(userId, widgetId);
    res.status(200).json({
      success: true,
      message: "Widget removed from favorites",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /users/:userId/favorite-widgets
 * Retrieve a user's favorite widgets.
 */
router.get("/:userId/favorite-widgets", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const favorites = await getFavorites(userId);
    res.status(200).json({
      success: true,
      message: "Favorites retrieved successfully",
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/validate-session", authGuard, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Session is valid"
  })
});

router.post("/generate-token", authGuard, validationMiddleware({ bodySchema: generateTokenSchema }), async (req, res) => {
  const { userId, publicWidgetId } = req.body;
  try {
    // Ensure session is valid (w/ corresponding user)
    // if (req.session.user.user_id !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Invalid session"
    //   });
    // }

    const sessionIdRes = await pool.query(
      "SELECT sid FROM session WHERE (sess->'user'->>'user_id')::int = $1",
      [userId]
    );

    if (sessionIdRes.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "Invalid session"
      });
    }

    const sessionId = sessionIdRes.rows[0].sid;

    // Lookup internal widget ID from public ID
    const widgetRes = await pool.query(
        "SELECT widget_id FROM widgets WHERE public_id = $1",
        [publicWidgetId]
    );

    if (widgetRes.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "Widget not found",
      })
    }

    const widgetId = widgetRes.rows[0].widget_id;

    // const token = jwt.sign({ U: userId, p: publicWidgetId, s: sessionId }, JWT_SECRET, { expiresIn: "8h", algorithm: "HS256" });
    const token = encryptToken({
      userId,
      publicWidgetId,
      sessionId
    })
    res.json({
      success: true,
      message: "Token generated successfully",
      data: {
        token,
      }
    })
    res.status(200);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating token " + error.message 
    });
  }
})

router.get('/search', async (req, res) => {
  try {
    const { email } = req.query;
    
    const query = `
      SELECT user_id, email
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
});

router.post('/send-password-reset-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    await sendPasswordResetEmail(email, otp);

    return res.json({
      success: true,
      message: "Email sent successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;
  
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const query = `
      SELECT cognito_user_id
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const username = result.rows[0].cognito_user_id;

    try {
      const resetResponse = await cognito.adminSetUserPassword({
        Password: password,
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        Permanent: true,
      }).promise(); // Use .promise() to handle the AWS SDK method correctly

      // If we reach here, the password reset was successful
      return res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (cognitoError) {
      // Handle specific Cognito errors
      console.error('Cognito Password Reset Error:', cognitoError);

      if (cognitoError.code === 'NotAuthorizedException') {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet requirements'
        });
      } else if (cognitoError.code === 'UserNotFoundException') {
        return res.status(404).json({
          success: false,
          message: 'Cognito user not found'
        });
      }

      // Generic error for other Cognito-related issues
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }

  } catch (error) {
    console.error('Password Reset Error:', error);
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`
    });
  }
});

router.patch('/:id', authGuard, async (req, res) => {
  const { first, last } = req.body;

  try {
    const id = parseInt(req.params.id);

    // Ensure target user exists
    const selectUserById = `
      SELECT *
      FROM USERS
      WHERE user_id = $1
    `
    const targetUserRes = await pool.query(selectUserById, [id]);
    if (targetUserRes.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Widget not found",
      });
      return;
    }

    await updateUser({
      id,
      first,
      last
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`,
    });
  }
})


export default router;
