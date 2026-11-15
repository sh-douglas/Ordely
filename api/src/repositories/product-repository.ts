import type { UpdateProductInput } from "../validators/product-validator.js";
import { prisma } from "../lib/prisma.js";

interface ProductCreateData {
  name: string;
  description?: string;
  price: string;
  categoryId: string;
  imageUrl?: string;
}

class ProductRepository {
  async remove(id: string) {
    return prisma.product.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), available: false },
    });
  }
  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id, deletedAt: null },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });
  }

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
      where: { available: true, deletedAt: null },
      include: { category: true },
    });
  }

  async findAll() {
    return prisma.product.findMany({ where: { deletedAt: null } });
  }

  async findByIds(productIds: string[]) {
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        id: {
          in: productIds,
        },
      },
    });
  }

  async updateAvailability(id: string, available: boolean) {
    return prisma.product.update({
      where: { id, deletedAt: null },
      data: {
        available,
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({ where: { id, deletedAt: null } });
  }
}

export default new ProductRepository();
