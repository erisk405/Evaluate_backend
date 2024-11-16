const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createForm = async (name) => {
  try {
    return prisma.form.create({
      data: {
        name: name,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const updateFormById = async (id,name) => {
  try {
    return prisma.form.update({
        where: {
            id
        },
        data:{
            name
        }
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const deleteFormById = async (id) => {
  try {
    return prisma.form.delete({
        where: {
            id
        },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const getAllform = async () => {
  try {
    return prisma.form.findMany();
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createForm,
  getAllform,
  updateFormById,
  deleteFormById
};
