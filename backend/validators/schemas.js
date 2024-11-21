/**
 * Validation schemas for request data using Zod.
 * These schemas ensure that incoming requests adhere to the expected structure and constraints.
 */

import { z } from 'zod'; // Zod library for schema validation

// ---------------------------------------------------
// Widget Validation Schemas
// ---------------------------------------------------

/**
 * Schema for creating a widget.
 * Validates the structure and constraints of a widget creation request.
 */
export const createWidgetSchema = z.object({
    name: z.string().min(1).max(255), // Widget name (required, max 255 characters)
    description: z.string().optional(), // Widget description (optional)
    visibility: z.string().max(50).optional(), // Visibility status (optional, max 50 characters)
    redirectLink: z.string().optional(), // Redirect link (optional)
    imageUrl: z.string().optional(), // Image URL for the widget (optional)
    categoryIds: z.number().array().optional(), // Array of category IDs (optional)
});

/**
 * Schema for editing a widget.
 * Based on the `createWidgetSchema` but makes all fields optional.
 */
export const editWidgetSchema = createWidgetSchema.partial(); // All fields are optional for edits

/**
 * Schema for query parameters when searching widgets.
 * Validates filters such as widget name, categories, and pagination details.
 */
export const queryParamasSchema = z.object({
    widgetName: z.string().optional(), // Widget name filter (optional)
    categories: z.string().array().optional(), // Array of category filters (optional)
    page: z.coerce.number().int().positive().optional(), // Page number (optional, positive integer)
    limit: z.coerce.number().int().positive().max(100, "Limit must be <= 100").optional(), // Limit per page (optional, max 100)
});

// ---------------------------------------------------
// User Validation Schemas
// ---------------------------------------------------

/**
 * Schema for creating a user.
 * Validates the structure and constraints of a user creation request.
 */
export const createUserSchema = z.object({
    email: z.string().min(1), // User email (required, must be non-empty)
    firstName: z.string().max(255).optional(), // First name (optional, max 255 characters)
    lastName: z.string().max(255).optional(), // Last name (optional, max 255 characters)
    role: z.string(), // User role (required)
    favWidgetsIds: z.number().array().optional(), // Array of favorite widget IDs (optional)
});

/**
 * Schema for updating a user.
 * Based on the `createUserSchema` but makes all fields optional.
 */
export const updateUserSchema = createUserSchema.partial(); // All fields are optional for updates

/**
 * Schema for favoriting a widget.
 * Validates the structure of a request to add a widget to a user's favorites.
 */
export const favoriteWidgetSchema = z.object({
    userId: z.coerce.number().int().positive(), // User ID (required, positive integer)
    widgetId: z.coerce.number().int().positive(), // Widget ID (required, positive integer)
});
