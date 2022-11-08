// Node modules.
import express from "express";
// Relative modules.
import AuthController from "../controllers/auth";
import AuthService from "../services/auth";
import useDB from "../middlewares/db";

// Create the router.
const router = express.Router();

// Create the controller.
const db = useDB();
const authService = new AuthService(db);
const authController = new AuthController(authService);

// Create the routes.
router.post("/login", authController.login);

export default router;
