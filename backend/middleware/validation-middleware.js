/**
 * Middleware for validating incoming request bodies using Zod schemas.
 * Ensures that requests adhere to the expected structure and constraints.
 */

import { z, ZodError } from "zod"; // Import Zod library for schema validation

/**
 * Validation middleware factory.
 * Generates middleware that validates the `req.body` against a provided Zod schema.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate the request body against.
 * @returns {Function} Middleware function for request validation.
 */
export const validationMiddleware = (schema) => {
    return (req, res, next) => {
        try {
            // Validate the request body using the provided schema
            schema.parse(req.body);

            // If validation passes, proceed to the next middleware or route handler
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Handle validation errors from Zod
                const errorMessages = error.errors.map((issue) => ({
                    message: `Error with ${issue.path.join('.')}: ${issue.message}`, // Detailed error message
                }));

                // Respond with a 400 Bad Request and detailed error messages
                res.status(400).json({ error: 'Bad request', details: errorMessages });
            } else {
                // Handle unexpected errors
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
};

  