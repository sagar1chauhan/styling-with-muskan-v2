import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function issueToken(userId) {
  const token = jwt.sign(
    { sub: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
  return token;
}
