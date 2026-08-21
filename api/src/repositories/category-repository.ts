import { prisma } from "../lib/prisma.js";

class CategoryRepository {
  async create(name: string) {
    return prisma.category.create({ data: { name } });
  }
  async findByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }
}

export default new CategoryRepository();
