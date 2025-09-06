const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  type: { String, enum: ["admin", "customer"], default: "customer" },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
