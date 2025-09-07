import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoute from "./routers/auth.js";
import productRoutes from "./routers/product.js";
import orderRoutes from "./routers/orders.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",")
      : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
import cartRoutes from "./routers/cart.js";
app.use("/api/cart", cartRoutes);

connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
