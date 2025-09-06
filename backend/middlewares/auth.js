// middlewares/auth.js
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "token";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function issueAuthCookie(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { sub } = jwt.verify(token, JWT_SECRET);
    req.user = { id: sub };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
}
