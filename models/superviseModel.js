const { PrismaClient, RequestStatus } = require("@prisma/client");
const prisma = new PrismaClient();

const createSupervise = async (user_id, department_id) => {
  try {
    return prisma.supervise.create({
      data: {
        user_id,
        department_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const updateSupervise = async (supervise_id, user_id, department_id) => {
  try {
    return prisma.supervise.update({
      where: {
        supervise_id,
      },
      data: {
        user_id,
        department_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const deleteSupervise = async (supervise_id) => {
  try {
    return prisma.supervise.delete({
      where: {
        supervise_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const getSuperviseByUserId = async (user_id) => {
  try {
    return prisma.supervise.findMany({
      where: {
        user_id,
      },
      select: {
        supervise_id: true,
        department: {
          select:{
            id:true,
            department_name:true
          }
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const getSupervises = async () => {
  try {
    return prisma.supervise.findMany({
      select:{
        supervise_id:true,
        user:{
          select:{
            id:true,
            name:true,
            role:true,
            image:true,
            department:{
              select:{
                id:true,
                department_name:true
              }
            }
          }
        },
        department:{
          select:{
            id:true,
            department_name:true
          }
        }
      }
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const countSuperviseByDepartmentId = async(userId,department_id)=>{
  try {
    return prisma.supervise.findMany({
      where:{
        department_id,
        user:{
          id:{
            not:userId
          }
        }
      }
      ,select:{
        user:{
          select:{
            id:true,
            name:true
          }
        }
      }
    });
    
  } catch (error) {
    console.error({ message: error });
  }
}


module.exports = {
  createSupervise,
  updateSupervise,
  deleteSupervise,
  getSuperviseByUserId,
  getSupervises,
  countSuperviseByDepartmentId,
  countSuperviseByDepartmentId
};
