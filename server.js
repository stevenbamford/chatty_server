
const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');
const WebSocket = require('ws');


// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

 wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

let numUsersOnline = 0;
const colours = ["#F44336", "#2196F3", "#4CAF50", "#4CAF50"];


wss.on('connection', (ws) => {
  console.log('Client connected');

  let userColour = colours[Math.floor(Math.random()*4)];
  userColour = JSON.stringify({type: "colour", content: userColour});
  ws.send(userColour);

  numUsersOnline++;
  let numUsers = JSON.stringify({type: "numUsersOnline", content: numUsersOnline});
  wss.broadcast(numUsers);

  console.log("Number of users online: ", numUsersOnline);

  ws.on('message', function incoming(message) {

    message = JSON.parse(message);
    console.log("Entered an img", message.content.search(/\.jpg/));
    if(message.type == "postMessage"){

    let messageToSend = message;
    messageToSend.id = uuid.v4();
    messageToSend.type = "incomingMessage";
    messageToSend = JSON.stringify(messageToSend);
    console.log(messageToSend);
    wss.broadcast(messageToSend);
      }
    if(message.type  == 'postNotification'){
      let notificationToSend = message;
      notificationToSend.id = uuid.v4();
      notificationToSend.type = "incomingNotification";
      notificationToSend = JSON.stringify(notificationToSend);
      wss.broadcast(notificationToSend);
    }
  });



  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    numUsersOnline--;
    console.log('Client disconnected');
    console.log("Number of users online: ", numUsersOnline);
    let numUsers = JSON.stringify({type: "numUsersOnline", content: numUsersOnline});
    wss.broadcast(numUsers);
  });
});
