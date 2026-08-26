import AppError from "../errors/app-error.js";
import categoryRepository from "../repositories/category-repository.js";
import productRepository from "../repositories/product-repository.js";
import {
  createProductSchema,
  updateProductAvailableSchema,
  type CreateProductInput,
  type UpdateProductAvailableInput,
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

  async updateAvailability(id: string, data: UpdateProductAvailableInput) {
    const parsedData = updateProductAvailableSchema.parse(data);

    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    const updatedProduct = await productRepository.updateAvailability(
      id,
      parsedData.available,
    );

    return updatedProduct;
  }
}

export default new ProductService();
