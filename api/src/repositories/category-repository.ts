import { prisma } from "../lib/prisma.js";

class CategoryRepository {
  async update(id: string, name: string) {
    return prisma.category.update({ where: { id }, data: { name } });
  }

  async create(name: string) {
    return prisma.category.create({ data: { name } });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }

  async findAll() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }
}

export default new CategoryRepository();
