const express = require("express");
const authController = require("./controllers/authController");
const middleware = require("./middlewares/middleware");
const userController = require("./controllers/userController")
const formController = require("./controllers/formController")
const departmentController = require("./controllers/departmentController")
const roleController = require("./controllers/roleController");
const { upload, uploadDepartmentImage } = require("./controllers/routeUpload");
const router = express.Router();

router.post("/sign-up",authController.register);
router.post("/sign-in",authController.login);
router.post('/sign-out',authController.logout);


router.get("/form",formController.getAllform)
router.get("/questionType",formController.getQuestionType) 
router.get("/department",departmentController.getDepartments)
router.get("/department/:id",departmentController.getDepartment)
router.get("/role",roleController.getRole)
router.get("/findUserEmplyDepartment",userController.findUserEmptyDepartment);

router.post('/sendRoleRequest',roleController.sendRoleRequest)
router.patch('/resolveRole',roleController.resolveRole)

router.get("/protected",middleware.verifyToken,(req,res) =>{
    res.json({message: "This is a protected route",userId: req.userId,role:req.role})
})

router.get("/userProfile",middleware.verifyToken,userController.findUser);
router.get("/myProfile",middleware.verifyToken,userController.getMyProfile)
router.put("/usersDepartment",middleware.verifyToken,userController.setDepartment);
router.put("/usersImage", upload.single('image'), middleware.verifyToken, userController.updateUserImage);


// admin path
router.post("/role",middleware.verifyToken,middleware.verifyAdmin,roleController.createRole)
router.post("/questionType",middleware.verifyToken,middleware.verifyAdmin,formController.createQuestionType)
router.post("/question",middleware.verifyToken,middleware.verifyAdmin,formController.createQuestion)
router.post("/department",uploadDepartmentImage.single('image'),middleware.verifyToken,middleware.verifyAdmin,departmentController.createDepartment)

router.put('/department-image/:id',middleware.verifyToken,middleware.verifyAdmin,uploadDepartmentImage.single('image'),departmentController.updateDepartmentImage);
router.put('/department',middleware.verifyToken,middleware.verifyAdmin,departmentController.updateDepartment);
router.post("/form",middleware.verifyToken,middleware.verifyAdmin,formController.createForm)
router.get("/allUsers",middleware.verifyToken,middleware.verifyAdmin,userController.getAllUsers)
router.get("/roleRequestPending",middleware.verifyToken,middleware.verifyAdmin,roleController.getRoleRequestPending)
router.put("/usersRole/:id",middleware.verifyToken,middleware.verifyAdmin,userController.setUserRole);
router.put("/role",middleware.verifyToken,middleware.verifyAdmin,userController.showRole);
router.put("/usersToDepartment",middleware.verifyToken,middleware.verifyAdmin,userController.addUserstoDepartment);


module.exports = router