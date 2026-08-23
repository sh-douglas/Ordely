import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app-error.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  next(new AppError("Route not found.", 404));
  return;
}
