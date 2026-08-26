import type { Request, Response, NextFunction } from "express";
import categoryService from "../services/category-service.js";

class CategoryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      return res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.findAll();

      return res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
