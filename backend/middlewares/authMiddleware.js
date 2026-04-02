const jwt = require("jsonwebtoken")
const isAuth = async (req,res,next)=>{
    try {
         const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"unauthorized user!"})
    }
    req.user = await jwt.verify(token,process.env.SECRET_KEY)
  
    
    next()
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
   
    
}
module.exports = isAuth