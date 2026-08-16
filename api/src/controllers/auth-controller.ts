import type { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth-service.js";

class AuthController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await AuthService.signUp(req.body);
      return res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
