import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String },
    color: { type: String },
    size: { type: String },
    stock: { type: Number, min: 0, default: 5 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, index: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    description: { type: String }, // shown on product page
    keywords: [{ type: String }], // optional: hidden aliases for search

    price: { type: Number, required: true, min: 0, index: true },
    mrp: { type: Number, min: 0 }, // for strike-through
    stock: { type: Number, min: 0, default: 0, index: true },
    variants: [VariantSchema],

    images: { type: [ImageSchema], default: [] },
    thumb: { type: String }, // main card image

    ratingAvg: { type: Number, min: 0, max: 5, default: 0, index: true },
    ratingCount: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },

    popularity: { type: Number, default: 0, index: true }, // for sorting
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);
ProductSchema.virtual("discountPercent").get(function () {
  if (!this.mrp || this.mrp <= 0) return 0;
  return Math.max(0, Math.round((1 - this.price / this.mrp) * 100));
});

ProductSchema.virtual("inStock").get(function () {
  const base = this.stock || 0;
  const v = (this.variants || []).reduce((s, x) => s + (x.stock || 0), 0);
  return base + v > 0;
});

ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ brand: 1, price: 1 });
ProductSchema.index({ isActive: 1, stock: -1 });
ProductSchema.index({ popularity: -1 });
export default mongoose.model("Product", ProductSchema);
