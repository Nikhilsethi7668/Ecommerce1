import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { issueAuthCookie } from "../middlewares/auth.js";

const isStrongPassword = (pw) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/.test(pw);

const sanitize = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});

export async function signup(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: "All fields are required" });
    const emailNorm = String(email).toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(emailNorm))
      return res.status(400).json({ message: "Invalid email address" });
    if (!/^\d{10}$/.test(String(phone)))
      return res.status(400).json({ message: "Invalid phone number" });
    if (!isStrongPassword(password))
      return res
        .status(400)
        .json({
          message:
            "Password must be ≥6 chars and include uppercase, lowercase, number, and special character (!@#$%^&*).",
        });

    const dup = await User.findOne({
      $or: [{ email: emailNorm }, { phone }],
    }).lean();
    if (dup) {
      const which = dup.email === emailNorm ? "Email" : "Phone";
      return res.status(409).json({ message: `${which} already in use` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: emailNorm,
      phone,
      passwordHash,
      role: "user",
    });
    issueAuthCookie(res, user._id);
    return res.status(201).json({ message: "Signed up", user: sanitize(user) });
  } catch (err) {
    if (err?.code === 11000) {
      const field = err?.keyPattern?.email
        ? "Email"
        : err?.keyPattern?.phone
        ? "Phone"
        : "Field";
      return res.status(409).json({ message: `${field} already in use` });
    }
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    const emailNorm = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailNorm });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );
    issueAuthCookie(res, user._id);
    return res.json({ success: true, message: "Logged in", user: sanitize(user) });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function addAddress(req, res) {
  try {
    const userId = req.user.id;
    const { label, line1, line2, city, state, zip, country, phone } = req.body;
    if (!line1 || !city || !state || !zip)
      return res.status(400).json({ message: "Address fields are required" });

    const address = {
      label: label ? String(label).trim() : "Home",
      line1: String(line1).trim(),
      line2: line2 ? String(line2).trim() : "",
      city: String(city).trim(),
      state: String(state).trim(),
      zip: String(zip).trim(),
      country: country ? String(country).trim() : "IN",
      phone: phone ? String(phone).trim() : "",
    };

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.addresses)) user.addresses = [];
    user.addresses.push(address);
    await user.save();

    return res
      .status(201)
      .json({ message: "Address added", addresses: user.addresses });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
}
