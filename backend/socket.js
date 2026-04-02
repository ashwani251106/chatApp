const Socket = (io)=>{
    // store connected users with their room info 
   const connectedUsers =  new Map()
   io.on("connection",(socket)=>{
      const user = socket.handshake.auth.user
      console.log("user connected",user?.userName);
    // join the room
      socket.on("join room",(groupId)=>{
            socket.join(groupId)
           connectedUsers.set(socket.id,{user,room:groupId})

            const userInRoom = Array.from(connectedUsers.values()).filter((user)=>user.room === groupId).map((u)=>u.user) 
            io.in(groupId).emit("users in room",userInRoom)
            socket.to(groupId).emit("notification",{
                type:'USER_JOINED',
                message:`${user?.userName} has joined the room`,
                user:user
            })
      })
    //   leaving of the room
    socket.on('leave room',(groupId)=>{
        console.log(`${user?.userName} leaving room:`,groupId);

        socket.leave(groupId)
        if(connectedUsers.has(socket.id)){
            connectedUsers.delete(socket.id)
            socket.to(groupId).emit('user left',user?._id)
            socket.to(groupId).emit("notification",{
                type:'USER_LEFT',
                message:`${user?.userName} left the room`
            })
        }
        
    })
    //  send new message 
    socket.on("new message",(message)=>{
        socket.to(message.group).emit("message received",message)
    })
    
    // updated message (for reactions and seen states)
    socket.on("message updated", (updatedMessage) => {
        socket.to(updatedMessage.group).emit("message updated", updatedMessage);
    })
    // disconnection 
        socket.on("disconnect",()=>{
            console.log(`${user?.userName} disconnected`);
            if(connectedUsers.has(socket.id)){
                const userData = connectedUsers.get(socket.id);
                socket.to(userData.room).emit('user left',user?._id)
                socket.to(userData.room).emit("notification",{
                    type:'USER_LEFT',
                    message:`${user?.userName || 'A user'} disconnected`
                })
                connectedUsers.delete(socket.id)
            }
            
        })
        // typing indicator when starts typing
        socket.on('typing',(groupId,userName)=>{
            socket.to(groupId).emit('user typing',{userName})

        })
          socket.on(' stop typing',(groupId)=>{
            socket.to(groupId).emit('user stop typing',{userName:user?.userName})
            
        })

      

   })
}
module.exports = Socket