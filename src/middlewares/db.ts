// Node modules.
import { PrismaClient } from "@prisma/client";

let client: PrismaClient | null = null;

const useDB = (): PrismaClient => {
  // Throw if the environment variables are not set.
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  // Return back the client if it already exists.
  if (client) {
    return client;
  }

  // Create the client.
  client = new PrismaClient();

  // Log.
  console.log("⚡️ Connected to Database + Prisma.");

  // Return the client.
  return client;
};

export default useDB;
