const permission = require("../models/permissionModel");

const createPermision = async (req, res) => {
  try {
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
// ฟังก์ชันสร้างฟอร์ม
const createPermissionForms = async (permissionId, formdata) => {
  try {
    // สร้าง internal forms
    for (const formId of formdata.internal) {
      await permission.createPermissionForm(permissionId, true, formId);
    }

    // สร้าง external forms
    for (const formId of formdata.external) {
      await permission.createPermissionForm(permissionId, false, formId);
    }
  } catch (error) {
    console.error("Form Creation Error:", error.message);
    throw new Error("Failed to create permission forms");
  }
};
const updatePermission = async (req, res) => {
  try {
    // permissions จะส่ง id ของ role ที่เป็น evaluator มา และ form Id ทั้ง External และ internal
    // assessorId
    const { assessorId, permissions } = req.body;
    // Validate input
    if (!assessorId || !permissions || typeof permissions !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing required fields",
      });
    }

    // หาก่อนว่า assessorId นี้มีpermission อยู่มั้ย
    const existingPermissions = await permission.findPermissionByRoleId(
      assessorId
    );

    // First, let's log the initial data
    console.log("Initial Permissions:", permissions);
    console.log("Existing Permissions:", existingPermissions);
    // สร้างฟังก์ชันสำหรับการ process permissions
    const processPermissions = async () => {
      // แปลง permissions object เป็น array of entries และ map แต่ละ entry
      const permissionResults = [];
      for (const [roleName, formdata] of Object.entries(permissions)) {
        try {
          // หา matching ใน existingPermissions
          const matchingExisting = existingPermissions.find(
            (existing) => existing.evaluator_role_id === formdata.id
          );
          console.log(`Checking Evaluator ID ${formdata.id}:`, {
            roleName,
            formdata,
            found: !!matchingExisting, // เป็นการแปลงค่าหรือ "cast" ค่าของตัวแปรให้เป็น Boolean (true หรือ false)
            // ถ้า matchingExisting มีค่าเป็น undefined, null, หรือค่าที่เป็น Falsy จะคืนค่าเป็น false
            // ถ้ามีการค้นหาที่เจอค่าที่ต้องการ (object หรือค่าอื่นที่เป็น Truthy) จะคืนค่าเป็น true
          });

          let permissionId = null;
          if (!matchingExisting) {
            // กรณีไม่พบ matching - เป็น permission ใหม่ที่ยังไม่มีใน existing
            // จะทำการสร้าง permission สร้างขึ้นมา เพื่อที่จะเก็บ form ลงไป
            const createPermisResult = await permission.createPermission(
              assessorId, // ผู้ประเมิน
              formdata.id // ผู้ถูกประเมิน
            );
            if (createPermisResult) {
              // Create internal permission forms
              permissionId = createPermisResult.permission_id;
              // สร้างฟอร์มให้กับ permission นั้นๆ ทั้งภายนอกและภายฝนย
              // ทำfunction createPermissionForms เพราะมีการลบและสร้างบ่อย และทำให้อ่านง่าย
              await createPermissionForms(permissionId, formdata);
            }

            // สร้าง permission และ formใส่เข้าไปใน permissionForm เสร็จ  ก็เก็บผลลัพไว้ว่าสร้างตัวไหนไป
            permissionResults.push({
              success: true,
              status: "new",
              permission_id: permissionId,
              evaluator_role_id: formdata.id,
              role_name: roleName,
            });

            // continue ใช้ใน loop เพื่อข้ามการทำงานในรอบปัจจุบัน และไปทำงานรอบถัดไปของ loop ทันที โดยจะไม่ประมวลผลโค้ดส่วนที่เหลือในรอบนั้น
            // หากไม่ใช้คำสั่ง continue โค้ดจะทำงานต่อไปด้านล่างของเงื่อนไขนี้ ซึ่งอาจมีการประมวลผลข้อมูลที่ซ้ำซ้อนหรือไม่จำเป็น มันเลยต้องข้ามจังหวะนี้
            continue;
          }
          // ----------------------------------
          // กรณีพบ matching - ดำเนินการ update
          // ---------------------------------
          permissionId = matchingExisting.permission_id;

          // ลบ permission forms เดิม
          await permission.deletePermissionForm(permissionId);
          // ----------------------------------------
          // สร้าง internal forms และ  external forms
          // --------------------- -----------------
          await createPermissionForms(permissionId, formdata);
          // เก็บ ผลลัพไว้ใน array
          permissionResults.push({
            success: true,
            status: "updated",
            permission_id: permissionId,
            evaluator_role_id: formdata.id,
            role_name: roleName,
          });
        } catch (error) {
          permissionResults.push({
            success: false,
            status: "error",
            evaluator_role_id: formdata.id,
            role_name: roleName,
            error: error.message,
          });
        }
      }

      // แยกผลลัพธ์ตามประเภท แล้วfilter ออกมาเป็นผลลัพตาม
      const newPermissions = permissionResults.filter(
        (result) => result.status === "new"
      );
      const updatedPermissions = permissionResults.filter(
        (result) => result.status === "updated"
      );
      const errorPermissions = permissionResults.filter(
        (result) => result.status === "error"
      );

      // หา existingPermissions ที่ไม่มีใน permissions (orphaned)
      const orphanedPermissions = existingPermissions.filter(
        (existing) =>
          !Object.values(permissions).some(
            (permission) => permission.id === existing.evaluator_role_id
          )
      );

      return {
        success: true,
        message: "Permissions processing completed",
        summary: {
          total_permissions: Object.keys(permissions).length,
          total_existing: existingPermissions.length,
          new_permissions: newPermissions.length,
          updated_permissions: updatedPermissions.length,
          orphaned_permissions: orphanedPermissions.length,
          error_count: errorPermissions.length,
        },
        details: {
          new_permissions: newPermissions,
          updated_permissions: updatedPermissions,
          orphaned_permissions: orphanedPermissions,
          errors: errorPermissions,
        },
        all_results: permissionResults,
      };
    };

    // ใช้งานตรวจสอบว่า มีpermission มั้ย และมีข้อมูลperrmisionส่งมารหือไม่
    if (existingPermissions.length > 0 || Object.keys(permissions).length > 0) {
      const result = await processPermissions();
      res.json(result);
    } else {
      res.json({
        success: false,
        message: "No permissions to process",
      });
    }
  } catch (error) {
    console.error("Permission update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update permissions",
      error: error.message,
    });
  }
};

const deletePermissionForm = async (req, res) => {
  try {
    console.log("delete", req.body);
    const { permission_id } = req.body;
    const deleted = await permission.deletePermissionForm(permission_id);
    if (!deleted) {
      throw new error("Deleted fail");
    }
    res.status(201).json({ message: "success deleted" });
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createPermision,
  updatePermission,
  deletePermissionForm,
};
