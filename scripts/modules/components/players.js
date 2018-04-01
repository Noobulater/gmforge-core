sync.render("ui_players", function(obj, app, scope) {
  if (!obj) {
    if (!game.players) {
      var div = $("<div>");
      div.append("connecting");

      return div;
    }

    game.players.addApp(app);
    return $("<div>");
  }
  scope = scope || {height : app.attr("height")};

  var data = obj.data;
  var div = $("<div>");
  div.addClass("flexrow flexmiddle fit-y");

  var playerList = $("<div>").appendTo(div);
  playerList.addClass("flexrow flex flexmiddle fit-y");
  playerList.sortable({
    handle : ".playerPlate",
    connectWith : ".dropContent",
    start : function(ev, ui) {
      $(ui.item).css("height", scope.height || "50px");
    }
  });

  for (var id in data) {
    if (id != getCookie("UserID")) {
      sync.render("ui_playerToken")(obj, app, {userID : id, centered : true, height : scope.height}).appendTo(playerList);
    }
  }

  if (getCookie("UserID") == "Sandboxer") {
    playerList.remove();

    var referPlate = $("<div>").appendTo(div);
    referPlate.addClass("flexmiddle alttext");
    if (Object.keys(data).length == 1) {
      referPlate.addClass("flex");
    }

    var label = genIcon("log-in", "Sign In to play with friends").appendTo(referPlate);
    label.addClass("lrpadding");
    label.css("pointer-events", "auto");
    label.click(function(){
      var auth = authDialog();
      var pop = ui_popOut({
        target : $(this),
        id : "auth",
        align : "top"
      }, auth);
      pop.addClass("background flexmiddle");
      pop.removeClass("white");
      pop.find(".white").removeClass("white");
      pop.css("border", "1px solid rgba(0,0,0,0.2)");
    });
  }
  else if (Object.keys(game.players.data).length <= 1) {
    playerList.removeClass("flex flexmiddle");

    var label = genIcon("log-in", "Click to invite your party");
    label.appendTo(div);
    label.addClass("lrpadding alttext flexmiddle flex");
    label.css("color", "white");
    label.css("pointer-events", "auto");
    label.attr("title", "Copies an invite to clipboard");
    label.click(function(){
      var input = genInput({
        parent : $(this),
        id : "copy-url",
        value : window.location.href.split("?password")[0],
      });

      if (game.config.data.password) {
        input.val(encodeURI(input.val()+"?password="+game.config.data.password));
      }
      if (getCookie("ExternalIP")) {
        input.val(getCookie("ExternalIP")+":"+getCookie("PublicPort")+"/join");
      }
      input.focus();
      input.get(0).setSelectionRange(0, input.val().length);

      document.execCommand("copy");
      input.remove();
      sendAlert({text : "Invitation Copied!"});
    });
  }
  else {
    playerList.addClass("");
  }

  return div;
});


sync.render("ui_playerToken", function(obj, app, scope) {
  scope = scope || {userID : app.attr("UserID")};

  var id = scope.userID;
  var player = game.players.data[scope.userID];
  if (!player) {
    return $("<div>");
  }
  var playerPlate = $("<div>");
  playerPlate.addClass("playerPlate round flexcolumn");
  playerPlate.attr("id", "player-icon-"+id);
  playerPlate.attr("UserID", id);
  playerPlate.attr("src", "players");
  playerPlate.attr("name", player.displayName);
  playerPlate.attr("index", player.entity);
  playerPlate.css("position", "relative");
  playerPlate.css("pointer-events", "auto");
  playerPlate.css("height", "100%");
  playerPlate.css("min-width", scope.height || "50px");
  playerPlate.css("margin-right", "0.25em");
  playerPlate.css("margin-left", "0.25em");

  playerPlate.click(function() {
    var playerID = $(this).attr("UserID");
    var playerPlate = $(this);
    if (getCookie("UserID") == playerID && hasSecurity(playerID, "Assistant Master")) {
      var uID = playerID;
      var content = sync.render("ui_assetPicker")(obj, app, {
        rights : "Rights",
        filter : "c",
        hideCreate : true,
        sessionOnly : true,
        select : function(ev, ui, ent, options, entities){
          runCommand("selectPlayerEntity", {id : ent.id(), userID : uID});
          sendAlert({text : "Impersonating Character : " + sync.rawVal(ent.data.info.name)});
          if (uID == getCookie("UserID")) {
            $(".chatType").text("IC");
            $(".chatType").addClass("highlight alttext");
            $(".chatType").attr("title", "In Character");
            $(".application[ui-name='_imperson']").attr("src", sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png");
            $(".application[ui-name='_imperson']").attr("ICText", sync.rawVal(ent.data.info.name));
            $(".application[ui-name='_imperson']").each(function(){
              sync.updateApp($(this), game.players);
            });
          }
          layout.coverlay("add-asset");
        }
      });
      var pop = ui_popOut({
        target : $(this),
        align : "top",
        prompt : true,
        id : "add-asset",
        title : "Impersonate...",
        style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
      }, content);
      pop.resizable();
    }
    else {
      if ($(this).attr("index") && game.entities.data[$(this).attr("index")] && game.entities.data[$(this).attr("index")].data["_t"] == "c") {
        if (hasSecurity(getCookie("UserID"), "Visible", game.entities.data[$(this).attr("index")].data)) {
          assetTypes["c"].preview(game.entities.data[$(this).attr("index")], $(this));
        }
        //popOut.resizable();
      }
      else if (hasSecurity(getCookie("UserID"), "Assistant Master") || uID == getCookie("UserID")) {
        var uID = playerID;
        var content = sync.render("ui_assetPicker")(obj, app, {
          rights : "Rights",
          filter : "c",
          hideCreate : true,
          sessionOnly : true,
          select : function(ev, ui, ent, options, entities){
            runCommand("selectPlayerEntity", {id : ent.id(), userID : uID});
            sendAlert({text : "Impersonating Character : " + sync.rawVal(ent.data.info.name)});
            if (uID == getCookie("UserID")) {
              $(".chatType").text("IC");
              $(".chatType").addClass("highlight alttext");
              $(".chatType").attr("title", "In Character");
              $(".application[ui-name='_imperson']").attr("src", sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png");
              $(".application[ui-name='_imperson']").attr("ICText", sync.rawVal(ent.data.info.name));
              $(".application[ui-name='_imperson']").each(function(){
                sync.updateApp($(this), game.players);
              });
            }
            layout.coverlay("add-asset");
          }
        });
        var pop = ui_popOut({
          target : $(this),
          align : "top",
          prompt : true,
          id : "add-asset",
          title : "Impersonate...",
          style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
        }, content);
        pop.resizable();
      }
      else {
        sendAlert({text : "User Has no Character"});
      }
    }
  });
  playerPlate.contextmenu(function(ev){
    var playerID = $(this).attr("UserID");
    var playerPlate = $(this);
    var optionList = [];
    if (hasSecurity(getCookie("UserID"), "Assistant Master") && playerPlate.attr("UserID") != getCookie("UserID")) {
      var admin = [
        {name : "Kick", click : function(ev, ui){
          sendAlert({text : "Kicked"});
          runCommand("kickPlayer", playerPlate.attr("UserID"));
        }},
      ];
      if (hasSecurity(getCookie("UserID"), "Game Master")) {
        if (game.config.data && (game.config.data.players && game.config.data.players[playerPlate.attr("UserID")])) {
          admin.push({name : "Set Rank", click : function(ev, ui){
            var newApp = sync.newApp("ui_gameCtrl", game.config);
            ui_popOut({
              target : $("body"),
            }, newApp);
          }});
        }
        else {
          admin.push({name : "Make Permanent Member", click : function(ev, ui){
            var content = $("<div>");
            content.addClass("flexcolumn flexmiddle");
            content.append("<i style='font-size : 0.8em'>A permanent player will always appear in the 'Rights' menu's of assets.<br>If a permanent player has the rank of Assistant Master, then they will have the option to resume this session anytime they want</i>");

            var button = $("<button>").appendTo(content);
            button.append("Confirm");
            button.click(function(){
              game.config.data.players = game.config.data.players || {};
              game.config.data.players[playerPlate.attr("UserID")] = duplicate(game.players.data[playerPlate.attr("UserID")]);
              game.config.sync("updateConfig");
              layout.coverlay("player-perm");
            });

            ui_popOut({
              target : playerPlate,
              id : "player-perm",
              style : {"width" : "20vw"}
            }, content);
          }});
        }
      }
      optionList.push({name : "Admin", submenu : admin})
    }

    if (getPlayerCharacter(playerPlate.attr("UserID")) != {} && hasSecurity(getCookie("UserID"), "Visible", getPlayerCharacter(playerPlate.attr("UserID")).data)) {
      var character = [
        {name : "Actions", click : function(){
          var actionObj = sync.dummyObj();
          actionObj.data = {context : {c : getPlayerCharacter(playerPlate.attr("UserID")).id()}};

          game.locals["actions"] = game.locals["actions"] || [];
          game.locals["actions"].push(actionObj);

          var newApp = sync.newApp("ui_actions");
          actionObj.addApp(newApp);

          var pop = ui_popOut({
            target : playerPlate,
            minimize : true,
            dragThickness : "0.5em",
            title : "Actions",
            align : "top"
          }, newApp);
          pop.resizable();
        }},
        {name : "Sheet", click : function(){
          var content = sync.newApp("ui_characterSheet");
          getPlayerCharacter(playerPlate.attr("UserID")).addApp(content);
          var popOut = ui_popOut({
            target: playerPlate,
            id: "char-summary-"+$(this).attr("index"),
            align: "right",
            dragThickness : "0.5em",
            style : {width : assetTypes["c"].width, height : assetTypes["c"].height}
          }, content);
          popOut.resizable();
        }},
        {name : "Summary", click : function(){
          var content = sync.newApp("ui_characterSummary");
          getPlayerCharacter(playerPlate.attr("UserID")).addApp(content);
          var popOut = ui_popOut({
            target: playerPlate,
            id: "char-summary-"+$(this).attr("index"),
            align: "right",
            dragThickness : "0.5em",
          }, content);
          popOut.resizable();
        }},
      ]
      optionList.push({name : "Character", submenu : character});
    }
    if (playerPlate.attr("UserID") == getCookie("UserID") || hasSecurity(getCookie("UserID"), "Assistant Master")) {
      optionList.push({
        name : "Impersonate...",
        icon : "user",
        click : function(ev, ui) {
          var uID = playerPlate.attr("UserID");
          var content = sync.render("ui_assetPicker")(obj, app, {
            rights : "Rights",
            filter : "c",
            hideCreate : true,
            sessionOnly : true,
            select : function(ev, ui, ent, options, entities){
              runCommand("selectPlayerEntity", {id : ent.id(), userID : uID});
              sendAlert({text : "Impersonating Character : " + sync.rawVal(ent.data.info.name)});
              if (uID == getCookie("UserID")) {
                $(".chatType").text("IC");
                $(".chatType").addClass("highlight alttext");
                $(".chatType").attr("title", "In Character");
                $(".application[ui-name='_imperson']").attr("src", sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png");
                $(".application[ui-name='_imperson']").attr("ICText", sync.rawVal(ent.data.info.name));
                $(".application[ui-name='_imperson']").each(function(){
                  sync.updateApp($(this), game.players);
                });
              }
              layout.coverlay("add-asset");
            }
          });
          var pop = ui_popOut({
            target : $("body"),
            prompt : true,
            id : "add-asset",
            title : "Impersonate...",
            style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
          }, content);
          pop.resizable();
        }
      });
    }
    var col = {
      name : "Color",
      submenu : [],
    };
    var submenu = [
      "rgba(34,34,34,1)",
      "rgba(187,0,0,1)",
      "rgba(255,153,0,1)",
      "rgba(255,240,0,1)",
      "rgba(0,187,0,1)",
      "rgba(0,115,230,1)",
      "rgba(176,0,187,1)",
      "rgba(255,115,255,1)",
      "rgba(255,255,255,1)",
    ];
    for (var i in submenu) {
      col.submenu.push({
        icon : "tint",
        style : {"background-color" : submenu[i], "color" : "transparent"},
        click : function(ev, ui){
          if (playerID == getCookie("UserID") || hasSecurity(getCookie("UserID"), "Assistant Master")) {
            runCommand("selectPlayerColor", {col : ui.css("background-color"), userID : playerID});
            layout.coverlay("player-color");
          }
        },
      });
    }
    col.submenu.push({
      icon : "cog",
      click : function(){
        if (playerID == getCookie("UserID") || hasSecurity(getCookie("UserID"), "Assistant Master")) {
          var primaryCol = sync.render("ui_colorPicker")(obj, app, {
            hideColor : true,
            custom : true,
            colorChange : function(ev, ui, col){
              runCommand("selectPlayerColor", {col : col, userID : playerID});
              layout.coverlay("player-color");
            }
          });

          ui_popOut({
            target : playerPlate,
            id : "player-color",
          }, primaryCol);
        }
      },
    });
    optionList.push(col);

    if (game.state.data.cards) {
      function draw(deck, number, player) {
        var deckData = game.state.data.cards.decks[deck];
        game.state.data.cards.players = game.state.data.cards.players || {};
        game.state.data.cards.players[player] = game.state.data.cards.players[player] || [];

        var cards = deckData.pool.splice(0, number);
        for (var i in cards) {
          game.state.data.cards.players[player].push(cards[i]);
        }

        game.state.sync("updateState");
      }
      var cards = [];
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        cards.push({
          name : "Discard",
          submenu : [
            {
              name : "All Cards",
              click : function(ev, ui){
                game.state.data.decks.players[playerID];
                game.state.sync("updateState");
              }
            },
            {
              name : "First Card",
              click : function(ev, ui){
                game.state.data.decks.players[playerID].splice(0, 1);
                game.state.sync("updateState");
              }
            },
            {
              name : "Last Card",
              click : function(ev, ui){
                game.state.data.decks.players[playerID].splice(game.state.data.decks.players[playerID].length-1, 1);
                game.state.sync("updateState");
              }
            }
          ]
        });
      }
      if (game.state.data.cards.players[playerID] && game.state.data.cards.players[playerID].length) {
        cards.push({
          name : "Show Hand",
          click : function(){
            var content = $("<div>");
            content.addClass("flexcolumn");

            var namePlate = $("<b>"+(getPlayerCharacterName(playerID) || getPlayerName(playerID))+"</b>").appendTo(content);
            namePlate.addClass("alttext lrpadding subtitle smooth outline");
            namePlate.css("pointer-events", "none");
            namePlate.css("background-color", "rgba(0,0,0,0.6)");
            namePlate.css("padding-right", "2em");

            var newApp = sync.newApp("ui_hand").appendTo(content);
            newApp.addClass("flexmiddle");
            newApp.attr("UserID", playerID);

            game.state.addApp(newApp);

            var pop = ui_popOut({
              target : $("#player-icon-"+playerID),
              id : "hand-"+playerID,
              align : "top",
              noCss : true,
              style : {"min-width" : "70px"},
            }, content);
            pop.attr("UserID", playerID);

            if (game.players.data[playerID].color) {
              pop.css("background-color", game.players.data[playerID].color);
            }
            else {
              pop.addClass("background");
            }
          }
        });
      }
    }
    if (game.state.data && game.state.data.cards && game.state.data.cards.players[playerID] && game.state.data.cards.players[playerID].length) {
      if (cards.length) {
        optionList.push({name : "Playing Cards", submenu : cards});
      }
    }

    optionList.push({
      name : "Send Handout",
      click : function(ev, ui){
        var content = sync.render("ui_assetPicker")(obj, app, {
          rights : "Visible",
          category : "p",
          hideCreate : true,
          sessionOnly : true,
          select : function(ev, ui, ent, options, entities){
            var p = {};
            p[playerPlate.attr("UserID")] = true;
            runCommand("handout", {id : ent.id(), name : "Handout", ui : assetTypes[ent.data._t].handout, players : p});
            layout.coverlay("add-asset");
            sendAlert({text : "Sent"});
          }
        });
        var pop = ui_popOut({
          target : $("body"),
          prompt : true,
          id : "add-asset",
          title : "Hand out...",
          style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
        }, content);
        pop.resizable();
      }
    });
    optionList.push({
      name : "Whisper",
      click : function(ev, ui){
        var prompt = ui_prompt({
          target : playerPlate,
          inputs : {
            "Message" : ""
          },
          click : function(ev, inputs){
            var p = {};
            p[getCookie("UserID")] = true;
            p[playerPlate.attr("UserID")] = true;
            runCommand("chatEvent", {text : "/w "+ inputs["Message"].val(), f : getPlayerCharacterName(getCookie("UserID")), p : p});
            sendAlert({text : "Sent"});
            layout.coverlay(prompt);
          }
        });
      }
    });

    if (playerPlate.attr("UserID") == getCookie("UserID")) {
      optionList.push({name : "Share Reaction", allowExternal : true, click : function(ev, ui){
        var picker = sync.render("ui_filePicker")(obj, app, {
          change : function(ev, ui, val){
            runCommand("reaction", val);
            layout.coverlay("reaction-share");
          }
        });
        var prompt = ui_popOut({
          target : ui,
          prompt : true,
          id : "reaction-share",
          style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
        }, picker);
      }});
      if ($("#web-cam-"+playerID).length && !$("#web-cam-"+playerID).is(":visible")) {
        optionList.push({
          name : "Show Voice/Video Controls",
          click : function(){
            $("#web-cam-"+playerID).show();
          }
        });
        optionList.push({
          name : "Leave Voice/Video Chat",
          click : function(){
            comms.shutdown();
          }
        });
      }
      else {
        /*optionList.push({
          name : "Join Voice/Video Chat",
          click : function(){
            initializeCamera();
          }
        });*/
      }
    }
    else {
      if ($("#web-cam-"+playerID).length) {
        optionList.push({
          name : "Show Voice/Video Controls",
          click : function(){
            $("#web-cam-"+playerID).show();
          }
        });
      }
    }

    var dropMenu = ui_dropMenu($(this), optionList, {id: "dice-app-selection-menu"});
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  });


  var imagePlate = $("<div>").appendTo(playerPlate);
  imagePlate.addClass("fit-xy smooth");
  imagePlate.attr("id", "player-image-plate-"+id);
  imagePlate.attr("UserID", id);
  imagePlate.attr("name", player.displayName);
  imagePlate.attr("index", player.entity);
  imagePlate.css("cursor", "pointer");
  imagePlate.css("position", "absolute");

  var iconDiv = $("<div>").appendTo(imagePlate);
  if (scope.centered) {
    iconDiv.addClass("flexmiddle");
  }
  iconDiv.css("height", "100%");

  var icon = $("<div>").appendTo(iconDiv);
  icon.addClass("flexcolumn flexmiddle white round outline");
  icon.attr("UserID", id);
  icon.css("background-image", "url('"+player.img+"')");
  icon.css("background-size", "cover");
  icon.css("background-repeat", "no-repeat");
  icon.css("background-position", "center 30%");
  icon.css("width", scope.height || 48);
  icon.css("height", scope.height || 48);
  icon.css("border-width", "3px");

  var name;

  if (!hasSecurity(id, "Assistant Master")) {
    icon.css("border-color", player.color);

    playerPlate.append("<div class='flex'></div>");
    name = $("<div>").appendTo(playerPlate);
    name.addClass("smooth alttext flexmiddle lrpadding bold");
    if (scope.centered) {
      name.addClass("subtitle");
      name.css("max-width", "120px");
    }
    name.attr("displayName", player.displayName);
    name.attr("UserID", id);
    name.css("background-color", "rgba(0,0,0,0.6)");
    name.css("z-index", "1");
    //if (hasSecurity(id, "Assistant Master")) {
    name.text(getPlayerCharacterName(id) || player.displayName);
    //}
  }
  else {
    icon.css("border-color", "rgba(190,4,15,1.0)");
    icon.append("<div class='flexcolumn smooth alttext fit-x flexmiddle' style='font-family: LifeCraft; background-color:rgba(0,0,0,0.6); position:absolute;'><b class='flex middle' style='margin-top : 2px;'>GM</b></div>");

    playerPlate.append("<div class='flex'></div>");
    name = $("<div>").appendTo(playerPlate);
    name.addClass("smooth alttext flexmiddle lrpadding bold");
    if (scope.centered) {
      name.addClass("subtitle");
      name.css("max-width", "120px");
    }
    name.attr("displayName", player.displayName);
    name.attr("UserID", id);
    name.css("background-color", "rgba(0,0,0,0.6)");
    name.css("z-index", "1");
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      name.text(getPlayerCharacterName(id) || player.displayName);
    }
    else {
      name.text(player.displayName);
    }
  }

  var imageDiv = $("<div>").appendTo(imagePlate);
  imageDiv.addClass("flexcolumn flexmiddle flex");

  if (player.entity) {
    name.addClass("hover2");
  }
  name.click(function(ev){
    var ent = getPlayerCharacter($(this).attr("UserID"));
    if (ent && ent.data) {
      $(this).attr("index", ent.id());
      if ($(this).hasClass("card-selected")) {
        $(this).removeClass("card-selected");
      }
      else {
        $(this).addClass("card-selected");
      }
    }
    else {
      $(this).removeClass("card-selected");
      sendAlert({text : "No character to target"});
    }
    ev.stopPropagation();
    ev.preventDefault();
  });

  if (id == getCookie("UserID")) {
    name.attr("displayName", "Me");
    name.text("Me");
  }
  name.attr("title", name.attr("displayName"));

  if (!hasSecurity(id, "Game Master") || id == getCookie("UserID")) { // reveal Players
    if (player.entity && game.entities.data[player.entity]) {
      var ent = game.entities.data[player.entity];
      if (sync.rawVal(ent.data.info.img)) {
        icon.css("background-image", "url('"+sync.rawVal(ent.data.info.img)+"')");
      }
    }
  }

  return playerPlate;
});
