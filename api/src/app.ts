import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth-routes.js";
import categoryRoutes from "./routes/category-routes.js";
import productRoutes from "./routes/product-routes.js";
import orderRoutes from "./routes/order-routes.js";

import errorHandler from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { env } from "./config/env.js";
import AppError from "./errors/app-error.js";
import { allowedOrigins } from "./config/cors.js";

const app = express();

const origins = allowedOrigins(env.CORS_ORIGIN);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origins.has(origin)) {
      callback(null, true);
    } else {
      callback(new AppError("Origin is not allowed.", 403));
    }
  },
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Running",
  });
});

app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
