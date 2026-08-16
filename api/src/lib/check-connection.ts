import { prisma } from "./prisma.js";

async function checkConnection() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database successfully connected!");
  } catch (error) {
    console.error("Error connecting to the database.", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
