const express =require("express");
const cors= require("cors");
const app=express();
const server=require("http").Server(app);
/* "nodemon": "^2.0.9",*/


const io=require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
const {v4:uuidV4}=require("uuid")
console.log("server running");


app.use(cors());
const port = process.env.PORT || 5000;
//To generate Room id
app.get('/',(req,res)=>
{
 res.send({link :uuidV4()});
})




io.on('connection', (socket)=> {
    console.log('new connect!');
    socket.on('joining-room',(roomId,userId)=> {
        console.log(`User : ${userId} joined Room : ${roomId}`);;
        socket.join(roomId.toString());
       socket.to(roomId.toString()).emit('user-joined',userId)
       
      socket.on('screen-share',(ID)=>{
        console.log('screen share req from:',ID);
        socket.to(roomId.toString()).emit('screen-share',ID);
      })

      socket.on('normal-view',(ID)=>{
        console.log('screen share to noraml view for:',ID);
        socket.to(roomId.toString()).emit('normal-view',ID);
      })

      socket.on('screen-share-newUser',(sharingId,destId)=>{
        console.log('sharing screen for newly joined user',destId);
        socket.to(roomId.toString()).emit('screen-share-newUser',sharingId,destId);
      })

      socket.on('new-message',(userName,message)=>{
        console.log('recived new message',message+userName);
        socket.to(roomId.toString()).emit('new-message',userName,message);
      })
      socket.on('newuserName',(userName)=>{
        console.log('recived new username',userName);
        socket.to(roomId.toString()).emit('newuserName',userName);
      })
     
      socket.on('userleftchat',(userName)=>{
        console.log('username left',userName);
        socket.to(roomId.toString()).emit('userleftchat',userName);
      })
       socket.on('disconnect', ()=>{
         socket.to(roomId.toString()).emit('user-left',userId);

       })
    })

    
});

server.listen(port,()=>{
    console.log(`listening on port ${port}`);
});