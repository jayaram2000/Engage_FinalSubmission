import React from 'react';

import {BrowserRouter as Router, Route} from 'react-router-dom';

import LandingPage from './components/LandingPage';
import MeetWindow from './components/MeetWindow';


const App=()=>(
    <Router>
     
     <Route path="/" exact component={LandingPage}/>
    <Route path="/:Room" component={MeetWindow}/>
    
    </Router>
);
export default App;


