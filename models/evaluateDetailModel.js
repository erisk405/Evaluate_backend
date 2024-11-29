const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createDetailEval = async (evaluate_id, questions, tx) => {
  try {
    return await tx.evaluateDetail.createMany({
      data: questions.map((item) => ({
        evaluate_id: evaluate_id,
        question_id: item.questionId,
        score: parseFloat(item.score),
      })),
    });
  } catch (error) {
    console.error("Error in createDetailEval:", error);
    throw error;
  }
};

module.exports = {
  createDetailEval,
};
