import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app-error.js";
export default function ensureAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.employeeRole !== "ADMIN")
    return next(new AppError("Administrator access required.", 403));
  next();
}
