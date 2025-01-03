const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createEvaluate = async (evaluate, tx) => {
  try {
    return await tx.evaluate.create({
      data: {
        period_id: evaluate.period_id,
        assessor_id: evaluate.assessor_id,
        evaluator_id: evaluate.evaluator_id,
        eval_depart_id: evaluate.eval_depart_id,
        date: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in createEvaluate:", error);
    throw error;
  }
};

const deleteEvaluate = async (evaluate_id, tx) => {
  try {
    return tx.evaluate.delete({
      where: {
        id: evaluate_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const findUserEvaluate = async (assessor_id, period_id) => {
  try {
    return prisma.evaluate.findMany({
      where: {
        assessor_id,
        period_id,
      },
      select: {
        id: true,
        period: {
          select: {
            period_id: true,
            title: true,
          },
        },
        evaluator: {
          select: {
            id: true,
            prefix: true,
            name: true,
          },
        },
        evaluateDetail: {
          select: {
            id: true,
            formQuestion: true,
            score: true,
          },
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const findUserEvaluateForDepartment = async (
  assessor_id,
  department_id,
  period_id
) => {
  try {
    return prisma.evaluate.findMany({
      where: {
        assessor_id,
        period_id,
        OR: [
          {
            evaluator: {
              department_id,
            },
          },
          {
            evaluator: {
              supervise: {
                some: {
                  department_id,
                },
              },
            },
          },
        ],
      },
      select: {
        period: {
          select: {
            period_id: true,
            title: true,
          },
        },

        evaluator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const getResultEvaluateById = async (evaluator_id, period_id) => {
  try {
    const result = prisma.evaluate.findMany({
      where: {
        evaluator_id,
        period_id,
      },
      select: {
        id:true,
        evaluator: {
          select: {
            prefix: {
              select: {
                prefix_name: true,
              },
            },
            name: true,
            role: {
              select: {
                role_name: true,
                role_level: true,
              },
            },
            department: {
              select: {
                department_name: true,
                id: true,
              },
            },
            supervise: true,
          },
        },
        period: {
          select: {
            title: true,
          },
        },
        evaluateDetail: {
          select: {
            formQuestion: {
              select: {
                form: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            score: true,
          },
        },
      },
    });
    return result;
  } catch (error) {
    console.error({ message: error });
  }
};

const findResultEvaluate = async (evaluator_id, period_id) => {
  try {
    return prisma.evaluate.findFirst({
      where: {
        evaluator_id,
        period_id,
      },
      select: {
        period: true,
        assessor_id: true,
        evaluator_id: true,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const upDateDateEval = async (evaluate_id, tx) => {
  try {
    return tx.evaluate.update({
      where: {
        id: evaluate_id,
      },
      data: {
        date: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in createEvaluate:", error);
    throw error;
  }
};

const findEvaluateByPeriod = async (period_id) => {
  try {
    return prisma.evaluate.findMany({
      where:{
        period_id
      }
    });
  } catch (error) {
    console.error("Error failed to find evaluate for this period:", error);
    throw error;
  }
};

const calculateScoreByMean = (mean) => {
  let score = 0;
  if (mean >= 4.5) {
    score = 10;
  } else if (mean >= 3.5 && mean <= 4.49) {
    score = 9;
  } else if (mean >= 2.5 && mean <= 3.49) {
    score = 8;
  } else if (mean >= 1.5 && mean <= 2.49) {
    score = 7;
  } else {
    score = 6;
  }
  return score;
};

module.exports = {
  createEvaluate,
  deleteEvaluate,
  findUserEvaluate,
  getResultEvaluateById,
  findUserEvaluateForDepartment,
  findResultEvaluate,
  upDateDateEval,
  findEvaluateByPeriod,
  calculateScoreByMean
};
