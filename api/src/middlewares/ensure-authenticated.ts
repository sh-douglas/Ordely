import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app-error.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import EmployeeRepository from "../repositories/employee-repository.js";

export default async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  let decoded;
  if (!header) {
    next(new AppError("Unauthorized.", 401));
    return;
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer") {
    next(new AppError("Unauthorized.", 401));
    return;
  }

  if (!token) {
    next(new AppError("Unauthorized.", 401));
    return;
  }

  try {
    decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === "string") {
      next(new AppError("Invalid or expired token", 401));
      return;
    }
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
    return;
  }

  if (!decoded.sub) {
    next(new AppError("Invalid or expired token", 401));
    return;
  }

  const sub = decoded.sub;

  const employee = await EmployeeRepository.findById(sub);

  if (!employee) {
    next(new AppError("Invalid or expired token", 401));
    return;
  }

  req.employeeId = employee.id;

  next();
}
