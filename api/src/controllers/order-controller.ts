import type { Request, Response } from "express";
import orderService from "../services/order-service.js";

import { orderIdSchema, trackingCodeSchema } from "../validators/params-validator.js";

class OrderController {
  async create(req: Request, res: Response) {
    const order = await orderService.create(req.body);

    return res.status(201).json(order);
  }

  async findActive(req: Request, res: Response) {
    const orders = await orderService.findActive();

    return res.status(200).json(orders);
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const parsedId = orderIdSchema.parse(req.params.id);

    const order = await orderService.findById(parsedId);

    return res.status(200).json(order);
  }

  async updateOrderStatus(req: Request<{ id: string }>, res: Response) {
    const parsedId = orderIdSchema.parse(req.params.id);

    const updatedOrder = await orderService.updateOrderStatus(
      parsedId,
      req.body,
    );

    return res.status(200).json(updatedOrder);
  }

  async findByTrackingCode(
    req: Request<{ trackingCode: string }>,
    res: Response,
  ) {
    const order = await orderService.findByTrackingCode(
      trackingCodeSchema.parse(req.params.trackingCode),
    );

    return res.status(200).json(order);
  }

  async findHistory(req: Request, res: Response) {
    const orders = await orderService.findHistory();

    return res.status(200).json(orders);
  }
}

export default new OrderController();
