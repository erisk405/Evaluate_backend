const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.jwtSecret, async (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
    const { id, role } = await User.findUserById(decoded.id);
    req.userId = id;
    req.role = role.role_name;
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
