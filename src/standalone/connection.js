//ntp
(function (root) {
  var ntp  = {}
    , offsets = []
    , socket;

  ntp.init = function (sock, options) {
    options = options || {};

    socket = sock;
    socket.on('ntp:server_sync', onSync);
    setInterval(sync, options.interval || 1000);
  };

  var onSync = function (data) {
    var diff = Date.now() - data.t1 + ((Date.now() - data.t0)/2);

    offsets.unshift(diff);

    if (offsets.length > 10) {
      offsets.pop();
    }
  };

  ntp.offset = function () {
    var sum = 0;
    for (var i = 0; i < offsets.length; i++)
      sum += offsets[i];

    sum /= offsets.length;

    return sum;
  };
  var sync = function () {
    socket.emit('ntp:client_sync', { t0 : Date.now() });
  };
  // AMD/requirejs
  if (typeof define === 'function' && define.amd) {
    define('ntp', [], function () {
      return ntp;
    });
  } else {
    root.ntp = ntp;
  }
})(window);

function runCommand(cmdName, cmdData) { // not instant,
  if (connection.alive && connection.socket) {
    connection.socket.emit("command", {name : cmdName, data : cmdData});
  }
  else {
    if (cmdName == "chatEvent") {
      game.logs.data = game.logs.data || {};
      game.logs.data.events = game.logs.data.events || [];
      game.logs.data.events.push(cmdData);
      game.logs.update();
    }
    else if (cmdName == "diceCheck") {
      var length = Object.keys(game.events.data).length;
      game.events.data["ev"+length] = sync.obj();
      game.events.data["ev"+length].data = cmdData;
      game.events.update();
      var updateData = {
        text : cmdData.msg,
        evID : "ev"+length,
        ui : cmdData.ui,
        user : sync.eval("@me.pName", sync.defaultContext()),
        href : cmdData.icon,
      };
      game.logs.data = game.logs.data || {};
      game.logs.data.events = game.logs.data.events || [];
      game.logs.data.events.push(updateData);
      game.logs.update();
    }
    else if (cmdName == "media") {
      if (!$("#dragMedia").length) {
        media_init();
      }
      mediaPlayer.command(cmdData);
    }
    console.log(cmdName + " : " + cmdData + " <NO CONNECTION>");
  }
}

var _nextSound = 0;
var _shutDownTime;

var globalSnd = new Audio();

function connection_init() {
  var offlineBackup = localStorage.getItem(getCookie("offlineGame"));
  var socket = io();

  ntp.init(socket);

  function ntpCheck() {
    if (!isNaN(ntp.offset())) {
      _offset = ntp.offset();
    }
    setTimeout(function(){ntpCheck();}, 10000);
  }
  if (!connection.alive) {
    setTimeout(function(){ntpCheck();}, 1000);
  }

  socket.emit("auth", {userID : getCookie("UserID")});
  socket.on("p2p", function(cmdData) {comms.message(cmdData)});
  socket.on("disconnect", function(cmdData) {
    console.log("disconnected");
    $.ajax({
      url: '/',
      error: function(code) {
        console.log(code);
        if (game.config && game.config.data.offline) {
          var frame = layout.page({
            title : "You have entered offline mode",
            prompt : "Editing is limited, but you can still access all your data. Rejoin the server and you will be able to upload your changes.",
            blur : 0.8
          });
        }
        else {
          var frame = layout.page({
            title : "Oops, looks like your connection was broken!",
            prompt : "The server appears to be down, or your internet connection is. Either way please refresh the page to resume editing.",
            blur : 0.8
          });
        }
      },
      dataType: 'json',
      success: function(data) {
        sendAlert({text : "Reconnect initilaized"});
        console.log("Reconnect Attempt");
        connection_init(); // reconnect
      },
      type: 'GET'
    });
    // Reinitialize a connection
  });

  socket.on("shutdown", function(cmdData) {
    var restartDiv = $("<div>");
    restartDiv.addClass("flexcolumn focus outline flexmiddle spadding smooth fit-xy");

    var timer = $("<b>").appendTo(restartDiv);
    timer.attr("title", cmdData.msg);
    timer.css("font-size", "3.0em");

    restartDiv.append("<p>"+cmdData.msg+"</p>");

    _shutDownTime = cmdData.endTime;
    function check(timer, timeIndex) {
      if (timer) {
        if ((_shutDownTime - dateCorrected()) > 0) {
          timer.text(String(Math.floor((_shutDownTime-dateCorrected(-500))/1000)).formatTime());
          setTimeout(function() {check(timer);}, 50);
          return true;
        }
        else {
          if (_shutDownTime - dateCorrected() > -1500) {
            timer.text(("0").formatTime());
            setTimeout(function() {check(timer);}, 1000);
            return true;
          }
          else {
            timer.parent().remove();
            return true;
          }
        }
      }
    }
    check(timer);
    sendAlert({text : cmdData.msg || "Server will shut down soon, please wrap up your changes.", duration : 180000});
    notify(restartDiv, {title : "Server Shutdown"});
  });
  socket.on("command", function(cmdData) {
    // little more restricted on the client
    var header = cmdData.header;
    if (header) {
       // name of the command to execute
      var id = header.id;
      var data = duplicate(cmdData.data);
      if (header.type == "alert") {
        sendAlert(data);
      }
      else if (header.type == "updateCollection") {
        if (game.locals["stamps"]) {
          game.locals["stamps"].data.sets = data;
          game.locals["stamps"].update();
        }
      }
      else if (header.type == "view") { // overriding view
        for (var i in game.state._apps) {
          if ($("#"+game.state._apps[i]).length) {
            $("#"+game.state._apps[i]).attr("tab", data.index);
            $("#"+game.state._apps[i]).attr("resourcePath", data.path);
            $("#"+game.state._apps[i]).attr("forced", true);
          }
        }
        game.state.update();
        game.config.update();
        layout.coverlay($(".piece-quick-edit"));
      }
      else if (header.type == "updateBoardLayer") {
        if (header.userID != getCookie("UserID")) {
          boardApi.applyUpdate(header.userID, data);
        }
      }
      /*else if (header.type == "view") { // overriding view
        sync.replaceApps(data);
      }*/
      else if (header.type == "event") {
        // there is already an event
        if (!game.events.data[id]) {
          var newObj = sync.obj(id);
          // events have some sort of action associated with them
          game.events.data[id] = newObj;
        }
        if (header.ui && util.contains(data.players, getCookie("UserID")) && header.popout) {
          // make the menu
          var app = sync.newApp(header.ui);
          app.attr("event", "true");
          game.events.data[id].addApp(app);
          //if (header.fullscreen) {
            var frame = layout.page({title: data.title, prompt : data.prompt, blur: 0.5}).append(app);
          //}
        }
        game.events.data[id].update(data);
        game.events.update();
      }
      else if (header.type == "cursor") { // gameboard cursor
        if (game.entities.data[data.id] && data != null) {
          var board = getEnt(data.id);
          var boardData = board.data;
          boardData.cursors = boardData.cursors || {};
          if (data.data.b) { // beacon
            boardData.beacons = boardData.beacons || [];
            boardData.beacons.push({x : data.data.x, y : data.data.y, col : game.players.data[id].color, owner : id, size : 0});
          }
          else {
            boardData.cursors[id] = data.data;
          }

          if (id != getCookie("UserID") && !hasSecurity(id, "Assistant Master") && hasSecurity(getCookie("UserID"), "Assistant Master")) {
            $(".tab").each(function(){
              if ($(this).is(":visible")) {
                var tabData = game.state.data.tabs[$(this).attr("tabKey")];
                if (tabData && tabData.index == data.id) {
                  layout.coverlay("player-marker-"+id);
                  if (game.players.data[id]) {
                    var offset = 14;
                    for (var i=0; i<Object.keys(game.players.data).length; i++) {
                      if (Object.keys(game.players.data)[i] == id && id != getCookie("UserID")) {
                        offset += 10*i;
                        break;
                      }
                    }

                    var marker = $("<div>").appendTo($(this));
                    marker.addClass("outline");
                    marker.attr("id", "player-marker-"+id);
                    marker.attr("index", tabData.index);
                    marker.attr("uID", id);
                    marker.attr("title", game.players.data[id].displayName);
                    marker.css("position", "absolute");
                    marker.css("left", offset);
                    marker.css("bottom", "0");
                    marker.css("width", "8px");
                    marker.css("height", "8px");
                    marker.css("background-color", game.players.data[id].color || "white");
                    marker.css("border-top-left-radius", "8px");
                    marker.css("border-top-right-radius", "8px");
                  }
                }
              }
            });
          }
        }
      }
      else if (header.type == "move") { // gameboard piece
        if (game.entities.data[id] && data != null && header.userID != getCookie("UserID") && data.data) {
          var boardObj = getEnt(id);
          var boardData = boardObj.data;
          var pieceData = data.data;
          var oldData = boardData.layers[data.layer][data.type][data.index];
          var speed = 0.1*util.dist(oldData.x, pieceData.x, oldData.y, pieceData.y)/(Math.max(pieceData.w, pieceData.h));
          if (data.type == "w") {
            boardData.layers[data.layer][data.type][data.index] = pieceData;
            $(".application[ui-name='ui_board']").each(function(){
              if (boardApi.apps[$(this).attr("id")] && boardApi.apps[$(this).attr("id")].board == id) {
                var stage = boardApi.apps[$(this).attr("id")].stage;
                var layer = stage.children[1].children[data.layer];
                if (layer && layer.children && layer.children.length) {
                  var walls = layer.children[4];
                  if (walls.children && walls.children[data.index]) {
                    walls.children[data.index].update();
                  }
                }
                boardApi.rebuildFog(boardObj, $(this));
              }
            });
          }
          else {
            if (oldData.i != pieceData.i || oldData.eID != pieceData.eID) {
              boardData.layers[data.layer][data.type][data.index] = pieceData;
              boardApi.updateObject(data.layer, data.type, data.index, boardObj);
              if ($(".piece-quick-edit-app").length && $(".piece-quick-edit-app").attr("idstr") == id+"-"+data.layer+"-p-"+data.index) {
                sync.updateApp($(".piece-quick-edit-app"), boardObj);
              }
            }
            else {
              $(".application[ui-name='ui_board']").each(function(){
                var userID = $(this).attr("UserID") || getCookie("UserID");
                if (boardApi.apps[$(this).attr("id")] && boardApi.apps[$(this).attr("id")].board == id) {
                  var stage = boardApi.apps[$(this).attr("id")].stage;
                  var layer = stage.children[1].children[data.layer];
                  if (layer && layer.children && layer.children.length) {
                    if (data.type == "p") {
                      var pieces = layer.children[2];
                      if (pieces.children && pieces.children[data.index]) {
                        pieces.children[data.index].animate(pieceData, oldData, speed);
                        if (boardApi.fog[id] && boardApi.fog[id].length) { // if dynamic fog
                          // rebuild dynamic fog cache
                          if (pieceData.eID) {
                            var ent = getEnt(pieceData.eID);
                            if (ent && ent.data && ent.data._t == "c" && hasSecurity(userID, "Visible", ent.data)) {
                              // rebuild vision
                              var range = null;
                              if (pieceData.eID && pieceData.o && pieceData.o.Sight) {
                                var ent = getEnt(pieceData.eID);
                                var context = sync.defaultContext();
                                if (ent && ent.data) {
                                  context[ent.data._t] = duplicate(ent.data);
                                }
                                var auraData = pieceData.o.Sight;
                                range = boardApi.scale(sync.eval(auraData.d, context), boardObj, true);
                              }
                              boardApi.apps[$(this).attr("id")].views[data.layer+"-"+data.type+"-"+data.index] = boardApi.buildDynamicFog(boardObj, $(this), pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
                              boardApi.rebuildDynamicFog(boardObj, $(this));
                            }
                            else if (boardApi.apps[$(this).attr("id")].views && boardApi.apps[$(this).attr("id")].views[data.layer+"-p-"+index]) {
                              boardApi.apps[$(this).attr("id")].views[data.layer+"-p-"+index].destroy(true);
                              delete boardApi.apps[$(this).attr("id")].views[data.layer+"-p-"+index];
                              boardApi.rebuildDynamicFog(board, $(this));
                            }
                          }
                        }
                      }
                    }
                    else if (data.type == "d") {
                      var drawings = layer.children[3];
                      if (drawings.children && drawings.children[data.index]) {
                        drawings.children[data.index].animate(pieceData, oldData, speed);
                      }
                    }
                    else if (data.type == "t") {
                      var tiles = layer.children[1];
                      if (tiles.children && tiles.children[data.index]) {
                        tiles.children[data.index].animate(pieceData, oldData, speed);
                      }
                    }
                  }
                }
              });
              boardData.layers[data.layer][data.type][data.index] = pieceData;
            }
          }
        }
      }
      else if (header.type == "handout") {
        var ent = game.entities.data[id];
        if (ent && ent.data) {
          if (data.sender) {
            sendAlert({text : "Handout from " + getPlayerName(data.sender)});
          }
          var content = $("<div>");
          content.addClass("flexcolumn flex");
          if (ent.data._t == "b") {
            var newApp = sync.newApp("ui_board").appendTo(content);
            newApp.attr("viewOnly", "true");
            ent.addApp(newApp)
          }
          else {
            var newApp = sync.newApp(data.ui || "ui_renderPage").appendTo(content);
            newApp.attr("viewOnly", "true");
            ent.addApp(newApp);
          }

          content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
          var popout = ui_popOut({
            title : data.name,
            target : $("body"),
            minimize : true,
            maximize : true,
            dragThickness : "0.5em",
            resizable : true,
            style : {width : assetTypes[ent.data._t].width, height : assetTypes[ent.data._t].height},
          }, content);
          popout.css("padding", "0px");
          popout.addClass("floating-app");
          popout.resizable();
        }
      }
      else if (header.type == "entity") {
        if (!game.entities.data[id] && data != null) {
          var newObj = sync.obj(id);

          game.entities.data[id] = newObj;
        }
        if (data == null) {
          delete game.entities.data[id];
        }
        else {
          if (hook.call("AssetUpdate", id, data)) {
            if (header.merge) {
              game.entities.data[id].update(data, Object.keys(data));
            }
            else {
              game.entities.data[id].update(data);
            }
          }
        }
        game.entities.update(); // UPDATE, EVERYTHING
      }
      else if (header.type == "storage") {
        // players are a special case
        if (!game.locals["storage"]) {
          var newObj = sync.obj("storage");
          game.locals["storage"] = newObj;
        }
        // prepare them all
        var storageData;
        if (header.add) {
          game.locals["storage"].data.l.push(data);
          storageData = game.locals["storage"].data;
        }
        else {
          storageData = data.data;
        }
        var spliceList = [];
        for (var index in storageData.l) {
          var lData = storageData.l[index];
          if (!isNaN(lData._uid) || storageData.s[lData._uid]) {
            if (lData._uid && storageData.s[lData._uid]) {
              // Non-relational, its all in the cache
              if (!(storageData.s[lData._uid] instanceof Object)) {
                storageData.s[lData._uid] = {data : storageData.s[lData._uid]};
              }
              var cData = storageData.s[lData._uid].data;
              if (!(cData instanceof Object)) {
                try {
                  var preview = JSON.parse(cData);
                  preview._uid = lData._uid;
                  storageData.s[lData._uid] = sync.obj(getCookie("UserID")+"_"+lData._uid);
                  storageData.s[lData._uid].data = preview;
                }
                catch(err) {
                  storageData.s[lData._uid] = sync.obj(getCookie("UserID")+"_"+lData._uid);
                  storageData.s[lData._uid].data = duplicate(game.templates.page);
                }
              }
            }
            else {
              spliceList.push(index);
            }
          }
          else {
            function getAsset(lData) {
              $.ajax({
                url: '/retrieveAsset?id='+lData._uid,
                error: function(code) {
                  console.log(code);
                },
                dataType: 'json',
                success: function(data) {
                var storageData = game.locals["storage"].data;
                  if (!(storageData.s[lData._uid] instanceof Object)) {
                    storageData.s[lData._uid] = data;
                  }
                  var cData = storageData.s[lData._uid].data;
                  if (!(cData instanceof Object)) {
                    try {
                      var preview = JSON.parse(cData);
                      preview._uid = lData._uid;
                      storageData.s[lData._uid] = sync.obj(getCookie("UserID")+"_"+lData._uid);
                      storageData.s[lData._uid].data = preview;
                    }
                    catch(err) {
                      storageData.s[lData._uid] = sync.obj(getCookie("UserID")+"_"+lData._uid);
                      storageData.s[lData._uid].data = duplicate(game.templates.page);
                    }
                  }
                  game.locals["storage"].update(storageData);
                },
                type: 'GET'
              });
            }
            getAsset(lData);
          }
        }
        for (var i=spliceList.length-1; i>=0; i--) {
          data.data.l.splice(spliceList[i], 1);
        }
        game.locals["storage"].update(storageData);
      }
      else if (header.type == "players") {
        // players are a special case
        if (!game.players) {
          var newObj = sync.obj("players");
          game.players = newObj;
        }
        for (var key in game.players.data) {
          if ($(".cursor-"+key).length && !data[key]) {
            $(".cursor-"+key).remove();
          }
        }
        game.players.update(data);
      }
      else if (header.type == "config") {
        game.config.update(data);
        // prepare music
        if (game.config.data.tracks) {
          audioChannels.prepTracks(game.config.data.tracks);
        }
      }
      else if (header.type == "music") {
        // playData
        if (data.cmd) {
          audioChannels[data.cmd](data.index, data.ind, data.val);
        }
        else {
          if (data.src == globalSnd.src && !globalSnd.paused) {
            globalSnd.stop();
          }
          else {
            globalSnd.src = data.src;
            globalSnd.volume = data.volume || 0.2;
            globalSnd.play();
          }
        }
      }
      else if (header.type == "command") {
        if (util.commands && util.commands[data.cmd]) {
          util.commands[data.cmd](data, header.userID);
        }
      }
      else if (header.type == "effect") {
        util.playEffect(data);
      }
      else if (header.type == "template") {
        for (var key in data) {
          game.templates[key] = data[key];
        }
      }
      else if (header.type == "tags") {
        game.templates.tags = data;
      }
      else if (header.type == "state") {
        game.state.update(data);
        // if combat is enabled, provoke a roll initiative
        if (game.state.data.combat) {
          if (header.combat) {
            if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
              if ($("#main-menu").length && $("#main-menu").css("opacity") == 0 && $("#main-menu").attr("docked")) {
                $("#combat-button").click();
                util.dockReveal($("#main-menu"));
              }
            }
          }
          if (!hasSecurity(getCookie("UserID"), "Assistant Master") && getPlayerCharacter(getCookie("UserID"))) {
            var ent = getPlayerCharacter(getCookie("UserID"));
            if (ent && ent.data) {
              if (!Object.keys(game.state.data.combat.engaged[ent.id()]).length) {
                if (game.state.data.combat && $("#olay-join-combat").length == 0) {
                  var maxZ = Math.max(util.getMaxZ(".main-dock"), util.getMaxZ(".ui-popout"));
                  var olay = layout.overlay({target : $("body"), id : "olay-join-combat", style : {"background-color" : "rgba(0,0,0,0.7)"}});
                  olay.css("z-index", maxZ+1);
                  olay.fadeIn();
                  olay.addClass("flexcolumn flexmiddle");
                  olay.click(function(){
                    layout.coverlay(olay);
                    layout.coverlay("join-combat");
                  });

                  var titleWrap = $("<div>").appendTo(olay);
                  titleWrap.css("position", "absolute");
                  titleWrap.css("width", "100%");
                  titleWrap.css("top", "10%");
                  titleWrap.addClass("flexmiddle bounce");
                  titleWrap.hide();
                  titleWrap.fadeIn();

                  if (sync.rawVal(ent.data.info.img)) {
                    var hypePlate = $("<div>").appendTo(olay);
                    hypePlate.css("width", "30vw");
                    hypePlate.css("height", "60vh");
                    if (layout.mobile) {
                      hypePlate.css("width", "200px");
                      hypePlate.css("height", "300px");
                    }
                    hypePlate.css("background-image", "url('"+(sync.rawVal(ent.data.info.img))+"')");
                    hypePlate.css("background-size", "cover");
                    hypePlate.css("background-repeat", "no-repeat");
                    hypePlate.css("background-position", "center 0");
                    hypePlate.css("box-shadow", "0 0 8px 8px #111 inset");
                    hypePlate.css("border-radius", "2px");
                  }

                  var announcments = [
                    "IT'S FIGHTING TIME",
                    "Things are about to get ugly",
                    "What's that? Combat you say?",
                    "CHAARRRRGEEE!",
                    "Still More FIGHTING",
                    '"... And I\'m all out of gum"',
                    "Raise those fists!",
                  ]

                  var title = $("<highlight>").appendTo(titleWrap);
                  title.text(announcments[Math.floor(Math.random() * announcments.length)]);
                  title.addClass("combat");
                  if (layout.mobile) {
                    titleWrap.css("top", "");
                    titleWrap.css("bottom", "20%");
                    title.css("font-size", "1.6em");
                  }
                  _actions["Set/Roll Initiative"].click(null, olay, ent, olay, {pump : true});
                  $("#join-combat").css("z-index", maxZ+2);
                }
              }
              else {
                layout.coverlay("olay-join-combat");
                layout.coverlay("join-combat");
              }
            }
            else {
              layout.coverlay("olay-join-combat");
              layout.coverlay("join-combat");
            }
          }
        }
        else {
          layout.coverlay("olay-join-combat");
          layout.coverlay("join-combat");
        }
      }
      else if (header.type == "logs" && game.logs) {
        game.logs.update(data);
      }
      else if (header.type == "comms") {
        if (data.cmd == "localMute") {
          comms.localMute(data.from);
        }
        else if (data.cmd == "localUnMute") {
          comms.localUnMute(data.from);
        }
        else if (data.cmd == "reveal") {
          if (hasSecurity(data.from, "Assistant Master") && data.players && data.players.length) {
            for (var i=0; i<data.players.length; i++) {
              comms.reveal(data.players[i]);
            }
          }
          else {
            comms.reveal(data.from);
          }
        }
        else if (data.cmd == "hide") {
          if (hasSecurity(data.from, "Assistant Master") && data.players && data.players.length) {
            for (var i=0; i<data.players.length; i++) {
              comms.hide(data.players[i]);
            }
          }
          else {
            comms.hide(data.from);
          }
        }
        if (data.cmd == "disconnect") {
          $("#web-cam-"+data.from).fadeOut();
        }
        else if (hasSecurity(data.from, "Assistant Master")) {
          if (data.cmd == "mute") {
            for (var i=0; i<data.players.length; i++) {
              comms.mute(data.players[i]);
            }
          }
          else if (data.cmd == "unmute") {
            for (var i=0; i<data.players.length; i++) {
              comms.unmute(data.players[i]);
            }
          }
          else if (data.cmd == "deafen") {
            for (var i=0; i<data.players.length; i++) {
              comms.deafen(data.players[i]);
            }
          }
          else if (data.cmd == "undeafen") {
            for (var i=0; i<data.players.length; i++) {
              comms.undeafen(data.players[i]);
            }
          }
          else if (data.cmd == "channel") {
            for (var i=0; i<data.players.length; i++) {
              comms.channel(data.players[i], data.channels);
            }
          }
        }
      }
      else if (header.type == "media") {
        if (!$("#dragMedia").length) {
          media_init();
        }
        mediaPlayer.command(data);
      }
      else if (header.type == "reaction") {
        if (getCookie("disableReactions") == "true" || $("#chat-button").hasClass("outline")) {
          return false;
        }
        if (_nextSound < Date.now() && !_winHasFocus) {
          var snd = new Audio("/sounds/snap.wav");
          snd.volume = 0.1;
          snd.play();

          _nextSound = Date.now() + 10000;
        }

        var media = data;
        var youtube = false;
        if (util.matchYoutube(data)) {
          youtube = util.matchYoutube(data);
          data = "/content/youtube.ico";
        }
        var mediaContent = ui_processMedia(data, {id : "reaction-media-"+header.id});
        mediaContent.css("transition", "height 1s");
        mediaContent.css("pointer-events", "none");
        mediaContent.css("min-width", Math.max($(window).width(), $(window).height())*0.1+"px");
        mediaContent.css("min-height", Math.max($(window).width(), $(window).height())*0.1+"px");
        var targetFrame = $("#player-icon-"+header.id);
        var align = "top";
        if ($("#web-cam-"+header.id).length) {
          targetFrame = $("#web-cam-"+header.id);
          align = null;
        }
        var title = "";
        if (layout.mobile) {
          targetFrame = $($(".main-dock")[3]);
          title = game.players.data[id].displayName + "'s reaction";
        }
        var dontHide;
        if (mediaContent.is("img")) {
          mediaContent.css('width', Math.max($("#player-image-plate-"+id).outerWidth(), 150));
          if (layout.mobile) {
            mediaContent.css("width", Math.max(targetFrame.width()/2, 150));
          }
          mediaContent.on('load', function() {
            var reaction = ui_popOut({
              target : targetFrame,
              align : align,
              id : "reaction-frame-"+header.id,
              userID : header.id,
              noCss : true,
              hideclose : true,
              title : title,
              style : {"background-color" : "white", "cursor" : "pointer", "max-height" : "50vh", "max-width" : "35vw"}
            }, mediaContent);
            var max = util.getMaxZ(".ui-popout");
            reaction.css("z-index", max+1);
            reaction.contextmenu(function(){
              layout.coverlay("reaction-frame-"+header.id, 500);
              return false;
            });
            reaction.click(function() {
              if (youtube) {
                if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
                  runCommand("media", {cmd : "update", data : youtube});
                  $(this).remove();
                }
                return;
              }
              var content = $("#reaction-media-"+$(this).attr("UserID"));
              // save aspect ratio
              var overlay = layout.overlay({
                target : $("body"),
                  style : {
                    "background-color" : "rgba(0,0,0,0.8)",
                    "cursor" : "pointer",
                    "pointer-events" : "auto",
                  },
                }
              );
              var max = util.getMaxZ(".ui-popout");
              overlay.css("z-index", max+1);
              overlay.addClass("flexmiddle");
              var aspect = content.outerWidth()/content.outerHeight();

              var div = $("<div>").appendTo(overlay);
              div.css("background-color", "white");

              var newContent = $("<img>").appendTo(div);
              if (aspect > 1) {
                newContent.css('height', "auto");
                newContent.css('width', $(window).outerWidth() * 0.6);
              }
              else {
                newContent.css('height', $(window).outerHeight() * 0.6);
                newContent.css('width', "auto");
              }

              newContent.attr('src', content.attr("src"));
              newContent.css("pointer-events", "none");

              overlay.click(function() {
                dontHide = true;
                layout.coverlay($(this), 500);
              });
            });
            if (!media.match(".gif")) {
              setTimeout(function() {
                if (!$("#reaction-frame-"+header.id+":hover").length || layout.mobile && !dontHide) {
                  layout.coverlay(reaction, 500);
                }
              }, 4000);
            }
            else {
              setTimeout(function() {
                if (!$("#reaction-frame-"+header.id+":hover").length || layout.mobile && !dontHide) {
                  layout.coverlay(reaction, 500);
                }
              }, 12000);
            }
            if (getCookie("UserID") != header.id && hasSecurity(header.id, "Assistant Master")) {
              dontHide = true;
              reaction.click();
            }
          });
        }
        else {
          mediaContent.attr('width', Math.max($("#player-image-plate-"+id).outerWidth(), 150));
          if (layout.mobile) {
            mediaContent.css("width", Math.max(targetFrame.width()/2, 150));
          }
          mediaContent.bind("ended", function() {
            if ($("#reaction-frame-"+id+":hover").length && !layout.mobile) {
              mediaContent[0].play();
            }
            else {
              layout.coverlay("reaction-frame-"+id, 500);
            }
          });
          var reaction = ui_popOut({
            target : targetFrame,
            align : align,
            id : "reaction-frame-"+header.id,
            userID : header.id,
            title : title,
            noCss : true,
            hideclose : true,
            style : {"background-color" : "white", "cursor" : "pointer"}
          }, mediaContent);
          var max = util.getMaxZ(".ui-popout");
          reaction.css("z-index", max+1);
          reaction.contextmenu(function(){
            layout.coverlay("reaction-frame-"+header.id, 500);
            return false;
          });
          reaction.click(function() {
            var content = $("#reaction-media-"+$(this).attr("UserID"));
            // save aspect ratio
            var overlay = layout.overlay({
              target : $("body"),
              style : {
                "background-color" : "rgba(0,0,0,0.8)",
                "cursor" : "pointer",
                "pointer-events" : "auto",
              },
            });
            var max = util.getMaxZ(".ui-popout");
            overlay.css("z-index", max+1);
            overlay.addClass("flexmiddle");

            var aspect = content.outerWidth()/content.outerHeight();

            content[0].pause();

            var newContent = $("<video>").appendTo(overlay);
            if (aspect > 1) {
              newContent.attr('height', "auto");
              newContent.attr('width', $(window).outerWidth() * 0.6);
            }
            else {
              newContent.attr('height', $(window).outerHeight() * 0.6);
              newContent.attr('width', "auto");
            }
            newContent.attr("muted", true);
            newContent.attr("autoplay", true);
            newContent.attr("loop", true);
            newContent.attr('src', content.attr("src"));
            newContent.css("pointer-events", "none");
            newContent[0].currentTime = content[0].currentTime;
            newContent[0].play();

            overlay.click(function() {
              layout.coverlay($(this), 500);
              content[0].currentTime = newContent[0].currentTime;
              content[0].play();
            });
          });
          if (getCookie("UserID") != header.id && hasSecurity(header.id, "Assistant Master")) {
            reaction.click();
          }
        }
      }
    }
  });

  socket.on("goOffline", function(cmdData) {
    try {
      if (game.owner == getCookie("UserID")) {
        game.config.data.offline = cmdData.offline;
        setCookie("offlineGame", cmdData.gameID, 999999999999999);

        localStorage.setItem(getCookie("offlineGame"), JSON.stringify(game));
      }
      connection.alive = false;
      socket.disconnect();
      sendAlert({text : "You are now offline"});
      for (var i in _syncList) {
        _syncList[i].update();
      }
    }
    catch (err) {
      sendAlert({text : "Game is too large to be taken offline"});
      runCommand("goOnline", JSON.stringify(JSON.parse(offlineBackup || "{}").entities));
      setCookie("offlineGame", "");
    }
  });

  socket.on("breakConnection", function(cmdData) {
    // little more restricted on the client
    game.locals["gameBackup"] = duplicate(game);
    connection.alive = false;
    socket.disconnect();
  });
  socket.on("initialize", function(cmdData) {
    if (layout.mobile) {
      $("#viewPort").empty();
    }
    setupGame();
    game.templates = cmdData.templates;
    var newConstants = {};
    for (var i in game.templates.constants) {
      newConstants[String(i).toLowerCase()] = game.templates.constants[i];
    }

    game.config.data = cmdData.config;
    game.state.data = cmdData.state;
    game.owner = cmdData.owner;
    game.locals["gameList"] = cmdData.games;
    game.id = cmdData.gameID;
    _authToken = cmdData.authToken;
    game.user = cmdData.userData;

    game.state.data.setting = game.state.data.setting || {};

    // there is already an event
    for (var id in cmdData.events) {
      var data = cmdData.events[id];
      if (!game.events.data[id]) {
        var newObj = sync.obj(id);
        // events have some sort of action associated with them
        game.events.data[id] = newObj;
      }
      game.events.data[id].update(data);
      game.events.update();
    }

    for (var id in cmdData.entities) {
      var data = cmdData.entities[id];
      if (!game.entities.data[id] && data != null) {
        var newObj = sync.obj(id);

        game.entities.data[id] = newObj;
      }
      if (data == null) {
        delete game.entities.data[id];
      }
      else {
        game.entities.data[id].update(data);
      }
      game.entities.update(); // UPDATE, EVERYTHING
    }

    game.logs.data = cmdData.logs;
    socket.emit('p2p', getCookie("UserID"));

    if (!connection.alive) {
      layout.init();
      loadNotify();
    }

    if (!isNaN(game.templates.version) && game.locals["gameList"][game.templates.identifier]) {
      if (game.locals["gameList"][game.templates.identifier].version && game.templates.version < game.locals["gameList"][game.templates.identifier].version && hasSecurity(getCookie("UserID"), "Game Master")) {
        var olay = layout.overlay({target : $("body"), style : {"background-color" : "rgba(0,0,0,0.5)"}});
        olay.addClass("flexcolumn flexmiddle");
        olay.append("<h1 class='alttext'>Your game is outdated, please update to the latest version</h1>");
        connection.alive = true;

        var button = $("<button>").appendTo(olay);
        button.addClass("focus");
        button.append("UPDATE GAME TEMPLATES");
        button.click(function(){
          olay.empty();
          setTimeout(function(){
            var button = $("<button>").appendTo(olay);
            button.append("Refresh");
            button.click(function(){
              window.location.reload();
            });
          }, 1000);

          if (game.locals["gameList"][game.templates.identifier]) {
            runCommand("updateTemplate", game.templates.identifier);
          }
          else {
            sendAlert({text : "This is a custom game, can't restore templates(still being built)"});
          }
        });
        var button = $("<button>").appendTo(olay);
        button.append("Proceed anyway");
        button.click(function(){
          olay.remove();
        });
      }
    }

    connection.alive = true;

    // players Select a character
    if (!hasSecurity(getCookie("UserID"), "Assistant Master") && (!(game.config.data.players && game.config.data.players[getCookie("UserID")]) || game.config.data.players[getCookie("UserID")].entity == null && !getEnt(game.config.data.players[getCookie("UserID")].entity))) {
      var frame = layout.page({title: "Choose your Character", prompt : "Select or create a character you will be playing with", blur: 0.5, id: "character-select", width : "auto"});
      var colWrap = $("<div>").appendTo(frame);
      colWrap.addClass("flexrow");

      var primaryCol = sync.render("ui_colorPicker")(sync.dummyObj(), frame, {
        hideColor : true,
        vertical : true,
        colors : [
          "rgba(34,34,34,1)",
          "rgba(187,0,0,1)",
          "rgba(255,153,0,1)",
          "rgba(255,240,0,1)",
          "rgba(0,187,0,1)",
          "rgba(0,115,230,1)",
          "rgba(176,0,187,1)",
          "rgba(255,115,255,1)",
          "rgba(255,255,255,1)",
        ],
        colorChange : function(ev, ui, col){
          runCommand("selectPlayerColor", {col : col, userID : getCookie("UserID")});
          sendAlert({text : "Color Selected"});
          primaryCol.css("background", col);
        }
      }).appendTo(colWrap);

      var entList = $("<div>").appendTo(colWrap);
      entList.addClass("flexrow lightoutline smooth flexwrap flexaround");

      var content = sync.render("ui_assetPicker")(game.entities, entList, {
        rights : "Rights",
        filter : "c",
        sessionOnly : true,
        select : function(ev, ui, ent, options, entities){
          var charSheet = assetTypes[ent.data._t].preview(ent, $("body"));
          runCommand("selectPlayerEntity", {id : ent.id()});
          sendAlert({text : "Impersonating Character"});

          $(".chatType").text("IC");
          $(".chatType").addClass("highlight alttext");
          $(".chatType").attr("title", "In Character");

          $(".application[ui-name='_imperson']").attr("src", sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png");
          $(".application[ui-name='_imperson']").attr("ICText", sync.rawVal(ent.data.info.name));
          $(".application[ui-name='_imperson']").each(function(){
            sync.updateApp($(this), game.players);
          });

          layout.coverlay("character-select", 500);
        }
      }).appendTo(entList);
      content.css("width", assetTypes["assetPicker"].width);
      content.css("height", assetTypes["assetPicker"].width);
      content.addClass("white");
    }
    else if (game.config.data.players && game.config.data.players[getCookie("UserID")] && game.config.data.players[getCookie("UserID")].entity != null && getEnt(game.config.data.players[getCookie("UserID")].entity)) {
      runCommand("selectPlayerColor", {col : game.config.data.players[getCookie("UserID")].color, userID : getCookie("UserID")});

      var ent = getEnt(game.config.data.players[getCookie("UserID")].entity);

      var charSheet = assetTypes[ent.data._t].preview(ent, $("body"));
      runCommand("selectPlayerEntity", {id : ent.id()});
      sendAlert({text : "Impersonating Character"});

      $(".chatType").text("IC");
      $(".chatType").addClass("highlight alttext");
      $(".chatType").attr("title", "In Character");

      $(".application[ui-name='_imperson']").attr("src", sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png");
      $(".application[ui-name='_imperson']").attr("ICText", sync.rawVal(ent.data.info.name));
      $(".application[ui-name='_imperson']").each(function(){
        sync.updateApp($(this), game.players);
      });
    }
    hook.call("Initialize", cmdData);
    // this becomes the live connection
  });
  connection.socket = socket;
}
