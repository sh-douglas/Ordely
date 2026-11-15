import { Router } from "express";
import authController from "../controllers/auth-controller.js";
import ensureAuthenticated from "../middlewares/ensure-authenticated.js";

import ensureAdmin from "../middlewares/ensure-admin.js";
import { z } from "zod";
import employeeRepository from "../repositories/employee-repository.js";
import AppError from "../errors/app-error.js";
const router = Router();
router.patch(
  "/employees/:id/status",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    const id = z.uuid().parse(req.params.id);
    const { active } = z
      .object({ active: z.boolean() })
      .strict()
      .parse(req.body);
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new AppError("Employee not found.", 404);
    if (employee.role === "ADMIN")
      throw new AppError(
        "Administrator accounts cannot be deactivated here.",
        409,
      );
    res.json(await employeeRepository.setActive(id, active));
  },
);

router.post("/signin", authController.signIn);
router.post("/signup", ensureAuthenticated, ensureAdmin, authController.signUp);

router.get(
  "/employees",
  ensureAuthenticated,
  ensureAdmin,
  authController.findAll,
);

router.get("/me", ensureAuthenticated, authController.me);

export default router;
