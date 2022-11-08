// Node modules.
import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
// Relative modules.
import { CustomRequest } from "../types";
import { SafeClient } from "../types/client";

export const isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Derive the token.
  const token = req.headers.authorization;

  // If there is no token, return an error.
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // If there is no JWT_SECRET, return an error.
  if (!process.env.JWT_SECRET) {
    console.log("JWT_SECRET is not defined.", process.env.JWT_SECRET);
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  try {
    // Verify the token.
    const client = jwt.verify(token, process.env.JWT_SECRET) as SafeClient;

    // Add the client to the request.
    req.client = client;

    // Continue.
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
