import type { Request, Response, NextFunction } from "express";
import OrderService from "../services/order-service.js";

class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.create(req.body);
      return res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
