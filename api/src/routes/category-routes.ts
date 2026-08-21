import { Router } from "express";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";
import CategoryController from "../controllers/category-controller.js";

const router = Router();

router.post("/", ensureAuthenticated, CategoryController.create);
router.get("/", CategoryController.findAll);

export default router;
