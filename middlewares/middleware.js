const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  const role = req.role;
  if (!role) return res.status(403).json({ message: "No role provided" });
  if (role !== "admin") {
    return res.status(403).json({ message: "No permission for admin only!" });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
