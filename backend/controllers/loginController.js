
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")

const post_req_login = async(req,res)=>{
    const {email,password} = req.body;
    try {
        const userFound = await User.findOne({email})
        if(!userFound){
           return  res.status(401).json({message:"invalid credentials"})
        }
        const validUser = await userFound.checkPassword(password)
        if(!validUser){
            return res.status(401).json({message:"invalid credentials"})
        }
        const token = jwt.sign({
            id:userFound._id,
            isAdmin:userFound.isAdmin
        },process.env.SECRET_KEY,{
            expiresIn:"1d"
        })

        res.cookie("token",token,{
            maxAge:1000*3600*24,
            
            httpOnly: true,
            sameSite: "strict"
        })
        return res.status(200).json({
            message:"user found",
            id:userFound._id,
            name:userFound.userName,
            admin:userFound.isAdmin
        })
           
                

    } catch (error) {
        res.status(400).json({message:error.message})
    }
}
module.exports = post_req_login