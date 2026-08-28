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

  async findActive(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.findActive();

      return res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parsedId = Number(req.params.id);
      const order = await orderService.findById(parsedId);

      return res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
