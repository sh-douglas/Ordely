import { Router } from "express";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";
import categoryController from "../controllers/category-controller.js";

const router = Router();

router.post("/", ensureAuthenticated, categoryController.create);
router.get("/", categoryController.findAll);

export default router;
