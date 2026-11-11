import type { Request, Response } from "express";
import { z } from "zod";
import categoryService from "../services/category-service.js";

class CategoryController {
  async update(req: Request<{ id: string }>, res: Response) {
    const id = z
      .string()
      .uuid("Category ID must be a valid UUID.")
      .parse(req.params.id);
    return res.status(200).json(await categoryService.update(id, req.body));
  }

  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body);

    return res.status(201).json(category);
  }

  async findAll(req: Request, res: Response) {
    const categories = await categoryService.findAll();

    return res.status(200).json(categories);
  }
}

export default new CategoryController();
