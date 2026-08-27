import { Router } from "express";
import orderController from "../controllers/order-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";
const router = Router();

router.post("/", orderController.create);
router.get("/", ensureAuthenticated, orderController.findActive);

export default router;
