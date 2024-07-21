const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const DeleteImage = async (imageId) => {
  try {
    return await prisma.image.delete({
      where: { id: imageId.id },
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
              public_id: image.filename, // Assuming req.file.filename is the public_id
            },
          });
        
    } catch (error) {
        console.error({ message: error });

    }
}
module.exports = {
  DeleteImage,
  CreateImage
};
