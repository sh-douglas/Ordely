import type { Request, Response, NextFunction } from "express";
import orderService from "../services/order-service.js";

class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create(req.body);
      return res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
