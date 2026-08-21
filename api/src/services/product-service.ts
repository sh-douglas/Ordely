import {
  createProductSchema,
  type CreateProductInput,
} from "../validators/product-validator.js";

class ProductService {
  async create(data: CreateProductInput) {
    const parsedData = createProductSchema.parse(data);
  }
}

export default new ProductService();
