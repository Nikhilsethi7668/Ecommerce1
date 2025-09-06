import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: "IN" },
    phone: { type: String },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: { type: String, required: true },
    phone: { type: String, index: true, required: true, unique: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    addresses: [AddressSchema],
    defaultAddressIndex: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);
