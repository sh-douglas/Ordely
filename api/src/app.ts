import express from "express";
import authRoutes from "./routes/auth-routes.js";
import categoryRoutes from "./routes/category-routes.js";
import productRoutes from "./routes/product-routes.js";

import errorHandler from "./middlewares/error-handler.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Running",
  });
});

app.use("/products", productRoutes);
app.use("/category", categoryRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

export default app;
