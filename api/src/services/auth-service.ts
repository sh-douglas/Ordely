import bcrypt from "bcrypt";

import EmployeeRepository from "../repositories/employee-repository.js";
import {
  signUpSchema,
  type SignUpInput,
} from "../validators/auth-validator.js";
import AppError from "../errors/app-error.js";

class AuthService {
  async signUp(data: SignUpInput) {
    const parsedData = signUpSchema.parse(data);
    const registeredEmployee = await EmployeeRepository.findByEmail(
      parsedData.email,
    );

    if (registeredEmployee) {
      throw new AppError("E-mail already in use", 409);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(parsedData.password, salt);

    const createEmployeeData = {
      name: parsedData.name,
      email: parsedData.email,
      passwordHash,
    };

    const employee = await EmployeeRepository.create(createEmployeeData);

    const publicEmployeeData = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };

    return publicEmployeeData;
  }
}

export default new AuthService();
