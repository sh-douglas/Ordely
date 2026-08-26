import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import employeeRepository from "../repositories/employee-repository.js";
import {
  signUpSchema,
  type SignUpInput,
  signInSchema,
  type SignInInput,
} from "../validators/auth-validator.js";
import AppError from "../errors/app-error.js";
import { env } from "../config/env.js";

class AuthService {
  async signUp(data: SignUpInput) {
    const parsedData = signUpSchema.parse(data);
    const registeredEmployee = await employeeRepository.findByEmail(
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

    const employee = await employeeRepository.create(createEmployeeData);

    const publicEmployeeData = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };

    return publicEmployeeData;
  }

  async signIn(data: SignInInput) {
    const parsedData = signInSchema.parse(data);
    const employee = await employeeRepository.findByEmail(parsedData.email);

    if (!employee) {
      throw new AppError("Invalid credentials.", 401);
    }

    const isPasswordValid = await bcrypt.compare(
      parsedData.password,
      employee.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials.", 401);
    }

    const token = jwt.sign({ sub: employee.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const employeeData = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
    };

    return {
      employee: employeeData,
      token,
    };
  }

  async me(id: string) {
    const employee = await employeeRepository.findById(id);

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

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
