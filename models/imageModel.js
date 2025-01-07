const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const DeleteImage = async (imageId) => {
  try {
    return await prisma.image.delete({
      where: { id: imageId },
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const CreateImage = async (image)=>{
    try {
        return await prisma.image.create({
            data: {
              url: image.path,
              public_id: image.filename.replace(/\.[^/.]+$/, ''), // Assuming req.file.filename is the public_id
            },
          });
        
    } catch (error) {
        console.error({ message: error });

    }
}
const findImageById = async (imageId)=>{
  try {
      return await prisma.image.findUnique({
          where: {
            id:imageId
          }
        });
      
  } catch (error) {
      console.error({ message: error });

  }
}

const CreateDepartmentImage = async (image)=>{
  try {
      return await prisma.image.create({
          data: {
            url: image.url,
            public_id: image.public_id, // Assuming req.file.filename is the public_id
          },
        });
      
  } catch (error) {
      console.error({ message: error });

  }
}
module.exports = {
  DeleteImage,
  CreateImage,
  CreateDepartmentImage,
  findImageById
};
