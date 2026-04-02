const Group = require("../models/groupModel");
const Message = require("../models/chatModel");
const User = require("../models/userModel");

const delete_req_group = async(req,res)=>{
    try {
        const groupId = req.params.id;
        const group = await Group.findById(groupId);
        
        if(!group) return res.status(404).json({message: "Group not found"});
        
        if(group.admin.toString() !== req.user.id) {
            return res.status(403).json({message: "Only the admin can delete this group"});
        }
        
        // Remove group
        await Group.findByIdAndDelete(groupId);
        
        // Cleanup messages
        await Message.deleteMany({group: groupId});
        
        // Cleanup joinedGroups ref from all users
        await User.updateMany({}, { $pull: { joinedGroups: { groupId: groupId } } });
        
        res.status(200).json({message: "Group successfully deleted"});
    } catch(error) {
        res.status(400).json({message: error.message});
    }
}

module.exports = delete_req_group;
