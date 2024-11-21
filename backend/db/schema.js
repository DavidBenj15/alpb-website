/**
 * Database schema definitions using drizzle-orm for PostgreSQL.
 * Defines the structure of the `widgets` and `users` tables.
 */

import { pgTable, integer, varchar, text, timestamp, serial } from 'drizzle-orm/pg-core'; // Import PostgreSQL-specific types and utilities from drizzle-orm

/**
 * Widgets Table
 * Represents the widgets stored in the system.
 */
export const widgets = pgTable('widgets', {
    // Unique identifier for each widget (Primary Key)
    id: serial('widget_id').primaryKey(),

    // The name of the widget (required)
    name: varchar('widget_name').notNull(),

    // A detailed description of the widget (optional)
    description: text('description'),

    // The visibility status of the widget, e.g., 'public' or 'private' (optional)
    visbility: varchar('visibility'),

    // The status of the widget, e.g., 'pending', 'approved', 'rejected' (optional, defaults to 'pending')
    status: varchar('status').default('pending'),

    // Timestamp indicating when the widget was created (defaults to the current time)
    createdAt: timestamp('created_at').defaultNow(),

    // A redirect link associated with the widget (optional)
    redirectLink: varchar('redirect_link'),

    // URL of the widget's image (optional)
    imageUrl: varchar('image_url'),

    // Array of category IDs associated with the widget (optional)
    categoryIds: integer('category_ids').array(),
});

/**
 * Users Table
 * Represents the users registered in the system.
 */
export const users = pgTable('users', {
    // Unique identifier for each user (Primary Key)
    id: serial('user_id').primaryKey(),

    // The Cognito identifier for the user (required)
    cognitoUser: varchar('cognito_user').notNull(),

    // The email address of the user (required)
    email: varchar('email').notNull(),

    // The first name of the user (optional)
    firstName: varchar('first_name'),

    // The last name of the user (optional, note: typo in key should be 'lastName')
    latName: varchar('last_name'),

    // Timestamp indicating when the user was created (defaults to the current time)
    createdAt: timestamp('created_at').defaultNow(),

    // The role of the user, e.g., 'admin', 'editor', 'viewer' (required)
    role: varchar('role').notNull(),

    // Array of favorite widget IDs associated with the user (optional)
    favWidgetsIds: integer('fav_widgets_ids').array(),
});
