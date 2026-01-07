
import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid auth header format" });
  }

  try {
    const secret = process.env.JWT_SECRET || "devsecret";
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
