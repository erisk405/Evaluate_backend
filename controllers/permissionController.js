const permission = require("../models/permissionModel");

const createPermision = async (req, res) => {
  try {
    const { id, role_name, description, role_level } = req.body;
    const { data, assessorID } = req.body;
    console.log("createPermision", { assessorID, data });
    const promises = Object.entries(data).map(
      // Object.entries() คือวิธีที่ช่วยให้เราสามารถแปลง object เป็น array of key-value pairs ได้อย่างสะดวก
      async ([roleName, roleData]) => {
        try {
          console.log("roleName:", roleName);
          console.log("roleData.ID:", roleData.id);
          const createPermisResult = await permission.createPermission(
            assessorID,
            roleData.id
          );
          // Create internal permission forms
          const internalPromises = roleData.internal.map(async (formId) => {
            return permission.createPermissionForm(
              createPermisResult.permission_id,
              true,
              formId
            );
          });
          await Promise.all(internalPromises);

          // Create external permission forms
          const externalPromises = roleData.external.map(async (formId) => {
            return permission.createPermissionForm(
              createPermisResult.permission_id,
              false,
              formId
            );
          });
          await Promise.all(externalPromises);

          return createPermisResult;
        } catch (error) {
          console.error(
            `Error creating permission for role ${roleName}:`,
            error
          );
          throw error;
        }
      }
    );

    // Wait for all permissions to be created
    const results = await Promise.allSettled(promises);

    // Filter out any rejected promises
    const successfulResults = results.filter(
      (result) => result.status === "fulfilled" //result.status ใน Promise.allSettled() จะบอกสถานะว่าเป็น "fulfilled" หรือ "rejected"
    );

    res.status(200).json({
      status: "success",
      data: successfulResults.map((result) => result.value),
    });
  } catch (error) {
    console.error({ message: error });
    res.status(500).json({ error: error.message });
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
