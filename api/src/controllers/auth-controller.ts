import type { Request, Response } from "express";
import authService from "../services/auth-service.js";
import AppError from "../errors/app-error.js";

class AuthController {
  async signUp(req: Request, res: Response) {
    const employee = await authService.signUp(req.body);

    return res.status(201).json(employee);
  }

  async signIn(req: Request, res: Response) {
    const employee = await authService.signIn(req.body);

    return res.status(200).json(employee);
  }

  async me(req: Request, res: Response) {
    if (!req.employeeId) {
      throw new AppError("Unauthorized", 401);
    }

    const employee = await authService.me(req.employeeId);

    return res.status(200).json(employee);
  }
}

export default new AuthController();
