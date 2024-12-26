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
      department_id: user.department,
      prefix_id: user.prefix,
    },
  });
};
const updateUserName = async (uid, name) => {
  try {
    return prisma.user.update({
      where: {
        id: uid,
      },
      data: {
        name,
      },
      select:{
        name:true
      }
    });
  } catch (error) {
    console.log("Error on updateUserName model!!");
    console.error({ message: error });
  }
};
const updateUserPrefix = async (uid, prefix_id) => {
  try {
    return prisma.user.update({
      where: {
        id: uid,
      },
      data: {
        prefix_id,
      },
      select:{
        prefix:true
      }
    });
  } catch (error) {
    console.log("Error on updateUserPrefix !!");
    console.error({ message: error });
  }
};
const updateUserEmail = async (uid, email) => {
  try {
    return prisma.user.update({
      where: {
        id: uid,
      },
      data: {
        email,
      },
    });
  } catch (error) {
    console.log("Error on updateUserName model!!");
    console.error({ message: error });
  }
};

const updateUserPassword = async (uid, newPassword) => {
  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return prisma.user.update({
      where: {
        id: uid,
      },
      data: {
        password: hashedPassword,
      },
    });
  } catch (error) {
    return error;
  }
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
      prefix: true,
      name: true,
      role: true,
      email: true,
      phone: true,
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
      prefix: true,
      name: true,
      email: true,
      phone: true,
      department: {
        select: {
          id: true,
          department_name: true,
        },
      },
      role: {
        include: {
          permissionsAsAssessor: {
            include: {
              permissionForm: {
                select: {
                  ingroup: true,
                  form: {
                    select: {
                      id: true,
                      name: true,
                      questions: {
                        select: {
                          id: true,
                          content: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
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
      prefix: true,
      name: true,
      email: true,
      image: true,
      role: true,
      supervise: true,
      department_id: true,
      department: true,
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
      prefix: true,
      name: true,
      image: true,
      role: true,
    },
  });
};
const assignUsersToDepartment = async (departmentId, userIds) => {
  // updete multiple user Department_id
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
        prefix: true,
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

const countAssessors = async (assessorRoleId, userId) => {
  try {
    // ดึง department_id ของ user ที่ต้องการดูข้อมูล
    const userDepartment = await prisma.user.findUnique({
      where: { id: userId },
      select: { department_id: true },
    });

    if (!userDepartment) {
      throw new Error("User not found");
    }

    const assessorCount = await prisma.user.count({
      where: {
        role_id: assessorRoleId,
        id: {
          not: userId,
        },
        department_id: userDepartment.department_id, // นับเฉพาะ ingroup
      },
    });

    return assessorCount;
  } catch (error) {
    console.error("Error counting assessors:", error);
    throw error;
  }
};
const countAssessorsOutgroup = async (assessorRoleId, userId) => {
  try {
    const userDepartment = await prisma.user.findUnique({
      where: { id: userId },
      select: { department_id: true },
    });

    if (!userDepartment) {
      throw new Error("User not found");
    }

    const assessorCount = await prisma.user.count({
      where: {
        role_id: assessorRoleId,
        NOT: { department_id: userDepartment.department_id }, // เฉพาะ outgroup
      },
    });

    return assessorCount;
  } catch (error) {
    console.error("Error counting outgroup assessors:", error);
    throw error;
  }
};

const findPermissionByUserId = async (userId, period_id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        prefix: {
          select: {
            prefix_name: true,
          },
        },
        id: true,
        name: true,
        role: {
          select: {
            id: true,
            role_name: true,
            permissionsAsAssessor: {
              where: {
                permissionForm: {
                  some: {},
                },
              },
              select: {
                permission_id: true,
                evaluatorRole: {
                  select: {
                    role_name: true,
                    _count: {
                      select: {
                        user: {
                          where: {
                            id: {
                              not: userId,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        image: true,
        evaluationsReceived: {
          // Get the users that the current user has evaluated\
          where: {
            period_id,
          },
          select: {
            period_id: true,
            evaluator: {
              select: {
                id: true,
                name: true,
                role: {
                  select: {
                    id: true,
                    role_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching permissions by user ID:", error);
    throw error; // Optionally throw the error to be handled by the caller
  }
};

const filterUserForExecutive = async (userId) => {
  try {
    const userDetail = await findUserById(userId);
    if (!userDetail) {
      throw new Error("cannot get userDetail");
    }
    const allUsers = await getAllUsers();
    let filterUsers = [];
    const role_level = userDetail.role.role_level;
    console.log(role_level);

    if (role_level) {
      if (role_level === "LEVEL_2") {
        filterUsers = allUsers.filter(
          (user) =>
            user.department?.id === userDetail.department_id &&
            user.role?.role_level === "LEVEL_1"
        );
      } else if (role_level === "LEVEL_3") {
        const supervises = userDetail.supervise;
        console.log(supervises);

        if (supervises && supervises.length > 0) {
          supervises.map((data) => {
            allUsers.map((user) => {
              if (
                (user.department?.id === data.department_id &&
                  user.role?.role_level === "LEVEL_1") ||
                (user.department?.id === data.department_id &&
                  user.role?.role_level === "LEVEL_2")
              ) {
                filterUsers.push(user);
              }
            });
          });
        } else {
          throw new Error("ยังไม่มีหน่วยงานที่กำกับดูแล ");
        }
      } else if (role_level === "LEVEL_4")
        filterUsers = allUsers.filter(
          (user) => user.role?.role_name !== "admin" && user.department?.id
        );
      else {
        throw new Error("คุณไม่ใช่รุ่นใหญ่ ต้อง roleLevel2 ขึ้นไป");
      }
    }
    filterUsers = filterUsers.map((user) => ({
      id: user.id,
      name: user.prefix.prefix_name + user.name,
      departmentId: user.department.id,
      departmentName: user.department.department_name,
      roleName: user.role.role_name,
    }));

    return filterUsers;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  // findAllUserforCount,
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
  assignUsersToDepartment,
  updateUserName,
  updateUserEmail,
  countAssessors,
  countAssessorsOutgroup,
  findPermissionByUserId,
  updateUserPrefix,
  updateUserPassword,
  filterUserForExecutive,
};
