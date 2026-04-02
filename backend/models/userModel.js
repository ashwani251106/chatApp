const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    joinedGroups: [{
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
        joinedAt: { type: Date, default: Date.now }
    }],


},{
    timestamps:true
})

// hash user Password
userSchema.pre("save", async function() {
    if(!this.isModified("password")){
        return;
    }
    const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password,salt)
})
// compare the password!
userSchema.methods.checkPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}
const User = mongoose.model("User",userSchema);
module.exports = User;

