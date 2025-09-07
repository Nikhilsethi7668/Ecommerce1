import mongoose from "mongoose";
import Product from "../models/product.js";
import Category from "../models/category.js";

const num = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildProductFilter = (q, brand, tags, minPrice, maxPrice) => {
  const filter = { isActive: true };
  const and = [];

  if (q) {
    and.push({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { keywords: { $elemMatch: { $regex: q, $options: "i" } } },
        { tags: { $elemMatch: { $regex: q, $options: "i" } } },
      ],
    });
  }

  if (brand) {
    const terms = String(brand)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (terms.length) {
      and.push({
        $or: terms.flatMap((t) => {
          const rx = new RegExp(`\\b${escapeRegExp(t)}`, "i");
          return [
            { brand: { $regex: rx } },
            { title: { $regex: rx } },
            { keywords: { $elemMatch: { $regex: rx } } },
          ];
        }),
      });
    }
  }

  if (tags) {
    filter.tags = {
      $in: String(tags)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }

  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = Number(minPrice);
    if (maxPrice != null) filter.price.$lte = Number(maxPrice);
  }

  if (and.length) filter.$and = and;
  return filter;
};

export const getHome = async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    const categories = await Promise.all(
      cats.map(async (c) => {
        const products = await Product.find({ category: c._id, isActive: true })
          .sort({ popularity: -1, createdAt: -1 })
          .limit(10)
          .lean();
        return { ...c, products };
      })
    );
    res.status(200).json({ categories });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "20",
      sort = "-createdAt",
      q,
      brand,
      tags,
      minPrice,
      maxPrice,
      categoryId,
    } = req.query;

    const p = Math.max(num(page, 1), 1);
    const l = Math.min(Math.max(num(limit, 20), 1), 100);

    const filter = buildProductFilter(q, brand, tags, minPrice, maxPrice);
    if (categoryId && mongoose.isValidObjectId(categoryId))
      filter.category = categoryId;

    const total = await Product.countDocuments(filter);
    const data = await Product.find(filter)
      .sort(sort)
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    res.status(200).json({
      data,
      meta: { total, page: p, pages: Math.ceil(total / l), limit: l },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId);
    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const {
      page = "1",
      limit = "20",
      sort = "-createdAt",
      q,
      brand,
      tags,
      minPrice,
      maxPrice,
    } = req.query;

    const p = Math.max(num(page, 1), 1);
    const l = Math.min(Math.max(num(limit, 20), 1), 100);

    const filter = {
      ...buildProductFilter(q, brand, tags, minPrice, maxPrice),
      category: categoryId,
    };
    console.log(filter);

    const total = await Product.countDocuments(filter);
    console.log(total);
    const data = await Product.find(filter)
      .sort(sort)
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    res.status(200).json({
      data,
      meta: { total, page: p, pages: Math.ceil(total / l), limit: l },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product id" });

    const product = await Product.findById(id)
      .populate("category", "_id name")
      .lean();
    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, product });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean()
      .populate("subcategories", "_id name");
    res.status(200).json(cats);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
