'use strict';

// Use express to open a web server

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { wsEngine: 'ws' });
const MAX_CLICKS = 200;

app.use(express.static(__dirname + '/node_modules')); // makes node_modules folder publicly accessible
app.use(express.static(__dirname + '/public')); //
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var users = [];
var sockets = [];

// -- ROUTING --
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/public/start.html');
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
  var x_ratio = (Math.random()*0.8)+0.1;
  var y_ratio = (Math.random()*0.8)+0.1;
  users[username].x_ratio = x_ratio;
  users[username].y_ratio = y_ratio;

  var user_data = []
  for(var u in users){
      var name = u
      var col = users[u].color
      var cl = users[u].clicks
      var x_ratio = users[u].x_ratio
      var y_ratio = users[u].y_ratio
      user_data.push({username:name, color:col, clicks:cl, x_ratio, y_ratio});
  }

  socket.emit('init', {self:{username, color, x_ratio, y_ratio}, user_data});
  socket.broadcast.emit('new-user',{username, color, x_ratio, y_ratio});

  socket.on('click', function(clicked_user){
    if(users[username] == undefined) return;
    clicked_user+="";
    var user_to_change;
    if(clicked_user === username){
        var clicks = ++users[username].clicks;
        if(clicks > MAX_CLICKS){
            socket.emit('win')
            socket.broadcast.emit('lose');
            resetGame();
            return
        }
    }
    else if (users[clicked_user] != undefined){
        var clicks = --users[clicked_user].clicks;
        if(users[clicked_user].clicks < -5){
            sockets[clicked_user].emit('you-died');
            sockets[clicked_user].disconnect();
        }
    }
    else{
        console.log("clicked nonexistant user")
        return;
    }

    socket.emit('update-clicks', {username:clicked_user, clicks})
    socket.broadcast.emit('update-clicks',{username:clicked_user, clicks});
  });

  socket.on('disconnect', function () {
    console.log(username + " disconnected")
    delete users[username]
    delete sockets[username]
    socket.emit('you-died');
    socket.broadcast.emit('user-died',username);
  });

});

function resetGame(){
    users = [];
    for (var s of sockets){
        s.disconnect();
    }
    sockets = [];
}
