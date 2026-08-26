import AppError from "../errors/app-error.js";
import categoryRepository from "../repositories/category-repository.js";
import productRepository from "../repositories/product-repository.js";
import {
  createProductSchema,
  type CreateProductInput,
} from "../validators/product-validator.js";

class ProductService {
  async create(data: CreateProductInput) {
    const parsedData = createProductSchema.parse(data);

    const existingCategory = await categoryRepository.findById(
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

    const newProduct = await productRepository.create(productData);

    return newProduct;
  }

  async findAvailable() {
    const products = await productRepository.findAvailable();

    return products;
  }

  async findAll() {
    const products = await productRepository.findAll();

    return products;
  }
}

export default new ProductService();
