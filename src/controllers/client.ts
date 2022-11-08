// Node modules.
import { NextFunction, Request, Response } from "express";
// Relative modules.
import ClientService from "../services/client";
import { CustomRequest } from "../types";

class ClientController {
  private clientService: ClientService;

  constructor(clientService: ClientService) {
    this.clientService = clientService;

    this.getMe = this.getMe.bind(this);
    this.create = this.create.bind(this);
    this.updateMe = this.updateMe.bind(this);
  }

  async getMe(req: CustomRequest, res: Response): Promise<void> {
    if (!req.client) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const client = await this.clientService.getByID(req.client.id);

    res.json(client);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await this.clientService.create(req.body);

      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.client) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const client = await this.clientService.updateByID(
        req.client.id,
        req.body
      );

      res.json(client);
    } catch (error) {
      next(error);
    }
  }
}

export default ClientController;
