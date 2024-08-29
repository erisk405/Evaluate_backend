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
        headOfDepartment: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        deputyDirector: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
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

const findDepartmentByName = async (name) => {
  try {
    return await prisma.department.findFirst({
      where: { department_name: name },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const findDepartmentById = async (
  departmentId,
  pageIndex = 0,
  pageSize = 5
) => {
  try {
    // นับจำนวนผู้ใช้ทั้งหมดใน department นี้
    const totalUsers = await prisma.user.count({
      where: { department_id: departmentId },
    });

    // console.log("totalUsers:",totalUsers);

    // ดึงข้อมูล department พร้อมกับผู้ใช้
    const department_data = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        department_name: true,
        image_id: true,
        user: {
          skip: pageIndex * pageSize,
          take: pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            image: true,
          },
        },
      }, // Ensure the ID is parsed as an integer
    });
    console.log("department_data:",department_data);
    
    return {
      department_data,
      totalUsers
    }
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

module.exports = {
  createDepartment,
  getDepartments,
  updateImage,
  findDepartmentByName,
  deleteDepartment,
  updateDepartmentImage,
  findDepartmentById,
  updateDepartment,
};
