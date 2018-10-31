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

// -- ROUTING --
app.get('/', function(req, res, next) {
    users[req.name] = {clicks:0};
    res.sendFile(__dirname + '/index.html');
});

app.get('/click', function(req, res, next) {
    res.send("hello");
});

server.listen(8080);
console.log("Server is listening...")

io.on('connection', function(connection) {

  // Checking user exists, whether or not user is in game, etc. (starting housekeeping)
  var handshakeData = connection.request;
  var username = handshakeData._query['username'];
});