// Node modules.
import bcrypt from "bcrypt";
import isEmail from "isemail";
import pick from "lodash/pick";
import Redis from "ioredis";
import { Prisma, PrismaClient } from "@prisma/client";
import { assert, object, string, size, refine, optional } from "superstruct";
// Relative modules.
import { NewClientInput, UpdateClientInput, SafeClient } from "../types/client";
import { CustomError } from "../types";

class ClientService {
  private db: PrismaClient;
  private redis: Redis;

  constructor(db: PrismaClient, redis: Redis) {
    this.db = db;
    this.redis = redis;

    this.getByID = this.getByID.bind(this);
    this.create = this.create.bind(this);
    this.updateByID = this.updateByID.bind(this);
  }

  private handleClientError(error: Error | CustomError | unknown): null {
    const customError = error as CustomError;

    // Bad request.
    if (error instanceof Prisma.PrismaClientValidationError) {
      customError.status = 400;
      customError.customMessage = error.message;
    }

    // Email already exists.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      customError.status = 400;
      customError.customMessage = "Email already exists";
    }

    // Validation errors.
    if (customError?.failures) {
      customError.status = 400;
      customError.customMessage = customError.message;
    }

    // Throw the error.
    throw customError;
  }

  private cleanCreateInput(input: NewClientInput): NewClientInput {
    return pick(input, ["email", "password", "firstName", "lastName"]);
  }

  private cleanUpdateInput(input: UpdateClientInput): UpdateClientInput {
    return pick(input, ["email", "firstName", "lastName"]);
  }

  private validateCreateInput(input: NewClientInput): void {
    const cleanedInput: NewClientInput = this.cleanCreateInput(input);
    try {
      assert(
        input,
        object({
          email: refine(string(), "email", (v) => isEmail.validate(v)),
          password: size(string(), 7, 30),
          firstName: optional(size(string(), 2, 50)),
          lastName: optional(size(string(), 2, 50)),
        })
      );
    } catch (error) {
      this.handleClientError(error);
    }
  }

  private validateUpdateInput(input: UpdateClientInput): void {
    try {
      assert(
        input,
        object({
          email: optional(
            refine(string(), "email", (v) => isEmail.validate(v))
          ),
          firstName: optional(size(string(), 2, 50)),
          lastName: optional(size(string(), 2, 50)),
        })
      );
    } catch (error) {
      this.handleClientError(error);
    }
  }

  makeSafeClient(client: SafeClient | null): SafeClient | null {
    if (!client) {
      return null;
    }

    return {
      createdAt: client.createdAt,
      email: client.email,
      firstName: client.firstName,
      id: client.id,
      lastName: client.lastName,
      updatedAt: client.updatedAt,
    };
  }

  async getByID(id: string): Promise<SafeClient | null> {
    // Get the cached client.
    const cachedClient = await this.redis.get(`client:${id}`);

    // Return the cached client.
    if (cachedClient) {
      return JSON.parse(cachedClient);
    }

    // Get the client.
    const client = await this.db.client.findUnique({
      where: { id },
    });
    const safeClient = this.makeSafeClient(client);

    // Save to cache.
    await this.redis.set(`client:${id}`, JSON.stringify(safeClient));

    // Return the client.
    return safeClient;
  }

  async create(data: NewClientInput): Promise<SafeClient | null> {
    // Validate the input.
    const cleanedInput = this.cleanCreateInput(data);
    this.validateCreateInput(cleanedInput);

    // Hash the password.
    cleanedInput.password = await bcrypt.hash(cleanedInput.password, 10);

    try {
      // Create the client.
      const client = await this.db.client.create({
        data: cleanedInput,
      });

      // Return the client.
      return this.makeSafeClient(client);
    } catch (error) {
      return this.handleClientError(error);
    }
  }

  async updateByID(
    id: string,
    data: UpdateClientInput
  ): Promise<SafeClient | null> {
    // Validate the input.
    const cleanedInput: UpdateClientInput = this.cleanUpdateInput(data);
    this.validateUpdateInput(cleanedInput);

    try {
      // Update the client.
      const client = await this.db.client.update({
        data: cleanedInput,
        where: { id },
      });

      // Return the client.
      return this.makeSafeClient(client);
    } catch (error) {
      return this.handleClientError(error);
    }
  }
}

export default ClientService;
