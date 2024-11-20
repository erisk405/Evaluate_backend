const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const createEvaluate = async (evaluate) => {
    try {
        const period_id = evaluate.period_id;
        const assessor_id = evaluate.assessor_id;
        const evaluator_id = evaluate.evaluator_id;
      return prisma.evaluate.create({
        data: {
            period_id,
            assessor_id,
            evaluator_id,
            date:new Date(),
        },
      });
    } catch (error) {
      console.error({ message: error });
    }
  };

  const deleteEvaluate = async (evaluate_id) => {
    try {
        
      return prisma.evaluate.delete({
        where: {
            evaluate_id
        },
      });
    } catch (error) {
      console.error({ message: error });
    }
  };

  




module.exports = {
    createEvaluate,
    deleteEvaluate
  };
  