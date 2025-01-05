const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkPeriodOverlap = async (newStart, newEnd) => {
  try {
    const overlappingPeriod = await prisma.period.findFirst({
      where: {
        OR: [
          {
            AND: [
              { start: { lte: newStart } },
              { end: { gte: newStart } }
            ]
          },
          {
            AND: [
              { start: { lte: newEnd } },
              { end: { gte: newEnd } }
            ]
          },
          {
            AND: [
              { start: { gte: newStart } },
              { end: { lte: newEnd } }
            ]
          }
        ]
      }
    });

    return overlappingPeriod;
  } catch (error) {
    console.error({ message: error });
    throw error;
  }
};
const validateDateTime = (dateTimeStr) => {
  // ตรวจสอบรูปแบบ ISO datetime
  const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!isoDateTimeRegex.test(dateTimeStr)) {
    throw new Error(`Invalid datetime format: ${dateTimeStr}. Expected format: YYYY-MM-DDTHH:mm:ss.sssZ`);
  }
  
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime: ${dateTimeStr}`);
  }
  
  return date;
};
const createPeriod = async (data) => {
  try {
    return prisma.period.create({
      data: {
        title: data.title,
        start: data.start,
        end: data.end,
        isAction: data.isAction ?? false,
      },
    });
  } catch (error) {
    console.error({ message: error.message });
    // throw error;
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

const setBackupTrue = async(period_id)=>{
  try {
    return prisma.period.update({
      where:{
        period_id
      },
      data:{
        backUp:true
      }
    })
    
  } catch (error) {
    console.log(error);
    
  }
}
const setBackupFalse = async(period_id)=>{
  try {
    return prisma.period.update({
      where:{
        period_id
      },
      data:{
        backUp:false
      }
    })
    
  } catch (error) {
    console.log(error);
    
  }
}


module.exports = {
  createPeriod,
  updatePeriod,
  setActionPeriod,
  getPeriods,
  getPeriodById,
  deletePeriod,
  checkPeriodOverlap,
  validateDateTime,
  setBackupTrue,
  setBackupFalse
};
