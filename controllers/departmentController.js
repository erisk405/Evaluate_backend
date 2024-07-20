const department = require("../models/departmentModel");

const createDepartment = async (req, res) =>{
    const {departmentName,image} = req.body
    try {
        const created = await department.createDepartment(departmentName,image);
        if (!created) {
            return res.status(404).json({ message: "not create" });
        }
        res.status(201).json(created)
    } catch (error) {
        console.error({message: error});
    }
}
const getDepartments = async (req, res) =>{
    try {
        const responsed = await department.getDepartments();
        if (!responsed) {
            return res.status(404).json({ message: "not get department" });
        }
        res.status(201).json(responsed)
    } catch (error) {
        console.error({message: error});
    }
}
module.exports = {
    createDepartment,
    getDepartments
}