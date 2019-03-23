var crypto = require("crypto");
var game = require("./game.js");
var sync = require("./sync.js");

var allUsers = {};

var io;
function init(server) {
  io = require('socket.io').listen(server, {pingInterval: 10000, pingTimeout: 30000});

  var ntp = require("socket-ntp");
  io.on('connection', function(socket){
    // sync the times
    newSocket(socket, io);
    ntp.sync(socket);
  });
}

function getUserID(userObj) {
  return userObj.id;
}

function send(userID, command, data) {
  if (allUsers[userID] && allUsers[userID].gameID) {
    io.in(allUsers[userID].gameID + "_" + userID).emit(command, data);
  }
  else {
    console.log("MSG : User Not Found " + userID);
  }
}

function alert(userID, data) {
  if (allUsers[userID] && allUsers[userID].gameID) {
    if (!(data instanceof Object)) {
      data = {text : data};
    }
    var update = {
      header : {
        type : "alert",
      },
      data : data
    };
    io.in(allUsers[userID].gameID + "_" + userID).emit("command", update);
  }
  else {
    console.log("MSG : User Not Found " + userID);
  }
}

function broadcast(msgList) {
  for (var userID in allUsers) {
    for (var v in msgList) {
      send(userID, msgList[v].command, msgList[v].data);
    }
  }
}

function newSocket(socket) {
  socket.on('auth', function(data){
    var userID = unescape(data.userID.trim());
    console.log(userID + " Authenticated");
    socket.userID = userID;
    socket.join("localhost"); // join the server's room
    socket.join("localhost" + "_" + userID); // join their own room

    allUsers[userID] = {salt : crypto.randomBytes(32)};
    allUsers[userID].gameID = "localhost";

    socket.gameID = game.joinGame("localhost", userID);
    console.log(socket.gameID);
  });
  socket.on('command', function(cmd) {
    // the game the player is in is valid
    if (socket.gameID) {//&& getGame(socket.gameID)) {
      var command = cmd.name;
      var commandData = cmd.data;
      if (!socket.userID) {
        console.log("running command without userID");
      }
      game.runCommand(socket.gameID, command, commandData, socket.userID);
    }
  });

  socket.on('p2p', function(data) {
    // a socket has been created, now we must try to merge the connections
    // all we are doing is forwarding the message
    if (allUsers[data.target] && allUsers[data.target].gameID == socket.gameID) {
      console.log("to " + data.target, "from " + socket.userID);
      data.from = socket.userID;
      io.in(allUsers[data.target].gameID + "_" + data.target).emit('p2p', data);
    }
  });

  socket.on('disconnect', function(){
    if (socket.userID) {
      console.log("disconnected "+ socket.userID + " " + socket.gameID);
      if (socket.gameID) {
        if (!io.sockets.adapter.rooms[socket.gameID + "_" + socket.userID]) {
          game.leaveGame(socket.gameID, socket.userID);
        }
      }
    }
    else {
      console.log("disconnected "+ socket.userID + " " + socket.gameID);
    }
  });
}

function registerUser(userObj, gameID) {
  var userID = getUserID(userObj);
  allUsers[userID] = {salt : crypto.randomBytes(32)};
  allUsers[userID].gameID = gameID;
}

function removeUser(userObj) {
  var userID = getUserID(userObj);
  if (allUsers[userID]) {
    if (allUsers[userID].socket) {
      delete allUsers[userID].socket.userID;
    }
  }
}

function getUsers() {
  return Object.keys(allUsers);
}

function user(userID) {
  if (allUsers[userID]) {
    return {
      displayName : allUsers[userID].displayName || userID,
      img : allUsers[userID].img,
      membership : allUsers[userID].membership,
      announcement : allUsers[userID].announcement,
      token : allUsers[userID].token,
      created : allUsers[userID].created,
    };
  }
  return false;
}

exports.initialize = init;
exports.alert = alert;
exports.broadcast = broadcast;
exports.send = send;
exports.user = user;
exports.newSocket = newSocket;
exports.registerUser = registerUser;
exports.removeUser = removeUser;
exports.getUsers = getUsers;
exports.userID = getUserID;
