const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createHistory = async (historyData) => {
  try {
    const user_id = historyData.user_id;
    const period_id = historyData.period_id;
    const role_name = historyData.role_name;
    const department_name = historyData.department_name;
    const total_SD = historyData.total_SD;
    const total_mean = historyData.total_mean;

    return prisma.history.create({
      data: {
        user_id,
        period_id,
        role_name,
        department_name,
        total_SD,
        total_mean,
      },
    });
  } catch (error) {
    console.error("Error failed to create history for UserID :", user_id);
    throw error;
  }
};

const createHistoryDetail = async (historyDetailData,tx) => {
  try {
    return tx.historyDetail.create({
      data: {
        history_id: historyDetailData.history_id,
        questionHead: historyDetailData.questionHead,
        level: historyDetailData.level,
      },
    });
  } catch (error) {
    console.error("Error failed to create historyDetail");
    throw error;
  }
};

const createHistoryQuestionScore = async (questionScoreData,tx) => {
  try {
    // ใช้ prisma โดยตรงแทน tx
    const dataCreate = await tx.historyQuestionScore.createMany({
      data: questionScoreData.map((data) => ({
        history_detail_id: data.history_detail_id,
        question: data.question,
        type_name: data.type_name,
        mean: data.mean,
        SD: data.SD,
      })),
    });
    return dataCreate;
  } catch (error) {
    console.error("Error failed to create historyQuestionScore");
    throw error;
  }
};


const createHistoryFormScore = async (formScore,tx) => {
  try {
    const dataCreate = await tx.historyFormScore.createMany({
      data: formScore.map((data) => ({
        history_detail_id: data.history_detail_id,
        type_name: data.type_name,
        total_SD_per_type: data.total_SD_per_type,
        total_mean_per_type: data.total_mean_per_type,
      })),
    });
    return dataCreate;
  } catch (error) {
    console.error("Error failed to create historyDetail");
    throw error;
  }
};

const findResultEvaluateFormHistoryByUserId = async(period_id,user_id) =>{
  try {
    return prisma.history.findFirst({  // ไม่สามารถใช้ findUnique ได้เพราะ เป็น unique แบบคู่
      where:{
        period_id,
        user_id
      },
      include:{
        user:{
          select:{
            name:true,
            prefix:true
          }
        },
        period:{
          select:{
            title:true
          }
        },
        history_detail:{
          include:{
            historyQuestionScore:true,
            historyFormScore:true
          }
        },

      }
    })
  } catch (error) {
    console.log(error);
  }
}

const getTotalMeanAndSDByUserId = async (period_id,user_id)=>{
  try {
    const find = prisma.history.findFirst({
      where:{
        period_id,
        user_id
      }
      ,select:{
        total_mean:true,
        total_SD:true
      }
    })
    
    return find
  } catch (error) {
    console.log(error);
    
  }
}

const deleteHistoryById = async (history_id,tx)=>{
  try {
    return tx.history.delete({
      where:{
        history_id
      }
    });
  } catch (error) {
    console.log(error);
    
  }
} 

const findHistoryByPeriod = async(period_id)=>{
  try {
    return prisma.history.findMany({
      where:{
        period_id
      },
      include:{
        history_detail:true
      }
    });
    
  } catch (error) {
    console.log(error);
    
  }
}

const deleteHistoryDetailByID= async(id,tx)=>{
  try {
    return tx.historyDetail.delete({
      where:{
        id
      }
    });
    
  } catch (error) {
    console.log(error);
    
  }
}
const deleteHistoryFormScore = async(history_detail_id,tx)=>{
  try {
    return tx.historyFormScore.deleteMany({
      where:{
        history_detail_id
      }
    });
    
  } catch (error) {
    console.log(error);
    
  }
}

const deleteHistoryQuestionScore = async(history_detail_id,tx)=>{
  try {
    return tx.historyQuestionScore.deleteMany({
      where:{
        history_detail_id
      }
    });
    
  } catch (error) {
    console.log(error);
    
  }
}



module.exports = {
  createHistory,
  createHistoryDetail,
  createHistoryQuestionScore,
  createHistoryFormScore,
  findResultEvaluateFormHistoryByUserId,
  getTotalMeanAndSDByUserId,
  deleteHistoryById,
  findHistoryByPeriod,
  deleteHistoryFormScore,
  deleteHistoryQuestionScore,
  deleteHistoryDetailByID
};
