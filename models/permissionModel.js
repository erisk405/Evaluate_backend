const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPermission = async (allOfdata) => {
  try {
    return prisma.permission.createMany({
      data: [allOfdata],
    });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createPermission,
};
