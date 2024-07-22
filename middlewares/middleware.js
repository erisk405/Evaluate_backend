const jwt = require("jsonwebtoken");
const config = require("../config");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err){
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
};
const verifyAdmin = (req,res,next)=>{
  const role = req.role
  if(!role) return res.status(403).json({ message: "No role provided" });
  if(role !== 'admin'){
    return res.status(403).json({ message: "No permission for admin only!" });
  }
  next();
}


module.exports = {
    verifyToken,
    verifyAdmin
};