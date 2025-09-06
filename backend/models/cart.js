import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantSku: { type: String },
    title: { type: String, required: true },
    thumb: { type: String },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1, default: 1 },
    meta: { type: Map, of: String }, //{ color:'Red', size:'M' }
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [CartItemSchema], default: [] },
    
  },
  { timestamps: true }
);

CartSchema.virtual("subtotal").get(function () {
  return (this.items || []).reduce((s, it) => s + it.price * it.qty, 0);
});

export default mongoose.model("Cart", CartSchema);
