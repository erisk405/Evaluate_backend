const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Image = require("../models/imageModel");
const bcrypt = require("bcryptjs");
const { deleteImage } = require("./routeUpload");
const findUser = async (req, res) => {
  const id = req.userId;
  try {
    const user = await User.findUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json(user);
  } catch (error) {
    console.error({ message: error });
  }
};
const setDepartment = async (req, res) => {
  const id = req.userId;
  const { departmentId } = req.body;
  // console.log("departmentId ", departmentId);

  try {
    const user = await User.setDepartment(departmentId, id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json(user);
  } catch (error) {
    console.error({ message: error });
  }
};
const setUserRole = async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  const { roleId } = req.body;
  try {
    const user = await User.setUserRole(userId, roleId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json(user);
  } catch (error) {
    console.error({ message: error });
  }
};
const setUserstoDepartment = async (req, res) => {
  try {
    const { userIds, departmentId } = req.body; // Destructure the received JSON data
    const response = await User.assignUsersToDepartment(departmentId, userIds);
    if (!response) {
      throw new error("addUserstoDepartment is error");
    }
    res.status(201).json({ message: "Add success !!!" });
  } catch (error) {
    console.error({ message: error });
  }
};

const updateProfileUserByAdmin = async (req, res) => {
  try {
    const updateProfile = req.body;
    console.log("updateProfile", updateProfile);

    // แก้ไข หน่วยงาน
    const updateDepart = await User.setDepartment(
      updateProfile.department,
      updateProfile.userId
    );
    if (!updateDepart) {
      return res.status(404).json({ message: "updateDepart error update" });
    }

    // แก้ไข ตัวแหน่ง
    const updateRole = await User.setUserRole(
      updateProfile.userId,
      updateProfile.role
    );
    if (!updateRole) {
      return res.status(404).json({ message: "updateRole error update" });
    }

    // แก้ไข ชื่อ สกุล
    const updateUserName = await User.updateUserName(
      updateProfile.userId,
      updateProfile.name
    );
    if (!updateUserName) {
      return res.status(404).json({ message: "updateUserName error update" });
    }
    const prefixUpdated = await User.updateUserPrefix(
      updateProfile.userId,
      updateProfile.prefixId
    );
    if (!prefixUpdated) {
      res.status(500).json("don't update User'prefix ");
      throw error;
    }
    // แก้ไข อีเมลล์
    const updateUserEmail = await User.updateUserEmail(
      updateProfile.userId,
      updateProfile.email
    );
    if (!updateUserEmail) {
      return res.status(404).json({ message: "updateUserEmail error update" });
    }

    const updatedPhoneNumber = await User.updatePhoneNumber(
      updateProfile.phone,
      updateProfile.userId
    );
    if (!updatedPhoneNumber) {
      return res
        .status(404)
        .json({ message: "updatedPhoneNumber error update" });
    }
    res.status(200).json({ message: "update success !!!" });
  } catch (error) {
    console.error({ message: error });
  }
};

const updateNameAndPrefix = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, prefixId, phone } = req.body;

    const nameUpdated = await User.updateUserName(userId, name);
    if (!nameUpdated) {
      res.status(500).json("don't update User'name ");
      throw error;
    }
    const prefixUpdated = await User.updateUserPrefix(userId, prefixId);
    if (!prefixUpdated) {
      res.status(500).json("don't update User'prefix ");
      throw error;
    }
    const updatedPhoneNumber = await User.updatePhoneNumber(phone, userId);
    if (!updatedPhoneNumber) {
      return res
        .status(404)
        .json({ message: "updatedPhoneNumber error update" });
    }
    res.status(200).json({
      message: "Success updated user prefix and name.",
      name: nameUpdated.name,
      prefix: prefixUpdated.prefix,
      phone: updatedPhoneNumber.phone,
    });
  } catch (error) {
    console.error({ message: error });
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const AllUsers = await User.getAllUsers();
    if (!AllUsers) {
      return res.status(404).json({ message: "AllUsers not found" });
    }
    res.status(201).json(AllUsers);
  } catch (error) {
    console.error({ message: error });
  }
};
const findUserEmptyDepartment = async (req, res) => {
  try {
    const users = await User.findUserEmptyDepartment();
    if (!users) {
      return res
        .status(404)
        .json({ message: "user empty department don't get" });
    }
    res.status(201).json(users);
  } catch (error) {
    console.error({ message: error });
  }
};
const getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await User.myProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "profile not found" });
    }
    res.status(201).json(profile);
  } catch (error) {
    console.error({ message: error });
  }
};

const updateUserImage = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("userId:", userId);
    // URL ของรูปที่ถูกอัพโหลด
    if (!req.file || !req.file.path) {
      throw new Error("Not found path image");
    }
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    console.log("user:", user);
    if (user.image) {
      // Delete the old image
      await deleteImage(user.image.public_id);
      // ลบ old image จาก database
      await Image.DeleteImage(user.image.id);
    }

    // บันทึก Image ลงในตาราง Image
    const newImage = await Image.CreateImage(req.file);
    // อัพเดต image_id ในตาราง User
    const imageId = newImage.id;
    const updatedUser = await User.updateImage(userId, imageId);
    res.status(201).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!", message: error });
  }
};

const showRole = async (req, res) => {
  const role = req.role;
  const userId = req.userId;
  res.status(201).json({ role: role, userId: userId });
};

const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findUserById(userId);
    const { old_pass, new_pass } = req.body;
    const isMatch = await bcrypt.compare(old_pass, user.password);
    if (!isMatch) {
      return res
        .status(409)
        .json({ message: "รหัสผ่านเดิม ไม่ถูกต้อง !!" });
    }
    const updated = await User.updateUserPassword(userId, new_pass);

    return res
      .status(201)
      .json({ message: "ตั้งค่ารหัสผ่านใหม่สำเร็จ", update: updated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const changePasswordByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { new_pass } = req.body;
    const updated = await User.updateUserPassword(userId, new_pass);

    return res
      .status(201)
      .json({ message: "ตั้งรหัสผ่านใหม่สำเร็จ*", update: updated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userIds = req.body;
    console.log("userIds", userIds);

    // Find all users that will be deleted
    const users = await User.findUsersByIds(userIds);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found!" });
    }
    // Delete images for all users that have them
    for (const user of users) {
      if (user.image) {
        await deleteImage(user.image.public_id);
        await Image.DeleteImage(user.image.id);
      }
    }
    // Delete users and their related records
    const result = await User.deleteUsersByIds(userIds);
    return res.status(200).json({
      message: "Users and related records deleted successfully",
      deletedCount: result.count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

module.exports = {
  findUser,
  setDepartment,
  setUserRole,
  updateUserImage,
  showRole,
  getAllUsers,
  getMyProfile,
  findUserEmptyDepartment,
  setUserstoDepartment,
  updateProfileUserByAdmin,
  updateNameAndPrefix,
  changePassword,
  changePasswordByUserId,
  deleteUser,
};
