const express = require("express")
const Message = require("../models/chatModel")
const isAuth = require("../middlewares/authMiddleware")
const Group = require("../models/groupModel")

const messageRouter = express.Router()
messageRouter.post("/",isAuth,async (req,res)=>{
    try {
        const {content,group} = req.body
        const groupFound= await Group.findById(group)
        const sender = groupFound.members.some(member => member.toString() === req.user.id)

        if(!sender){
            res.status(400).json({message:"you can't send message in this group!"})
        }else{
            const message = await Message.create({
                sender:req.user.id,
                content,
                group
           }) 
        const populateMessage = await Message.findById(message._id)
            .populate("sender","userName email")
            .populate("seenBy", "userName")
            .populate("reactions.user", "userName");
         res.status(200).json(populateMessage)
        }
           

       

    } catch (error) {
        res.status(400).json({message:error.message})
    }
})
messageRouter.get("/:groupId", isAuth, async(req,res)=>{
    const User = require("../models/userModel");
    try {
        const user = await User.findById(req.user.id);
        let joinDate = new Date(0); // Epoch, fallback if not found
        
        if (user && user.joinedGroups) {
            const joinInfo = user.joinedGroups.find(g => g.groupId && g.groupId.toString() === req.params.groupId);
            if (joinInfo && joinInfo.joinedAt) {
                joinDate = joinInfo.joinedAt;
            }
        }

        const message = await Message.find({
            group: req.params.groupId,
            createdAt: { $gte: joinDate }
        })
            .populate("sender","userName email")
            .populate("seenBy", "userName")
            .populate("reactions.user", "userName")
            .sort({createdAt: 1})
            
        res.status(200).json(message)
    } catch (error) {
        res.status(400).json({message:error.message})
    }
})

messageRouter.put("/:messageId/react", isAuth, async(req, res)=>{
    try {
        const { emoji } = req.body;
        const message = await Message.findById(req.params.messageId);
        if(!message) return res.status(404).json({message: "Message not found"});
        
        // Remove existing reaction by this user
        message.reactions = message.reactions.filter(r => r.user.toString() !== req.user.id);
        
        // Add new reaction if emoji is provided
        if(emoji) {
            message.reactions.push({ user: req.user.id, emoji });
        }
        
        await message.save();
        const updatedMessage = await Message.findById(message._id)
            .populate("sender","userName email")
            .populate("seenBy", "userName")
            .populate("reactions.user", "userName");
            
        res.status(200).json(updatedMessage);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
});

messageRouter.put("/:messageId/seen", isAuth, async(req, res)=>{
    try {
        const message = await Message.findById(req.params.messageId);
        if(!message) return res.status(404).json({message: "Message not found"});
        
        if(!message.seenBy.includes(req.user.id)) {
            message.seenBy.push(req.user.id);
            await message.save();
        }
        
        const updatedMessage = await Message.findById(message._id)
            .populate("sender","userName email")
            .populate("seenBy", "userName")
            .populate("reactions.user", "userName");
            
        res.status(200).json(updatedMessage);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
});


module.exports = messageRouter