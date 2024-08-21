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
        console.log("department:",checkDepartmentName);
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
const updateDepartmentImage = async (req, res) => {
    try {
        const image = req.file;
        const departmentId  = req.params.id;
        
        if (!image || !req.file.buffer) {
            throw new Error("Not found path image");
        }

        const mimeType = image.mimetype;
        if (mimeType !== 'image/png' && mimeType !== 'image/jpeg') {
            return res.status(400).json({ message: "Invalid image format, only PNG and JPEG are allowed" });
        }

        const existingDepartment = await department.findDepartmentById(departmentId);
        if (!existingDepartment) {
            return res.status(404).json({ message: "Department not found" });
        }

        const newImage = await route.uploadImageToCloudinary(image);
        if (!newImage) {
            return res.status(404).json({ message: "Failed to upload new image to Cloudinary" });
        }

        const oldImageId = existingDepartment.image_id;
        console.log("oldImageId:",oldImageId);
        console.log("existingDepartment:",existingDepartment);
        console.log("department:",departmentId);
        if (oldImageId) {
            console.log('oldImageId ',oldImageId);
            const oldImage = await Image.findImageById(oldImageId);
            if (oldImage) {
                await route.deleteImageFromCloudinary(oldImage.public_id);
                await Image.DeleteImage(oldImageId);
            }
        }

        const uploadImage = await Image.CreateDepartmentImage(newImage);
        if (!uploadImage) {
            return res.status(404).json({ message: "Failed to save new image to database" });
        }

        const updateImageToDepartment = await department.updateDepartmentImage(departmentId, uploadImage.id);

        res.status(200).json(updateImageToDepartment);
    } catch (error) {
        console.error({ message: error.message });
        res.status(500).json({ message: error.message });
    }
};

const getDepartments = async (req, res) =>{
    try {
        const responsed = await department.getDepartments();
        // console.log("department:",responsed);
        if (!responsed) {
            return res.status(404).json({ message: "not get department" });
        }
        res.status(201).json(responsed)
    } catch (error) {
        console.error({message: error});
    }
}
const updateDepartment = async (req, res) =>{
    const {department_id,department_name,headOfDepartment_id,deputyDirector_id} = req.body;
    try {
        const responsed = 
        await department.updateDepartment(department_id,department_name,headOfDepartment_id,deputyDirector_id);
        // console.log("department:",responsed);
        if (!responsed) {
            return res.status(404).json({ message: "not update department" });
        }
        res.status(201).json(responsed)
    } catch (error) {
        console.error({message: error});
    }
}

const getDepartment = async (req, res) => {
    const departmentId = req.params.id;
    try {
      const respond = await department.findDepartmentById(departmentId);
      if (!respond) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.status(200).json(respond);
    } catch (error) {
      console.error({ message: error.message });
      res.status(500).json({ message: "Internal server error" });
    }
};



module.exports = {
    createDepartment,
    getDepartments,
    updateDepartmentImage,
    getDepartment,
    updateDepartment
}