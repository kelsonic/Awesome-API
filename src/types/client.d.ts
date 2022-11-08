// Node modules.
import { Client } from "@prisma/client";

export interface SafeClient extends Omit<Client, "password"> {}

export type NewClientInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type UpdateClientInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
};
