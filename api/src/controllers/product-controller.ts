import type { Request, Response, NextFunction } from "express";
import ProductService from "../services/product-service.js";

class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create(req.body);

      return res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.findAll();

      return res.status(201).json(products);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
