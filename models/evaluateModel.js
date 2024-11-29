const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createEvaluate = async (evaluate, tx) => {
  try {
    return await tx.evaluate.create({
      data: {
        period_id: evaluate.period_id,
        assessor_id: evaluate.assessor_id,
        evaluator_id: evaluate.evaluator_id,
        date: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in createEvaluate:", error);
    throw error;
  }
};

const deleteEvaluate = async (evaluate_id) => {
  try {
    return prisma.evaluate.delete({
      where: {
        evaluate_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createEvaluate,
  deleteEvaluate,
};
