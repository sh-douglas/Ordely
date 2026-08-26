import type { Request, Response, NextFunction } from "express";
import productService from "../services/product-service.js";

class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);

      return res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async findAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.findAvailable();

      return res.status(201).json(products);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.findAll();

      return res.status(201).json(products);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
