import { prisma } from "../lib/prisma.js";

interface EmployeeCreateData {
  name: string;
  email: string;
  passwordHash: string;
}

class EmployeeRepository {
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
