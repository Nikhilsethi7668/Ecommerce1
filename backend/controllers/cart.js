import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Order from "../models/Order.js";
import Product from "../models/product.js";

export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, qty = 1, variantSku, meta } = req.body;
    if (!userId || !productId || Number(qty) <= 0)
      return res.status(400).json({ message: "Invalid input" });
    if (!mongoose.isValidObjectId(productId))
      return res.status(400).json({ message: "Invalid product id" });

    const prod = await Product.findById(productId).lean();
    if (!prod || !prod.isActive)
      return res.status(404).json({ message: "Product not found" });

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) userCart = new Cart({ user: userId, items: [] });

    const idx = userCart.items.findIndex(
      (it) =>
        String(it.product) === String(productId) &&
        String(it.variantSku || "") === String(variantSku || "")
    );

    if (idx > -1) {
      userCart.items[idx].qty += Number(qty);
    } else {
      userCart.items.push({
        product: productId,
        variantSku: variantSku || undefined,
        title: prod.title,
        thumb: prod.thumb || prod.images?.[0]?.url || "",
        price: prod.price,
        qty: Number(qty),
        meta: meta || undefined,
      });
    }

    await userCart.save();
    const populated = await userCart.populate({
      path: "items.product",
      select: "brand ratingAvg ratingCount stock variants",
    });
    res.status(200).json({ cart: populated });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    let userCart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "brand ratingAvg ratingCount stock variants",
    });
    if (!userCart) userCart = new Cart({ user: userId, items: [] });
    res.status(200).json({ cart: userCart });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, variantSku } = req.body;
    if (!userId || !productId)
      return res.status(400).json({ message: "Invalid input" });

    const userCart = await Cart.findOne({ user: userId });
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    userCart.items = userCart.items.filter(
      (it) =>
        !(
          String(it.product) === String(productId) &&
          String(it.variantSku || "") === String(variantSku || "")
        )
    );

    await userCart.save();
    const populated = await userCart.populate({
      path: "items.product",
      select: "brand ratingAvg ratingCount stock variants",
    });
    res.status(200).json({ cart: populated });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { shippingAddress } = req.body;
    if (!shippingAddress)
      return res.status(400).json({ message: "Shipping address required" });

    const userCart = await Cart.findOne({ user: userId });
    if (!userCart || userCart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const prods = new Map();
    for (const it of userCart.items) {
      let prod = prods.get(String(it.product));
      if (!prod) {
        prod = await Product.findById(it.product);
        if (!prod || !prod.isActive)
          return res
            .status(409)
            .json({
              message: "Product unavailable",
              data: { product: String(it.product) },
            });
        prods.set(String(it.product), prod);
      }
      if (it.variantSku) {
        const v = (prod.variants || []).find(
          (x) => String(x.sku) === String(it.variantSku)
        );
        if (!v)
          return res
            .status(409)
            .json({
              message: "Variant not found",
              data: { product: String(it.product), variantSku: it.variantSku },
            });
        if ((v.stock || 0) < it.qty)
          return res
            .status(409)
            .json({
              message: "Insufficient stock",
              data: {
                product: String(it.product),
                variantSku: it.variantSku,
                available: v.stock || 0,
              },
            });
      } else {
        if ((prod.stock || 0) < it.qty)
          return res
            .status(409)
            .json({
              message: "Insufficient stock",
              data: { product: String(it.product), available: prod.stock || 0 },
            });
      }
    }

    for (const it of userCart.items) {
      const prod = prods.get(String(it.product));
      if (it.variantSku) {
        const v = (prod.variants || []).find(
          (x) => String(x.sku) === String(it.variantSku)
        );
        v.stock = (v.stock || 0) - it.qty;
      } else {
        prod.stock = (prod.stock || 0) - it.qty;
      }
      await prod.save();
    }

    const items = userCart.items.map((it) => ({
      product: it.product,
      variantSku: it.variantSku,
      title: it.title,
      price: it.price,
      qty: it.qty,
      thumb: it.thumb,
    }));

    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const order = await Order.create({
      user: userId,
      items,
      amounts: { subtotal, shipping, total },
      shippingAddress,
      status: "created",
    });

    userCart.items = [];
    await userCart.save();

    res.status(201).json({ order });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
