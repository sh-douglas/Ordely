import type { Request, Response } from "express";
import productService from "../services/product-service.js";

class ProductController {
  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);

    return res.status(201).json(product);
  }

  async findAvailable(req: Request, res: Response) {
    const products = await productService.findAvailable();

    return res.status(201).json(products);
  }

  async findAll(req: Request, res: Response) {
    const products = await productService.findAll();

    return res.status(201).json(products);
  }

  async updateAvailability(req: Request<{ id: string }>, res: Response) {
    const product = await productService.updateAvailability(
      req.params.id,
      req.body,
    );

    return res.status(200).json(product);
  }
}

export default new ProductController();
