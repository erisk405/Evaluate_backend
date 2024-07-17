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

const findUserByUsername = async (email) => {
  return prisma.user.findUnique({
    where: { email: email },
  });
};

module.exports = {
  createUser,
  findUserByUsername,
};
