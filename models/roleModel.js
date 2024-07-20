const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createRole = async(role)=>{
    try {
        return prisma.role.create({
            data:{
                role_name:role.roleName,
                description:role.description
            }
        })
        
    } catch (error) {
        console.error({message:error});
    }  
}
const getRole = async()=>{
    try {
        return prisma.role.findMany()
        
    } catch (error) {
        console.error({message:error});
    }  
}


module.exports = {
    createRole,
    getRole
}