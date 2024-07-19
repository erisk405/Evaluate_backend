const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    await User.createUser(req.body);
    res.status(201).json({ message: "User registered success !!!" });
  } catch (error) {
    res.status(500).json({ message: "Error registered user!" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: "1h",
    });
    res.cookie('token', token,{
      maxAge: 300000,
      secure: true,
      httpOnly: true,
      sameSite: "none"
    })
    res.json({ message: 'Login Success' });
  } catch (error) {
    res.status(500).json({message:"Error logging in"});
  }
};

module.exports = {
    register,
    login
}