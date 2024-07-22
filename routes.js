const express = require("express");
const authController = require("./controllers/authController");
const middleware = require("./middlewares/middleware");
const userController = require("./controllers/userController")
const formController = require("./controllers/formController")
const departmentController = require("./controllers/departmentController")
const roleController = require("./controllers/roleController");
const { upload } = require("./controllers/routeUpload");
const router = express.Router();

router.post("/sign-up",authController.register);
router.post("/sign-in",authController.login);
router.post('/sign-out',authController.logout);



router.get("/form",formController.getAllform)
router.get("/questionType",formController.getQuestionType) 
router.get("/department",departmentController.getDepartments)
router.get("/role",roleController.getRole)


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
router.post("/department",middleware.verifyToken,middleware.verifyAdmin,departmentController.createDepartment)

router.post("/form",middleware.verifyToken,middleware.verifyAdmin,formController.createForm)
router.get("/allUsers",middleware.verifyToken,middleware.verifyAdmin,userController.getAllUsers)
router.put("/usersRole/:id",middleware.verifyToken,middleware.verifyAdmin,userController.setUserRole);
router.put("/role",middleware.verifyToken,middleware.verifyAdmin,userController.showRole);


module.exports = router