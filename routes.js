const express = require("express");
const authController = require("./controllers/authController");
const middleware = require("./middlewares/middleware");
const userController = require("./controllers/userController")
const formController = require("./controllers/formController")
const departmentController = require("./controllers/departmentController")
const roleController = require("./controllers/roleController")
const router = express.Router();

router.post("/sign-up",authController.register);
router.post("/sign-in",authController.login);
router.post('/sign-out',authController.logout);

router.post("/form",formController.createForm)
router.post("/questionType",formController.createQuestionType)
router.post("/question",formController.createQuestion)
router.post("/department",departmentController.createDepartment)
router.post("/role",roleController.createRole)

router.get("/form",formController.getAllform)
router.get("/questionType",formController.getQuestionType) 
router.get("/department",departmentController.getDepartments)
router.get("/role",roleController.getRole)


router.get("/protected",middleware.verifyToken,(req,res) =>{
    res.json({message: "This is a protected route",userId: req.userId})
})

router.get("/users",middleware.verifyToken,userController.findUser);
router.put("/usersDepartment",middleware.verifyToken,userController.setDepartment);
router.put("/usersRole",middleware.verifyToken,userController.setRole);



module.exports = router