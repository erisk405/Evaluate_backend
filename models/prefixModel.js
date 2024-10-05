const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CreatePrefix = async (prefixName) => {
  try {
    return await prisma.prefix.create({
      data: {
        prefix_name: prefixName,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const getPrefix = async () => {
    try {
      return prisma.prefix.findMany();
    } catch (error) {
      console.error({ message: error });
    }
  };
  

module.exports = {
  CreatePrefix,
  getPrefix
};
