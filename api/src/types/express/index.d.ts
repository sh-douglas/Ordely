declare global {
  namespace Express {
    interface Request {
      employeeId?: string;
      employeeRole?: "ADMIN" | "EMPLOYEE";
    }
  }
}

export {};
