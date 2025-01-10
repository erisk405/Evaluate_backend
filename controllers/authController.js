const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const tokenExpiresIn = 36000;
const cookieMaxAge = tokenExpiresIn * 1000;

const register = async (req, res) => {
  try {
    const role = await Role.checkMemberRole();
    await User.createUser(req.body, role);
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
    const token = jwt.sign(
      { id: user.id, role: user.role.role_name },
      process.env.jwtSecret,
      {
        expiresIn: tokenExpiresIn + "s",
      }
    );
    res.cookie("token", token, {
      maxAge: cookieMaxAge,
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });
    res.json({ message: "Login Success" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("token", { path: "/", secure: true, sameSite: "none" });
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out" });
  }
};

// ตั้งค่า Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // เปลี่ยนตามผู้ให้บริการ เช่น 'hotmail', 'yahoo'
  auth: {
    user: process.env.EMAIL, // อีเมลของคุณ
    pass: process.env.EMAIL_PASSWORD, // รหัสผ่าน (หรือ App Password)
  },
});
const forgotPassword = async (req, res) => {
  try {
    const email = req.params.email;
    const findUser = await User.findUserByEmail(email);
    // console.log(findUser);

    if (!findUser) {
      return res
        .status(403)
        .json({ success: false, message: "Email not found user" });
    }
    // สร้าง token สำหรับการ reset password
    const token = jwt.sign({ uid: findUser.id }, process.env.jwtSecret, {
      expiresIn: "15m",
    });
    const resetLink = `http://localhost:3000/reset-password/${token}`; // ลิงก์พร้อม token

    // อ่านเนื้อหาไฟล์ mail.html
    let htmlContent = await fs.readFile("../backend/mail.html", "utf-8");

    // แทนที่ {{resetLink}} ใน HTML ด้วยลิงก์จริง
    htmlContent = htmlContent.replace("{{resetLink}}", resetLink);

    // ส่งอีเมล
    await transporter.sendMail({
      from: process.env.EMAIL, // อีเมลผู้ส่ง
      to: email, // อีเมลผู้รับ
      subject: "Reset your password",
      html: htmlContent, // เนื้อหา HTML ที่ปรับแต่งแล้ว
    });

    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message, errorStack: err.stack });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.jwtSecret, async (err, decoded) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to authenticate token" });
      }
      const updated = await User.updateUserPassword(decoded.uid, newPassword);
      if (!updated) {
        return res
          .status(403)
          .json({ success: false, message: "Cannot updated" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Reset password successfully!" });
    });
  } catch (error) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message, errorStack: err.stack });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
