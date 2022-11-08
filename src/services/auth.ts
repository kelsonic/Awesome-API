// Node modules.
import bcrypt from "bcrypt";
import isEmail from "isemail";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { assert, object, string, size, refine } from "superstruct";
// Relative modules.
import { CustomError } from "../types";

class AuthService {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;

    this.generateToken = this.generateToken.bind(this);
  }

  private handleError(error: Error | CustomError | unknown): null {
    const customError = error as CustomError;

    // Validation errors.
    if (customError?.failures) {
      customError.status = 400;
      customError.customMessage = customError.message;
    }

    // Authorization error.
    if (customError.message === "Unauthorized") {
      customError.status = 401;
      customError.customMessage = "Unauthorized";
    }

    // Throw the error.
    throw customError;
  }

  private validateGenerateTokenInput(input: {
    email: string;
    password: string;
  }): void {
    try {
      assert(
        input,
        object({
          email: refine(string(), "email", (v) => isEmail.validate(v)),
          password: size(string(), 7, 30),
        })
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateToken(
    email: string,
    password: string
  ): Promise<string | undefined> {
    // Validate the input.
    this.validateGenerateTokenInput({ email, password });

    // Find the client.
    const client = await this.db.client.findUnique({
      where: {
        email,
      },
    });

    // If there is no client, return an error.
    if (!client) {
      this.handleError(new Error("Unauthorized"));
      return;
    }

    // Compare the password.
    const isPasswordCorrect = await bcrypt.compare(password, client.password);

    // If the password is incorrect, return an error.
    if (!isPasswordCorrect) {
      this.handleError(new Error("Unauthorized"));
      return;
    }

    // If there is no JWT_SECRET, return an error.
    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET is not defined.", process.env.JWT_SECRET);
      throw new Error("Internal server error");
    }

    // Generate a token.
    const token = jwt.sign(client, process.env.JWT_SECRET);

    // Send the token.
    return token;
  }
}

export default AuthService;
