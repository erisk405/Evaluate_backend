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
    const request = await prisma.roleRequest.create({
      data: {
        userId,
        roleId,
        status: "PENDING",
      },
    });
    return request;
  } catch (error) {
    res.status(500).json({ error: "Failed to create role request" });
  }
}

async function handlerRoleRequest(requestId, status) {
  try {

    const request = await prisma.roleRequest.update({
      where: { id: requestId },
      data: { status },
    });
    // แจ้งเตือนไปยังสมาชิกที่เกี่ยวข้องผ่าน Socket.IO
    return request
  } catch (error) {
    res.status(500).json({ error: "Filed to update role request" });
  }
}

module.exports = {
  createRole,
  getRole,
  checkMemberRole,
  RoleRequest,
  handlerRoleRequest,
};
