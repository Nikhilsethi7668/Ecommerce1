import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(products);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
