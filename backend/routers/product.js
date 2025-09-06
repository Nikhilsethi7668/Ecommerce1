import express from "express";
import {
  getHome,
  searchProducts,
  getProductsByCategory,
  getProductDetails,
  getAllCategories,
} from "../controllers/product.js";

const router = express.Router();

router.get("/home", getHome);
router.get("/categories", getAllCategories);
router.get("/categories/:categoryId/products", getProductsByCategory);
router.get("/products", searchProducts);
router.get("/products/:id", getProductDetails);

export default router;
