const isAdmin = (req,res,next)=>{
    try {
        const user = req.user
        console.log(user);
        
        if(user && user.isAdmin){
           
          return next();
        }else{
              res.status(501).json({message:"Not an Admin you cannot create the group!"})
        }
      
    } catch (error) {
        res.status(400).json({message:error.message})
    }
}
module.exports = isAdmin