import { Router } from "express";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";
import categoryController from "../controllers/category-controller.js";

const router = Router();

router.patch("/:id", ensureAuthenticated, categoryController.update);

router.post("/", ensureAuthenticated, categoryController.create);
router.get("/", categoryController.findAll);

export default router;
