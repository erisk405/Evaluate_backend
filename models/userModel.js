const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createUser = async (user) => {
  const password = await user.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  return prisma.user.create({
    data: {
      uid: user.uid,
      email: user.email,
      name: user.name,
      password: hashedPassword,
      role_id: user.role_id,
      department_id: user.department_id,
      dateofbirth: new Date(user.dateofbirth),
    },
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email: email },
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      image_id:true
    },
  });
};
const setDepartment = async(departmentId,uid)=>{
  try {
    return prisma.user.update({
      where:{
        id:uid,
      },
      data:{
        department_id:departmentId
      }
    })
  } catch (error) {
    console.error({message:error});
  }
}
const setRole = async(roleId,uid)=>{
  try {
    return prisma.user.update({
      where:{
        id:uid,
      },
      data:{
        role_id:roleId
      }
    })
  } catch (error) {
    console.error({message:error});
  }
}

const CheckOldImage = async(user)=>{
  try {
    return await prisma.image.findUnique({
      where: { id: user.image_id },
    });
  } catch (error) {
    console.error({message:error});
  }
}

const updateImage = async(userId,imageId)=>{
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { image_id: imageId},
    });
    
  } catch (error) {
    console.error({message:error});

  }
}


module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  setDepartment,
  setRole,
  CheckOldImage,
  updateImage
};

