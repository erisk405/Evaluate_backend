const { PrismaClient } = require("@prisma/client");
const moment = require("moment-timezone");
const prisma = new PrismaClient();

const createRole = async (role) => {
  try {
    return prisma.role.create({
      data: {
        role_name: role.role_name,
        description: role.description,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const getRole = async () => {
  try {
    return prisma.role.findMany();
  } catch (error) {
    console.error({ message: error });
  }
};
const checkMemberRole = async () => {
  try {
    const memberRole = await prisma.role.findUnique({
      where: { role_name: "member" },
    });
    if (!memberRole) {
      const created = await prisma.role.create({
        data: {
          role_name: "member",
        },
      });
      return created;
    }
    return memberRole;
  } catch (error) {
    console.error({ message: error });
  }
};

// Request role ----------------------------------

async function RoleRequest(userId, roleId) {
  try {
    const bangkokTime = moment().tz("Asia/Bangkok").format(); //format time to UTC
    console.log("Current time in Bangkok:", bangkokTime);

    const pendingRoleRequestsCount = await prisma.roleRequest.count({
      where: {
        status: "PENDING",
      },
    });
    const request = await prisma.roleRequest.create({
      data: {
        userId,
        roleId,
        status: "PENDING",
        createdAt: bangkokTime,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        role: {
          select: {
            id: true,
            role_name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return { count: pendingRoleRequestsCount, data: request };
  } catch (error) {
    console.error({ message: error });
  }
}

async function deleteOldRequest(userId) {
  try {
    const oldUser = await prisma.roleRequest.findFirst({
      where: {
        userId: userId,
        status: "PENDING",
      },
      select: {
        id: true,
      },
    });

    if (!oldUser) {
      return "no olduser";
    }
    const deleteOldUser = await prisma.roleRequest.delete({
      where: {
        id: oldUser.id,
      },
    });
    return deleteOldUser;
  } catch (error) {
    console.error({ message: error });
  }
}
async function deleteStatusApprove(userId) {
  try {
    // Find the approved request for the given user
    const request = await prisma.roleRequest.findFirst({
      where: {
        userId: userId,
        status: "APPROVED",
      },
    });

    // Check if the approved request exists
    if (!request) {
      return "don't have approve_request!";
    }

    // Delete the approved request
    await prisma.roleRequest.delete({
      where: {
        id: request.id,
      },
    });

    return "delete success";
  } catch (error) {
    console.error({ message: error });
    return "An error occurred";
  }
}

async function handlerRoleRequest(requestId, status) {
  try {
    return await prisma.roleRequest.update({
      where: { id: requestId },
      data: { status },
    });
    // แจ้งเตือนไปยังสมาชิกที่เกี่ยวข้องผ่าน Socket.IO
  } catch (error) {
    console.error({ message: error });
  }
}

  const getRoleRequestPending = async (skip,limit) => {
    try {
      const pendingRoleRequestsCount = await prisma.roleRequest.count({
        where: {
          status: "PENDING",
        },
      });
      const pendingRoleRequests = await prisma.roleRequest.findMany({
        where: {
          status: "PENDING",
        },
        orderBy: {
          createdAt:'desc'
        },
        skip:parseInt(skip),
        take:parseInt(limit),
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          role: {
            select: {
              id: true,
              role_name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return { count: pendingRoleRequestsCount, data: pendingRoleRequests };
    } catch (error) {
      console.error({ message: error });
    }
  };

module.exports = {
  createRole,
  getRole,
  checkMemberRole,
  RoleRequest,
  handlerRoleRequest,
  getRoleRequestPending,
  deleteOldRequest,
  deleteStatusApprove,
};
