// Node modules.
import { NextFunction, Request, Response } from "express";
// Relative modules.
import AuthService from "../services/auth";

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;

    this.login = this.login.bind(this);
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = await this.authService.generateToken(
        req.body.email,
        req.body.password
      );

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
