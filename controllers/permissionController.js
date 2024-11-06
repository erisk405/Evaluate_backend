const permission = require("../models/permissionModel");

const createPermision = async (req, res) => {
  try {
    const permis = req.body;
    console.log("createPermision", permis);
    // const create = await permission.createPermission()
    const promises = Object.entries(permis.data).map(async ([role, roleData]) => {
      console.log('Role:', role);
      console.log('ID:', roleData.id);

      const createPermis = await permission.createPermission(permis.assessorID, roleData.id);
      console.log("createPermis", createPermis);
      
      // Handle internal permissions if they exist
      if (roleData.internal) {
        roleData.internal.map(async (element) => {
          console.log('Internal permissions xxx:', element);
          const createPermissionForm = await permission.createPermissionForm(createPermis.permission_id,true,element);
          console.log("createPermissionForm", createPermissionForm);
        });
      }
      
      // Handle external permissions if they exist
      if (roleData.external) {
        console.log('External permissions:', roleData.external);
        roleData.internal.map(async (element) => {
          console.log('Internal permissions xxx:', element);
          const createPermissionForm = await permission.createPermissionForm(createPermis.permission_id,false,element);
          console.log("createPermissionForm", createPermissionForm);
        });
      }

      return createPermis;
    });

    // Wait for all permissions to be created
    const results = await Promise.all(promises);
    
    res.status(200).json({
      status: "success",
      data: results
    });
  } catch (error) {
    console.error({ message: error });
  }
};
const updatePermission = async (req, res) => {
  try {
    console.log("kuy", req.body);

    const edit = await permission.updatePermission(req.body);
    console.log(edit);
    res.status(201).json(edit);
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createPermision,
  updatePermission,
};
