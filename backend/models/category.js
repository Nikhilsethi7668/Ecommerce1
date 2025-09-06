import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: { type: String },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    subcategories: [SubcategorySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
