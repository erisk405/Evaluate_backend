const User = require("../models/userModel");

const findUser = async (req, res) =>{
    const id = req.params.id
    try {
        const user = await User.findUserById(id);
        res.status(201).json(user)
    } catch (error) {
        console.error({message: error});
    }
}

module.exports = {
    findUser
}