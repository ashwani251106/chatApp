const User = require("../models/userModel")



const post_req_register  = async(req,res)=>{
    
    const {userName,email,password} = req.body;
    try {
        // finding the user
        const isUser = await User.findOne({email})
        if(isUser){
           return  res.status(400).json({message:"User Already Exist!"})
        }
        const user =  await User.create({
            userName,
            email,
            password
         })
         if(user){
            res.status(201).json({message:"User Created!",id:user._id,userName:user.userName})
         }
         
    }catch (error) {
        res.status(400).json({message:error.message})

    }
}
module.exports = post_req_register