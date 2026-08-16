import express from "express";
import authRoutes from "./routes/auth-routes.js";

import errorHandler from "./middlewares/error-handler.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Running",
  });
});

export default app;
