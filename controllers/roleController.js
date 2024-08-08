const Role = require("../models/roleModel");
const { Server } = require("socket.io");
const io = new Server();
const createRole = async (req, res) => {
  try {
    const created = await Role.createRole(req.body);
    console.log(created);
    if (!created) {
      return res.status(404).json({ message: "don't create role" });
    }
    res.status(201).json(created);
  } catch (error) {
    console.error({ message: error });
  }
};
const getRole = async (req, res) => {
  try {
    const responsed = await Role.getRole();
    if (!responsed) {
      return res.status(404).json({ message: "don't get role" });
    }
    res.status(201).json(responsed);
  } catch (error) {
    console.error({ message: error });
  }
};

const sendRoleRequest = async (req, res) => {
    try {
      const { userId, roleId } = req.body;
      
      
      // const oldRequest = await Role.deleteOldRequest(userId);
      // console.log('oldRequest :',oldRequest);
      
      const response = await Role.RoleRequest(userId, roleId);
      console.log(response.data.role.id);
      if (!response) {
        return res.status(404).json({ message: "don't get role" });
      }
      
      
      // const idRoleRequest = response.Role.id;
      // console.log("idRoleRequest : ",idRoleRequest);
      


      res.status(201).json(response);
    } catch (error) {
      console.error({ message: error });
      res.status(500).json({ error: "Internal server error" });
    }
};
  
const resolveRole = async (req, res) => {
  try {
    const { requestId, status,userId } = req.body;
    console.log("status:", status);
    console.log("requestId:", requestId);
    console.log("userId:", userId);

    if(status !== 'REJECTED'){
      const deleteOldApprove = await Role.deleteStatusApprove(userId);
      console.log('deleteOldApprove :',deleteOldApprove);
    }
    

    const response = await Role.handlerRoleRequest(requestId, status);
    if (!response) {
      return res.status(404).json({ message: "don't get role" });
    }

    // io.emit("rolRequestHandled", { requestId, status });
    res.status(201).json(response);
  } catch (error) {
    console.error({ message: error });
  }
};

const getRoleRequestPending = async (req,res)=>{
  const { page=1,limit} = req.query;
  const skip = (page-1)*limit;
  console.log("skip",skip);
  console.log("page",page);
  
  
  try {
    
    const requestPending = await Role.getRoleRequestPending(skip,limit);
    if (!requestPending) {
      return res.status(404).json({ message: "don't get request pending!.." });
    }
    res.status(200).json(requestPending);
    
  } catch (error) {
    console.error({ message: error });
  }
}

module.exports = {
  createRole,
  getRole,
  sendRoleRequest,
  resolveRole,
  getRoleRequestPending,
};
