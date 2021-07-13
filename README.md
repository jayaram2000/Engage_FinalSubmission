# Video Chatting Application
Final submission for engage mentorship program 


## Description

A video conferencing web app developed using react and Node.js. PeerJs library was used to handle all peer-peer media communications. The front-end part of the application is hosted live on netlify with the link https://engagevideo.netlify.app and the back-end node server is hosted on heruko. (**if the heruko server is in sleep mode it might take 2-3 seconds to return the generated room code**)

### Key features
* Ability to create new rooms
* 2 or more users can join in a single room
* Users can share their screen in the meet
* Offers funtionality to record screen and store locally on user's device
* Responsive webpage having support for mobile devices
* Chat feature where user's can converse live
* Works across even symmetric NAT netwroks (private TURN server hosted on AWS)

## Getting Started

### Dependencies

    * Node.js
    * React

### Intructions to run local instance


### Backend-server
* Inside nodeServerBackEnd file make following modifications to server.js file
   * Under cros, Orgin change it to point to your local instance of front-end (optional) 
   * Change port value from 5000 to port no of your choice (optional)
* Open CLI inside the nodeServerBacEnd and run the following command to install all dependencies
```
npm install
```

* Start the server
```
node server.js
```

### FrontEnd-React app
* Inside reactFrontEnd file make following modifications to the files
  * src/componenets/landingPage.jsx change axios.get source to local instance of the backend server
  * src/componenets/MeetWindow.jsx update link inside addLinkSnippet funtion
  * src/connectionServices/Connection.js Change value of ENDPOINT variable to local server instance
 
 * Open CLI inside reactFrontEnd and run the command
 ```
 npm install
 ```
 
 * Start server
 ```
 npm start
 ```
 


## Author

Jayaram J

jayaramjawahar@gmail.com


