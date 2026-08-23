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

  async findAvailable() {
    return prisma.product.findMany({
      orderBy: [
        {
          category: {
            name: "asc",
          },
        },
        {
          name: "asc",
        },
      ],
      where: { available: true },
      include: { category: true },
    });
  }

  async findAll() {
    return prisma.product.findMany();
  }
}

export default new ProductRepository();
