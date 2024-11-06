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


const updatePermission = async (data) =>{
  try{
  }catch(error){
    console.error({ message: error });
  }
};

module.exports = {
  createPermission,
  updatePermission,
  createPermissionForm
};
