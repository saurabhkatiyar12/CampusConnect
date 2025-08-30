const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Authentication middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided, authorization denied ❌" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token ❌" });
  }
}

// ✅ Role authorization middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized ❌" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Forbidden: Access denied ❌" });
    }
    next();
  };
}

module.exports = { authMiddleware, authorizeRoles };
