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
const createQuestionType = async (type) => {
  try {
    return prisma.question_type.create({
      data: {
        type: type,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const createQuestion = async (formId, typeId, name) => {
  try {
    return prisma.form_question.create({
      data: {
        name: name,
        form_id: formId,
        question_type_id: typeId,
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
const getQuestionType = async () => {
  try {
    return prisma.question_type.findMany({
      include: {
        questions: {
          select: {
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createForm,
  getAllform,
  createQuestionType,
  getQuestionType,
  createQuestion,
  updateFormById,
  deleteFormById
};
