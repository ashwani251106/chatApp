const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const messageSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        trim:true,
    },
    content:{
        type:String,
        required:true,
        
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
        requird:true
    },
    seenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true }
    }]


},{
    timestamps:true
})

const Message = mongoose.model("Message",messageSchema)
module.exports = Message

