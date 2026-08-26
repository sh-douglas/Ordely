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

  async findByIds(productIds: string[]) {
    return prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });
  }
}

export default new ProductRepository();
