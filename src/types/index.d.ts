// Node modules.
import { Request } from "express";
// Relative modules.
import { SafeClient } from "./client";

export {};

export interface CustomRequest extends Request {
  prisma?: any;
  redisClient?: any;
  client?: SafeClient;
}

export interface CustomError extends Error {
  code?: string;
  customMessage?: string;
  failures?: () => { message: string }[];
  status?: number;
}
