import { prisma } from "../lib/prisma.js";

interface EmployeeCreateData {
  name: string;
  email: string;
  passwordHash: string;
}

class EmployeeRepository {
  async findAll() {
    return prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  }

  async create(data: EmployeeCreateData) {
    return prisma.employee.create({ data });
  }

  async findByEmail(email: string) {
    return prisma.employee.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.employee.findUnique({ where: { id } });
  }
}

export default new EmployeeRepository();
