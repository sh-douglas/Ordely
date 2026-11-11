import AppError from "../errors/app-error.js";
import categoryRepository from "../repositories/category-repository.js";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "../validators/category-validator.js";

class CategoryService {
  async update(id: string, data: CreateCategoryInput) {
    const parsedData = createCategorySchema.parse(data);
    if (!(await categoryRepository.findById(id))) {
      throw new AppError("Category not found.", 404);
    }
    const existing = await categoryRepository.findByName(parsedData.name);
    if (existing && existing.id !== id) {
      throw new AppError("This category already exists.", 409);
    }
    return categoryRepository.update(id, parsedData.name);
  }

  async create(data: CreateCategoryInput) {
    const parsedData = createCategorySchema.parse(data);

    const existingCategory = await categoryRepository.findByName(
      parsedData.name,
    );

    if (existingCategory) {
      throw new AppError("This category already exists.", 409);
    }

    const newCategory = await categoryRepository.create(parsedData.name);

    return newCategory;
  }

  async findAll() {
    const categories = await categoryRepository.findAll();

    return categories;
  }
}

export default new CategoryService();
