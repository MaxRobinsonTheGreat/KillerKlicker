'use strict';

// Use express to open a web server

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { wsEngine: 'ws' });

app.use(express.static(__dirname + '/node_modules')); // makes node_modules folder publicly accessible
app.use(express.static(__dirname + '/public')); //
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var users = [];
var sockets = [];

// -- ROUTING --
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/click', function(req, res, next) {
    res.send("hello");
});

server.listen(8080);
console.log("Server is listening...")

io.on('connection', function(socket) {

  // Checking user exists, whether or not user is in game, etc. (starting housekeeping)
  var handshakeData = socket.request;
  var username = handshakeData._query['username'];
  users[username] = {clicks: 0}
  console.log(username + " joined the game")
  sockets[username] = socket;
  users[username].color = "rgb("+
    +((Math.random() * 150) +105)+","
    +((Math.random() * 150) +105)+","
    +((Math.random() * 150) +105)+")";
  var color = users[username].color;
  
  var user_data = []
  for(var u in users){
      var name = u
      var col = users[u].color
      var cl = users[u].clicks
      user_data.push({username:name, color:col, clicks:cl});
  }
  
  socket.emit('init', {self:{username, color}, user_data});
  socket.broadcast.emit('new-user',{username, color});
  
  socket.on('click', function(clicked_user){
    clicked_user+="";
    console.log(clicked_user)
    if(clicked_user === username){
        var clicks = ++users[username].clicks;
    }
    else if (users[clicked_user] != undefined){
        var clicks = --users[clicked_user].clicks;
        if(users[clicked_user].clicks < 0){
            sockets[clicked_user].disconnect();
        }
    }
    else{
        console.log("clicked nonexistant user")
    }
    
    var clicks = ++users[username].clicks;
    socket.broadcast.emit('update-clicks',{username, clicks});
  });
  
  socket.on('disconnect', function () {
    console.log(username + " disconnected")
    delete users[username]
    delete sockets[username]
    socket.emit('you-died');
    socket.broadcast.emit('user-died',username);
  });
  
});