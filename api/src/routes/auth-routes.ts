import { Router } from "express";
import AuthController from "../controllers/auth-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";

const router = Router();

router.post("/signin", AuthController.signIn);
router.post("/signup", ensureAuthenticated, AuthController.signUp);

router.get("/me", ensureAuthenticated, AuthController.me);

export default router;
