// scope
var users = require("./users.js");
var crypto = require("crypto");
var fs = require("fs");
var sync = require("./sync.js");
// scope
var users = require("./users.js");
var crypto = require("crypto");

var gameCommands = {};
gameCommands["general"] = require("./games/general.js");
gameCommands["space_wars"] = require("./games/space_wars.js");
gameCommands["heresy2"] = require("./games/heresy2.js");
gameCommands["cthulhu"] = require("./games/cthulhu.js");
gameCommands["dnd_5e"] = require("./games/dnd_5e.js");
gameCommands["pathfounder"] = require("./games/pathfounder.js");
gameCommands["worldbuilder"] = require("./games/worldbuilder.js");

var gameDisplay = {
  "worldbuilder" : {
    info : {
      name : {current : "Worldbuilder"},
      img : {current : "/content/games/worldbuild.png"},//"http://media.moddb.com/images/groups/1/7/6035/40K-RPG-Logo_Bone.png",
    },
    templates : gameCommands["worldbuilder"].templates,
    show : true,
    sandbox : true,
  },
  "dnd_5e" : {
    info : {
      name : {current : "The 5th Dungeon's end, Dragons!"},
      img : {current : "/content/games/dnd5e.png"},
    },
    templates : gameCommands["dnd_5e"].templates,
    show : true,
    beta : true,
    sandbox : true,
  },
  "space_wars" : {
    info : {
      name : {current : "Space Empire"},
      img : {current : "/content/games/spacewars.png"},//"http://vignette2.wikia.nocookie.net/starwars/images/4/40/SWEotE.png",
    },
    templates : gameCommands["space_wars"].templates,
    show : true,
    beta : true,
    sandbox : true,
  },
  "pathfounder" : {
    info : {
      name : {current : "Pathfounder"},
      img : {current : "/content/games/pathfounder.png"},//"",
    },
    templates : gameCommands["pathfounder"].templates,
    show : true,
    beta : true,
    sandbox : true,
  },
  "heresy2" : {
    info : {
      name : {current : "Heresy"},
      img : {current : "/content/games/heresy2.png"},
    },
    templates : gameCommands["heresy2"].templates,
    show : true,
    beta : true,
    sandbox : true,
  },
  "cthulhu" : {
    info : {
      name : {current : "cthulhu"},
      img : {current : "/content/games/cthulhu.png"},//"http://vignette2.wikia.nocookie.net/starwars/images/4/40/SWEotE.png",
    },
    templates : gameCommands["cthulhu"].templates,
    show : true,
    beta : true,
    sandbox : true,
  },
};

var security = gameCommands["general"].templates.security;
var games = {};
function merge(source, object, override) {
  for (var key in object) {
    if (object[key] instanceof Object) {
      if (source[key] instanceof Object) {
        merge(source[key], object[key], override);
      }
      else {
        if (override) {
          source[key] = object[key];
        }
        else {
          if (source[key] == null) {
            source[key] = object[key];
          }
        }
      }
    }
    else {
      if (override) {
        source[key] = object[key];
      }
      else {
        if (source[key] == null) {
          source[key] = object[key];
        }
      }
    }
  }
}
function runCommand(gameID, command, commandData, userID) {
  // if userID isn't present then its a server command
  // this is where we want to auto save if it is time
  if (games["localhost"]) {
    // search in reverse order
    if (gameCommands["general"].commands[command]) {
      gameCommands["general"].commands[command](gameID, commandData, userID);
      return true;
    }
    return false;
  }
}

function broadcast(gameID, cmd, commandName, userIDs) {
  var game = games["localhost"];
  if (userIDs) {
    for (var index in userIDs) {
      users.send(userIDs[index], commandName || "command", cmd);
    }
  }
  else {
    for (var userID in game.players) {
      users.send(userID, commandName || "command", cmd);
    }
  }
}

function startSaving(gameID) {
  if (games["localhost"]) {
    saveGame(gameID);
    setTimeout(function(){
      startSaving(gameID);
    }, 30000 * 4); // 2 minutes
  }
}

function createGame(gameData, gameName, gameKey, userID) {
  if (!gameData) {
    games["localhost"] = {
      config : {
        name : (gameName || "Roleplaying").substring(0, 32),
        packages : [],
        resources : [],
        capacity : 10,
        game : gameKey
      },
      cache : [], // useful for storing cloud storage/references
      owner : userID,
      players : {}, // userID as a key
      _euid : 0, // internal uniqueID for each entity
      entities : {},
      _evuid : 0,
      events : {}, // user input, timed events etc
      media : {players : {}},
      state : {display : {}, "_lclock" : 0}, // specific options to the world
      logs : {events : [], "_lclock" : 0},
      templates : JSON.parse(JSON.stringify(gameCommands["general"].templates)),
    }
    gameCommands["general"].initialize("localhost");
    if (gameKey) {
      gameCommands["general"].commands["updateTemplate"]("localhost", JSON.parse(JSON.stringify(gameCommands[gameKey].templates)), "localhost", true);
    }
    var sheets = [{"i":"/content/bluesword/ground.png","p":0,"gW":64,"gH":64,"w":512,"h":512,"objs":[{"i":3,"gW":2,"gH":2,"w":128,"h":128,"s":0},{"i":0,"gW":1,"gH":3,"w":64,"h":192,"s":0},{"i":1,"gW":2,"gH":3,"w":128,"h":192,"s":0},{"i":19,"gW":1,"gH":1,"w":64,"h":64,"s":0},{"i":59,"gW":1,"gH":1,"w":64,"h":64,"s":0},{"i":40,"gW":1,"gH":3,"w":64,"h":192,"s":0},{"i":41,"gW":2,"gH":3,"w":128,"h":192,"s":0},{"i":60,"gW":1,"gH":1,"w":64,"h":64,"s":0},{"i":5,"gW":3,"gH":1,"w":192,"h":64,"s":0},{"i":13,"gW":3,"gH":2,"w":192,"h":128,"s":0}],"nW":1024,"nH":1024},{"i":"/content/bluesword/interior.png","p":0,"gW":64,"gH":64,"w":512,"h":1024,"objs":[{"i":0,"gW":1,"gH":1,"w":64,"h":64},{"i":1,"gW":1,"gH":1,"w":64,"h":64},{"i":2,"gW":2,"gH":1,"w":128,"h":64},{"i":4,"gW":2,"gH":1,"w":128,"h":64},{"i":6,"gW":2,"gH":2,"w":128,"h":128},{"i":8,"gW":1,"gH":1,"w":64,"h":64},{"i":16,"gW":1,"gH":1,"w":64,"h":64},{"i":9,"gW":2,"gH":2,"w":128,"h":128},{"i":11,"gW":2,"gH":2,"w":128,"h":128},{"i":13,"gW":1,"gH":1,"w":64,"h":64},{"i":21,"gW":1,"gH":1,"w":64,"h":64},{"i":22,"gW":2,"gH":3,"w":128,"h":192},{"i":29,"gW":1,"gH":2,"w":64,"h":128},{"i":27,"gW":2,"gH":1,"w":128,"h":64},{"i":25,"gW":2,"gH":2,"w":128,"h":128},{"i":24,"gW":1,"gH":1,"w":64,"h":64},{"i":32,"gW":1,"gH":1,"w":64,"h":64},{"i":35,"gW":2,"gH":1,"w":128,"h":64},{"i":40,"gW":2,"gH":2,"w":128,"h":128},{"i":42,"gW":3,"gH":2,"w":192,"h":128},{"i":45,"gW":3,"gH":3,"w":192,"h":192},{"i":56,"gW":1,"gH":1,"w":64,"h":64},{"i":57,"gW":1,"gH":1,"w":64,"h":64},{"i":58,"gW":1,"gH":1,"w":64,"h":64},{"i":59,"gW":1,"gH":1,"w":64,"h":64},{"i":60,"gW":1,"gH":1,"w":64,"h":64},{"i":64,"gW":4,"gH":2,"w":256,"h":128},{"i":68,"gW":3,"gH":2,"w":192,"h":128},{"i":71,"gW":1,"gH":1,"w":64,"h":64},{"i":79,"gW":1,"gH":1,"w":64,"h":64},{"i":80,"gW":3,"gH":2,"w":192,"h":128},{"i":83,"gW":4,"gH":2,"w":256,"h":128},{"i":87,"gW":1,"gH":1,"w":64,"h":64},{"i":95,"gW":1,"gH":1,"w":64,"h":64},{"i":96,"gW":2,"gH":1,"w":128,"h":64},{"i":98,"gW":4,"gH":1,"w":256,"h":64},{"i":102,"gW":2,"gH":1,"w":128,"h":64},{"i":104,"gW":2,"gH":1,"w":128,"h":64},{"i":106,"gW":4,"gH":1,"w":256,"h":64},{"i":112,"gW":1,"gH":1,"w":64,"h":64},{"i":116,"gW":1,"gH":1,"w":64,"h":64},{"i":117,"gW":1,"gH":1,"w":64,"h":64},{"i":118,"gW":1,"gH":1,"w":64,"h":64},{"i":119,"gW":1,"gH":1,"w":64,"h":64},{"i":110,"gW":2,"gH":1,"w":128,"h":64},{"i":113,"gW":2,"gH":1,"w":128,"h":64},{"i":115,"gW":1,"gH":1,"w":64,"h":64}],"nW":1024,"nH":2048},{"i":"/content/bluesword/items.png","p":0,"gW":64,"gH":64,"w":512,"h":512,"objs":[{"i":0,"gW":1,"gH":1,"w":32,"h":32},{"i":1,"gW":1,"gH":1,"w":32,"h":32},{"i":8,"gW":1,"gH":1,"w":32,"h":32},{"i":9,"gW":1,"gH":1,"w":32,"h":32},{"i":2,"gW":1,"gH":2,"w":32,"h":64},{"i":3,"gW":1,"gH":2,"w":32,"h":64},{"i":4,"gW":1,"gH":2,"w":32,"h":64},{"i":5,"gW":1,"gH":1,"w":32,"h":32},{"i":13,"gW":1,"gH":1,"w":32,"h":32},{"i":6,"gW":2,"gH":1,"w":64,"h":32},{"i":14,"gW":2,"gH":1,"w":64,"h":32},{"i":16,"gW":1,"gH":1,"w":32,"h":32},{"i":17,"gW":1,"gH":1,"w":32,"h":32},{"i":18,"gW":1,"gH":1,"w":32,"h":32},{"i":19,"gW":1,"gH":1,"w":32,"h":32},{"i":20,"gW":1,"gH":1,"w":32,"h":32},{"i":21,"gW":1,"gH":1,"w":32,"h":32},{"i":22,"gW":1,"gH":1,"w":32,"h":32},{"i":23,"gW":1,"gH":1,"w":32,"h":32},{"i":24,"gW":1,"gH":1,"w":32,"h":32},{"i":25,"gW":1,"gH":1,"w":32,"h":32},{"i":26,"gW":1,"gH":1,"w":32,"h":32},{"i":27,"gW":1,"gH":1,"w":32,"h":32},{"i":28,"gW":1,"gH":1,"w":32,"h":32},{"i":29,"gW":1,"gH":1,"w":32,"h":32},{"i":30,"gW":1,"gH":1,"w":32,"h":32},{"i":31,"gW":1,"gH":1,"w":32,"h":32},{"i":32,"gW":1,"gH":1,"w":32,"h":32},{"i":33,"gW":1,"gH":1,"w":32,"h":32},{"i":35,"gW":1,"gH":1,"w":32,"h":32},{"i":36,"gW":1,"gH":1,"w":32,"h":32},{"i":37,"gW":1,"gH":1,"w":32,"h":32},{"i":38,"gW":1,"gH":1,"w":32,"h":32},{"i":39,"gW":1,"gH":1,"w":32,"h":32},{"i":40,"gW":1,"gH":1,"w":32,"h":32},{"i":41,"gW":1,"gH":1,"w":32,"h":32},{"i":42,"gW":1,"gH":1,"w":32,"h":32},{"i":43,"gW":1,"gH":1,"w":32,"h":32},{"i":44,"gW":1,"gH":1,"w":32,"h":32},{"i":45,"gW":1,"gH":1,"w":32,"h":32},{"i":46,"gW":1,"gH":1,"w":32,"h":32},{"i":47,"gW":1,"gH":1,"w":32,"h":32},{"i":48,"gW":1,"gH":1,"w":32,"h":32},{"i":49,"gW":1,"gH":1,"w":32,"h":32},{"i":50,"gW":1,"gH":1,"w":32,"h":32},{"i":51,"gW":1,"gH":1,"w":32,"h":32},{"i":52,"gW":1,"gH":1,"w":32,"h":32},{"i":53,"gW":1,"gH":1,"w":32,"h":32},{"i":54,"gW":1,"gH":1,"w":32,"h":32},{"i":56,"gW":1,"gH":1,"w":32,"h":32},{"i":57,"gW":1,"gH":1,"w":32,"h":32},{"i":58,"gW":1,"gH":1,"w":32,"h":32},{"i":59,"gW":1,"gH":1,"w":32,"h":32},{"i":60,"gW":1,"gH":1,"w":32,"h":32},{"i":61,"gW":1,"gH":1,"w":32,"h":32}],"nW":1024,"nH":1024},{"i":"/content/bluesword/forest.png","p":0,"gW":64,"gH":64,"w":512,"h":512,"objs":[{"i":0,"gW":3,"gH":3,"w":96,"h":96},{"i":3,"gW":2,"gH":2,"w":64,"h":64},{"i":5,"gW":2,"gH":2,"w":64,"h":64},{"i":7,"gW":1,"gH":1,"w":32,"h":32},{"i":24,"gW":3,"gH":3,"w":96,"h":96},{"i":21,"gW":1,"gH":2,"w":32,"h":64},{"i":37,"gW":1,"gH":1,"w":32,"h":32},{"i":22,"gW":1,"gH":2,"w":32,"h":64},{"i":38,"gW":1,"gH":1,"w":32,"h":32},{"i":15,"gW":1,"gH":1,"w":32,"h":32},{"i":23,"gW":1,"gH":1,"w":32,"h":32},{"i":31,"gW":1,"gH":1,"w":32,"h":32},{"i":24,"gW":3,"gH":2,"w":96,"h":64},{"i":19,"gW":2,"gH":2,"w":64,"h":64}],"nW":1024,"nH":1024},{"i":"/content/bluesword/desert.png","p":0,"gW":64,"gH":64,"w":576,"h":1024,"objs":[{"i":0,"gW":2,"gH":2,"w":64,"h":64},{"i":2,"gW":1,"gH":1,"w":32,"h":32},{"i":11,"gW":1,"gH":1,"w":32,"h":32},{"i":3,"gW":1,"gH":1,"w":32,"h":32},{"i":12,"gW":1,"gH":1,"w":32,"h":32},{"i":4,"gW":2,"gH":2,"w":64,"h":64},{"i":6,"gW":2,"gH":2,"w":64,"h":64},{"i":8,"gW":1,"gH":1,"w":32,"h":32},{"i":17,"gW":1,"gH":1,"w":32,"h":32},{"i":25,"gW":2,"gH":2,"w":64,"h":64},{"i":24,"gW":1,"gH":1,"w":32,"h":32},{"i":33,"gW":1,"gH":1,"w":32,"h":32},{"i":23,"gW":1,"gH":2,"w":32,"h":64},{"i":21,"gW":2,"gH":2,"w":64,"h":64},{"i":20,"gW":1,"gH":1,"w":32,"h":32},{"i":19,"gW":1,"gH":1,"w":32,"h":32},{"i":18,"gW":1,"gH":1,"w":32,"h":32},{"i":29,"gW":1,"gH":1,"w":32,"h":32},{"i":27,"gW":2,"gH":1,"w":64,"h":32},{"i":36,"gW":3,"gH":2,"w":96,"h":64},{"i":39,"gW":3,"gH":3,"w":96,"h":96},{"i":42,"gW":3,"gH":3,"w":96,"h":96},{"i":54,"gW":2,"gH":2,"w":64,"h":64},{"i":56,"gW":1,"gH":1,"w":32,"h":32},{"i":65,"gW":1,"gH":1,"w":32,"h":32},{"i":66,"gW":1,"gH":1,"w":32,"h":32},{"i":67,"gW":1,"gH":1,"w":32,"h":32},{"i":68,"gW":1,"gH":1,"w":32,"h":32},{"i":77,"gW":1,"gH":1,"w":32,"h":32},{"i":76,"gW":1,"gH":1,"w":32,"h":32},{"i":75,"gW":1,"gH":1,"w":32,"h":32},{"i":74,"gW":1,"gH":1,"w":32,"h":32},{"i":72,"gW":2,"gH":2,"w":64,"h":64},{"i":90,"gW":2,"gH":2,"w":64,"h":64},{"i":108,"gW":2,"gH":2,"w":64,"h":64},{"i":83,"gW":2,"gH":2,"w":64,"h":64},{"i":85,"gW":2,"gH":2,"w":64,"h":64},{"i":87,"gW":1,"gH":1,"w":32,"h":32},{"i":96,"gW":1,"gH":1,"w":32,"h":32},{"i":69,"gW":1,"gH":2,"w":32,"h":64},{"i":70,"gW":2,"gH":2,"w":64,"h":64},{"i":88,"gW":1,"gH":2,"w":32,"h":64},{"i":89,"gW":1,"gH":1,"w":32,"h":32},{"i":98,"gW":1,"gH":1,"w":32,"h":32},{"i":101,"gW":2,"gH":2,"w":64,"h":64},{"i":119,"gW":1,"gH":1,"w":32,"h":32},{"i":103,"gW":4,"gH":4,"w":128,"h":128}],"nW":1152,"nH":2048}];

    gameCommands["general"].commands["createBoard"]("localhost", {name : "Game Board", gridW : 64, gridH : 64, w : 1600, h : 1600, sheets : sheets}, userID, true);
    games["localhost"].state.tabs = [{ui : "ui_board", index : "1"}, {name : "Slideshow", data : {}}, {name : "Resource Page", ui : "ui_resourcePage", index : "config"}];

    gameCommands["general"].commands["logEvent"](gameName, {text : "Welcome! Here are some quick chat commands", style : {"background-color" : "rgb(235,235,228)"}}, null, true);
    gameCommands["general"].commands["logEvent"](gameName, {text : "/r <dice> - Rolls the equation", style : {"background-color" : "rgb(235,235,228)"}}, null, true);
    gameCommands["general"].commands["logEvent"](gameName, {text : "/r 4d20k3 - Roll 4 d20s and keep the best 3", style : {"background-color" : "rgb(235,235,228)"}}, null, true);
    gameCommands["general"].commands["logEvent"](gameName, {text : "/w <text> - whispers", style : {"background-color" : "rgba(66,108,66,0.2)", "font-size" : "0.9em"}}, null, true);
    gameCommands["general"].commands["logEvent"](gameName, {text : "/me <text> - perform an action!", style : {"background-color" : "rgba(255,138,0,0.2)"}}, null, true);
    gameCommands["general"].commands["logEvent"](gameName, {text : "Share Media by posting links!", media : "https://www.gmforge.io/content/icons/Book1000p.png", style : {"background-color" : "rgb(235,235,228)"}}, null, true);
  }
  else {
    games["localhost"] = JSON.parse(gameData);
    games["localhost"].players = {}; // empty game
    games["localhost"].config.name = gameName;
  }
  setTimeout(function(){
    startSaving(gameName);
  }, 30000);
}

var leavecheck = {};


function gameCheck(gameID) {
  if (leavecheck[gameID] + 1000*60*14 < Date.now()) {
    if (games["localhost"] && (!games["localhost"].players[games["localhost"].owner] || Object.keys(games["localhost"].players).length == 0)) {
      // host is gone, remove it
      removeGame(gameID);
    }
  }
}

function leaveGame(gameID, userID) {
  if (games["localhost"]) {
    if (users.user(userID).displayName) {
      gameCommands["general"].commands["logEvent"](gameID, {text : users.user(userID).displayName + " has disconnected", color : "#EBEBE4"}, userID, true);
    }
    delete games["localhost"].players[userID];
    updatePlayers(gameID);
    if (!games["localhost"].players[games["localhost"].owner]) {
      gameCommands["general"].commands["logEvent"](gameID, {text : "The host has left the session, if they do not return within the next 15 minutes this session will be shutdown", color : "#EBEBE4"}, userID, true);
      leavecheck[gameID] = Date.now();
      setTimeout(function() {
        gameCheck(gameID);
      }, 1000*60*15);
    }
  }
}

function hasPlayer(gameID, userID) {
  if (games["localhost"].players[userID]) {
    return true;
  }
  return false;
}

function saveGame(gameID) {
  if (games["localhost"]) {
    var game = games["localhost"];
    var buf = new Buffer(JSON.stringify(game)); // decode
    if (game.config.name) {
      fs.writeFile('./public' + game.config.name, buf, function(err) {
        if (err) {
          console.log("err", err);
        }
        console.log("Saved game : " + game.config.name + " " + new Date());
      });
    }
  }
}

function clean(object) {
  for (var index in object) {
    var value = object[index];
    if (value instanceof Object) {
      if (Array.isArray(value)) {
        for (var i in value) {
          clean(value[i]);
        }
      }
      else {
        clean(value);
      }
    }
    else if ((value == null && value !== "") || (value instanceof Object && Object.keys(value) < 1)) {
      delete object[index];
    }
  }
}

function updatePlayers(gameID, joinID) {
  var sendData = {};
  var game = games["localhost"];
  for (var playerID in game.players) {
    sendData[playerID] = {};
    if (users.user(playerID)) {
      sendData[playerID] = users.user(playerID);
      sendData[playerID].peerName = game.players[playerID].peerName;
    }
    else {
      sendData[playerID].offline = true;
    }
    sendData[playerID].rank = game.players[playerID].rank;
    sendData[playerID].entity = game.players[playerID].entity;
    sendData[playerID].color = game.players[playerID].color;
    sendData[playerID]["_t"] = "p";
  }

  // update all other players they joined
  var players = Object.keys(game.players);

  for (var playerID in game.players) {
    users.send(playerID, "command", {
      header : {
        type : "players"
      },
      data : sendData
    });
  }
}

var peerID = 0;
function joinGame(gameID, userID) {
  // Join the game
  var game = games["localhost"];
  if (game) {
    game.config.players = game.config.players || {};

    game.players[userID] = {
      name : userID,
      _t : "p",
      rank : security.player["Trusted Player"], // game owner priviledges
    };

    if (userID != game.owner) {
      if (game.config.players && game.config.players[userID]) {
        game.players[userID].rank = game.config.players[userID].rank;
      }
      else {
        game.config.players[userID] = game.config.players[userID] || {
          name : userID,
          _t : "p",
          rank : security.player["Trusted Player"], // game owner priviledges
        };
        game.players[userID].rank = security.player["Trusted Player"];
      }
    }
    else {
      game.players[userID].rank = security.player["Game Master"];
    }
    game.players[userID].membership = users.user(userID).membership;
    if (users.user(userID).announcement) {
      for (var i in game.players) {
        if (users.user(userID).announcement && users.user(userID).announcement.text) {
          users.alert(i, users.user(userID).announcement);
        }
      }
    }
    updatePlayers(gameID, userID); // update all the players
    // send game state to this player
    users.send(userID, "initialize", {
      templates : game.templates,
      config : game.config,
      state : game.state,
      logs : game.logs,
      owner : game.owner,
      userData : game.config.players[userID],
      entities : game.entities,
      events : game.events,
      games : getGameTypes(),
      gameID : "localhost",
    });

    gameCommands["general"].commands["logEvent"](gameID, {text : users.user(userID).displayName + " has connected", color : "#EBEBE4"}, userID, true);
    // Quit any existing game this player is in
    for (var index in games) {
      if (index != gameID && hasPlayer(index, userID)) {
        leaveGame(gameID, userID);
        return gameID;
      }
    }
    return gameID;
  }
}

function getGame(gameID) {
  return games["localhost"];
}

function removeGame(gameID) {
  var game = games["localhost"];
  if (game) {
    //for () // disconnect all players
    broadcast(gameID, {}, "breakConnection");
    delete games["localhost"];
  }
}

function getGameList() {
  var returnData = [];
  for (var hostSID in games) {
    var game = games[hostSID];

    if (!game.hidden) {
      var password = false;
      if (game.config.password) {
        password = true;
      }
      returnData.push({
        owner: game.owner,
        ownerName : game.ownerName,
        gameURL: game.url,
        name: game.config.name,
        packages : game.config.packages,
        game : game.config.game,
        password: password,
        capacity: sync.newValue("Max Players", Object.keys(game.players).length, 0, game.config.capacity),
      });
    }
  }
  return returnData;
}

function getGameByURL(url) {
  for (var hostSID in games) {
    var game = games[hostSID];
    if (game.url == url) {
      return hostSID;
    }
  }
  return false;
}

function getGameTypes() {
  return gameDisplay;
}

function getDicePools() {
  function merge(source, object) {
    for (var key in object) {
      if (object[key] instanceof Object) {
        if (source[key] instanceof Object) {
          merge(source[key], object[key]);
        }
        else {
          source[key] = object[key];
        }
      }
      else {
        source[key] = object[key];
      }
    }
  }

  var result = {};
  for (var index in gameCommands) {
    // deep copy the object then manipulate it
    merge(result, JSON.parse(JSON.stringify(gameCommands[index].templates)));
  }
  return result;
}

function canJoin(gameID, userID, password) {
  var game = games["localhost"];
  if (game.owner == userID) {
    return true;
  }
  if (game && game.config) {
    if (game.players[userID] || game.config.capacity > Object.keys(game.players).length) {
      if (game.config.password == password || game.players[userID]) {
        return true;
      }
    }
  }
  return false;
}

function hasSecurity(gameID, userID, priv, obj) {
  // dm's can do anything
  var game = games["localhost"];
  if (game.players[userID]) {
    if (obj && (obj["_s"] && obj["_s"][userID] && obj["_s"][userID] <= priv)) {
      return true;
    }
    if (game.players[userID].rank <= priv) {
      return true;
    }
    if (obj && obj["_s"] && obj["_s"].default && obj["_s"].default != 0) {
      if (obj["_s"].default == 1) {
        return true;
      }
      var result = sync.eval(obj["_s"].default, {});
      if (priv != null) {
        if (result && (result <= game.templates.security.object[priv]) || result <= game.templates.security.player[priv]) {
          return true;
        }
      }
      else if (result) {
        return true;
      }
    }
  }
  return false;
}

exports.joinGame = joinGame;
exports.leaveGame = leaveGame;
exports.createGame = createGame;
exports.saveGame = saveGame;
exports.getGame = getGame;
exports.runCommand = runCommand;
exports.removeGame = removeGame;
exports.broadcast = broadcast;
exports.updatePlayers = updatePlayers;
exports.getGameList = getGameList;
exports.getGameTypes = getGameTypes;
exports.getDicePools = getDicePools;
exports.getGameByURL = getGameByURL;
exports.canJoin = canJoin;
exports.security = hasSecurity;
