window.human = false;

var canvasEl = document.querySelector('.fireworks');
var ctx = canvasEl.getContext('2d');
var numberOfParticules = 30;
var pointerX = 0;
var pointerY = 0;
var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
var colors = "#FF1461";
const MAX = 300;
const MIN = 30;
const GROWTH = 3;

var circle = [{ name: "Name", color: "#FF1461", cx: 50, cy: 50, cr: 100 }, { name: "Name", color: "#83D0E5", cx: 450, cy: 550, cr: 50 }];

//window.onload = function() {

function createPlayer() {
  for (var i = 0; i < 5; i++) {
    console.log(i);
    players[i] = {
      color: "rgb(" +
        ((Math.random() * 150) + 105) + "," +
        ((Math.random() * 150) + 105) + "," +
        ((Math.random() * 150) + 105) + ")",
      cx: Math.floor(Math.random() * 1500 + MAX),
      cy: Math.floor(Math.random() * 700 + MAX),
      cr: MIN,
      clicks: 0
    };
  }
}

var socket = io.connect({ query: "username=" + Math.random() + "" });

socket.on('connect', function(data) {
  console.log("hello")
});

var players = [];
var self;

/*socket.on('new-user', function(data) {
  // a user has been added, data = {username, color}
  console.log(data.username)
  players[data.username] = { color: data.color, cx: Math.floor(Math.random() * 100 + MAX), cy: Math.floor(Math.random() * 100 + MAX), cr: MIN, clicks: 0 };

});*/
socket.on('init', function(data) {
  console.log(data);
  self = {
    color: data.self.color,
    cx: Math.floor(Math.random() * 1000 + MAX),
    cy: Math.floor(Math.random() * 500 + MAX),
    cr: MIN,
    clicks: 0
  }
});

var players = []

socket.on('new-user', function(data) {
  // a user has been added, data = {username, color}
  //console.log(data.username)
  console.log("new user added");
  console.log("name: "+data.username);
  //var players = new Object();
  players[data.username] = {
    color: data.color,
    cx: Math.floor(Math.random() * 1500 + MAX),
    cy: Math.floor(Math.random() * 500 + MAX),
    cr: MIN,
    clicks: 0
  }
});

socket.on('update-clicks', function(data) {
  // a click has occured, data = {username, total clicks}
  console.log(data)
});

socket.on('you-died', function() {
  // refresh the page
  console.log(dead_user)
});

socket.on('user-died', function(dead_user) {
  // remove the player
  console.log(dead_user)
});

function setCanvasSize() {
  canvasEl.width = window.innerWidth * 2;
  canvasEl.height = window.innerHeight * 2;
  canvasEl.style.width = window.innerWidth + 'px';
  canvasEl.style.height = window.innerHeight + 'px';
  canvasEl.getContext('2d').scale(2, 2);
}

function updateCoords(e) {
  pointerX = e.clientX || e.touches[0].clientX;
  pointerY = e.clientY || e.touches[0].clientY;
}

function setParticuleDirection(p) {
  var angle = anime.random(0, 360) * Math.PI / 180;
  var value = anime.random(50, 180);
  var radius = [-1, 1][anime.random(0, 1)] * value;
  return {
    x: p.x + radius * Math.cos(angle),
    y: p.y + radius * Math.sin(angle)
  }
}

function createParticule(x, y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = colors;
  //p.color = colors[anime.random(0, colors.length - 1)];
  p.radius = anime.random(16, 32);
  p.endPos = setParticuleDirection(p);
  p.draw = function() {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  return p;
}

function createCircle(x, y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = '#FFF';
  p.radius = 0.1;
  p.alpha = .5;
  p.lineWidth = 6;
  p.draw = function() {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.lineWidth = p.lineWidth;
    ctx.strokeStyle = p.color;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  return p;
}

function renderParticule(anim) {
  for (var i = 0; i < anim.animatables.length; i++) {
    anim.animatables[i].target.draw();
  }
}

function animateParticules(x, y) {
  var circle = createCircle(x, y);
  var particules = [];
  for (var i = 0; i < numberOfParticules; i++) {
    particules.push(createParticule(x, y));
  }
  anime.timeline().add({
      targets: particules,
      x: function(p) { return p.endPos.x; },
      y: function(p) { return p.endPos.y; },
      radius: 0.1,
      duration: anime.random(1200, 1800),
      easing: 'easeOutExpo',
      update: renderParticule
    })
    .add({
      targets: circle,
      radius: anime.random(80, 160),
      lineWidth: 0,
      alpha: {
        value: 0,
        easing: 'linear',
        duration: anime.random(600, 800),
      },
      duration: anime.random(1200, 1800),
      easing: 'easeOutExpo',
      update: renderParticule,
      offset: 0
    });
}

//var cx; //circle x
//var cy;
//var cr;
var inside; //inside circle

var render = anime({
  duration: Infinity,
  update: function() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.beginPath();
    ctx.arc(self.cx, self.cy, self.cr, 0, 2 * Math.PI);
    ctx.fillStyle = self.color;
    ctx.fill()
    for (var x of players) {
      ctx.beginPath();
      ctx.arc(x.cx, x.cy, x.cr, 0, 2 * Math.PI);
      ctx.fillStyle = x.color;
      ctx.fill();
    }




    //inside = cc(cx,cy,cr);
  }
});

document.addEventListener(tap, function(e) {
  //console.log("X: " + e.clientX);
  //console.log("Y: " + e.clientY);

  if (Math.sqrt(Math.pow(self.cx - e.clientX, 2) + Math.pow(self.cy - e.clientY, 2)) <= self.cr) {
    colors = self.color;
    self.cr += GROWTH;
    window.human = true;
    render.play();
    updateCoords(e);
    animateParticules(pointerX, pointerY);
  }

  for (var x of players) {
    console.log(x.cx);

    if (Math.sqrt(Math.pow(x.cx - e.clientX, 2) + Math.pow(x.cy - e.clientY, 2)) <= x.cr) {
      colors = x.color;
      x.cr -= GROWTH;
      window.human = true;
      render.play();
      updateCoords(e);
      animateParticules(pointerX, pointerY);
    }
  }
  socket.emit('click', "replace me with the clicked username")
}, false);
/*
function cc(e,x,y,r) {//checkCircle
//console.log(Math.sqrt(Math.pow(x-pointerX,2)+Math.pow(y-pointerY,2)));

//console.log("Y: "+pointerY);
  if (Math.sqrt(Math.pow(x-pointerX,2)+Math.pow(y-pointerY,2))<r) {
    return true;
  }
  return false;
}
*/
var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;

setCanvasSize();
window.addEventListener('resize', setCanvasSize, false);
