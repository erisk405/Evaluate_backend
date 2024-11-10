const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPermission = async (assessor_role_id,evaluator_role_id) => {
  try {
    return prisma.permission.create({
      data:{
        assessor_role_id,
        evaluator_role_id
      }
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const createPermissionForm = async (permission_id,inGroup,form_id) => {
  try {
    return prisma.permissionForm.create({
      data:{
        permission_id:permission_id,
        form_id:form_id,
        ingroup:inGroup
      }
    });
  } catch (error) {
    console.error({ message: error });
  }
};


const updatePermissionForm = async (permission_id,inGroup,form_id) =>{
  try{
  }catch(error){
    console.error({ message: error });
  }
};

const deletePermissionForm = async (permission_id) =>{
  try{
    return prisma.permissionForm.deleteMany({
      where:{
        permission_id: permission_id,
      }
    });

  }catch(error){
    console.error({ message: error });
  }
};

const findPermissionByRoleId = async (role_id) =>{
 try {
  return prisma.permission.findMany({
    where:{
      assessor_role_id:role_id,
    }

  })
 } catch (error) {
  
 }
};

const findPermissionFormById = async (permission_id) =>{
  try {
   return prisma.permissionForm.findMany({
     where:{
      permission_id,
     }
 
   })
  } catch (error) {
   
  }
 };
module.exports = {
  createPermission,
  updatePermissionForm,
  createPermissionForm,
  deletePermissionForm,
  findPermissionByRoleId,
  findPermissionFormById
};
