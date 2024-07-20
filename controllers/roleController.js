const Role = require("../models/roleModel");

const createRole = async (req,res)=>{
    try {
        const created = await Role.createRole(req.body)
        console.log(created);
        if(!created){
            return res.status(404).json({ message: "don't create role" });
        }
        res.status(201).json(created)
        
    } catch (error) {
        console.error({message:error});
    }
}
const getRole = async (req,res)=>{
    try {
        const responsed = await Role.getRole()
        if(!responsed){
            return res.status(404).json({ message: "don't get role" });
        }
        res.status(201).json(responsed)
        
    } catch (error) {
        console.error({message:error});
    }
}


module.exports = {
    createRole,
    getRole
}