const { PrismaClient } = require("@prisma/client");

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

const getRoleRequestPending = async () => {
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
};
