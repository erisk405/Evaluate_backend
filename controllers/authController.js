const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const tokenExpiresIn = 3600;
const tokenMaxAge = tokenExpiresIn * 10; // 10 ชั่วโมง
const isProduction = process.env.NODE_ENV === "production";
const baseUrl = isProduction
  ? `${process.env.CLIENT_URL}`
  : "http://localhost:3000";
const register = async (req, res) => {
  try {
    const role = await Role.checkMemberRole();
    await User.createUser(req.body, role);
    res.status(201).json({ message: "ลงทะเบียนผู้ใช้สำเร็จ!" });
  } catch (error) {
    console.error("Error in register:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "อีเมลนี้ถูกใช้ไปแล้ว กรุณาใช้อีเมลอื่น" });
    }

    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ message: "ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบข้อมูล" });
    }

    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่ภายหลัง" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.role_name },
      process.env.jwtSecret,
      { expiresIn: tokenMaxAge + "s" }
    );

    // ส่ง JWT ผ่าน Authorization header
    res.status(200).json({
      message: "Login Success",
      success: true,
      token, // frontend จะต้องเก็บ token และแนบไปใน request ถัดไป
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
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

    if (!findUser) {
      return res
        .status(403)
        .json({ success: false, message: "Email not found user" });
    }

    // Generate token for password reset
    const token = jwt.sign({ uid: findUser.id }, process.env.jwtSecret, {
      expiresIn: "15m",
    });
    const resetLink = `${baseUrl}/reset-password/${token}`;

    // Resolve path to the mail template
    const path = require("path");
    const mailFilePath = path.join(process.cwd(), "mail.html");

    // Read the mail template file
    let htmlContent;
    try {
      htmlContent = await fs.readFile(mailFilePath, "utf-8");
    } catch (fileError) {
      console.error("Error reading mail.html:", fileError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to load email template",
        error: fileError.message,
      });
    }

    // Replace placeholder with the actual reset link
    htmlContent = htmlContent.replace("{{resetLink}}", resetLink);

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset your password",
      html: htmlContent,
    });

    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

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
          .json({ success: false, message: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
      }
      return res
        .status(200)
        .json({ success: true, message: "รีเซ็ตรหัสผ่านสำเร็จแล้ว!" });
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
  forgotPassword,
  resetPassword,
};
