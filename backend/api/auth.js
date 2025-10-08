import { Router } from "express";
import cognito from "../cognito.js";
import pool from "../db.js";
import { disableCognitoAccount } from "../services/developerService.js";

const router = Router();

/**
 * POST /auth/resend-confirmation
 * Resend confirmation code for unconfirmed users
 */
router.post("/resend-confirmation", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    // Resend confirmation code with Cognito
    await cognito.resendConfirmationCode({
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
      Username: email.toLowerCase(),
    }).promise();

    res.status(200).json({
      success: true,
      message: "Confirmation code resent successfully"
    });

  } catch (error) {
    console.error("Resend confirmation error:", error);

    // Handle specific Cognito errors
    if (error.code === 'UserNotFoundException') {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    } else if (error.code === 'InvalidParameterException') {
      return res.status(400).json({
        success: false,
        message: "User is already confirmed"
      });
    } else if (error.code === 'LimitExceededException') {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait before requesting another code"
      });
    }

    res.status(500).json({
      success: false,
      message: `Failed to resend confirmation code: ${error.message}`
    });
  }
});

/**
 * POST /auth/confirm-signup
 * Confirm user signup with confirmation code and update pending developer status
 */
router.post("/confirm-signup", async (req, res) => {
  const { email, confirmationCode } = req.body;

  if (!email || !confirmationCode) {
    return res.status(400).json({
      success: false,
      message: "Email and confirmation code are required"
    });
  }

  try {
    // Confirm signup with Cognito
    await cognito.confirmSignUp({
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
      Username: email.toLowerCase(),
      ConfirmationCode: confirmationCode,
    }).promise();

    // Check if this is a pending developer and update their status
    const updateResult = await pool.query(`
      UPDATE pending_developers
      SET email_confirmed = true
      WHERE email = $1 AND email_confirmed = false
      RETURNING request_id, email, first_name, last_name
    `, [email.toLowerCase()]);

    const isDeveloper = updateResult.rowCount > 0;
    if (isDeveloper) {
      await disableCognitoAccount(email);
    }

    res.status(200).json({
      success: true,
      message: "Email confirmed successfully",
      data: {
        isDeveloper,
        developer: updateResult.rows[0] || null
      }
    });

  } catch (error) {
    console.error("Confirmation error:", error);

    // Handle specific Cognito errors
    if (error.code === 'CodeMismatchException') {
      return res.status(400).json({
        success: false,
        message: "Invalid confirmation code"
      });
    } else if (error.code === 'ExpiredCodeException') {
      return res.status(400).json({
        success: false,
        message: "Confirmation code has expired"
      });
    } else if (error.code === 'NotAuthorizedException') {
      return res.status(400).json({
        success: false,
        message: "User is already confirmed"
      });
    }

    res.status(500).json({
      success: false,
      message: `Confirmation failed: ${error.message}`
    });
  }
});

/**
 * GET /auth/check-status/:email
 * Check if email belongs to a pending developer
 */
router.get("/check-status/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await pool.query(`
      SELECT status, email_confirmed
      FROM pending_developers
      WHERE email = $1
    `, [email.toLowerCase()]);

    if (result.rowCount === 0) {
      return res.json({
        status: "regular_user"
      });
    }

    const developer = result.rows[0];
    res.json({
      status: developer.email_confirmed ? "pending_approval" : "pending_confirmation"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error checking status: ${error.message}`
    });
  }
});

export default router;