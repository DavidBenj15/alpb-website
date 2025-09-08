/**
 * Middleware for validating incoming request bodies using Zod schemas.
 * Ensures that requests adhere to the expected structure and constraints.
 */

import { ZodError } from "zod"; // Import Zod library for schema validation

/**
 * Validation middleware factory.
 * Generates middleware that validates the `req.body`, `req.params`, and/or `req.query` against a provided Zod schema.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate the request body against.
 * @returns {Function} Middleware function for request validation.
 */
export function validationMiddleware({
  bodySchema,
  paramsSchema,
  querySchema,
} = {}) {
  return (req, res, next) => {
    try {
      // Validate the request body if a schema is provided
      if (bodySchema) {
        bodySchema.parse(req.body);
      }

      // Validate the request params if a schema is provided
      if (paramsSchema) {
        paramsSchema.parse(req.params);
      }

      // Validate the request query params if a schema is provided
      if (querySchema) {
        querySchema.parse(req.query);
      }

      // If validation passes, proceed to the next middleware or route handler
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors from Zod
        const messages = error.errors.map((issue) => ({
          message: `${issue.path.join(".")}: ${issue.message}`, // Detailed error message
        }));

        console.error(messages);

        // Respond with a 400 Bad Request and detailed error messages
        res.status(400).json({
          success: false,
          message: `${messages[0].message}`, // Only include the first error message
        });
      } else {
        // Handle unexpected errors
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };
}

