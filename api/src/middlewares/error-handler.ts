import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import AppError from "../errors/app-error.js";

function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  } else if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    res.status(400).json({ error: firstIssue?.message || "Invalid fields." });
    return;
  } else {
    res.status(500).json({
      error: "An error occurred with your request. Please try again later.",
    });
    return;
  }
}

export default errorHandler;
