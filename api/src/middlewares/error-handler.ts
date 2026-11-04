import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import AppError from "../errors/app-error.js";
import { Prisma } from "../generated/prisma/client.js";

const bodyErrors: Record<string, { status: number; message: string }> = {
  "entity.parse.failed": { status: 400, message: "Request body must be valid JSON." },
  "entity.too.large": { status: 413, message: "Request body is too large." },
  "charset.unsupported": { status: 415, message: "Request charset is not supported." },
  "encoding.unsupported": { status: 415, message: "Request encoding is not supported." },
  "request.aborted": { status: 400, message: "Request was aborted." },
  "request.size.invalid": { status: 400, message: "Request body size does not match Content-Length." },
};

const databaseErrors: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: "A record with these unique fields already exists." },
  P2003: { status: 409, message: "The operation conflicts with a related record." },
  P2025: { status: 404, message: "Record not found." },
};

function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (
    "type" in error &&
    typeof error.type === "string" &&
    Object.hasOwn(bodyErrors, error.type)
  ) {
    const bodyError = bodyErrors[error.type]!;
    res.status(bodyError.status).json({ error: bodyError.message });
    return;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    Object.hasOwn(databaseErrors, error.code)
  ) {
    const databaseError = databaseErrors[error.code]!;
    res.status(databaseError.status).json({ error: databaseError.message });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  } else if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    res.status(400).json({ error: firstIssue?.message || "Invalid fields." });
    return;
  } else {
    console.error(error);
    res.status(500).json({
      error: "An error occurred with your request. Please try again later.",
    });
    return;
  }
}

export default errorHandler;
