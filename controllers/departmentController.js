const department = require("../models/departmentModel");
const Image = require("../models/imageModel");
const route = require("./routeUpload")

const createDepartment = async (req, res) =>{
    try {
        // console.log(req.file.buffer); // ตรวจสอบข้อมูลไฟล์ที่ถูกส่งมาว่ามีอยู่หรือไม่
        const image = req.file
        const {departmentName} = req.body
        // const departmentName = 'testDepartment';

        if(!image || !req.file.buffer){
            throw new Error("Not found path image");
        }

        // ตรวจสอบ MIME type ของไฟล์
        const mimeType = image.mimetype;
        if (mimeType !== 'image/png' && mimeType !== 'image/jpeg') {
            return res.status(400).json({ message: "Invalid image format, only PNG and JPEG are allowed" });
        }
        
        const checkDepartmentName = await department.findDepartmentByName(departmentName);
        if(checkDepartmentName){
            return res.status(404).json({ message: "name department duplicate" });
        }

        const newdepartment = await department.createDepartment(departmentName);
        if (!newdepartment) {
            return res.status(404).json({ message: "not create department to db" });
        }
      
        // อัปโหลดรูปภาพหลังจากที่แน่ใจว่าแผนกถูกสร้างสำเร็จแล้ว
        const newImage = await route.uploadImageToCloudinary(image);
        const departmentId = newdepartment.id
        if (!newImage) {
            // ลบแผนกที่เพิ่งสร้างไปก่อนหน้านี้หากการอัปโหลดรูปภาพล้มเหลว
            await department.deleteDepartment(departmentId);
            return res.status(404).json({ message: "not create image to cloud" });
        }

        const uploadImage = await Image.CreateDepartmentImage(newImage);
        if(!uploadImage){
            return res.status(404).json({ message: "not create image to db" });
        }
        
        const updateImageToDepartment = await department.updateDepartmentImage(departmentId,uploadImage.id)
        
        // บันทึก Image ลงในตาราง Image
        
        res.status(201).json(updateImageToDepartment)
    } catch (error) {
        console.error({message: error});
    }
}
const updateDepartmentImage = async(req,res)=>{
    try {
        
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
    getDepartments,
    updateDepartmentImage
}