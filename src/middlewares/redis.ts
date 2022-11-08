// Node modules.
import Redis from "ioredis";

let redisClient: Redis | null = null;

const useRedis = (): Redis => {
  // Throw if the environment variables are not set.
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined");
  }

  // Return the redis client if we already have it.
  if (redisClient) {
    return redisClient;
  }

  // Create the Redis client.
  redisClient = new Redis(process.env.REDIS_URL);

  // On connect.
  redisClient.on("connect", () => {
    console.log("⚡️ Connected to Redis.");
  });

  // On error.
  redisClient.on("error", (error) => {
    console.log(
      "❌ Error connecting to Redis, check your environment variables. The error:",
      error
    );
  });

  // On disconnect.
  redisClient.on("disconnect", () => {
    console.log("❌ Disconnected from Redis.");
    redisClient = null;
  });

  // Return the client.
  return redisClient;
};

export default useRedis;
