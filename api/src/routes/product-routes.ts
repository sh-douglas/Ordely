import { Router } from "express";
import productController from "../controllers/product-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";

const router = Router();

router.post("/", ensureAuthenticated, productController.create);
router.get("/menu", productController.findAvailable);
router.get("/inventory", ensureAuthenticated, productController.findAll);
router.patch(
  "/:id/availability",
  ensureAuthenticated,
  productController.updateAvailability,
);

export default router;
