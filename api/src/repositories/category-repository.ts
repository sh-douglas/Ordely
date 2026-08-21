import { prisma } from "../lib/prisma.js";

class CategoryRepository {
  async create(name: string) {
    return prisma.category.create({ data: { name } });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }

  async findAll() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }
}

export default new CategoryRepository();
