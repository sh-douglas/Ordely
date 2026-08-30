import { Router } from "express";
import orderController from "../controllers/order-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";
const router = Router();

router.post("/", orderController.create);
router.get("/", ensureAuthenticated, orderController.findActive);
router.get("/:id", ensureAuthenticated, orderController.findById);
router.get("/track/:trackingCode", orderController.findByTrackingCode);
router.patch("/:id/status", orderController.updateOrderStatus);

export default router;
