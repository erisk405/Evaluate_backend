const User = require("../models/userModel");
const Image = require("../models/imageModel");
const { deleteImage } = require("./routeUpload");
const findUser = async (req, res) =>{
    const id = req.userId
    try {
        const user = await User.findUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(201).json(user)
    } catch (error) {
        console.error({message: error});
    }
}
const setDepartment = async (req, res) =>{
    const id = req.userId
    const {departmentId} = req.body
    try {
        const user = await User.setDepartment(departmentId,id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(201).json(user)
    } catch (error) {
        console.error({message: error});
    }
}
const setRole = async (req, res) =>{
    const id = req.userId
    const {roleId} = req.body
    try {
        const user = await User.setRole(roleId,id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(201).json(user)
    } catch (error) {
        console.error({message: error});
    }
}


const updateUserImage = async (req, res) => {
    try {
        const userId = req.userId
        console.log(userId);
        // URL ของรูปที่ถูกอัพโหลด
        if (!req.file || !req.file.path) {
            throw new Error("Not found path image");
        }
        const user = await User.findUserById(userId)
        if (!user) {
          return res.status(404).json({ error: 'User not found!' });
        }
        if (user.image_id) {
          const oldImage = await User.CheckOldImage(user)
    
          if (oldImage) {
            console.log(`Deleting old image with public_id: ${oldImage.public_id}`);
            // Delete the old image
            await deleteImage(oldImage.public_id);
            // ลบ old image จาก database
            await Image.DeleteImage(oldImage);
          }
        }
  
        // บันทึก Image ลงในตาราง Image
        const newImage = await Image.CreateImage(req.file);
        // อัพเดต image_id ในตาราง User
        const imageId = newImage.id
        const updatedUser = await User.updateImage(userId,imageId)
        res.status(201).json(updatedUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong!' ,message:error});
    }
}
  


module.exports = {
    findUser,
    setDepartment,
    setRole,
    updateUserImage
}