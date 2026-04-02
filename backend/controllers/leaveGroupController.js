const Group = require("../models/groupModel");

const post_req__leave = async(req,res)=>{

    try {
         const groupId = req.params.id
    const userId = req.user.id

   const updatedGroup = await Group.findByIdAndUpdate(groupId,{$pull:{members:userId}},{new:true})
   
    const User = require("../models/userModel")
    await User.findByIdAndUpdate(userId, { $pull: { joinedGroups: { groupId: groupId } } })
 
    res.status(200).json({message:"left the group",updatedGroup})
    } catch (error) {
        res.status(400).json({message:error.message})
    }
   

}
module.exports = post_req__leave