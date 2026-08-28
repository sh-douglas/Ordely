import type { Request, Response } from "express";
import categoryService from "../services/category-service.js";

class CategoryController {
  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body);

    return res.status(201).json(category);
  }

  async findAll(req: Request, res: Response) {
    const categories = await categoryService.findAll();

    return res.status(200).json(categories);
  }
}
