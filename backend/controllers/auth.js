import bcrypt from "bcryptjs";
import User from "../models/user.js";

const isStrongPassword = (pw) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/.test(pw);

// SIGNUP
export async function signup(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailNorm = String(email).toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(emailNorm)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be ≥6 chars and include uppercase, lowercase, number, and special character (!@#$%^&*).",
      });
    }

    const exists = await User.findOne({ email: emailNorm }).lean();
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: emailNorm,
      phone,
      passwordHash,
      role: "user",
    });

    // prepare payload for middleware
    req.authUserId = user._id;
    res.locals.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    res.locals.message = "Signed up successfully";
    res.locals.statusCode = 201;
    return next(); // -> issueAuthCookie
  } catch (err) {
    if (
      err?.code === 11000 &&
      (err?.keyPattern?.email || err?.keyValue?.email)
    ) {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// LOGIN
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailNorm = String(email).toLowerCase().trim();
    // passwordHash is select:false in model → include it
    const user = await User.findOne({ email: emailNorm })
      .select("+passwordHash")
      .lean();
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok)
      return res.status(401).json({ message: "Invalid email or password" });

    // last login (fire-and-forget, no need to await)
    User.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    ).catch(() => {});

    req.authUserId = user._id;
    res.locals.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    res.locals.message = "Logged in successfully";
    return next(); // -> issueAuthCookie
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// (example) Get current user from cookie-auth
export async function me(req, res) {
  // requireAuth middleware sets req.user.id
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.json(null);
  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
}

export async function addAddress(req, res) {
  try {
    const userId = req.user.id;
    const { label, line1, line2, city, state, zip, country, phone } = req.body;

    if (!line1 || !city || !state || !zip) {
      return res.status(400).json({ message: "Address fields are required" });
    }

    const address = {
      label: label ? label.trim() : "Home",
      line1: line1.trim(),
      line2: line2 ? line2.trim() : "",
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country ? country.trim() : "IN",
      phone: phone ? phone.trim() : "",
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push(address);
    await user.save();

    return res
      .status(201)
      .json({ addresses: user.addresses }, { message: "Address added" });
  } catch (err) {
    console.error("addAddress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
export async function addAvatar(req, res) {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    ).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ avatarUrl: user.avatarUrl }, { message: "Avatar updated" });
  } catch (err) {
    console.error("addAvatar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
