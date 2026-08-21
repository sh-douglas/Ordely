import type { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth-service.js";
import AppError from "../errors/app-error.js";

class AuthController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await AuthService.signUp(req.body);
      return res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await AuthService.signIn(req.body);
      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.employeeId) {
        throw new AppError("Unauthorized", 401);
      }

      const employee = await AuthService.me(req.employeeId);
      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
