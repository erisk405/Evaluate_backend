const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");
const User = require("../models/userModel");

const tokenExpiresIn = 3600; 
const cookieMaxAge = tokenExpiresIn * 1000; 

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
      expiresIn: tokenExpiresIn+'s',
    });
    res.cookie('token', token,{
      maxAge: cookieMaxAge,
      secure: true,
      httpOnly: true,
      sameSite: "none"
    })
    res.json({ message: 'Login Success' });
  } catch (error) {
    res.status(500).json({message:"Error logging in"});
  }
};


const logout = (req, res) => {
  try {
    res.clearCookie('token', { path: '/', secure: true, sameSite: 'none' });
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out' });
  }
};

module.exports = {
    register,
    login,
    logout
}