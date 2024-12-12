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

const getScoreByQuestion = async (userId, question_id, period_id) => {
  try {
    return prisma.evaluateDetail.findMany({
      where: {
        evaluate: {
          period_id,
          evaluator_id: userId,
        },
        question_id,
      },
      select: {
        score: true,
      },
    });
  } catch (error) {
    console.error("Error in createDetailEval:", error);
    throw error;
  }
};
const getScoreByQuestionForExecutive = async (
  userId,
  question_id,
  period_id
) => {
  try {
    return prisma.evaluateDetail.findMany({
      where: {
        evaluate: {
          period_id,
          evaluator_id: userId,
          assessor: {
            role: {
              NOT: {
                role_level: "LEVEL_1",
              },
            },
          },
        },
        question_id,
      },
      select: {
        score: true,
      },
    });
  } catch (error) {}
};
const getScoreByQuestionForDepartment = async (
  userId,
  question_id,
  period_id,
  department_id
) => {
  try {
    return prisma.evaluateDetail.findMany({
      where: {
        evaluate: {
          period_id,
          evaluator_id: userId,
          assessor: {
            department_id: department_id,
            AND: [
              {
                role:{
                  role_level:{
                    not:"LEVEL_2"
                  }
                }
              },
              {
                role:{
                  role_level:{
                    not:"LEVEL_3"
                  }
                }
              },
          ],
          },
        },
        question_id,
      },
      select: {
        score: true,
      },
    });
  } catch (error) {
    console.error("Error in createDetailEval:", error);
    throw error;
  }
};

module.exports = {
  createDetailEval,
  getScoreByQuestion,
  getScoreByQuestionForExecutive,
  getScoreByQuestionForDepartment,
};
