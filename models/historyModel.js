const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createHistory = async (historyData,tx) => {
  try {
    const user_id = historyData.user_id;
    const period_id = historyData.period_id;
    const role_name = historyData.role_name;
    const department_name = historyData.department_name;
    const total_SD = historyData.total_SD;
    const total_mean = historyData.total_mean;
    
    return tx.history.create({
        data:{
            user_id,
            period_id,
            role_name,
            department_name,
            total_SD,
            total_mean
        }
    })
  } catch (error) {
    console.error("Error failed to create history for UserID :", user_id);
    throw error;
  }
};

const createHistoryDetail= async (historyDetailData,tx) => {
    try {
        return tx.historyDetail.create({
            data:{
                history_id:historyDetailData.history_id,
                questionHead:historyDetailData.questionHead,
                level:historyDetailData.level
            }
        });
    } catch (error) {
      console.error("Error failed to create historyDetail");
      throw error;
    }
  };

  const createHistoryQuestionScore= async (questionScoreData,tx) => {
    try {
        const dataCreate = await tx.historyQuestionScore.createMany({
            data:questionScoreData.map((data)=>({
                history_detail_id:data.history_detail_id,
                question:data.question,
                type_name:data.type_name,
                mean:data.mean,
                SD:data.SD
            }))
        })
        return dataCreate
    } catch (error) {
      console.error("Error failed to create historyDetail");
      throw error;
    }
  };

  const createHistoryFormScore= async (formScore,tx) => {
    try {
        const dataCreate = await tx.historyFormScore.createMany({
            data:formScore.map((data)=>({
                history_detail_id:data.history_detail_id,
                type_name:data.type_name,
                total_SD_per_type:data.total_SD_per_type,
                total_mean_per_type:data.total_mean_per_type
            }))
        })
        return dataCreate
    } catch (error) {
      console.error("Error failed to create historyDetail");
      throw error;
    }
  };

module.exports = {
    createHistory,
    createHistoryDetail,
    createHistoryQuestionScore,
    createHistoryFormScore
};
