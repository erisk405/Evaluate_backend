const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const createQuestion = async (content, form_id) => {
  try {
    return prisma.formQuestion.create({
      data: {
        content: content,
        form_id: form_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const updateQuestion = async (content, questionId) => {
  try {
    return prisma.formQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        content,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const deleteQuestions = async (questionIds) => {
  try {
    return prisma.formQuestion.deleteMany({
      where: {
        id: {
          in: questionIds,
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const getQuestions = async (formId) => {
  try {
    return prisma.formQuestion.findMany({
      where: {
        form_id: formId,
      },
      select: {
        id: true,
        content: true,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestions,
  getQuestions,
};
