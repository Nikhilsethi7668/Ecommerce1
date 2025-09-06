import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantSku: { type: String },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    thumb: { type: String },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [OrderItemSchema],
    amounts: {
      subtotal: { type: Number, required: true, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    shippingAddress: { type: Object, required: true },
    status: {
      type: String,
      enum: ["created", "paid", "shipped", "delivered", "cancelled"],
      default: "created",
      index: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
