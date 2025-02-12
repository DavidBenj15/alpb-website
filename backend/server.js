/**
 * Entry point for the Express.js backend server.
 * This file sets up middleware, routes, and starts the server.
 */

import express, { json } from "express"; // Express.js framework for creating APIs
import cors from "cors"; // Middleware to enable Cross-Origin Resource Sharing
import pool from "./db.js";
import session from "express-session";
import pgSession from "connect-pg-simple";
import dotenv from "dotenv"; // For managing environment variables
dotenv.config(); // Load environment variables from a `.env` file

// Importing API route handlers
import widgets from "./api/widgets.js";
import users from "./api/users.js";
import teams from "./api/teams.js";
import categories from "./api/widget-categories.js";

const SESSION_SECRET = process.env.SESSION_SECRET;

// Initialize the Express app
const app = express();

// ---------------------------------------------------
// Middleware Setup
// ---------------------------------------------------

/**
 * Enable CORS (Cross-Origin Resource Sharing).
 * Required if the frontend and backend are hosted on different domains or ports.
 */
// app.use(cors({
//     origin: (origin) => origin, // Allow any origin
//     credentials: true, // Allow credentials
//     allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowHeaders: ["Content-Type", "Authorization"],
//     exposeHeaders: ["Set-Cookie"],
//   }));
app.use(cors({
  credentials: true,
  origin: ["https://alpb-analytics.com/", "http://localhost:3000"]
}))

/**
 * Parse incoming JSON requests.
 * Adds the parsed data to `req.body`.
 */
app.use(json());

const PostgresStore = pgSession(session);

app.use(
  session({
    store: new PostgresStore({
      pool: pool,
      pruneSessionInterval: 60 * 15, // how often to clean up expired sessions from db (minutes)
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // TODO change to true for prod
      maxAge: 24 * 60 /*minutes*/ * 60 /*seconds*/ * 1000, // session length (ms)
      // maxAge: 1000 * 5 // TODO change back to normal amount!
    },
  }),
);

// ---------------------------------------------------
// API Routes
// ---------------------------------------------------

app.use("/api/widgets", widgets);

app.use("/api/users", users);

app.use("/api/teams", teams);

app.use("/api/widget-categories", categories);

// ---------------------------------------------------
// Root Route
// ---------------------------------------------------

/**
 * Route: `/`
 * Health check route to ensure the server is running.
 */
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ---------------------------------------------------
// Server Initialization
// ---------------------------------------------------

/**
 * The port on which the server will run.
 * Defaults to 3001 if not specified in the environment variables.
 */
const PORT = process.env.PORT || 3001;

/**
 * Start the server and listen for incoming requests.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
