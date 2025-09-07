// routes/cartRoutes.js
import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  addItemToCart,
  getCart,
  removeItemFromCart,
  // clearCart,
  placeOrder,
} from "../controllers/cart.js";

const router = express.Router();

router.get("/", requireAuth, getCart);
router.post("/add", requireAuth, addItemToCart);
router.post("/remove", requireAuth, removeItemFromCart);

router.post("/place-order", requireAuth, placeOrder);

export default router;
