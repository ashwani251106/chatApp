require("dotenv").config()
const express = require("express")
const {createServer} = require("http")
const socketio = require("socket.io")
const userRouter = require("./routes/userRouter")
const cookieParser = require("cookie-parser")
const app = express()
const server = createServer(app)
const cors = require("cors")
const mongoose = require("mongoose")
const groupRouter = require("./routes/groupRouter")
const getGroupRouter = require("./routes/getGroupRouter")
const joinRouter = require("./routes/joinRouter")
const leaveGroupRouter = require("./routes/leaveGroupRouter")
const messageRouter = require("./routes/messageRouter")
const Socket = require("./socket")

const io = socketio(server,{
    cors:{
        origin:["http://localhost:5173"],
        methods:["get","POST"],
        credentials:true

    }
})
// middlewares
app.use(express.json())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(cookieParser())


mongoose.connect(process.env.URI).then(()=>console.log("mongoDB connected successfully!")).catch((error)=>console.log(error))
Socket(io)
app.use("/",userRouter)
app.use("/message",messageRouter)
app.use("/groups",groupRouter)
app.use("/groups",getGroupRouter)
app.use("/groups",joinRouter)
app.use("/groups",leaveGroupRouter)
server.listen(process.env.PORT,()=>{
    console.log("server is running!");
    
})