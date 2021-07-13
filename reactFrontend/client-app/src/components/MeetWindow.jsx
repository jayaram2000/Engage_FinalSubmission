import React, {useState, useEffect} from 'react';
import {createSocketConnectionInstance} from '../connectionServices/Connection';
import { AppBar, Toolbar } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Fade from '@material-ui/core/Fade';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/MeetWindow.css';
import { Widget,isWidgetOpened,addLinkSnippet, renderCustomComponent, deleteMessages, setBadgeCount} from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import UserPopup from './popup';


let socketInstance;
let msgCount;


const MeetWindow =(props)=>{
  
    const roomId = (props.location.pathname.substring(1));
    
    const [micStatus,setMic]=useState(true);
    const [videoStatus,setCam] =useState(true);
    const [recordStatus,setRecord]=useState(true);
    const [screenShareStatus,setScreen]=useState(true);
    const [screenPresenterStatus,setpresenter]=useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [userName,setName]=useState('');

    useEffect(() => {
       
      socketInstance=(createSocketConnectionInstance({
        roomId:roomId,
        micStatus:micStatus,
        videoStatus:videoStatus,
        recordStatus:recordStatus,
        updatevalue: updatevalue,
      }))

      toast.configure();
      deleteMessages();


      addLinkSnippet({ title: 'Share this link to join the room',
      link: `https://engagevideo.netlify.app/${roomId}`,
      target: ''});


      msgCount=0;
    },[])

    const updatevalue=(property,val)=>{
      if(property==='recordStatus')
      {
        setRecord(val);
      }
      else if(property==='micStatus')
      {
        setMic(val);
      }
      else if(property==='videoStatus')
      {
        setCam(val);
      }
      else if(property==='screenPresenter')
      {
        setpresenter(val);
        setCam(!val);
        socketInstance.videotoggle(val);
        
      }
      else if(property==='screenShareStatus')
      {
        setScreen(val);
       
      }
      else if(property==='Incomingmessage')
      {
        updateNewMessage(val);
        
      }
      else if(property==='newuserName')
      {
        newuserjoined(val);
      }
   

    }

    const exitcall=()=>{

      socketInstance.exitcall(userName);
      props.history.push('/');
    }



    const mictoggle=()=>{

      socketInstance.mictoggle(micStatus)
    }


    const videotoggle=()=>{
      if(screenPresenterStatus)
      return;

      socketInstance.videotoggle(videoStatus);

    }
   

    const screenShare=()=>{

      socketInstance.screenSharetoggle(screenShareStatus); 
    }

    const recordScreen=()=>{

      socketInstance.recordScreen(recordStatus);

    }

    const copyToClipboard=() => {

      var textField = document.createElement('textarea')
      textField.innerText = roomId;
      document.body.appendChild(textField)
      textField.select()
      document.execCommand('copy')
      textField.remove()
    }

    const copyLink=()=>{
    
     copyToClipboard();

      toast.info(`Room code copied to clipboard !`,{position: toast.POSITION.TOP_CENTER});
    }
    
    

    const handleClick = (event) => {

      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {

      setAnchorEl(null);
    };
  
    const handleNewUserMessage=(Message)=>{
    
      socketInstance.broadcastmessage(Message,userName);
      
    }
    const updateNewMessage=(updateNewMessage)=>{   

    renderCustomComponent(Reply,updateNewMessage); 
    msgCount++;
    console.log(`msg count: ${msgCount}`);
    setBadgeCount(msgCount);

    
    }

    const newuserjoined=(userName)=>{

      renderCustomComponent(newUser,userName);
   
    }
  
    const newUser=(props)=>{

      return(<React.Fragment> <div class="chat-messages">
                                 <div class="new-user">{props.userName} {props.messageBody}</div>
                             </div>
            </React.Fragment>

     )

    }
   const Reply=(props)=>{
     return(<React.Fragment> <div class="chat-messages">
                                  <div class="message">{props.messageBody}</div>
                                   <div class="from">{props.userName} {new Date().toLocaleTimeString()}</div>
                              </div>
             </React.Fragment>
            )
  
   }


 


   const handleuserDetails=(val)=>{

    setName(val.name);
    console.log('username',val.name);
    socketInstance.newuserChat(val.name);

   }

    return(<React.Fragment>
                        <div onClick={()=>{if(isWidgetOpened()){ msgCount=0;}}}>

                        <Widget handleNewUserMessage={handleNewUserMessage}  
                            title="Chat here !"
                            subtitle="" 
                            autofocus={false}
                            showTimeStamp={false}
                            setBadgeCount={msgCount}/>

                        </div>

                        <UserPopup submitHandle={handleuserDetails}></UserPopup>
    
                         <div id="video-grid"> <video id="screen-share" display="none"/> </div>
   
                        <AppBar className="footbar-wrapper" position="bottom-fixed" color="primary" >
                            <Toolbar className={`footbar-tool`}>
                                  <div  onClick={mictoggle} title={micStatus ? 'Disable Mic' : 'Enable Mic'}>
                                          {micStatus ?<MicIcon/>:<MicOffIcon/>}
                                  </div>
                                  <div  onClick={exitcall} >
                                          <CallEndRoundedIcon/>
                                  </div>
                                
                                <div  onClick={videotoggle} title={micStatus ? 'Disable Cam' : 'Enable Cam'}>
                                          {videoStatus ?<VideocamIcon/>:<VideocamOffIcon/>}
                                  </div>  
                                  <div onClick={copyLink} title='Add user'>
                                  {<PersonAddIcon/>}
                                  </div>
                                  <IconButton
                                      id="options-button"
                                      aria-label="more"
                                      aria-controls="long-menu"
                                      aria-haspopup="true"
                                      onClick={handleClick}>
                                        <MoreVertIcon />
                                  </IconButton>
                                  <Menu
                                    id="more"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={open}
                                    onClose={handleClose}
                                    TransitionComponent={Fade}>
                                    <MenuItem onClick={screenShare}>{(!screenPresenterStatus && !screenShareStatus)?"Disabled":(screenShareStatus)?"Share Screen":"End ScreenShare"}</MenuItem>
                                     <MenuItem onClick={recordScreen}>{(recordStatus)?"Start Recording":"Stop Recording"}</MenuItem>
                        
                                  </Menu>
                          </Toolbar>
                        </AppBar>
       
        
         
          
          
            </React.Fragment>)
};

export default MeetWindow;

