// Node modules.
import { Application, Request, Response, NextFunction } from "express";
// Relative modules.
import authRoutes from "./auth";
import clientRoutes from "./client";
import webhookRoutes from "./webhook";
import { CustomError } from "../types";

const handleErrors = (
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.log(error);
  res
    .status(error?.status || 500)
    .json({ message: error.customMessage || "Internal server error" });
};

const applyRoutes = (app: Application) => {
  // API v1 routes.
  app.use("/api/v1", authRoutes);
  app.use("/api/v1", clientRoutes);
  app.use("/api/v1", webhookRoutes);

  // Health check route.
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  // Error handler.
  app.use(handleErrors);
};

export default applyRoutes;
