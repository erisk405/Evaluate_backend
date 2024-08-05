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
      const response = await Role.RoleRequest(userId, roleId);
      if (!response) {
        return res.status(404).json({ message: "don't get role" });
      }
      const idRequest = response.id;
      console.log("idRequest:", idRequest);
      // io.emit("newRoleRequest", { userId, roleId, idRequest });
      res.status(201).json(response);
    } catch (error) {
      console.error({ message: error });
      res.status(500).json({ error: "Internal server error" });
    }
};
  
const adminSendRole = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    console.log("status:", status);
    console.log("requestId:", requestId);
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
  try {
    const requestPending = await Role.getRoleRequestPending();
    if (!requestPending) {
      return res.status(404).json({ message: "don't get request pending!.." });
    }
    res.status(201).json(requestPending);
    
  } catch (error) {
    console.error({ message: error });
  }
}

module.exports = {
  createRole,
  getRole,
  sendRoleRequest,
  adminSendRole,
  getRoleRequestPending,
};
