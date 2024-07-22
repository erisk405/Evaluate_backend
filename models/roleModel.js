const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createRole = async(role)=>{
    try {
        return prisma.role.create({
            data:{
                role_name:role.role_name,
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
const checkMemberRole = async()=>{
    try {
        const memberRole = await prisma.role.findUnique({
            where: { role_name: 'member' }
        });
        if (!memberRole) {
            const created = await prisma.role.create({
                data:{
                    role_name:"member"
                }
            })
            return created
        }
        return memberRole
        
    } catch (error) {
        console.error({message:error});
    }
}

module.exports = {
    createRole,
    getRole,
    checkMemberRole
}