const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPeriod = async (data) => {
  try {
    return prisma.period.create({
      data: {
        title: data.title,
        start: data.start,
        end: data.end,
        isAction: false,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const updatePeriod = async (data) => {
  try {
    return prisma.period.update({
      where: {
        period_id: data.period_id,
      },
      data: {
        title: data.title,
        start: data.start,
        end: data.end,
        isAction: data.isAction,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const setActionPeriod = async (period_id, isAction) => {
  try {
    return prisma.period.update({
      where: {
        period_id,
      },
      data: {
        isAction,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const getPeriods = async () => {
  try {
    return prisma.period.findMany();
  } catch (error) {
    console.error({ message: error });
  }
};
const getPeriodById = async (period_id) => {
  try {
    return prisma.period.findUnique({
        where:{
        period_id
        }
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const deletePeriod = async(period_id)=>{
    try {
        return prisma.period.delete({
            where:{
            period_id
            }
        });
      } catch (error) {
        console.error({ message: error });
      }
}

module.exports = {
  createPeriod,
  updatePeriod,
  setActionPeriod,
  getPeriods,
  getPeriodById,
  deletePeriod
};
