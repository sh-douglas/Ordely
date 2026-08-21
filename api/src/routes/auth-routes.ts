import { Router } from "express";
import AuthController from "../controllers/auth-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";

const router = Router();

router.post("/signup", AuthController.signUp);
router.post("/signin", AuthController.signIn);

router.get("/me", ensureAuthenticated, AuthController.me);

export default router;
