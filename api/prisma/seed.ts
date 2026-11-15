import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";
const email = process.env.ADMIN_EMAIL ?? "admin@ordely.local";
const password = process.env.ADMIN_PASSWORD;
try {
  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN" || !existing.active)
      throw new Error(
        "Existing email is not an active admin; no account was changed.",
      );
    console.log(`Admin already exists: ${email}. Password preserved.`);
  } else {
    if (!password || password.length < 12)
      throw new Error("Set ADMIN_PASSWORD with at least 12 characters.");
    await prisma.employee.create({
      data: {
        name: process.env.ADMIN_NAME ?? "Administrador Ordely",
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "ADMIN",
        active: true,
      },
    });
    console.log(`Admin created: ${email}`);
  }
} finally {
  await prisma.$disconnect();
}
