var users = require("./users.js");
var gameControls = require("./game.js");
var sync = require("./sync.js");
var fs = require('fs');

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

exports.display = {};
exports.templates = {
  dice : {
    defaults : ["d20", "d12", "d10", "d8", "d6", "d4"],
    modifiers : [0,1,2,3,4,5,6,7,8,9,10],
    ui : "ui_diceResults",
    keys : {
      "a" : {name : "Advantage", img : "/content/dice/advantage.png"},
      "f" : {name : "Failure", img : "/content/dice/failure.png"},
      "s" : {name : "Success", img : "/content/dice/success.png"},
      "t" : {name : "Threat", img : "/content/dice/threat.png"},
      "tri" : {name : "Triumph", img : "/content/dice/triumph.png"},
      "des" : {name : "Despair", img : "/content/dice/despair.png"},
      "light" : {name : "Light", img : "/content/dice/light.png"},
      "dark" : {name : "Dark", img : "/content/dice/dark.png"},
    },
    pool : {
      "d2" : {value : "d2"},
      "d4" : {value : "d4"},
      "d5" : {value : "d5"},
      "d6" : {value : "d6"},
      "d8" : {value : "d8"},
      "d10" : {value : "d10"},
      "d12" : {value : "d12"},
      "d20" : {value : "d20"},
      "d100" : {value : "d100"},
      "proficiency" : {
        value : "d12",
        display : {
          "background-color" : "rgb(255,230,0)",
          "border" : "1px solid black",
          "color" : "black"
        },
        results : {
          "1" : {a:2},
          "2" : {a:1},
          "3" : {a:2},
          "4" : {tri:1, s:1},
          "5" : {s:1},
          "6" : {s:1, a:1},
          "7" : {s:1},
          "8" : {s:1, a:1},
          "9" : {s:2},
          "10" : {s:1, a:1},
          "11" : {s:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "2" : {imgs : ["/content/dice/advantage.png"]},
          "3" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "4" : {imgs : ["/content/dice/triumph.png"]},
          "5" : {imgs : ["/content/dice/success.png"]},
          "6" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "7" : {imgs : ["/content/dice/success.png"]},
          "8" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "9" : {imgs : ["/content/dice/success.png", "/content/dice/success.png"]},
          "10" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "11" : {imgs : ["/content/dice/success.png", "/content/dice/success.png"]},
          "12" : {imgs : []},
        }
      },
      "ability" : {
        value : "d8",
        display : {
          "background-color" : "rgb(80,185,75)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {s:1},
          "2" : {a:1},
          "3" : {s:1, a:1},
          "4" : {s:2},
          "5" : {a:1},
          "6" : {s:1},
          "7" : {a:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/success.png"]},
          "2" : {imgs : ["/content/dice/advantage.png"]},
          "3" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "4" : {imgs : ["/content/dice/success.png", "/content/dice/success.png"]},
          "5" : {imgs : ["/content/dice/advantage.png"]},
          "6" : {imgs : ["/content/dice/success.png"]},
          "7" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "8" : {},
        }
      },
      "boost" : {
        value : "d6",
        display : {
          "background-color" : "rgb(135,215,245)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {s:1, a:1},
          "2" : {a:1},
          "3" : {a:2},
          "4" : {s:1},
        },
        translations : {
          "1" : {imgs : ["/content/dice/success.png", "/content/dice/advantage.png"]},
          "2" : {imgs : ["/content/dice/advantage.png"]},
          "3" : {imgs : ["/content/dice/advantage.png", "/content/dice/advantage.png"]},
          "4" : {imgs : ["/content/dice/success.png"]},
          "5" : {},
          "6" : {},
        }
      },
      "challenge" : {
        value : "d12",
        display : {
          "background-color" : "rgb(230,25,55)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {t:2},
          "2" : {t:1},
          "3" : {t:2},
          "4" : {t:1},
          "5" : {f:1, t:1},
          "6" : {f:1},
          "7" : {f:1, t:1},
          "8" : {f:1},
          "9" : {des:1, f:1},
          "10" : {f:2},
          "11" : {f:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/threat.png", "/content/dice/threat.png"]},
          "2" : {imgs : ["/content/dice/threat.png"]},
          "3" : {imgs : ["/content/dice/threat.png", "/content/dice/threat.png"]},
          "4" : {imgs : ["/content/dice/threat.png"]},
          "5" : {imgs : ["/content/dice/failure.png", "/content/dice/threat.png"]},
          "6" : {imgs : ["/content/dice/failure.png"]},
          "7" : {imgs : ["/content/dice/failure.png", "/content/dice/threat.png"]},
          "8" : {imgs : ["/content/dice/failure.png",]},
          "9" : {imgs : ["/content/dice/despair.png"]},
          "10" : {imgs : ["/content/dice/failure.png", "/content/dice/failure.png"]},
          "11" : {imgs : ["/content/dice/failure.png", "/content/dice/failure.png"]},
          "12" : {imgs : []},
        }
      },
      "difficulty" : {
        value : "d8",
        display : {
          "background-color" : "rgb(85,35,130)",
          "border" : "1px solid black"
        },
        results : {
          "1" : {t:1},
          "2" : {f:1},
          "3" : {f:1, t:1},
          "4" : {t:1},
          "6" : {t:2},
          "7" : {f:2},
          "8" : {t:1},
        },
        translations : {
          "1" : {imgs : ["/content/dice/threat.png"]},
          "2" : {imgs : ["/content/dice/failure.png"]},
          "3" : {imgs : ["/content/dice/failure.png", "/content/dice/threat.png"]},
          "4" : {imgs : ["/content/dice/threat.png"]},
          "5" : {imgs : []},
          "6" : {imgs : ["/content/dice/threat.png", "/content/dice/threat.png"]},
          "7" : {imgs : ["/content/dice/failure.png", "/content/dice/failure.png"]},
          "8" : {imgs : ["/content/dice/threat.png"]},
        }
      },
      "setback" : {
        value : "d6",
        display : {
          "background-color" : "black",
          "border" : "1px solid black"
        },
        results : {
          "1" : {f:1},
          "2" : {f:1},
          "3" : {t:1},
          "4" : {t:1},
        },
        translations : {
          "1" : {imgs : ["/content/dice/failure.png"], f:1},
          "2" : {imgs : ["/content/dice/failure.png"], f:1},
          "3" : {imgs : ["/content/dice/threat.png"], t:1},
          "4" : {imgs : ["/content/dice/threat.png"], t:1},
          "5" : {},
          "6" : {},
        }
      },
      "force" : {
        value : "d12",
        display : {
          "background-color" : "white",
          "border" : "1px solid black",
          "color" : "black"
        },
        results : {
          "1" : {dark:1},
          "2" : {light:2},
          "3" : {dark:1},
          "4" : {light:2},
          "5" : {dark:1},
          "6" : {light:2},
          "7" : {dark:1},
          "8" : {light:1},
          "9" : {dark:1},
          "10" : {light:1},
          "11" : {dark:1},
          "12" : {dark:2},
        },
        translations : {
          "1" : {imgs : ["/content/dice/darkside.png"]},
          "2" : {imgs : ["/content/dice/lightside.png", "/content/dice/lightside.png"]},
          "3" : {imgs : ["/content/dice/darkside.png"]},
          "4" : {imgs : ["/content/dice/lightside.png", "/content/dice/lightside.png"]},
          "5" : {imgs : ["/content/dice/darkside.png"]},
          "6" : {imgs : ["/content/dice/lightside.png", "/content/dice/lightside.png"]},
          "7" : {imgs : ["/content/dice/darkside.png"]},
          "8" : {imgs : ["/content/dice/lightside.png",]},
          "9" : {imgs : ["/content/dice/darkside.png"]},
          "10" : {imgs : ["/content/dice/lightside.png"]},
          "11" : {imgs : ["/content/dice/darkside.png"]},
          "12" : {imgs : ["/content/dice/darkside.png","/content/dice/darkside.png"]},
        }
      },
    }
  },
  initiative : {i : "d10"},
  character : {
    _t : "c",
    info : {
      name : sync.newValue("Name", "Default Character"),
      img : sync.newValue("Character Art"),
      notes : sync.newValue("Character Notes"),
    },
    stats : {},
    counters : {},
    tags : {},
    skills : {},
    talents : {},
    inventory : [],
    spellbook : [], //storage for psychic
    specials : {}, // special rules
  },
  item : {
    _t : "i", tags : {},
    info : {
      name : sync.newValue("Name", null),
      weight : sync.newValue("Weight", null, 0),
      quantity : sync.newValue("Quantity", null, 0),
      img : sync.newValue("Image", null),
      special : sync.newValue("Special Rules", null),
      notes : sync.newValue("Notes", null),
      price : sync.newValue("Price", null)
    },
    equip : {
      armor : sync.newValue("Armor", null),
    },
    weapon : {damage : sync.newValue("Damage", null),},
    spell : {},
  },
  page : {
    _t : "p",
    info : {
      name : sync.newValue("Name", "Default Page"),
      img : sync.newValue("Art"),
      notes : sync.newValue("Notes"),
      mode : sync.newValue("Mode", null)
    },
  },
  security : {
    player : { // player Rights dictate default priviledges
      "Game Master" : 1,
      "Assistant Master" : 2, // Co-DMs
      "Trusted Player" : 3,
      "Player" : 4,
      "Spectator" : 5, // Restricted Networking + No write priviledges
    },
    object : { // object Privledges apply to individual entities
      "Default Access" : 0,
      "Owner" : 1,
      "Rights" : 2,
      "Visible" : 3,
      "Deny" : 4,
    }
  },
  // overhead management
  constants : {},
  tables : {},
  tags : {},
};

exports.initialize = function(gameID) {
  var game = gameControls.getGame(gameID);
  for (var j in game.entities) {
    var ent = game.entities[j];
    if (ent._t == "b") {
      ent.info = ent.info || {name : sync.newValue(null, ent.name || "[No Name]")};
      for (var i in ent.layers) {
        var layer = ent.layers[i];
        if (layer._s == 1) {
          layer._s = {default : "(@me.rank=='Game Master')?(1):((@me.rank=='Assistant Master')?(1):(0))"};
        }
        else if (layer._s === 0 || layer._s == null) {
          layer._s = {default : "1"};
        }
      }
    }
    if (ent._t == "c") {
      if (ent.counters.saving) {
        for (var i in ent.counters.saving.current) {
          ent.counters["sv"+i] = ent.counters.saving.current[i];
        }
        delete ent.counters.saving;
      }
      for (var i in ent.inventory) {
        var item = ent.inventory[i];
        for (var k in item.equip.armor.modifiers) {
          if (item.equip.armor.modifiers[k] == "none") {
            delete item.equip.armor.modifiers[k];
          }
        }
      }
    }
    if (ent._t == "p") {
      ent.info.mode = ent.info.mode || sync.newValue("Mode");
    }
  }
}

exports.commands = {};

exports.commands["updateTemplate"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (game.owner == userID || override) {
    if (data instanceof Object) {
      game.templates = data;
      users.alert(userID, "All users need to refresh to recieve changes (press f5)");
      gameControls.saveGame(gameID);
    }
    else {
      var gameTypes = gameControls.getGameTypes();
      if (gameTypes[data]) {
        exports.commands["updateTemplate"](gameID, JSON.parse(JSON.stringify(gameTypes[data])), userID, true);
        game.config.game = data;
        gameControls.saveGame(gameID);
      }
    }
  }
}

exports.commands["forceTab"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (gameControls.security(gameID, userID, 2) && data) {
    var pList = [];
    for (var pID in game.players) {
      pList.push(pID);
    }
    var update = {
      header : {
        type : "view",
      },
      data : data,
    };
    gameControls.broadcast(gameID, update, null, pList);
  }
  return false;
}

/*exports.commands["forceView"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (gameControls.security(gameID, userID, 2) && data) {
    var pList = [];
    for (var pID in game.players) {
      if (!gameControls.security(gameID, pID, 2)) { // don't force assistant masters
        pList.push(pID);
      }
    }
    var update = {
      header : {
        type : "view",
      },
      data : data,
    };
    gameControls.broadcast(gameID, update, null, pList);
  }
  return false;
}*/

/*exports.commands["provokeRoll"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (gameControls.security(gameID, userID, 1) || override) {
    data.players = data.players || [{userID : userID}];
    for (var i in data.players) {
      var pID = data.players[i];

      var eventData = {
        players : [pID.userID], // multiple people can affect one event
        root : "entities", // default root for travseral, do not expose to client
        targetID : pID.targetID,
        lookup : pID.lookup,
        title : data.data.title || data.title,
        prompt : data.data.prompt || data.prompt,
        _popout : true,
        _ui : "ui_roll",
        data : {
          equations : data.data.equations,
          custom : data.data.custom,
        }
      };

      if (data._callbacks && override) {
        eventData._callbacks = data._callbacks;
      }
      else {
        eventData._callbacks = {};
        eventData._callbacks["postResolve"] = function(gameID, data, userID, override) {
          var evID = data.id;
          var ev = data.ev;
          var newData = data.data;
          if (exports.commands["updateEvent"](gameID, {id : data.id}, userID, true)) {
            // Updated Successfully
            var updateData = {
              text : users.user(userID).displayName + " rolled for event " + ev.title,
              evID : evID
            };
            if (!game.events[data.id].logged) {
              game.events[data.id].logged = true;
              exports.commands["logEvent"](gameID, updateData, userID, true);
            }
            else {
              var changed = {
                userID : userID,
                text : users.user(userID).displayName + " changed event " + (game.events[data.id].title || "")
              }
              exports.commands["logEvent"](gameID, changed, userID, true);
              var alertData = {
                header : {
                  type : "alert",
                },
                data : updateData
              }
              alertData.data.player = userID;
              gameControls.broadcast(gameID, alertData);
            }
          }
        }
        eventData._callbacks["resolve"] = function(gameID, data, userID, override) {
          // if they have access do something
          var evID = data.id;
          var ev = data.ev;
          var newData = data.data;
          var targetData;
          if (ev.targetID) {
            targetData = sync.traverse(game.entities, ev.targetID);
            if (targetData && ev.lookup) {
              var newTargetData = {};
              for (var key in ev.lookup) {
                var val = ev.lookup[key];
                if (val == "r") { // raw
                  newTargetData[key] = sync.rawVal(sync.traverse(targetData, key));
                }
                else if (val != null) {
                  newTargetData[key] = sync.val(sync.traverse(targetData, key));
                }
              }
            }
          }
          if (true) {
            game.events[evID].data.equations = newData.equations;
          }
          else {
            for (var index in ev.data.equations) {
              sync.reduce(ev.data.equations[index], targetData);
            }
          }

          if (ev._callbacks["postResolve"]) {
            ev._callbacks["postResolve"](gameID, data, userID, override);
          }
        }
      }

      var returnID = exports.commands["createEvent"](gameID, eventData, userID, true);
      if (returnID) {
        // Created Successfully
        users.alert(userID, {text:"Roll Successfully Sent"});
        return returnID;
      }
    }
  }
}

exports.commands["performRoll"] = function(gameID, data, userID, override) {
  // a publicly exposed function that invokes the "resolve" callback
  // "resolve" can be triggered multiple times, and serves as a way to
  // update events/initiatives
  var game = gameControls.getGame(gameID);
  var ev = game.events[data.id];
  if (ev) {
    ev._callbacks["resolve"](gameID, {id : data.id, ev : ev, data : data.data}, userID, override);
  }
}

exports.commands["provokeChoice"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (gameControls.security(gameID, userID, 1) || override) {
    data.players = data.players || [{userID : userID}];
    for (var i in data.players) {
      var pID = data.players[i];
      var eventData = {
        players : [pID.userID],
        popout : true,
        ui : "ui_choices",
        title : data.data.title || data.title,
        prompt : data.data.prompt || data.prompt,
        data : {
          choices : data.data.choices,
        },
      };

      var returnID = exports.commands["createEvent"](gameID, eventData, userID, true);
      if (returnID) {
        // Created Successfully
        users.alert(userID, {text:"Roll Successfully Sent"});
        return returnID;
      }
    }
  }
}

exports.commands["performChoice"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  var ev = game.events[data.id];
  if (ev && gameControls.security(gameID, userID, 2, ev) || override) {
    var newData = data.data;

    game.events[data.id].selected = newData.choice;

    if (exports.commands["resolve"](gameID, {id : data.id}, userID, true)) {
      // Updated Successfully
      if (exports.commands["logEvent"](gameID, {text:users.user(userID).displayName + " made the choice " + game.events[data.id].choices[newData.choice]}, userID, true)) {
        // Updated Successfully
      }
    }
  }
}*/
exports.commands["music"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var update = {
    header : {
      type : "music",
      user : userID,
    },
    data : data,
  };
  gameControls.broadcast(gameID, update);
}

exports.commands["command"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var update = {
    header : {
      type : "command",
      user : userID,
    },
    data : data,
  };
  gameControls.broadcast(gameID, update);
}

exports.commands["effect"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (gameControls.security(gameID, userID, 2)) {
    var update = {
      header : {
        type : "effect",
        user : userID,
      },
      data : data,
    };
    gameControls.broadcast(gameID, update);
  }
}

exports.commands["comms"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  data = data || {};
  data.from = userID;
  var update = {
    header : {
      type : "comms",
    },
    data : data,
  };

  gameControls.broadcast(gameID, update);
}

exports.commands["media"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (game.players[userID] && data) {
    if (data.cmd == "update" && game.owner == userID) {
      game.media.video = data.data.video;
      game.media.players = {}; // players that are ready for this video
      game.media.check = Date.now() + 1000 * 10;
      for (var userID in game.players) {
        game.media.players[userID] = false;
      }
      var update = {
        header : {
          type : "media",
        },
        data : {cmd : "update", data : data.data},
      };
      gameControls.broadcast(gameID, update);
    }
    else if (data.cmd == "update-ack") {
      game.media.players[userID] = true; //add to this table as soon as it works
      var ready = true;
      for (var userID in game.media.players) {
        if (!game.media.players[userID]) {
          ready = false;
        }
      }
      if (ready) {
        var update = {
          header : {
            type : "media",
          },
          data : {cmd : "ready"},
        };
        gameControls.broadcast(gameID, update, null, Object.keys(game.media.players));
      }
    }
    else if (data.cmd == "play" && game.owner == userID) {
      var update = {
        header : {
          type : "media",
        },
        data : {cmd : "play"},
      };
      gameControls.broadcast(gameID, update, null, Object.keys(game.media.players));
    }
    else if (data.cmd == "watching") {
      var update = {
        header : {
          type : "media",
        },
        data : {cmd : "watching", userID : userID, video : data.video},
      };
      // show everybody whos' watching what
      gameControls.broadcast(gameID, update);
    }
  }
}

exports.commands["updateConfig"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (game.owner == userID || override) {
    if (data && data.data) {
      game.config.name = data.data.name || game.config.name;
      game.config.password = data.data.password || game.config.password;
      if (game.config.password == '""') {
        delete game.config.password;
      }
      game.config.capacity = data.data.capacity || game.config.capacity;
      game.config.motd = data.data.motd || game.config.motd;
      game.config.players = data.data.players || game.config.players;
      game.config.organized = data.data.organized || game.config.organized;
      game.config.folders = data.data.folders || game.config.folders;
      game.config.tracks = data.data.tracks || game.config.tracks;
      game.config.game = data.data.game || game.config.game;
      game.config.resources = data.data.resources || game.config.resources;
      game.config.options = game.config.options || {};
      game.config.scripts = data.data.scripts || game.config.scripts || [];
      game.config.library = data.data.library || game.config.library;
      var changed;
      for (var id in game.players) {
        if (game.config.players && game.config.players[id] && game.players[id]) {
          game.players[id].rank = game.config.players[id].rank;
          changed = true;
        }
      }
      if (changed) {
        gameControls.updatePlayers(gameID);
      }
      // update other player states with the new changes
      var update = {
        header : {
          type : "config",
        },
        data : game.config
      };
      gameControls.broadcast(gameID, update);
    }
  }
  return false;
}

exports.commands["reaction"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (gameControls.security(gameID, userID, 3)) {
    // update other player states with the new changes
    if (exports.commands["logEvent"](gameID, {user : users.user(userID).displayName, userID : userID, color : game.players[userID].color, media : data}, userID, true)) {
      var update = {
        header : {
          id : userID,
          type : "reaction",
        },
        data : data
      };
      gameControls.broadcast(gameID, update);
    }
  }
}

exports.commands["updateDisplay"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var obj = game.state.display;

  if (gameControls.security(gameID, userID, 2) || override) {
    if (data) {
      game.state.displays = game.state.displays || [];
      game.state.display = game.state.display || {};
      game.state.display.media = data.media;
      game.state.display.title = data.title;
      game.state.display.credits = data.credits;
      game.state.display.preface = data.preface;
      game.state.display.text = data.text;
      game.state.display.options = data.options || {};
      // update other player states with the new changes
      if (exports.commands["updateState"](gameID, null, userID, true)) {
        // success
      }
    }
  }
  return false;
}

/*{
  map,
  bc,
  pieces : {
    {x,y,w,h,eID,c,"_s"}
  }
}*/

exports.commands["createBoard"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}

  if (gameControls.security(gameID, userID, 1) || override) {
    if (data) {
      var board = {"_t" : "b"};
      board.info = data.info || {name : sync.newValue(null, data.name || "[No Name]")};
      board.map = data.map;
      board.bc = data.bc || "rgb(34,34,34,0.5)";
      board.c = data.c || "rgb(34,34,34,0.5)";
      board.sheets = data.sheets;
      if (!board.sheets) {
        board.sheets = [{"legal": {"name": "Thanks to Blue Sword Games!","img" : "/content/bluesword/bluesword.jpg","href": "https://www.patreon.com/blueswordgames"},"i":"/content/bluesword/ground.png","p":0,"gW":64,"gH":64,"w":512,"h":512,"objs":[{"i":3,"gW":2,"gH":2,"w":128,"h":128,"s":0},{"i":0,"gW":1,"gH":3,"w":64,"h":192,"s":0},{"i":1,"gW":2,"gH":3,"w":128,"h":192,"s":0},{"i":19,"gW":1,"gH":1,"w":64,"h":64,"s":0},{"i":59,"gW":1,"gH":1,"w":64,"h":64,"s":0},{"i":40,"gW":1,"gH":3,"w":64,"h":192,"s":0},{"i":41,"gW":2,"gH":3,"w":128,"h":192,"s":0},{"i":60,"gW":1,"gH":1,"w":64,"h":64,"s":0},{"i":5,"gW":3,"gH":1,"w":192,"h":64,"s":0},{"i":13,"gW":3,"gH":2,"w":192,"h":128,"s":0}],"nW":1024,"nH":1024},{"i":"/content/bluesword/interior.png","p":0,"gW":64,"gH":64,"w":512,"h":1024,"objs":[{"i":0,"gW":1,"gH":1,"w":64,"h":64},{"i":1,"gW":1,"gH":1,"w":64,"h":64},{"i":2,"gW":2,"gH":1,"w":128,"h":64},{"i":4,"gW":2,"gH":1,"w":128,"h":64},{"i":6,"gW":2,"gH":2,"w":128,"h":128},{"i":8,"gW":1,"gH":1,"w":64,"h":64},{"i":16,"gW":1,"gH":1,"w":64,"h":64},{"i":9,"gW":2,"gH":2,"w":128,"h":128},{"i":11,"gW":2,"gH":2,"w":128,"h":128},{"i":13,"gW":1,"gH":1,"w":64,"h":64},{"i":21,"gW":1,"gH":1,"w":64,"h":64},{"i":22,"gW":2,"gH":3,"w":128,"h":192},{"i":29,"gW":1,"gH":2,"w":64,"h":128},{"i":27,"gW":2,"gH":1,"w":128,"h":64},{"i":25,"gW":2,"gH":2,"w":128,"h":128},{"i":24,"gW":1,"gH":1,"w":64,"h":64},{"i":32,"gW":1,"gH":1,"w":64,"h":64},{"i":35,"gW":2,"gH":1,"w":128,"h":64},{"i":40,"gW":2,"gH":2,"w":128,"h":128},{"i":42,"gW":3,"gH":2,"w":192,"h":128},{"i":45,"gW":3,"gH":3,"w":192,"h":192},{"i":56,"gW":1,"gH":1,"w":64,"h":64},{"i":57,"gW":1,"gH":1,"w":64,"h":64},{"i":58,"gW":1,"gH":1,"w":64,"h":64},{"i":59,"gW":1,"gH":1,"w":64,"h":64},{"i":60,"gW":1,"gH":1,"w":64,"h":64},{"i":64,"gW":4,"gH":2,"w":256,"h":128},{"i":68,"gW":3,"gH":2,"w":192,"h":128},{"i":71,"gW":1,"gH":1,"w":64,"h":64},{"i":79,"gW":1,"gH":1,"w":64,"h":64},{"i":80,"gW":3,"gH":2,"w":192,"h":128},{"i":83,"gW":4,"gH":2,"w":256,"h":128},{"i":87,"gW":1,"gH":1,"w":64,"h":64},{"i":95,"gW":1,"gH":1,"w":64,"h":64},{"i":96,"gW":2,"gH":1,"w":128,"h":64},{"i":98,"gW":4,"gH":1,"w":256,"h":64},{"i":102,"gW":2,"gH":1,"w":128,"h":64},{"i":104,"gW":2,"gH":1,"w":128,"h":64},{"i":106,"gW":4,"gH":1,"w":256,"h":64},{"i":112,"gW":1,"gH":1,"w":64,"h":64},{"i":116,"gW":1,"gH":1,"w":64,"h":64},{"i":117,"gW":1,"gH":1,"w":64,"h":64},{"i":118,"gW":1,"gH":1,"w":64,"h":64},{"i":119,"gW":1,"gH":1,"w":64,"h":64},{"i":110,"gW":2,"gH":1,"w":128,"h":64},{"i":113,"gW":2,"gH":1,"w":128,"h":64},{"i":115,"gW":1,"gH":1,"w":64,"h":64}],"nW":1024,"nH":2048},{"i":"/content/bluesword/items.png","p":0,"gW":64,"gH":64,"w":512,"h":512,"objs":[{"i":0,"gW":1,"gH":1,"w":32,"h":32},{"i":1,"gW":1,"gH":1,"w":32,"h":32},{"i":8,"gW":1,"gH":1,"w":32,"h":32},{"i":9,"gW":1,"gH":1,"w":32,"h":32},{"i":2,"gW":1,"gH":2,"w":32,"h":64},{"i":3,"gW":1,"gH":2,"w":32,"h":64},{"i":4,"gW":1,"gH":2,"w":32,"h":64},{"i":5,"gW":1,"gH":1,"w":32,"h":32},{"i":13,"gW":1,"gH":1,"w":32,"h":32},{"i":6,"gW":2,"gH":1,"w":64,"h":32},{"i":14,"gW":2,"gH":1,"w":64,"h":32},{"i":16,"gW":1,"gH":1,"w":32,"h":32},{"i":17,"gW":1,"gH":1,"w":32,"h":32},{"i":18,"gW":1,"gH":1,"w":32,"h":32},{"i":19,"gW":1,"gH":1,"w":32,"h":32},{"i":20,"gW":1,"gH":1,"w":32,"h":32},{"i":21,"gW":1,"gH":1,"w":32,"h":32},{"i":22,"gW":1,"gH":1,"w":32,"h":32},{"i":23,"gW":1,"gH":1,"w":32,"h":32},{"i":24,"gW":1,"gH":1,"w":32,"h":32},{"i":25,"gW":1,"gH":1,"w":32,"h":32},{"i":26,"gW":1,"gH":1,"w":32,"h":32},{"i":27,"gW":1,"gH":1,"w":32,"h":32},{"i":28,"gW":1,"gH":1,"w":32,"h":32},{"i":29,"gW":1,"gH":1,"w":32,"h":32},{"i":30,"gW":1,"gH":1,"w":32,"h":32},{"i":31,"gW":1,"gH":1,"w":32,"h":32},{"i":32,"gW":1,"gH":1,"w":32,"h":32},{"i":33,"gW":1,"gH":1,"w":32,"h":32},{"i":35,"gW":1,"gH":1,"w":32,"h":32},{"i":36,"gW":1,"gH":1,"w":32,"h":32},{"i":37,"gW":1,"gH":1,"w":32,"h":32},{"i":38,"gW":1,"gH":1,"w":32,"h":32},{"i":39,"gW":1,"gH":1,"w":32,"h":32},{"i":40,"gW":1,"gH":1,"w":32,"h":32},{"i":41,"gW":1,"gH":1,"w":32,"h":32},{"i":42,"gW":1,"gH":1,"w":32,"h":32},{"i":43,"gW":1,"gH":1,"w":32,"h":32},{"i":44,"gW":1,"gH":1,"w":32,"h":32},{"i":45,"gW":1,"gH":1,"w":32,"h":32},{"i":46,"gW":1,"gH":1,"w":32,"h":32},{"i":47,"gW":1,"gH":1,"w":32,"h":32},{"i":48,"gW":1,"gH":1,"w":32,"h":32},{"i":49,"gW":1,"gH":1,"w":32,"h":32},{"i":50,"gW":1,"gH":1,"w":32,"h":32},{"i":51,"gW":1,"gH":1,"w":32,"h":32},{"i":52,"gW":1,"gH":1,"w":32,"h":32},{"i":53,"gW":1,"gH":1,"w":32,"h":32},{"i":54,"gW":1,"gH":1,"w":32,"h":32},{"i":56,"gW":1,"gH":1,"w":32,"h":32},{"i":57,"gW":1,"gH":1,"w":32,"h":32},{"i":58,"gW":1,"gH":1,"w":32,"h":32},{"i":59,"gW":1,"gH":1,"w":32,"h":32},{"i":60,"gW":1,"gH":1,"w":32,"h":32},{"i":61,"gW":1,"gH":1,"w":32,"h":32}],"nW":1024,"nH":1024},{"i":"/content/bluesword/forest.png","p":0,"gW":64,"gH":64,"w":512,"h":512,"objs":[{"i":0,"gW":3,"gH":3,"w":96,"h":96},{"i":3,"gW":2,"gH":2,"w":64,"h":64},{"i":5,"gW":2,"gH":2,"w":64,"h":64},{"i":7,"gW":1,"gH":1,"w":32,"h":32},{"i":24,"gW":3,"gH":3,"w":96,"h":96},{"i":21,"gW":1,"gH":2,"w":32,"h":64},{"i":37,"gW":1,"gH":1,"w":32,"h":32},{"i":22,"gW":1,"gH":2,"w":32,"h":64},{"i":38,"gW":1,"gH":1,"w":32,"h":32},{"i":15,"gW":1,"gH":1,"w":32,"h":32},{"i":23,"gW":1,"gH":1,"w":32,"h":32},{"i":31,"gW":1,"gH":1,"w":32,"h":32},{"i":24,"gW":3,"gH":2,"w":96,"h":64},{"i":19,"gW":2,"gH":2,"w":64,"h":64}],"nW":1024,"nH":1024},{"i":"/content/bluesword/desert.png","p":0,"gW":64,"gH":64,"w":576,"h":1024,"objs":[{"i":0,"gW":2,"gH":2,"w":64,"h":64},{"i":2,"gW":1,"gH":1,"w":32,"h":32},{"i":11,"gW":1,"gH":1,"w":32,"h":32},{"i":3,"gW":1,"gH":1,"w":32,"h":32},{"i":12,"gW":1,"gH":1,"w":32,"h":32},{"i":4,"gW":2,"gH":2,"w":64,"h":64},{"i":6,"gW":2,"gH":2,"w":64,"h":64},{"i":8,"gW":1,"gH":1,"w":32,"h":32},{"i":17,"gW":1,"gH":1,"w":32,"h":32},{"i":25,"gW":2,"gH":2,"w":64,"h":64},{"i":24,"gW":1,"gH":1,"w":32,"h":32},{"i":33,"gW":1,"gH":1,"w":32,"h":32},{"i":23,"gW":1,"gH":2,"w":32,"h":64},{"i":21,"gW":2,"gH":2,"w":64,"h":64},{"i":20,"gW":1,"gH":1,"w":32,"h":32},{"i":19,"gW":1,"gH":1,"w":32,"h":32},{"i":18,"gW":1,"gH":1,"w":32,"h":32},{"i":29,"gW":1,"gH":1,"w":32,"h":32},{"i":27,"gW":2,"gH":1,"w":64,"h":32},{"i":36,"gW":3,"gH":2,"w":96,"h":64},{"i":39,"gW":3,"gH":3,"w":96,"h":96},{"i":42,"gW":3,"gH":3,"w":96,"h":96},{"i":54,"gW":2,"gH":2,"w":64,"h":64},{"i":56,"gW":1,"gH":1,"w":32,"h":32},{"i":65,"gW":1,"gH":1,"w":32,"h":32},{"i":66,"gW":1,"gH":1,"w":32,"h":32},{"i":67,"gW":1,"gH":1,"w":32,"h":32},{"i":68,"gW":1,"gH":1,"w":32,"h":32},{"i":77,"gW":1,"gH":1,"w":32,"h":32},{"i":76,"gW":1,"gH":1,"w":32,"h":32},{"i":75,"gW":1,"gH":1,"w":32,"h":32},{"i":74,"gW":1,"gH":1,"w":32,"h":32},{"i":72,"gW":2,"gH":2,"w":64,"h":64},{"i":90,"gW":2,"gH":2,"w":64,"h":64},{"i":108,"gW":2,"gH":2,"w":64,"h":64},{"i":83,"gW":2,"gH":2,"w":64,"h":64},{"i":85,"gW":2,"gH":2,"w":64,"h":64},{"i":87,"gW":1,"gH":1,"w":32,"h":32},{"i":96,"gW":1,"gH":1,"w":32,"h":32},{"i":69,"gW":1,"gH":2,"w":32,"h":64},{"i":70,"gW":2,"gH":2,"w":64,"h":64},{"i":88,"gW":1,"gH":2,"w":32,"h":64},{"i":89,"gW":1,"gH":1,"w":32,"h":32},{"i":98,"gW":1,"gH":1,"w":32,"h":32},{"i":101,"gW":2,"gH":2,"w":64,"h":64},{"i":119,"gW":1,"gH":1,"w":32,"h":32},{"i":103,"gW":4,"gH":4,"w":128,"h":128}],"nW":1152,"nH":2048}];
      }
      board.layers = data.layers || [{
        _s : {default : "1"},
        n : "Background Layer",
        t : data.decor || [], //tiles
        p : data.pieces || [], //pieces
        d : data.strokes || [], //drawing
      },
      {
        _s : {default : "1"},
        n : "Player Layer",
        t : data.decor || [], //tiles
        p : data.pieces || [], //pieces
        d : data.strokes || [], //drawing
      },
      {
        n : "Trap Layer",
        _s : {default : "1"},
        t : [], //tiles
        p : [], //pieces
        d : [], //drawing
      },
      {
        n : "GM Layer",
        _s : {default : "(@me.rank=='Game Master')?(1):((@me.rank=='Assistant Master')?(1):(0))"},
        t : [], //tiles
        p : [], //pieces
        d : [], //drawing
      }];

      board.x = data.x;
      board.y = data.y;
      board.w = data.w || 1600;
      board.h = data.h || 1600;
      board.r = data.r;
      board.rp = data.rp;
      board.gridX = data.gridX || 0;
      board.gridY = data.gridY || 0;
      board.gridW = data.gridW || 64;
      board.gridH = data.gridH || 64;
      board.gc = data.gc || "rgba(0,0,0,0.10)";

      board.pW = data.pW;
      board.pH = data.pH;
      board.pC = data.pC;
      board.pD = data.pD;

      board.vX = data.vX;
      board.vY = data.vY;
      board.vZ = data.vZ || 100;

      board.options = data.options || {gLayer : 0, pLayer : 1};
      if (game.templates.grid && !data.options) {
        board.options.unit = game.templates.grid.unit;
        board.options.unitScale = game.templates.grid.unitScale;
        board.options.hex = game.templates.grid.hex;
      }
      // update other player states with the new changes
      if (override) {
        board._c = data._c;
        board._uid = data._uid;
      }
      var res = exports.commands["createEntity"](gameID, board, userID, override);
      if (res) {
        // success
        return res;
      }
    }
  }
  return false;
}

exports.commands["updateBoard"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var board = game.entities[data.id];
  if (board && data.data && (gameControls.security(gameID, userID, 2, board) || override)) {
    board.info = data.data.info || {name : sync.newValue(null, board.name || "[No Name]")};
    board.map = data.data.map;
    board.c = data.data.c;
    board.layers = board.layers || [];
    board.sheets = data.data.sheets || [];
    board.layers = data.data.layers || [{
      _s : {default : "1"},
      n : "Default Layer",
      t : data.data.decor || [], //tiles
      p : data.data.pieces || [], //pieces
      d : data.data.strokes || [], //drawing
    },
    {
      _s : {default : "1"},
      n : "Player Layer",
      t : data.data.decor || [], //tiles
      p : data.data.pieces || [], //pieces
      d : data.data.strokes || [], //drawing
    },
    {
      n : "Trap Layer",
      t : data.data.decor || [], //tiles
      p : data.data.pieces || [], //pieces
      d : data.data.strokes || [], //drawing
    },
    {
      n : "GM Layer",
      s : [], //stamps
      t : [], //tiles
      p : [], //pieces
      d : [], //drawing
    }];

    board.x = data.data.x;
    board.y = data.data.y;
    board.w = data.data.w;
    board.h = data.data.h;
    board.r = data.data.r;
    board.rp = data.data.rp;
    board.gridX = data.data.gridX || 0;
    board.gridY = data.data.gridY || 0;
    board.gridW = data.data.gridW;
    board.gridH = data.data.gridH;
    board.gc = data.data.gc;

    board.pW = data.data.pW;
    board.pH = data.data.pH;
    board.pC = data.data.pC;
    board.pD = data.data.pD;

    board.vX = data.data.vX;
    board.vY = data.data.vY;
    board.vZ = data.data.vZ || 100;

    board.options = data.data.options;
    // update other player states with the new changes
    if (exports.commands["updateEntity"](gameID, {id : data.id}, userID, true)) {
      // success
    }
  }
  return false;
}

exports.commands["boardAddDrawing"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var board = game.entities[data.id];
  if (data.data && (gameControls.security(gameID, userID, 2, board) || (board.options && board.options.freeDraw) || override)) {
    data.data.u = userID;
    if (board.layers[data.layer] && board.layers[data.layer].d.length < game.config.tileLimit) {
      board.layers[data.layer].d.push(data.data);

      // update other player states with the new changes
      if (exports.commands["updateEntity"](gameID, {id : data.id, noResponse : true}, userID, true)) {
        // success
        return true;
      }
    }
  }
  return false;
}

exports.commands["boardUpdateDrawing"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var board = game.entities[data.id];
  if (data.data && (gameControls.security(gameID, userID, 2, board) || (board.options && board.options.freeDraw) || override)) {
    data.data.u = userID;
    if (board.layers[data.layer] && board.layers[data.layer].d.length < game.config.tileLimit && board.layers[data.layer].d[data.stroke]) {
      board.layers[data.layer].d[data.stroke] = data.data;

      // update other player states with the new changes
      if (exports.commands["updateEntity"](gameID, {id : data.id, noResponse : true}, userID, true)) {
        // success
        return true;
      }
    }
  }
  return false;
}


exports.commands["boardDeleteDrawing"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var board = game.entities[data.id];
  if (data.data && (gameControls.security(gameID, userID, 2, board) || (board.options && board.options.freeDraw) || override)) {
    if (board.layers[data.layer] && board.layers[data.layer].d[data.stroke]) {
      board.layers[data.layer].d.splice(data.stroke, 1);

      // update other player states with the new changes
      if (exports.commands["updateEntity"](gameID, {id : data.id}, userID, true)) {
        // success
        return true;
      }
    }
  }
  return false;
}

exports.commands["deleteBoard"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}

  if (gameControls.security(gameID, userID, 1) || override) {
    if (data.id && game.entities[data.id]["_t"] == "b") {
      if (exports.commands["deleteEntity"](gameID, data, userID, true)) {
        // update other player states with the new changes
        if (game.state.display.board == data.id) {
          game.state.display.board = null;
          exports.commands["updateState"](gameID, null, userID, true);
        }
        return true;
      }
    }
  }
  return false;
}

exports.commands["createPiece"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (data) {
    var board = game.entities[data.id];
    var pieceData = data.data;
    if (board && board["_t"] == "b") {
      var pieceData = data.data;
      if (pieceData) {
        var ent = game.entities[pieceData.eID];
        if (gameControls.security(gameID, userID, 2, board) || (!ent || gameControls.security(gameID, userID, 2, ent))) {
          // update other player states with the new changes
          board.layers[data.layer].p.push(pieceData);
          if (exports.commands["updateEntity"](gameID, {id : data.id}, userID, true)) {
            // success
            return true;
          }
        }
      }
    }
  }
  return false;
}

exports.commands["updateBoardCursor"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (data) {
    var board = game.entities[data.id];
    if (board) {
      board.cursors = board.cursors || {};
      board.cursors[userID] = data.data;
      // update other player states with the new changes
      var update = {
        header : {
          id : userID,
          type : "cursor",
        },
        data : data
      };
      gameControls.broadcast(gameID, update);
      return true;
    }
  }
  return false;
}

exports.commands["updateBoardLayer"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (game && data) {
    var board = game.entities[data.id];
    if (data.layer != null && board && board["_t"] == "b" && board.layers[data.layer]) {
      if (gameControls.security(gameID, userID, 2, board) || data.triggered || (data.type == "p" && (!data.data.eID || (data.data.eID && game.entities[data.data.eID] && gameControls.security(gameID, userID, 2, game.entities[data.data.eID])))) || (data.type == "d" && board.options && board.options.freeDraw)) {
        board.layers[data.layer] = data.result;
        var update = {
          header : {
            id : data.id,
            userID : userID,
            type : "updateBoardLayer",
          },
          data : data
        };
        gameControls.broadcast(gameID, update);
        return true;
      }
    }
  }
  return false;
}

exports.commands["boardMove"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (game && data) {
    var board = game.entities[data.id];
    if (data.layer != null && board["_t"] == "b" && board.layers[data.layer] && data.data) {
      if (gameControls.security(gameID, userID, 2, board) || (data.type == "p" && data.data.eID && game.entities[data.data.eID] && gameControls.security(gameID, userID, 2, game.entities[data.data.eID])) || (data.type == "d" && board.options && board.options.freeDraw)) {
        board.layers[data.layer][data.type][data.index] = data.data;
        var update = {
          header : {
            id : data.id,
            userID : userID,
            type : "move",
          },
          data : data
        };
        gameControls.broadcast(gameID, update);
        return true;
      }
    }
  }
  return false;
}

exports.commands["deletePiece"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (data && data.data) {
    var board = game.entities[data.id];
    var pieceData = data.data;
    if (pieceData.index != null && pieceData.layer && board && board["_t"] == "b" && board.layers && board.layers[pieceData.layer]) {
      // update other player states with the new changes
      if (gameControls.security(gameID, userID, 2, board) && board.layers[pieceData.layer].p[pieceData.index]) {
        board.layers[pieceData.layer].p.splice([pieceData.index]);
        var update = {
          header : {
            id : data.id,
            type : "piece",
            delete : true,
          },
          data : pieceData
        };
        gameControls.broadcast(gameID, update);
        return true;
      }
    }
  }
  return false;
}

exports.commands["updateQueue"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var obj = game.state.display;
  if (gameControls.security(gameID, userID, 2) || override) {
    if (data) {
      game.state.display.queue = data;
      // update other player states with the new changes
      if (exports.commands["updateState"](gameID, null, userID, true)) {
        // success
      }
    }
  }
  return false;
}

exports.commands["nextMedia"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var obj = game.state.display;

  if (gameControls.security(gameID, userID, 2) || override) {
    if (!game.state.display) {
      game.state.display = {};
    }
    if (!game.state.display.queue) {
      game.state.display.queue = [];
    }
    else if (game.state.display.queue.length){
      merge(game.state.display, game.state.display.queue[0], true);
      game.state.display.queue.splice(0,1);
    }
    // update other player states with the new changes
    if (exports.commands["updateState"](gameID, null, userID, true)) {
      // success
    }
  }
  return false;
}

exports.commands["startDisplayCountdown"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var obj = game.state.display;

  if (gameControls.security(gameID, userID, 2) || override) {
    if (data) {
      if (!game.state.display.timers) {
        game.state.display.timers = [];
      }
      game.state.display.timers.push({label : data.label, endTime: Date.now() + Number(data.time)});
      if (exports.commands["updateState"](gameID, null, userID, true)) {
        // success
      }
    }
  }
  return false;
}

exports.commands["destroyDisplayCountdown"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var obj = game.state.display;

  if (gameControls.security(gameID, userID, 2) || override) {
    if (data) {
      if (game.state.display.timers) {
        if (game.state.display.timers[data.index]) {
          game.state.display.timers.splice(data.index, 1);
          // update other player states with the new changes
          if (exports.commands["updateState"](gameID, null, userID, true)) {
            // success
          }
        }
      }
    }
  }
  return false;
}

exports.commands["selectPlayerEntity"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var targetID = userID;
  if (data && data.userID && gameControls.security(gameID, userID, 2)) {
    targetID = data.userID || userID;
  }
  var pObj = game.players[targetID];
  if (pObj) {
    if (!data.id) {
      if (game.players[targetID] && game.players[targetID].entity) {
        delete game.players[targetID].entity;
        // update other player states with the new changes
        if (game.config.players && game.config.players[targetID]) {
          delete game.config.players[targetID].entity;
          var update = {
            header : {
              type : "config",
            },
            data : game.config
          };
          gameControls.broadcast(gameID, update);
        }
        gameControls.updatePlayers(gameID);
        return true;
      }
    }
    else {
      var obj = game.entities[data.id];
      if (obj) {
        if (game.config.players && game.config.players[targetID]) {
          game.config.players[targetID].entity = data.id;

          var update = {
            header : {
              type : "config",
            },
            data : game.config
          };
          gameControls.broadcast(gameID, update);
        }
        game.players[targetID].entity = data.id;
        // update other player states with the new changes
        gameControls.updatePlayers(gameID);
        return true;
      }
    }
  }
  return false;
}

exports.commands["selectPlayerColor"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var targetID = userID;
  if (data.userID && gameControls.security(gameID, userID, 2)) {
    targetID = data.userID || userID;
  }
  var pObj = game.players[targetID];
  if (pObj) {
    if (!data) {
      delete game.players[targetID].color;
      if (game.config.players && game.config.players[targetID]) {
        delete game.config.players[targetID].color;
        var update = {
          header : {
            type : "config",
          },
          data : game.config
        };
        gameControls.broadcast(gameID, update);
      }
      // update other player states with the new changes
      gameControls.updatePlayers(gameID);
      return true;
    }
    else {
      game.players[targetID].color = data.col;
      if (game.config.players && game.config.players[targetID]) {
        game.config.players[targetID].color = data.col;
        var update = {
          header : {
            type : "config",
          },
          data : game.config
        };
        gameControls.broadcast(gameID, update);
      }
      // update other player states with the new changes
      gameControls.updatePlayers(gameID);
      return true;
    }
  }
  return false;
}

exports.commands["createEntity"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (gameControls.security(gameID, userID, 1) || override) {
    // allow players to have one entity each
    if (Object.keys(game.entities).length >= game.config.entityLimit + game.config.capacity) {
      if (exports.commands["logEvent"](gameID, {text:"Server has reached max entity capacity, upgrade to Group package to get a larger Entity cap"}, userID, true)) {
        // Logged Successfully
      }
      return false;
    }

    game["_euid"] = game["_euid"] + 1;
    game.entities[game["_euid"]] = data;
    game.entities[game["_euid"]]["_s"] = {};
    game.entities[game["_euid"]]["_s"][game.owner] = exports.templates.security.object["Owner"];
    game.entities[game["_euid"]]["_s"][userID] = exports.templates.security.object["Owner"]; // 1 is creater
    game.entities[game["_euid"]]["_lclock"] = 0;
    game.entities[game["_euid"]]["_c"] = game.entities[game["_euid"]]["_c"] || userID;

    if (!override) {
      game.entities[game["_euid"]]["_c"] = game.owner || userID; // belongs to the owner
    }

    game.entities[game["_euid"]]["_uid"] = game.entities[game["_euid"]]["_uid"] || null;
    game.entities[game["_euid"]]["_sync"] = game.entities[game["_euid"]]["_sync"] || null;
    if (data) {
      var update = {
        header : {
          id : game["_euid"],
          type : "entity"
        },
        data : data
      };
      gameControls.broadcast(gameID, update);
    }
    return game["_euid"];
  }
}

exports.commands["refreshEntity"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var obj = game.entities[data.id];
  if (obj) { // Reload it
    exports.commands["updateEntity"](gameID, {id : data.id}, userID, true);
    return true;
  }
  return false;
}

exports.commands["updateEntity"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var obj = game.entities[data.id];
  if (obj && (override || userID == "s-76561197990379371")) { // this is an internal function
    var newObj = data.data;
    if (!newObj) {
      newObj = game.entities[data.id];
    }
     // NOBODY is allowed to change the type
    newObj["_t"] = game.entities[data.id]["_t"];
    game.entities[data.id] = newObj;
    // Consistency with lamport clocks
    game.entities[data.id]["_lclock"] = Number(game.entities[data.id]["_lclock"]) + 1;
    game.entities[data.id]["_uTime"] = Date.now();
    var update = {
      header : {
        id : data.id,
        type : "entity",
      },
      data : newObj
    };
    if (data.noResponse) {
      var list = [];
      for (var i in game.players) {
        if (i != userID) {
          list.push(i);
        }
      }
      gameControls.broadcast(gameID, update, null, list);
    }
    else {
      gameControls.broadcast(gameID, update);
    }
    return true;
  }
  return false;
}

exports.commands["deleteEntity"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var obj = game.entities[data.id];
  if (obj && override) {
    delete game.entities[data.id];
    var update = {
      header : {
        id : data.id,
        type : "entity",
      },
      data : null
    };
    gameControls.broadcast(gameID, update);
    return true
  }
  return false;
}

exports.commands["createPage"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  if (gameControls.security(gameID, userID, 2) || override) {
    var entity = JSON.parse(JSON.stringify(game.templates.page || {}));
    if (data.data) {
      var override = data.data.override;
      // start with the base character
      merge(entity, override, true);
    }
    else {
      entity = data;
    }
    var res = exports.commands["createEntity"](gameID, entity, userID, override);
    if (res) {
      // Created Successfully
      return res;
    }
  }
  return false;
}

exports.commands["createEvent"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  if (Object.keys(game.events).length >= game.config.eventLimit) {
    for (var i=0; i<game["_evuid"]; i++) {
      if (game.events[i]) {
        delete game.events[i];
        break;
      }
    }
  }
  if (data && override) {
    var popout = data._popout;
    var ui = data._ui;
    delete data._popout;
    delete data._ui;

    game["_evuid"] = game["_evuid"] + 1;
    game.events[game["_evuid"]] = data || {};
    game.events[game["_evuid"]]._callbacks = data._callbacks || {};
    game.events[game["_evuid"]]["_c"] = userID; // who created it
    game.events[game["_evuid"]]["_s"] = {};


    for (var id in game.players) { // set appropriate rights for targets
      game.events[game["_evuid"]]["_s"][id] = exports.templates.security.object["Visible"];
    }

    for (var id in data.players) { // set appropriate rights for targets
      game.events[game["_evuid"]]["_s"][data.players[id]] = exports.templates.security.object["Rights"];
    }

    game.events[game["_evuid"]]["_s"][game.owner] = exports.templates.security.object["Owner"];
    game.events[game["_evuid"]]["_s"][userID] = exports.templates.security.object["Owner"]; // 1 is creater


    // this must be set by the SERVER, nobody else, security breach otherwise
    game.events[game["_evuid"]].root = data.root || "entities";
    game.events[game["_evuid"]]["_lclock"] = 0;
    // update other player states
    var cleanse = JSON.parse(JSON.stringify(data));
    delete cleanse._callbacks;
    var update = {
      header : {
        id : game["_evuid"],
        type : "event",
        popout : popout,
        ui : ui,
      },
      data : cleanse
    };
    gameControls.broadcast(gameID, update);

    return game["_evuid"];
  }
  return false;
}

exports.commands["updateEvent"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var obj = game.events[data.id];
  if (obj && gameControls.security(gameID, userID, 2, obj) || override) {
    var newObj = data.data;
    if (!newObj) {
      newObj = game.events[data.id];
    }
    // preserve callbacks
    var callbacks = game.events[data.id]._callbacks;
    game.events[data.id] = newObj;
    game.events[data.id]._callbacks = callbacks;
    // Consistency with lamport clocks
    game.events[data.id]["_lclock"] = Number(game.events[data.id]["_lclock"]) + 1;

    var cleanse = JSON.parse(JSON.stringify(newObj));
    delete cleanse.callbacks;
    var update = {
      header : {
        id : data.id,
        type : "event",
      },
      data : cleanse
    };
    gameControls.broadcast(gameID, update);
    if (!override) {
      var changed = {
        userID : userID,
        text : users.user(userID).displayName + " changed event " + (game.events[data.id].title || "")
      }
      exports.commands["logEvent"](gameID, changed, userID, true);
    }

    return true;
  }
  return false;
}

exports.commands["resolveEvent"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var obj = game.events[data.id];
  if (obj && override) {
    for (var index in obj._callbacks) {
      obj._callbacks[index](gameID, data, userID, override); // happens after an event has been performed
    }
    if (exports.commands["updateEvent"](gameID, {id : data.id}, userID, true)) {
      // Updated Successfully
      return true;
    }
  }
  return false;
}

exports.commands["deleteEvent"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (game.events[data.id] && override) {
    delete game.events[data.id];
    var update = {
      header : {
        id : data.id,
        type : "event",
      },
      data : null
    };
    gameControls.broadcast(gameID, update);
    return true;
  }
  return false;
}

exports.commands["chatEvent"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (userID || override) {

    var userName = userID;
    if (game.config.players && game.config.players[userID]) {
      userName = game.config.players[userID].displayName || userName;
    }
    else if (game.players && game.players[userID]) {
      userName = game.players[userID].displayName || userName;
    }

    data.user = users.user(userID).displayName; // can't spoof users
    data.userID = userID;

    if (data.audio && gameControls.security(gameID, userID, 3)) {
      gameControls.broadcast(gameID, {header : {type : "music"}, data : {src : data.audio, volume : data.volume}});
    }

    if (data.eventData) {
      if (!data.eventData.pool) {
        data.eventData.pool = data.eventData.pool || {};
        var rolled = {};
        var total = 0;
        for (var index in data.eventData.equations) {
          if (!data.eventData.equations[index].ctx) {
            data.eventData.equations[index].ctx = {};
          }
          data.eventData.equations[index].ctx.total = sync.newValue(null, data.eventData.equations[index].v);
          total += data.eventData.equations[index].v;
          if (data.eventData.equations[index].ctx.die) {
            var diceData = game.templates.dice.pool[sync.rawVal(data.eventData.equations[index].ctx.die)];
            rolled[sync.rawVal(data.eventData.equations[index].ctx.die)] = rolled[sync.rawVal(data.eventData.equations[index].ctx.die)] || 0;
            rolled[sync.rawVal(data.eventData.equations[index].ctx.die)] += 1;
            if (diceData && diceData.results) {
              var valueData = diceData.results[data.eventData.equations[index].v];
              for (var key in valueData) {
                if (data.eventData.pool[key]) {
                  data.eventData.pool[key] += valueData[key];
                }
                else {
                  data.eventData.pool[key] = valueData[key];
                }
              }
            }
          }
        }
        if (data.eventData.equations && data.eventData.equations.length) {
          data.eventData.pool["dice"] = data.eventData.equations.length;
          data.eventData.pool["rolled"] = rolled;
        }
        data.eventData.pool["total"] = total;
      }
    }

    for (var id in data.effects) {
      var targetCalc = data.effects[id];
      if (game.entities[id]) {
        for (var i in targetCalc) {
          var val = sync.traverse(game.entities[id], targetCalc[i].target);
          var updateData = {
            icon : sync.rawVal(game.entities[id].info.img),
            eID : id
          };
          if (val instanceof Object) {
            sync.rawVal(val, targetCalc[i].eq);
          }
          else {
            sync.traverse(game.entities[id], targetCalc[i].target, targetCalc[i].eq);
          }
          if (!targetCalc[i].hide) {
            exports.commands["logEvent"](gameID, updateData, userID, true);
          }
        }
        exports.commands["updateEntity"](gameID, {id : id}, userID, true);
      }
    }
    if (exports.commands["logEvent"](gameID, data, userID, true)) {
      // Updated Successfully
      return true;
    }
  }
  return false;
}

exports.commands["handout"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (gameControls.security(gameID, userID, 2) || override) {
    var update = {
      header : {
        id : data.id,
        type : "handout",
      },
      data : {name : data.name, ui : data.ui, sender : userID}
    };
    if (data.players) {
      for (var i in data.players) {
        users.send(i, "command", update);
      }
    }
    else {
      gameControls.broadcast(gameID, update);
    }
  }
  return false;
}

exports.commands["kickPlayer"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (gameControls.security(gameID, userID, 2) || override) {
    if (game.players[data]) {
      users.send(data, "breakConnection");
    }
  }
  return false;
}

/*exports.commands["testStat"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);

  var id = exports.commands["provokeRoll"](gameID, data, userID, true);
  if (id) {
    // override the callback
    var msg = data.data.msg;
    game.events[id]._callbacks["postResolve"] = function(gameID, data, userID, override) {
      var evID = data.id;
      var ev = data.ev;
      var newData = data.data;
      if (exports.commands["updateEvent"](gameID, {id : data.id}, userID, true)) {
        // Updated Successfully
        var updateData = {
          text : msg,
          evID : evID,
          ui : "ui_statTest",
        };
        if (!ev.logged) {
          ev.logged = true;
          exports.commands["logEvent"](gameID, updateData, userID, true);
          users.alert(userID, updateData);
        }
        else {
          var changed = {
            userID : userID,
            text : users.user(userID).displayName + " changed event " + (game.events[data.id].title || "")
          }
          exports.commands["logEvent"](gameID, changed, userID, true);
        }
      }
    }
  }
}*/

exports.commands["diceCheck"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var newData = data.data;
  if (newData) {
    var ev = {
      flavor : data.msg,
      icon : data.icon || data.href,
      person : data.f,
      eventData : {
        ui : data.ui,
        equations : newData.equations,
        pool : newData.pool,
        loc : newData.loc,
        var : data.var,
      }
    };
    exports.commands["chatEvent"](gameID, ev, userID, true);
    return true;
  }
  return false;
}

exports.commands["applyCheck"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  for (var id in data.effects) {
    var targetCalc = data.effects[id];
    if (game.entities[id]) {
      for (var i in targetCalc) {
        var val = sync.traverse(game.entities[id], targetCalc[i].target);
        if (val instanceof Object) {
          sync.rawVal(val, targetCalc[i].eq);
        }
        else {
          sync.traverse(game.entities[id], targetCalc[i].target, targetCalc[i].eq);
        }
      }
      exports.commands["updateEntity"](gameID, {id : id}, userID, true);
    }
  }

  var updateData = {
    flavor : data.flavor,
    eID : id,
    color : data.color,
  };
  exports.commands["logEvent"](gameID, updateData, userID, true);
}

exports.commands["emptyEventLog"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}

  if (game.players[userID] && game.owner == userID) {
    game.logs.events = [];
    game["_evuid"] = 0;
    game.events.events = {};
    exports.commands["updateLogs"](gameID, null, userID, true);
    return true;
  }
  return false;
}


exports.commands["emptyLogEvent"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}

  if (game.players[userID] && gameControls.security(gameID, userID, 1) || override) {
    if (game.logs.events[data]) {
      game.logs.events.splice(data, 1);
    }
    exports.commands["updateLogs"](gameID, null, userID, true);
    return true;
  }
  return false;
}

exports.commands["updateEventLog"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}

  if (game.players[userID] && gameControls.security(gameID, userID, 1) || override) {
    if (game.logs.events[data.index]) {
      game.logs.events[data.index] = data.data;
    }
    exports.commands["updateLogs"](gameID, null, userID, true);
    return true;
  }
  return false;
}

exports.commands["logEvent"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (override) {
    if (data) {
      var logs = game.logs.events;
      game.logs.uid = (game.logs.uid || 0) + 1;
      data.timeStamp = Date.now();
      data.uid = game.logs.uid;
      if (logs.length > 200) {
        logs.splice(0,1);
      }
      logs.push(data);
    }
    // send the update to everybody
    if (exports.commands["updateLogs"](gameID, null, userID, true)) {
      // Created Successfully
      return game.logs.uid;
    }
  }
  return false;
}

exports.commands["updateRights"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  var obj = game.entities[data.id];
  if (obj && gameControls.security(gameID, userID, 1, obj) || override) {
    for (var key in data.security) {
      if (obj["_s"] && key != userID) {
        if (obj["_s"][key] && !data.security[key]) {
          delete obj["_s"][key];
        }
        else {
          obj["_s"][key] = data.security[key];
        }
      }
    }
    exports.commands["updateEntity"](gameID, {id : data.id}, userID, true);
  }
  return true;
}

exports.commands["updateSheet"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  var obj = game.entities[data.id];
  if (obj && gameControls.security(gameID, userID, 2, obj) || override) {
    obj._d = data.data._d;
    obj._calc = data.data._calc;
    exports.commands["updateAsset"](gameID, data, userID);
  }
  return true;
}

exports.commands["updateActions"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  var obj = game.entities[data.id];
  if (obj && gameControls.security(gameID, userID, 2, obj) || override) {
    if (data.delete == null) {
      sync.traverse(obj, (data.path || "")+"_a", data._a || {});
    }
    else {
      var ref = sync.traverse(obj, (data.path || "")+"_a");
      delete ref[data.delete];
    }
    exports.commands["updateEntity"](gameID, {id : data.id}, userID, true);
  }
  return true;
}

exports.commands["changeTemplate"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  if (game.owner == userID || override) {
    for (var key in data) {
      game.templates[key] = data[key];

      var update = {
        header : {
          type : "template",
        },
        data : data
      };
      gameControls.broadcast(gameID, update);
    }
  }
}

exports.commands["updateSync"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  var obj = game.entities[data.id];
  if (obj && gameControls.security(gameID, userID, 1, obj) || override) {
    obj._sync = data.data;
    exports.commands["updateEntity"](gameID, {id : data.id}, userID, true);
  }
  return true;
}

exports.commands["updateCombatState"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  var obj = game.state;
  if (obj && (obj.combat || gameControls.security(gameID, userID, 2)) || override) {
    var newObj = data.data.combat;
    game.state.combat = newObj;
    // Consistency with lamport clocks
    game.state["_lclock"] = Number(game.state["_lclock"]) + 1;
    var update = {
      header : {
        type : "state",
        combat : true,
      },
      data : game.state
    };
    gameControls.broadcast(gameID, update);
  }
  return true;
}

exports.commands["updateCards"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}

  var obj = game.state;
  if (obj || override) {
    var newObj = data.data.cards;
    game.state.cards = newObj;
    // Consistency with lamport clocks
    game.state["_lclock"] = Number(game.state["_lclock"]) + 1;
    var update = {
      header : {
        type : "state",
        combat : true,
      },
      data : game.state
    };
    gameControls.broadcast(gameID, update);
  }
  return true;
}

exports.commands["updateState"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}

  var obj = game.state;
  if (obj && gameControls.security(gameID, userID, 2) || override) {
    var newObj = game.state;
    if (data && data.data) {
      newObj = data.data;
    }
    game.state = newObj;
    // Consistency with lamport clocks
    game.state["_lclock"] = Number(game.state["_lclock"]) + 1;
    var update = {
      header : {
        type : "state",
      },
      data : game.state
    };
    gameControls.broadcast(gameID, update);
  }
  return true;
}

exports.commands["updateLogs"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  // Consistency with lamport clocks
  if (override) {
    game.logs["_lclock"] = Number(game.logs["_lclock"]) + 1;
    var update = {
      header : {
        type : "logs",
      },
      data : game.logs
    };
    gameControls.broadcast(gameID, update);

    return true;
  }
  return false;
}

exports.commands["createCharacter"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (override || game.players[userID]) {
    var entity = JSON.parse(JSON.stringify(game.templates.character || {}));
    if (data) {
      merge(data, entity);
      entity = data;
    }
    if (exports.commands["createEntity"](gameID, entity, userID, true)) {
      // Created Successfully
      return true;
    }
  }
  return false;
}

exports.commands["createItem"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (override || game.players[userID]) {
    var entity = data;
    if (exports.commands["createEntity"](gameID, entity, userID, true)) {
      // Created Successfully
      return true;
    }
  }
  return false;
}

exports.commands["updateAsset"] = function(gameID, data, userID, override) {
  // priviledges are needed here
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var obj = game.entities[data.id];
  if (obj && gameControls.security(gameID, userID, 2, obj) || override) {
    if (obj["_t"] == "b") {
      exports.commands["updateBoard"](gameID, data, userID, override);
    }
    if (exports.commands["updateEntity"](gameID, {id: data.id, data : data.data, noResponse : true}, userID, true)) {
      //do something successful
      return true;
    }
  }
  return false;
}

exports.commands["deleteAsset"] = function(gameID, data, userID, override) {
  // check to make sure it is a character
  var game = gameControls.getGame(gameID);
  if (!game) {return false;}
  var obj = game.entities[data.id];
  if (data.id && obj && gameControls.security(gameID, userID, 2, obj)) {
    if (exports.commands["deleteEntity"](gameID, data, userID, true)) {
      return true;
    }
  }
  return false;
}

exports.commands["joinCombat"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var obj = game.entities[data.id];
  if (obj && gameControls.security(gameID, userID, 2, obj) || override) {
    var newData = data.data;
    if (game.state.combat) {
      game.state.combat.engaged[data.id] = newData;
      if (exports.commands["updateState"](gameID, null, userID, true)) {
        // Updated Successfully
      }
    }
  }
}

exports.commands["leaveCombat"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  var obj = game.entities[data.id];
  if (obj && gameControls.security(gameID, userID, 2, obj) || override) {
    if (game.state.combat && game.state.combat.engaged[data.id]) {
      delete game.state.combat.engaged[data.id];
      if (exports.commands["updateState"](gameID, null, userID, true)) {
        // Updated Successfully
      }
    }
  }
}

exports.commands["enableCombat"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (gameControls.security(gameID, userID, 2) || override) {
    if (exports.commands["logEvent"](gameID, {text : "COMBAT STARTED", color: "rgb(255,100,100)", evID : true}, userID, true)) {
      // Updated Successfully
    }
  }
}

exports.commands["disableCombat"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (gameControls.security(gameID, userID, 2) || override) {
    var newData = data.data;

    delete game.state.combat;
    if (exports.commands["logEvent"](gameID, {text : "COMBAT ENDED", color: "rgb(100,255,100)", evID : true}, userID, true)) {
      // Updated Successfully
    }
    if (exports.commands["updateState"](gameID, null, userID, true)) {
      // Updated Successfully
    }
  }
}


exports.commands["savePack"] = function(gameID, data, userID, override) {
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (game.owner == userID || override) {
    var newData = data.key;
    fs.writeFile('./public/packs/'+data.key, data.data, 'utf8', function(success){

    }, function(err) {
      users.alert(userID, "Failed Saving " + data.key);
    });
  }
}

exports.commands["saveGame"] = function(gameID, data, userID, override) {
  gameControls.saveGame(gameID);
}


var fs = require('fs');

exports.commands["packageTemplate"] = function(gameID, data, userID, override) { // prepares for the workshop
  var game = gameControls.getGame(gameID);
  if (!game || !data) {return false;}
  if (game.owner == userID || override) {
    var dupe = JSON.parse(JSON.stringify(game.templates));
    dupe.identifier = data.key;

    fs.writeFileSync("./public/templates/"+data.key, JSON.stringify(dupe, 2, 2));
  }
}
