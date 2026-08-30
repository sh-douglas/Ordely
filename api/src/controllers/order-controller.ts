import type { Request, Response } from "express";
import orderService from "../services/order-service.js";

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
    const parsedId = Number(req.params.id);

    const order = await orderService.findById(parsedId);

    return res.status(200).json(order);
  }

  async updateOrderStatus(req: Request<{ id: string }>, res: Response) {
    const parsedId = Number(req.params.id);

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
      req.params.trackingCode,
    );

    return res.status(200).json({
      order,
    });
  }
}

export default new OrderController();
