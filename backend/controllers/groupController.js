const Group = require("../models/groupModel")


const post_req_group = async(req,res)=>{
    try {
        const {name,description} = req.body
       
        
        const group = await Group.create({
            name,
            description,
            admin:req.user.id,
            members:[req.user.id]
        })
        
        const User = require("../models/userModel")
        const user = await User.findById(req.user.id)
        if(user) {
            user.joinedGroups.push({ groupId: group._id, joinedAt: new Date() })
            await user.save()
        }
        
        const populateGroup = await Group.findById(group._id).populate("admin","userName email").populate("members","userName email");
        res.status(201).json({populateGroup})
    } catch (error) {
        res.status(400).json({message:error.message})
    }
}
module.exports = post_req_group