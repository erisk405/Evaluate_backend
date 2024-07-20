const User = require("../models/userModel");

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

module.exports = {
    findUser,
    setDepartment,
    setRole
}