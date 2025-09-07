import express from "express";
import { signup, login, addAddress } from "../controllers/auth.js";
import { requireAuth, logout } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/add-address", requireAuth, addAddress);
router.post("/logout", requireAuth, logout);

export default router;
