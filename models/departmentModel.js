const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createDepartment = async (departmentName) => {
    try {
        return prisma.department.create({
            data: {
                department_name:departmentName
            },
          });
        
    } catch (error) {
        console.error({message:error})
    }
    
}
const getDepartments = async () => {
    try {
        return prisma.department.findMany(
            {
                include: {
                    _count: {
                        select: { user: true },
                    },
                },
            }
        );
        
    } catch (error) {
        console.error({message:error})
    }
    
}

const findDepartmentByName = async(name)=>{
    try {
        return await prisma.department.findUnique({
            where: { department_name: name },
          });
    } catch (error) {
        console.error({message:error});
    }

}
  
const updateImage = async(departmentId,imageId)=>{
    try {
      return await prisma.department.update({
        where: { id: departmentId },
        data: { image_id: imageId},
      });
      
    } catch (error) {
      console.error({message:error});
    }
  }
  const deleteDepartment = async (departmentId) => {
    try {
        return await prisma.department.delete({
            where: { id: departmentId },
        });
    } catch (error) {
        console.error({ message: error.message });
        throw new Error("Database error during department deletion");
    }
};
const updateDepartmentImage = async (departmentId, imageId) => {
    try {
        return await prisma.department.update({
            where: { id: departmentId },
            data: { image_id: imageId },
        });
    } catch (error) {
        console.error({ message: error.message });
        throw new Error("Database error during department update");
    }
};





module.exports = {
    createDepartment,
    getDepartments,
    updateImage,
    findDepartmentByName,
    deleteDepartment,
    updateDepartmentImage
   };