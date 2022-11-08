// Node modules.
import Redis from "ioredis";
import express from "express";
// Relative modules.
import ClientController from "../controllers/client";
import ClientService from "../services/client";
import useDB from "../middlewares/db";
import useRedis from "../middlewares/redis";
import { isAuthenticated } from "../middlewares/auth";

// Create the router.
const router = express.Router();

// Create the controller.
const db = useDB();
const redisClient: Redis = useRedis();
const clientService = new ClientService(db, redisClient);
const clientController = new ClientController(clientService);

// Create the routes.
router.get("/clients/me", isAuthenticated, clientController.getMe);
router.post("/clients", clientController.create);
router.put("/clients/me", isAuthenticated, clientController.updateMe);

export default router;
