
const Group = require("../models/groupModel");


const post_req_join = async(req,res)=>{
    try {
        const group = await Group.findById(req.params.id)
       const {name,description,_id} = group
        if(!group){
            res.status(404).json({message:"group doesn't exist"})   
        }else if(group.members.includes(req.user.id)){
            res.status(409).json({message:"user already exist!"})
        }else{
            
            group.members.push(req.user.id)
            await group.save()
            
            const User = require("../models/userModel")
            const user = await User.findById(req.user.id)
            if (user) {
                user.joinedGroups.push({ groupId: group._id, joinedAt: new Date() })
                await user.save()
            }
            
            res.status(201).json({message:"Added successfully!",name,description,id:_id})
        }
        
       

    } catch (error) {
        res.status(400).json({message:error.message})
    }
}
module.exports = post_req_join
