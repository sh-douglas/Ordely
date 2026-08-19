declare global {
  namespace Express {
    interface Request {
      employeeId?: string;
    }
  }
}

export {};
