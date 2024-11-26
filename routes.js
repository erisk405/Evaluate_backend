const express = require("express");
const authController = require("./controllers/authController");
const middleware = require("./middlewares/middleware");
const userController = require("./controllers/userController");
const formController = require("./controllers/formController");
const departmentController = require("./controllers/departmentController")
const roleController = require("./controllers/roleController");
const prefixController = require("./controllers/prefixController");
const permissionController = require("./controllers/permissionController");
const periodController = require("./controllers/periodController");
const evaluateController = require("./controllers/evaluateController");
const { upload, uploadDepartmentImage } = require("./controllers/routeUpload");
const router = express.Router();

router.get("/protected",middleware.verifyToken,(req,res) =>{
    res.json({message: "This is a protected route",userId: req.userId,role:req.role})
})
router.post("/sign-up",authController.register);
router.post("/sign-in",authController.login);
router.post('/sign-out',authController.logout);

//--------------perfix----------------------
router.get("/prefix",prefixController.getPrefix);
router.post("/prefix",middleware.verifyToken,middleware.verifyAdmin, prefixController.createPrefix);
router.put("/prefix",middleware.verifyToken,middleware.verifyAdmin, prefixController.updatePrefix);
router.delete("/prefix/:prefix_id",middleware.verifyToken,middleware.verifyAdmin, prefixController.deletePrefix);
//--------------perfix----------------------

//--------------department----------------------
router.post("/department",uploadDepartmentImage.single('image'),middleware.verifyToken,middleware.verifyAdmin,departmentController.createDepartment);
router.put('/department-image/:id',middleware.verifyToken,middleware.verifyAdmin,uploadDepartmentImage.single('image'),departmentController.updateDepartmentImage);
router.put('/department',middleware.verifyToken,middleware.verifyAdmin,departmentController.updateDepartment);
router.get("/department",departmentController.getDepartments);
router.get("/department/:id",middleware.verifyToken,departmentController.getDepartment);
//--------------department----------------------

//--------------role----------------------
router.get("/role",middleware.verifyToken,roleController.getRole)
router.post("/role",middleware.verifyToken,middleware.verifyAdmin,roleController.createRole)
router.delete("/role",middleware.verifyToken,middleware.verifyAdmin,roleController.deleteRole)
router.put("/role",middleware.verifyToken,middleware.verifyAdmin,roleController.updateRole);
router.post('/sendRoleRequest',middleware.verifyToken,roleController.sendRoleRequest)
router.patch('/resolveRole',middleware.verifyToken,middleware.verifyAdmin,roleController.resolveRole)
router.get("/roleRequestPending",middleware.verifyToken,middleware.verifyAdmin,roleController.getRoleRequestPending)
//--------------role----------------------

//--------------user----------------------
router.get("/findUserEmplyDepartment",userController.findUserEmptyDepartment);
router.get("/userProfile",middleware.verifyToken,userController.findUser);
router.get("/myProfile",middleware.verifyToken,userController.getMyProfile)
router.put("/usersDepartment",middleware.verifyToken,userController.setDepartment);
router.put("/usersRole/:id",middleware.verifyToken,middleware.verifyAdmin,userController.setUserRole);
router.put("/usersImage", upload.single('image'), middleware.verifyToken, userController.updateUserImage);
router.get("/allUsers",middleware.verifyToken,middleware.verifyAdmin,userController.getAllUsers)
router.put("/usersToDepartment",middleware.verifyToken,middleware.verifyAdmin,userController.setUserstoDepartment);
//--------------user----------------------

//--------------form----------------------
router.get("/form",formController.getAllform)
router.put('/form',middleware.verifyToken,middleware.verifyAdmin,formController.updateForm);
router.post("/form",middleware.verifyToken,middleware.verifyAdmin,formController.createForm)
router.delete("/form",middleware.verifyToken,middleware.verifyAdmin,formController.deleteForm)
router.post("/question",middleware.verifyToken,middleware.verifyAdmin,formController.createQuestion)
router.put("/question",middleware.verifyToken,middleware.verifyAdmin,formController.updateQuestion)
router.delete("/question",middleware.verifyToken,middleware.verifyAdmin,formController.deleteQuestion)
router.get("/questions/:formId",middleware.verifyToken,middleware.verifyAdmin,formController.getQuestions)
//--------------form----------------------

//--------------permission----------------------
router.post("/permission",middleware.verifyToken,middleware.verifyAdmin,permissionController.createPermision);
router.put("/permissionRole",middleware.verifyToken,middleware.verifyAdmin,permissionController.updatePermission);
router.delete("/permissionForm",middleware.verifyToken,middleware.verifyAdmin,permissionController.deletePermissionForm);
//--------------permission----------------------

//-------------period------------------------------->>>
router.post("/period",middleware.verifyToken,middleware.verifyAdmin,periodController.createPeriod);
router.put("/period",middleware.verifyToken,middleware.verifyAdmin,periodController.updatePeriod);
router.get("/periods",middleware.verifyToken,periodController.getAllPeriods);
router.get("/period/:period_id",middleware.verifyToken,middleware.verifyAdmin,periodController.getPeriodById);
router.delete("/period/:period_id",middleware.verifyToken,middleware.verifyAdmin,periodController.deletePeriod);
//-------------period------------------------------->>>

//-------------evaluate------------------------------->>>
router.post("/evaluate",middleware.verifyToken,middleware.verifyAdmin,evaluateController.createEvaluate);
//-------------evaluate------------------------------->>>

module.exports = router