import { Router } from "express";
import authController from "../controllers/auth-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";

const router = Router();

router.post("/signin", authController.signIn);
router.post("/signup", ensureAuthenticated, authController.signUp);

router.get("/me", ensureAuthenticated, authController.me);

export default router;
