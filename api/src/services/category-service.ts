import AppError from "../errors/app-error.js";
import CategoryRepository from "../repositories/category-repository.js";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "../validators/category-validator.js";

class CategoryService {
  async create(data: CreateCategoryInput) {
    const parsedData = createCategorySchema.parse(data);

    const existingCategory = await CategoryRepository.findByName(
      parsedData.name,
    );

    if (existingCategory) {
      throw new AppError("This category already exists.", 409);
    }

    const newCategory = await CategoryRepository.create(parsedData.name);

    return newCategory;
  }

  async findAll() {
    const categories = await CategoryRepository.findAll();

    return categories;
  }
}

export default new CategoryService();
