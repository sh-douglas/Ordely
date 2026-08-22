import AppError from "../errors/app-error.js";
import CategoryRepository from "../repositories/category-repository.js";
import ProductRepository from "../repositories/product-repository.js";
import {
  createProductSchema,
  type CreateProductInput,
} from "../validators/product-validator.js";

class ProductService {
  async create(data: CreateProductInput) {
    const parsedData = createProductSchema.parse(data);

    const existingCategory = await CategoryRepository.findById(
      parsedData.categoryId,
    );

    if (!existingCategory) {
      throw new AppError("Category not found.", 404);
    }

    const productData = {
      name: parsedData.name,
      ...(parsedData.description && { description: parsedData.description }),
      price: parsedData.price,
      categoryId: existingCategory.id,
    };

    const newProduct = await ProductRepository.create(productData);

    return newProduct;
  }
}

export default new ProductService();
