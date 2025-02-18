const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createDepartment = async (departmentName) => {
  try {
    return prisma.department.create({
      data: {
        department_name: departmentName,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const getDepartments = async () => {
  try {
    return prisma.department.findMany({
      select: {
        id: true,
        department_name: true,
        _count: {
          select: { user: true },
        },
        image: true,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const getDepartmentsForAdmin = async () => {
  try {
    return prisma.department.findMany({
      select: {
        id: true,
        department_name: true,
        image: true,
        user: {
          select: {
            id: true,
            prefix:{
              select:{
                prefix_name:true
              }
            },
            name: true,
            department: true,
            image: true,
            email: true,
            phone: true,
            prefix: true,
            role: {
              select: {
                id: true,
                role_name: true,
                role_level: true,
              },
            },
          },
        },
        supervise: {
          select: {
            supervise_id: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: {
                  select: {
                    id: true,
                    role_name: true,
                  },
                },
                department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const countEvaluatorOfDepartment = async (assessor_id) => {
  try {
    return prisma.department.findMany({
      select: {
        id: true,
        department_name: true,
        user: {
          where: {
            NOT: {
              id: assessor_id,
            },
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const findDepartmentByName = async (name) => {
  try {
    return await prisma.department.findFirst({
      where: { department_name: name },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const findDepartmentById = async (departmentId) => {
  try {
    // ดึงข้อมูล department พร้อมกับผู้ใช้
    const department_data = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        department_name: true,
        image_id: true,
        user: {
          select: {
            id: true,
            prefix:{
              select:{
                prefix_name:true
              }
            },
            name: true,
            department: true,
            image: true,
            role: {
              select: {
                id: true,
                role_name: true,
                role_level: true,
              },
            },
            supervise: {
              select: {
                supervise_id: true,
                department_id: true,
              },
            },
          },
        },
        supervise: {
          select: {
            supervise_id: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                prefix:true,
                role: {
                  select: {
                    id: true,
                    role_name: true,
                  },
                },
                department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
                supervise: {
                  select: {
                    supervise_id: true,
                    department_id: true,
                  },
                },
              },
            },
          },
        },
      }, // Ensure the ID is parsed as an integer
    });
    console.log("department_data:", department_data);

    return {
      department_data,
      // totalUsers
    };
  } catch (error) {
    console.error({ message: error.message });
    throw new Error("Error fetching department data");
  }
};

const getDepartmentNameById = async (departId) => {
  try {
    return prisma.department.findUnique({
      where: {
        id: departId,
      },
      select: {
        department_name: true,
      },
    });
  } catch (error) {
    console.error({ message: error.message });
    throw new Error("Error fetching department name");
  }
};

const findDepartmentByIdForAdmin = async (departmentId) => {
  try {
    // ดึงข้อมูล department พร้อมกับผู้ใช้
    const department_data = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        department_name: true,
        image_id: true,
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            image: true,
            email: true,
            phone: true,
            prefix: true,
            role: {
              select: {
                id: true,
                role_name: true,
                role_level: true,
              },
            },
          },
        },
        supervise: {
          select: {
            supervise_id: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: {
                  select: {
                    id: true,
                    role_name: true,
                  },
                },
                department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
              },
            },
          },
        },
      }, // Ensure the ID is parsed as an integer
    });
    console.log("department_data:", department_data);

    return {
      department_data,
      // totalUsers
    };
  } catch (error) {
    console.error({ message: error.message });
    throw new Error("Error fetching department data");
  }
};

const updateImage = async (departmentId, imageId) => {
  try {
    return await prisma.department.update({
      where: { id: departmentId },
      data: { image_id: imageId },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const deleteDepartment = async (departmentId) => {
  try {
    // ทำการลบข้อมูลโดยตรง แต่จับข้อผิดพลาดที่เกิดจาก foreign key constraint
    return await prisma.department.delete({
      where: { id: departmentId },
      include: { image: true }
    });
  } catch (error) {
    // จัดการข้อผิดพลาดที่เกิดจาก prisma
    if (error.code === 'P2003' || error.code === 'P2014') {
      // P2003: Foreign key constraint failed on the field
      // P2014: The change you are trying to make would violate the required relation
      throw new Error("RefferentData");
    }
    
    if (error.code === 'P2025') {
      // Record to delete does not exist
      throw new Error("ไม่พบข้อมูลแผนกที่ต้องการลบ");
    }
    
    // กรณีอื่นๆ
    throw new Error(`เกิดข้อผิดพลาดในการลบข้อมูล: ${error.message}`);
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
const updateDepartment = async (
  departmentId,
  department_name,
  headOfDepartment_id,
  deputyDirector_id
) => {
  try {
    return await prisma.department.update({
      where: { id: departmentId },
      data: {
        department_name,
        headOfDepartment_id,
        deputyDirector_id,
      },
    });
  } catch (error) {
    console.error({ message: error.message });
    throw new Error("Database error during department update");
  }
};

const findDepartWhereHaveRoleLevel1 = async ()=>{
  try {
    return prisma.department.findMany({
      where:{
        user:{
          some:{
            role:{
              role_level:"LEVEL_1"
            }
          }
        }
      },select:{
        id:true,
        department_name:true
      }
    })
    
  } catch (error) {
    console.error({ message: error.message });
    throw new Error("error date base");
  }
}

const checkEvaluationCompletion = async () => {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        department_name: true,
        image: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        supervise: {
          select: {
            supervise_id: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
                department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return departments;
  } catch (error) {
    console.error({ message: error.message });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  updateImage,
  findDepartmentByName,
  deleteDepartment,
  updateDepartmentImage,
  findDepartmentById,
  updateDepartment,
  findDepartmentByIdForAdmin,
  getDepartmentsForAdmin,
  countEvaluatorOfDepartment,
  checkEvaluationCompletion,
  getDepartmentNameById,
  findDepartWhereHaveRoleLevel1
};
