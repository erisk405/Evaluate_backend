const Role = require("../models/roleModel");
const User = require("../models/userModel");
const permission = require("../models/permissionModel");
const form = require("../models/formModel");
const createRole = async (req, res) => {
  try {
    const {roleName,description,roleLevel} = req.body;
    
    const created = await Role.createRole(roleName,description,roleLevel);
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

const updateRole = async (req, res) => {
  try {
    const {role_id,roleName,description,roleLevel} = req.body;
    
    const updated = await Role.updateRole(role_id,roleName,description,roleLevel);
    console.log(updated);
    if (!updated) {
      return res.status(404).json({ message: "don't updated role" });
    }
    res.status(201).json(updated);
  } catch (error) {
    console.error({ message: error });
  }
};

const deleteRole = async (req,res) => {
  try {
    const {id} = req.body
    const permissionfind = await permission.findPermissionByRoleId(id);
    if(!!permissionfind){
      for(const [_,value]of Object.entries(permissionfind)){
        // console.log("value",value);
        const deletePermissionForm = await permission.deletePermissionForm(value.permission_id);
        // console.log("deletePermissionForm",deletePermissionForm);
        
      }
      const deletePermission = await permission.deletePermission(id);
      // console.log("deletePermission",deletePermission);
      
    }
    const deleteVision = await form.deleteVisionByRoleId(id)
    if (!deleteVision) {
      return res.status(404).json({ message: "cannot delete formVision" });
    }
    const responsed = await Role.deleteRole(id)
    if (!responsed) {
      return res.status(404).json({ message: "don't get role" });
    }
    res.status(201).json(responsed);
  } catch (error) {
    console.error({ message: error });
    res.status(500).json({ message: "Error deleting role", error: error.message });
  }
}


const sendRoleRequest = async (req, res) => {
    try {
      const { userId, roleId } = req.body;
      
      
      const oldRequest = await Role.deleteOldRequest(userId);
      console.log('oldRequest :',oldRequest);
      
      const response = await Role.RoleRequest(userId, roleId);
      console.log(response.data.role.id);
      if (!response) {
        return res.status(404).json({ message: "don't get role" });
      }
      
      


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
    const statusResponse = response.status;
    const roleId = response.role.id;
  
    
    console.log("statusResponse :",statusResponse);
    console.log("roleId :",roleId);
    
    if(statusResponse === 'APPROVED'){
      const setUserRole = await User.setUserRole(userId,roleId);
      if(!setUserRole){
        return res.status(404).json({ message: "don't set UserRole" });
      }
      console.log('updated UserRole');
      
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
  deleteRole,
  updateRole
};
