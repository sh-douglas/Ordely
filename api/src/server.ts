import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

async function startServer() {
  try {
    await prisma.$connect();
    app.listen(env.PORT, () => {
      console.log(`App is running on port ${env.PORT}.`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();
