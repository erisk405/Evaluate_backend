const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createForm = async (name) => {
  try {
    return prisma.form.create({
      data: {
        name: name,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const updateFormById = async (id, name) => {
  try {
    return prisma.form.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const createVisionForm = async (payload) => {
  try {
    const visionData = payload.stackFormLevel.map((item) => ({
      form_id: payload.formId,
      role_id: item.role_id,
      level: item.visionLevel,
    }));
    return prisma.roleFormVision.createMany({
      data: visionData,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("Error creating vision forms:", error);
    throw error; // Re-throw error for higher-level handling
  }
};
const deleteVisionAllOfForm = async (form_id) => {
  try {
    return prisma.roleFormVision.deleteMany({
      where: {
        form_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const deleteVisionByFormId = async (form_id) => {
  try {
    return prisma.roleFormVision.deleteMany({
      where: {
        form_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const deleteVisionByRoleId = async (role_id) => {
  try {
    return prisma.roleFormVision.deleteMany({
      where: {
        role_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const deleteFormById = async (id) => {
  try {
    return prisma.form.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    return error({ message: error });
  }
};
const getAllform = async () => {
  try {
    return prisma.form.findMany({
      include: {
        questions: true,
        roleFormVision: {
          select: {
            role_form_id: true,
            form_id: true,
            visionRole: true,
            level: true,
          },
        },
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const createRoleFormVision = async (payload) => {
  try {
    return prisma.roleFormVision.createMany({
      data: payload,
    });
  } catch (error) {
    console.error({ message: error });
  }
};

const findVisionFormLevel = async (form_id, role_id) => {
  try {
    return prisma.roleFormVision.findUnique({
      where: {
        form_id,
        role_id,
      },
    });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createForm,
  getAllform,
  updateFormById,
  deleteFormById,
  createRoleFormVision,
  findVisionFormLevel,
  createVisionForm,
  deleteVisionAllOfForm,
  deleteVisionByFormId,
  deleteVisionByRoleId
};
