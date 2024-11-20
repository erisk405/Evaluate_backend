const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createDetailEval = async (evaluate_id,questions) => {
  try {    
    return prisma.evaluateDetail.createMany({
      data:questions.map(item=>({
        evaluate_id:evaluate_id,
        question_id:item.question_id,
        score:parseFloat(item.score)
      }))
    });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
    createDetailEval,
};
