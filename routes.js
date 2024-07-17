const express = require("express");
const authController = require("./controllers/authController");
const middleware = require("./middlewares/middleware");

const router = express.Router();

router.post("/sign-up",authController.register);
router.post("/sign-in",authController.login);

router.get("/protected",middleware.verifyToken,(req,res) =>{
    res.json({message: "This is a protected route",userId: req.userId})
})

module.exports = router