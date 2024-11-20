const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const createPrefix = async (prefix_name) => {
  try {
    return await prisma.prefix.create({
      data: {
        prefix_name,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const updatePrefix = async (prefix_id,prefix_name) => {
  try {
    return await prisma.prefix.update({
      where: {
        prefix_id,
      },
      data:{
        prefix_name
      }
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
const deletePrefix = async(prefix_id)=>{
  try {
    return await prisma.prefix.delete({
      where: {
        prefix_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
}
  

module.exports = {
  createPrefix,
  getPrefix,
  updatePrefix,
  deletePrefix
};
