const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPermission = async (assessor_role_id, evaluator_role_id) => {
  try {
    console.log("evaluator_role_id", evaluator_role_id);

    return prisma.permission.create({
      data: {
        assessor_role_id,
        evaluator_role_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const createPermissionForm = async (permission_id, inGroup, form_id) => {
  try {
    return prisma.permissionForm.create({
      data: {
        permission_id: permission_id,
        form_id: form_id,
        ingroup: inGroup,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const updatePermissionForm = async (permission_id, inGroup, form_id) => {
  try {
  } catch (error) {
    console.error({ message: error });
  }
};

const deletePermissionForm = async (permission_id) => {
  try {
    return prisma.permissionForm.deleteMany({
      where: {
        permission_id: permission_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const deletePermission = async (assessor_role_id) => {
  try {
    return prisma.permission.deleteMany({
      where: {
        assessor_role_id: assessor_role_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const findPermissionByRoleId = async (role_id) => {
  try {
    return prisma.permission.findMany({
      where: {
        assessor_role_id: role_id,
      },
    });
  } catch (error) {}
};

const findPermissionFormById = async (permission_id) => {
  try {
    return prisma.permissionForm.findMany({
      where: {
        permission_id,
      },
      select:{
        form:{
          select:{
            id:true,
            name:true,
          }
        },
        ingroup:true
      }
    });
  } catch (error) {}
};

const findEvaluatorPermissions = async (userId) => {
  try {
    const evaluatorPermissions = await prisma.permission.findMany({
      where: {
        evaluatorRole: {
          user: {
            some: {
              id: userId, // กรองเฉพาะ evaluator ที่เป็น user นี้
            },
          },
        },
        permissionForm: {
          some: {}, // กรองเฉพาะ permissionForm ที่มีค่า
        },
      },
      select: {
        permission_id: true,
        permissionForm: {
          select: {
            form: {
              select: {
                id: true,
                name: true,
              },
            },
            ingroup:true
          },
          
        },
        assessorRole: {
          select: {
            id: true,
            role_name: true,
          },
        },
      },
    });
    return evaluatorPermissions;
  } catch (error) {
    console.error('Error finding evaluator permissions:', error);
  }
};

module.exports = {
  createPermission,
  updatePermissionForm,
  createPermissionForm,
  deletePermissionForm,
  findPermissionByRoleId,
  findPermissionFormById,
  deletePermission,
  findEvaluatorPermissions,
};
