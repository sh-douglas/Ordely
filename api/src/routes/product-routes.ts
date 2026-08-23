import { Router } from "express";
import ProductController from "../controllers/product-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";

const router = Router();

router.post("/", ensureAuthenticated, ProductController.create);
router.get("/menu", ProductController.findAvailable);
router.get("/inventory", ensureAuthenticated, ProductController.findAll);

export default router;
