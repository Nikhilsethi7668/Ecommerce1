import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Issue JWT into an HttpOnly cookie and send the prepared payload
export function issueAuthCookie(req, res) {
  const userId = req.authUserId;
  if (!userId)
    return res.status(500).json({ message: "Auth issue: missing userId" });

  const token = jwt.sign({ sub: String(userId) }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // set true on HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Send the user payload that controller put in res.locals
  const status = res.locals.statusCode || 200;
  const message = res.locals.message || "OK";
  return res.status(status).json({ message, user: res.locals.user });
}

// Read token from cookie, verify, attach req.user.id
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { sub } = jwt.verify(token, JWT_SECRET);
    req.user = { id: sub };
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Clear the cookie
export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({ message: "Logged out" });
}
