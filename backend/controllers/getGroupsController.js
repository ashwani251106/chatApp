const Group = require("../models/groupModel");

const post_req_getGroups = async(req,res)=>{
    const {name} = req.body
    try {
        const query = name ? { name: { $regex: name, $options: 'i' } } : {};
        const group = await Group.find(query).populate("members","userName email").populate("admin","userName email")
        if(group.length===0){
            return res.status(404).json({message:"group not found!"})
        }else{
            return res.status(200).json(group)
        }




        
    } catch (error) {
        res.status(400).json({message:error.message})
    }
}


  const post_req_allGroup = async(req,res)=>{
    const userId = req.user.id
    try {
        const groupOfUser = await Group.find({members:userId})
        
        if(groupOfUser.length===0){
          return  res.status(404).json({message:"no group for you"})
        }else{
            const onlyNameAndDes = groupOfUser.map(
                (group)=>{return {name:group.name,description:group.description,id:group._id, admin:group.admin}}
            )
            return res.status(200).json(onlyNameAndDes)
        }
        

    } catch (error) {
        return res.status(400).json({message:error.message})
    }
}
module.exports = {
    post_req_getGroups , 
    post_req_allGroup}