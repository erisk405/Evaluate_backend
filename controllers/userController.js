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

module.exports = {
    findUser
}