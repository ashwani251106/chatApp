const post_req_login = require("../controllers/loginController");
const post_req_register = require("../controllers/registrationContoller");

const express = require("express")
const userRouter = express.Router()
userRouter.post("/register",post_req_register)
userRouter.post("/login",post_req_login)
userRouter.post("/logout",(req,res)=>{
    res.clearCookie("token")
    return res.status(200).json({message:"user Logged Out !"})
})
module.exports = userRouter
