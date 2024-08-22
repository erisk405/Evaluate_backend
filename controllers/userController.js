const User = require("../models/userModel");
const Image = require("../models/imageModel");
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
  console.log("departmentId ", departmentId);
  console.log("body ", req.body);

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
    if(!response){
      throw new error('addUserstoDepartment is error')
    }
    res.status(201).json({ message: "Add success !!!" });
  } catch (error) {
    console.error({ message: error });
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
      await Image.DeleteImage(user.image);
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
};
