const prefix = require("../models/prefixModel");

const createPrefix = async (req, res) =>{
    const {prefix_name} = req.body
    // console.log(req.body);
    try {
        const created = await prefix.CreatePrefix(prefix_name);
        if (!created) {
            return res.status(404).json({ message: "not create" });
        }
        res.status(201).json(created)
    } catch (error) {
        console.error({message: error});
    }
}

const getPrefix = async(req,res)=>{
    try {
        const response = await prefix.getPrefix();
        if (!response) {
            return res.status(404).json({ message: "form not found" });
        }
        res.status(201).json(response)
        
    } catch (error) {
        console.error({message: error});
    }
}

module.exports = {
    createPrefix,
    getPrefix
}