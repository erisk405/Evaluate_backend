const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createDepartment = async (departmentName,image) => {
    try {
        return prisma.department.create({
            data: {
                department_name:departmentName,
                image:image
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




module.exports = {
    createDepartment,
    getDepartments
   };