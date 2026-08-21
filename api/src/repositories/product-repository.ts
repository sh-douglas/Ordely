import { prisma } from "../lib/prisma.js";

interface ProductCreateData {
  name: string;
  description?: string;
  price: string;
  categoryId: string;
}

class ProductRepository {
  async create(data: ProductCreateData) {
    return prisma.product.create({ data });
  }
}

export default new ProductRepository();
