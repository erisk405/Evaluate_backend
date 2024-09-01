const bcrypt = require("bcryptjs");
const { PrismaClient, RequestStatus } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (user, role) => {
  const password = await user.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  return prisma.user.create({
    data: {
      uid: user.uid,
      email: user.email,
      name: user.name,
      password: hashedPassword,
      role_id: role.id,
      phone: user.phone,
      department_id: user.department_id,
      dateofbirth: new Date(user.dateofbirth),
    },
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email: email },
    include: {
      role: true,
    },
  });
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      email:true,
      phone:true,
      department: true,
      image: true,
    },
  });
};
const myProfile = async (userId) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      department: {
        select: {
          id: true,
          department_name: true,
        },
      },
      role: true,
      image: true,
      roleRequests: {
        where: {
          status: RequestStatus.PENDING,
        },
        select: {
          role: true,
          status: true,
        },
      },
    },
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
};

const findUserEmptyDepartment = async () => {
  return prisma.user.findMany({
    where: {
      department_id: null,
      role: {
          role_name: {
            not: "admin",
          },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
    },
  });
};
const assignUsersToDepartment = async (departmentId, userIds) => { // updete multiple user Department_id
  return prisma.user.updateMany({
    where: {
      id: {
        in: userIds,
      },
    },
    data: {
      department_id: departmentId,
    },
  });
};

const setDepartment = async (departmentId, uid) => {
  try {
    return prisma.user.update({
      where: {
        id: uid,
      },
      data: {
        department_id: departmentId,
      },
      select: {
        department: true,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const setUserRole = async (userId, roleId) => {
  try {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role_id: roleId,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const CheckOldImage = async (user) => {
  try {
    return await prisma.image.findUnique({
      where: { id: user.image.id },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const updateImage = async (userId, imageId) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { image_id: imageId },
      select: {
        id: true,
        image: true,
        email: true,
        department: true,
        name: true,
        phone: true,
        role: true,
        roleRequests: true,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  setDepartment,
  setUserRole,
  CheckOldImage,
  updateImage,
  getAllUsers,
  myProfile,
  findUserEmptyDepartment,
  assignUsersToDepartment
};
