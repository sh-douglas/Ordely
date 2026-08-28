import { Router } from "express";
import orderController from "../controllers/order-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";
const router = Router();

router.post("/", orderController.create);
router.get("/", ensureAuthenticated, orderController.findActive);
router.get("/:id", ensureAuthenticated, orderController.findById);
router.patch(
  "/:id/status",
  ensureAuthenticated,
  orderController.updateOrderStatus,
);

export default router;
