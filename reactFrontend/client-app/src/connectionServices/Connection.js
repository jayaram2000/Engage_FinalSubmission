import io from 'socket.io-client';
import Peer from 'peerjs';


class SocketConnection {
    ENDPOINT='https://engage-video-app.herokuapp.com/';
    peers={};
    videoContainer={};
    currentStream=null;
    mediaRecorder=null;
    screenShareStatus=true;
    screenPresenter=false;
    currentScreenShareID=null;
    recordedChunks=[];
    constructor(props)
    {   this.updatevalue=props.updatevalue;
        this.roomId=props.roomId;
        this.peer=this.newpeerconnection();
        this.socket=io(this.ENDPOINT);
        console.log('inside the connection :'+props.roomId);
        this.socketEvent();
        this.PeerEvent();
        document.getElementById('screen-share').style.display = "none";
       this.detectuseragent();
        
    }

    newpeerconnection()
    {
        return new Peer({
         config: {'iceServers': [
             { urls: ['stun:stun.l.google.com:19302','stun:stun3.l.google.com:19302','stun:stun.stunprotocol.org:3478'] },
             { urls: 'turn:3.108.196.62:3478', credential: 'AdFs$8A0!21',username:'nighthawk' }
            
           ]}
 
        });
    }

    /************** ALL SOCKET & PEERJS REALTED FUCNTIONS *****************/
 
   

    socketEvent()
    {
        this.socket.on('screen-share',(ID)=>{
            console.log('screen-share view for:',ID);
            this.currentScreenShareID=ID;
            this.screenShareStatus=!this.screenShareStatus;
            this.updatevalue('screenShareStatus',this.screenShareStatus);
           this.screenShareView(ID,this.videoContainer[ID]);
        })


        this.socket.on('screen-share-newUser',(sharingId,DestId)=>{
            if(DestId===this.userId)
            {
                this.currentScreenShareID=sharingId;
                this.screenShareStatus=!this.screenShareStatus;
                this.updatevalue('screenShareStatus',this.screenShareStatus);
                console.log("replace video ID for new user",sharingId);

                
                var i = 0, howManyTimes = 11;
                const g=()=>{
                console.log(`waiting for sharefeed with ${i}`)
                if(`${sharingId}` in this.videoContainer)
                    {
                        this.screenShareView(sharingId,this.videoContainer[sharingId]);
                      
                        i=20;
                    }
                i++;
                if (i < howManyTimes) {
                    setTimeout(g, 1000);
                }
                else if(i<20){
                    alert('Oops! something went wrong join the meet again to view shared screen');
                }
                }
    
                g();
               
                 
                
               
                
            }
        })


        this.socket.on('normal-view',(ID)=>{
            console.log('REvert view for:',ID);
            this.screenShareStatus=!this.screenShareStatus;
            this.updatevalue('screenShareStatus',this.screenShareStatus);
            this.currentScreenShareID=null;
            this.screenShareRevert(ID);
        })

        this.socket.on('user-left',(Id)=>{
            if(this.currentScreenShareID===Id)
            { this.screenShareStatus=!this.screenShareStatus;
                this.updatevalue('screenShareStatus',this.screenShareStatus);
                this.currentScreenShareID=null;
                this.screenShareRevert(Id);
            }
            this.removeuser(Id);
        })

        this.socket.on('new-message',(userName,message)=>{
          
            this.updatevalue('Incomingmessage',{userName:userName, messageBody:message});  
           
        })

        this.socket.on('newuserName',(userName)=>{
            this.updatevalue('newuserName',{userName:userName,messageBody: ' joined chat'});
        })


        this.socket.on('userleftchat',(userName)=>{
            this.updatevalue('newuserName',{userName:userName,messageBody: ' left chat'});
        })
       
    }


    PeerEvent()
    {
       
        this.peer.on('open',(id) =>{
            this.userId=id;
            console.log('generated userId: '+id);
            this.setlocalstream();
            console.log("emitting joining room request")
         
            var i = 0, howManyTimes = 11;

            const f=()=>{
            console.log(`waiting for joining room with ${i}`)
            if(`${this.userId}` in this.videoContainer)
                {
                    this.socket.emit('joining-room', this.roomId, id);
                  
                    i=20;
                }
            i++;
            if (i < howManyTimes) {
                setTimeout(f, 1500);
            }
            else if(i<20){
                /*if local stream cant be obtained*/
                alert('Check camera/audio permissions and try again !');
            }
            }

            f();
           
            
           
               
            });


        this.peer.on('error',(err)=>{
           console.log('reconnecting to peer',err);
           alert("Check your internet connection and re-try");
           this.peer.reconnect();
       });
      
        
    }
     


    setPeerListenres(stream)
    {
        console.log('peerlisteners set');
        this.peer.on('call', (Call) =>{
           
            Call.answer(stream);
            Call.on('stream',(externalstream)=>{
             console.log('incoming stream');
             this.peers[Call.metadata.userId]=Call.peerConnection;
                this.addstream(externalstream,Call.metadata.userId);
            })
          
        })
    }
 
     
    /************END OF SOCKET & PEER HADNLING FUNCTIONS ***************/






    /***************HANDLING NEW USER JOINED **************************/

    newUserConnection()
    {
        this.socket.on('user-joined',(Id)=>{
           
            console.log("joined use:"+Id);
          
            if(this.screenPresenter)
            {
                this.socket.emit('screen-share-newUser',this.userId,Id);
                console.log('screen-share req sent for new user');
            }
                this.connectToUser(this.currentStream,Id);
            
            
            
        });
      

    }


    connectToUser(stream,Id)
        {
       
            const call=this.peer.call(Id,stream,{ metadata: { userId: this.userId } });
            this.peer.on('error',(err)=>{
                console.log("ERROR"+err);
            })
            console.log('made call to '+ Id+ 'stream');
            call.on('stream',(externalstream)=>{
                console.log('connteced user returned stream',externalstream);
                this.addstream(externalstream,Id);
            })
           
            this.peers[Id]=call.peerConnection;
          
        }
   
    /*************END OF USER JOIED FUCNTIONS **********************/


    
   
    /******************** AUDIO & VIDEO STREAM HANDLING **********************/



    setlocalstream()
    { 
        
       this.getvideoaudio(true,true).then((stream)=> {
            this.localstream=stream;
            this.currentStream=stream;
            //To mute audio and video on start
            this.videotoggle(true);
            this.mictoggle(true);

            this.addstream(stream,this.userId);
            this.setPeerListenres(this.currentStream);
            this.newUserConnection();

      })
      .catch(function(err) { console.log(err.name + ": " + err.message); });
     
    }


    getvideoaudio(videostatus,micstatus)
    {
        const myNavigator = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia;
        return myNavigator({video:videostatus,audio :micstatus});
    }
    
    
    addstream(stream,Id)
   {
       if(!this.videoContainer[Id])
       {
        const videogrid=document.getElementById('video-grid');
      
        this.videoContainer[Id]=stream;
        const localcontainer = document.createElement('div');
        const video = document.createElement('video');
        video.srcObject =stream;
        video.id=Id;
        video.autoplay = true;
        if (this.userId === Id) video.muted = true;
        localcontainer.appendChild(video)
        videogrid.append(localcontainer);
        console.log("done creating video :"+Id);
       
        
       }
      
   }

   removeuser(Id)
   {
    if(this.peers[Id])this.peers[Id].close();
    delete this.videoContainer[Id];
    const video = document.getElementById(Id);
    if (video) video.remove();
    delete this.peers[Id];
    

   }
   


   videotoggle(videostatus)
   {
       if(this.localstream)
       {
        this.localstream.getVideoTracks()[0].enabled =!videostatus; 
        this.updatevalue('videoStatus',!videostatus);
       }
   
   }


   mictoggle(micStatus)
   {
       if(this.localstream)
       {    
        this.localstream.getAudioTracks()[0].enabled =!micStatus;
        this.updatevalue('micStatus',!micStatus);

       }
    
   }

/**********************END OF AUDIO & VIDEO HANDLING ****************/



 /********************* SCREENSHARE FUNCTIONS**********************/


   screenShareView(Id,mediaStream)
   {
    var video = document.getElementById(Id);
          if(video)
          {
            video.pause();
            video.style.display="none";
         
          }
        const tmp=document.getElementById('screen-share');
        tmp.style.display="inline";
        tmp.srcObject=mediaStream;
        tmp.autoplay=true;
        if(Id===this.userId)
        {
            tmp.muted=true;
        }
        console.log("video elemnt",tmp);

   }




   screenShareRevert(Id)
   {
    const tmp=document.getElementById('screen-share');
    if(tmp)
    {
        tmp.pause();
        tmp.srcObject=null;
        tmp.style.display="none";
    }
    var video = document.getElementById(Id);
          if(video)
          {
           
            video.style.display="inline";
            video.play();
          }
  
   
    
   }



   screenSharetoggle(toggle)
   { 

       if(toggle)
       {
        if(!this.screenShareStatus)
                return;
   
    
    
           navigator.mediaDevices.getDisplayMedia({
           video: {
               cursor: "always"
           },
           audio: {
               echoCancellation: true,
               noiseSuppression: true

           }
            }).then((mediaStream)=>{
        
        
        
           mediaStream.getVideoTracks()[0].onended=()=>
           {
             
           this.stopscreen();
           }
     
           if(mediaStream)
           {
             this.socket.emit('screen-share',this.userId);
             console.log('screen-share req sent');
             this.currentStream=mediaStream;
             this.screenShareStatus=!this.screenShareStatus;
             this.updatevalue('screenShareStatus',this.screenShareStatus);
             this.screenPresenter=!this.screenPresenter;
             this.updatevalue('screenPresenter',this.screenPresenter);
             this.screenShareView(this.userId,mediaStream);
           

           
          
            for (const [key, value] of Object.entries(this.peers)) {
            
                value.getSenders().map((sender) => {
                
                    if(sender.track.kind ==="video") {
                        if(mediaStream.getVideoTracks().length > 0){
                            sender.replaceTrack(mediaStream.getVideoTracks()[0]);
                        }
                    }
                    
                });
                 }
         
             }}).catch((err)=>{
             console.log("unable to get screen stream"+err)
            })

       }
       else
       {
            this.stopscreen();
       }
    
           
   }
   
 
    stopscreen()
    {if(!this.screenPresenter)
        return;
        
       this.socket.emit('normal-view',this.userId);
       this.screenPresenter=!this.screenPresenter;
       this.screenShareStatus=!this.screenShareStatus;
       this.updatevalue('screenShareStatus',this.screenShareStatus);
       this.updatevalue('screenPresenter',this.screenPresenter);
        this.screenShareRevert(this.userId);
        var video = document.getElementById(this.userId);
        if(video)
        {
            video.pause();
            video.srcObject = this.localstream;
            video.play();
        }
         
          this.currentStream=this.localstream
        for (const [key, value] of Object.entries(this.peers)) {
            
            value.getSenders().map((sender) => {
            
                if(sender.track.kind === "video") {
                    if(this.localstream.getVideoTracks().length > 0){
                        sender.replaceTrack(this.localstream.getVideoTracks()[0]);
                    }
                }               
            });
        }
    }




    /***********************END OF SCREENSHARE FUNCTIONS  ********************************/






    /***********************SCREEN RECORDING FUNCTIONS ***********************************/

    recordScreen(recordStatus){

        if(recordStatus)
        {
            navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
     
                }
            }).then((mediaStream)=>{
               
             
               this.mediaRecorder=new MediaRecorder(mediaStream);
               this.startrecording();
               mediaStream.getVideoTracks()[0].onended=()=>
               {
                 
               this.endrecording();
               }
            
            }).catch((err)=>{
                console.log("unable to get screen stream for recording"+err)
            })
            
        }
        else 
        {
           
            this.endrecording();
           
        }
        
    }


    startrecording()
    {   
        this.updatevalue('recordStatus',false);
       
        console.log("starting",this.mediaRecorder);
      
        this.mediaRecorder.ondataavailable=(event)=>{
        
        if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
                }
            }   

        this.mediaRecorder.onstop=()=>{
                const blob = new Blob(this.recordedChunks,{'type': 'video/mp4'});
                console.log(this.recordedChunks.length);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
                var dateTime = date+'-'+time;
                a.download = 'Recording/'+dateTime+'.mp4';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }, 200);
                this.recordedChunks=[];
            }
        this.mediaRecorder.start(1500);
    }
    
    
    endrecording()
    {
        if(this.mediaRecorder)
        {
            console.log("ending",this.mediaRecorder);
            this.updatevalue('recordStatus',true);
            this.mediaRecorder.stop();
            this.mediaRecorder=null;
              
        }
       
    }


    /*********************END OF SCREENRECORDING FUCNTIONS ****************************/



    /******************* CHAT FUNCTIONS *******************************/


    broadcastmessage(newmessage,userName)
    {
        if(this.socket)
        {
            this.socket.emit('new-message',userName,newmessage);
        }
    }

    newuserChat(name)
    {
     setTimeout(()=>{ if(this.socket)
         {
          this.socket.emit('newuserName',name);
         }},1500);
       
    }

    
    /************************* END OF CHAT FUNCTIONS *********************/




    detectuseragent()
    {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
            document.getElementById('options-button').style.display = "none";
        }
    }


    exitcall(username)
    {
     
     if(this.screenPresenter)
     {
        this.socket.emit('normal-view',this.userId);
     }
     this.socket.emit('userleftchat',username);
     this.socket.disconnect();
     if(this.videoContainer[this.userId])
     {
         const Tracks = this.videoContainer[this.userId].getTracks();
         Tracks.forEach(element => {element.stop();
             
         });
     }
    
        delete(this.videoContainer);
        delete(this.peer);
        delete(this.peers);
       
    }
 
  
    

   
 
}




export function createSocketConnectionInstance(settings={}) {
    return  new SocketConnection(settings);
}