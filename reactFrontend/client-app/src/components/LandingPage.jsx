import React, {useState} from 'react';
import Axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import '../styles/LandingPage.css';


const LandingPage= (props)=> {

      const [roomId, setRoom] = useState('');
      const createroom = ()=> {
        Axios.get('https://engage-video-app.herokuapp.com/',{

        }).then((res) =>{

          setRoom(res.data.link);
          
      });};
      
      const handlejoin=()=>{

        if(roomId)
        {
          props.history.push(`/${roomId}`);
        }
       
      }
      
     

      return ( <React.Fragment>
                      <div class="outer">
                            <div class="middle">
                                   <div class="inner">
                                         <Box boxShadow={3}>
                                          <Card className="center card">
                                            <CardContent align="center">
                                              <br/>
                                              <br/>
                                              <Grid container spacing={2} >
                                              <Grid container item xs={6} direction="column" >
                                              <h3>Join with existing code </h3>
                                              <Box m={3} pt={2}>
                                              <div> <TextField variant="outlined" color="white" type="text"  value={roomId} inputProps={{ style: { padding: 6}}} onChange={(e) =>{setRoom(e.target.value) }}/> </div>
                                              </Box>
                                              <Box m={2} pt={0}>
                                              <div><Button variant="contained" color="primary" onClick={handlejoin} style={{Width: '200px', Height: '30px', minWidth: '30px', minHeight: '10px'}} > Join Room</Button></div> 
                                              </Box>
                                              </Grid>
                                              <Grid container item xs={6} direction="column" >
                                              <h3>Create new one!</h3>
                                              <Box m={2} pt={3}>
                                              <div><Button variant="contained" color="primary"  onClick={createroom} style={{Width: '200px', Height: '30px', minWidth: '30px', minHeight: '10px'}}> Create Room</Button></div>
                                              </Box>
                                              </Grid>
                                              </Grid>
                                              </CardContent>
                                            </Card>
                                          </Box>
                                     </div>
                            </div>
                      </div>
                </React.Fragment>
             )
};

export default LandingPage;

/*
                                                    */