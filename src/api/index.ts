// Node modules.
import dotenv from "dotenv";
import express, { Express } from "express";
// Relative modules.
import applyMiddlewares from "../middlewares";
import applyRoutes from "../routes";

// Load environment variables.
dotenv.config();

// Create the app.
const app: Express = express();

// Apply middlewares.
applyMiddlewares(app);

// Apply routes.
applyRoutes(app);

// Export the app.
export default app;
