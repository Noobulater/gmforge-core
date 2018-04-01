// This is the segment of code for controls, key shortcuts etc
var _nextKey = 0;
var hotkeys = {};

function _keyTrans(keys) {
  var keyCodes = {};
  keyCodes[16] = "Shift";
  keyCodes[17] = "Ctrl";
  keyCodes[18] = "Alt";
  keyCodes[37] = "arrow-left";
  keyCodes[38] = "arrow-up";
  keyCodes[39] = "arrow-right";
  keyCodes[40] = "arrow-down";

  keyCodes[70] = "f";

  var str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i=0; i<str.length; i++) {
    keyCodes[str.charCodeAt(i)] = str.charAt(i);
  }
  keyCodes[90] = "Z";

  var split = keys.split(",");
  var str = "";
  for (var key in split) {
    str = str + keyCodes[parseInt(split[key])] + "+";
  }
  return str.substring(0, str.length-1);
}

const _undo = "17,90";
hotkeys[_undo] = {
  name : "Undo",
  combo : _keyTrans(_undo),
  exe : function() {
    if (!($(':focus').is("input") || $(':focus').is("textarea"))) {
      util.undo();
    }
  },
  override : false,
}


const _copy = "17,67";
hotkeys[_copy] = {
  name : "Copy Map Selection",
  combo : _keyTrans(_copy),
  exe : function() {
    if (Object.keys(boardApi.pix.selections) && Object.keys(boardApi.pix.selections).length) {
      if (!($(':focus').is("input") || $(':focus').is("textarea"))) {
        var numSelected = Object.keys(boardApi.pix.selections).length;
        for (var i in boardApi.pix.selections) {
          var selectData = boardApi.pix.selections[i];
          var board = getEnt(selectData.board);
          if (board && hasSecurity(getCookie("UserID"), "Rights", board.data)) {
            var objectData = board.data.layers[selectData.layer][selectData.type][selectData.index];
            if (selectData.type == "t") {
              boardApi.pix.addObject(duplicate(objectData), selectData.layer, selectData.type, board);
            }
            else if (selectData.type == "p") {
              // duplicate the entity
              var ent = getEnt(objectData.eID);
              console.log(ent, objectData);
              if (ent && ent.data && ent.data._t == "c" && numSelected == 1) {
                function dupeReturn(ent, pieceData, boardIndex, layer) {
                  var lastKeys = Object.keys(game.entities.data);
                  var newChar = duplicate(ent.data);
                  var name = sync.rawVal(newChar.info.name) || "";
                  name = name.split("#")[0].trim();
                  var match = name.match("#(\\d+)");
                  var max = 0;
                  for (var key in game.entities.data) {
                    if (game.entities.data[key].data._t == "c" && sync.rawVal(game.entities.data[key].data.info.name).match("#(\\d+)")) {
                      if (max < sync.rawVal(game.entities.data[key].data.info.name).match("#(\\d+)")[1]) {
                        max = parseInt(sync.rawVal(game.entities.data[key].data.info.name).match("#(\\d+)")[1]);
                      }
                    }
                  }

                  sync.rawVal(newChar.info.name, name + " #" + (max + 1));

                  runCommand("createCharacter", newChar);
                  game.entities.listen["pieceCopy"] = function(rObj, newObj, target) {
                    var board = getEnt(boardIndex);
                    var change = true;
                    for (var key in game.entities.data) {
                      if (!util.contains(lastKeys, key)) {
                        pieceData.eID = key;
                        boardApi.pix.addObject(pieceData, selectData.layer, selectData.type, board);
                        change = false;
                        break;
                      }
                    }
                    return change;
                  }
                }
                dupeReturn(ent, duplicate(objectData), selectData.board, selectData.layer);
                break;
              }
              else {
                boardApi.pix.addObject(duplicate(objectData), selectData.layer, selectData.type, board);
              }
            }
            else if (selectData.type == "d") {
              boardApi.pix.addObject(duplicate(objectData), selectData.layer, selectData.type, board);
            }
          }
        }
        sendAlert({text : "Duplicated"});
      }
    }
  },
  override : false,
}

const _quickSearch = "16,17,70";
hotkeys[_quickSearch] = {
  name : "Quick Search",
  combo : _keyTrans(_quickSearch),
  exe : function() {
    if (!$("#quick-search").length) {
      var newApp = sync.newApp("ui_quickSearch");
      newApp.addClass("flex");

      game.locals["quicksearch"] = game.locals["quicksearch"] || sync.obj();
      game.locals["quicksearch"].data = game.locals["quicksearch"].data || {filters : {"storage" : true}};

      game.locals["quicksearch"].addApp(newApp);

      ui_popOut({
        target : $("body"),
        id : "quick-search",
        style : {width : "60vw", height : "40vh"}
      }, newApp);
    }
    else {
      layout.coverlay("quick-search");
    }
  },
}

const _quickCalc = "17,90,67";
hotkeys[_quickCalc] = {
  name : "Quick Calc",
  combo : _keyTrans(_quickCalc),
  exe : function() {
    if (!$("#quick-calc").length) {
      var newApp = sync.newApp("ui_quickCalc");
      newApp.addClass("flex");

      game.locals["quickcalc"] = game.locals["quickcalc"] || sync.obj();
      game.locals["quickcalc"].data = game.locals["quickcalc"].data || {};

      game.locals["quickcalc"].addApp(newApp);

      ui_popOut({
        target : $("body"),
        id : "quick-calc",
        style : {width : "200px"}
      }, newApp);
    }
    else {
      if ($("#quick-calc").attr("faded")) {
        layout.coverlay("quick-calc");
      }
      else {
        $("#quick-calc").attr("faded", true);
        $("#quick-calc").css("opacity", "0.5");
        $("#quick-calc").hover(function(){
          $(this).css("opacity", "");
        },
        function(){
          $(this).css("opacity", "0.5");
        });
      }
    }
  },
}

const _hotkey = "16,90,72";
hotkeys[_hotkey] = {
  name : "Toggle HotKey List",
  combo : _keyTrans(_hotkey),
  exe : function() {
    toggleHotKeysDisplay();
  },
}

const _roll = "16,90,82";
hotkeys[_roll] = {
  name : "Roll Dice",
  combo : _keyTrans(_roll),
  exe : function() {
    var content = $("<div>");
    content.addClass("flex flexcolumn padding");

    game.locals["diceRoll"] = game.locals["diceRoll"] || sync.obj();
    game.locals["diceRoll"].data = game.locals["diceRoll"].data || {};

    var extraDice = sync.newApp("ui_dicePooler").appendTo(content);
    game.locals["diceRoll"].addApp(extraDice);

    var confirmWrap = $("<div>").appendTo(content);
    confirmWrap.addClass("flexrow");

    var checkWrap = $("<div>").appendTo(confirmWrap);
    checkWrap.addClass("flexcolumn lrmargin");

    var check = $("<div>").appendTo(checkWrap);
    check.addClass("flexmiddle");

    var close = genInput({
      parent : check,
      type : "checkbox",
      style : {"margin-top" : "0"},
    });
    close.prop("checked", true);
    check.append("<b class='subtitle lrpadding'>Close after rolling</b>");

    var check = $("<div>").appendTo(checkWrap);
    check.addClass("flexmiddle");

    var show = genInput({
      parent : check,
      type : "checkbox",
      style : {"margin-top" : "0"},
    });
    show.prop("checked", false);
    show.change(function(){
      if (show.prop("checked") == true) {
        extraDice.attr("show", "true");
      }
      else {
        extraDice.attr("show", "false");
      }
      game.locals["diceRoll"].update();
    });
    check.append("<b class='subtitle lrpadding'>Show all dice types</b>");

    var button = $("<button>").appendTo(confirmWrap);
    button.addClass("flex");
    button.append("Roll");
    button.click(function(){
      snd_diceRoll.play();
      var context = sync.defaultContext();

      var equation = "";
      for (var i in game.locals["diceRoll"].data.dice) {
        equation += game.locals["diceRoll"].data.dice[i]+"["+i+"]+";
      }
      equation = equation.substring(0, equation.length-1);

      var icon;
      var ic;
      util.processEvent("/r " + equation, "rolled", icon, ic);
      if (close.prop("checked") == true) {
        layout.coverlay("dice-popout-"+extraDice.attr("id"), 500);
      }
    });


    var button = $("<button>").appendTo(confirmWrap);
    button.addClass("subtitle background alttext");
    button.append("Private");
    button.click(function(){
      snd_diceRoll.play();
      var context = sync.defaultContext();

      var equation = "";
      for (var i in game.locals["diceRoll"].data.dice) {
        equation += game.locals["diceRoll"].data.dice[i]+"["+i+"]+";
      }
      equation = equation.substring(0, equation.length-1);

      var icon;
      var ic;
      var priv = {};
      priv[getCookie("UserID")] = true;
      util.processEvent("/r " + equation, "rolled", icon, ic, priv);
      if (close.prop("checked") == true) {
        layout.coverlay("dice-popout-"+extraDice.attr("id"), 500);
      }
    });


    var popout = ui_popOut({
      target : $("body"),
      title : "Dice Roller",
      align : "bottom",
      id : "dice-popout",
      style : {"width": "300px"},
    }, content);
    popout.resizable();
  },
}

/*
const _display = "16,90,68";
hotkeys[_display] = {
  name : "Force To Display",
  combo : _keyTrans(_display),
  exe : function() {
    sync.replaceApps({apps : ["ui_board"], newApp : "ui_display", all : true});
    runCommand("forceView", {apps : ["ui_board"], newApp : "ui_display", all : true});
  },
}
const _board = "16,90,66";
hotkeys[_board] = {
  name : "Force to map",
  combo : _keyTrans(_board),
  exe : function() {
    sync.replaceApps({apps : ["ui_display"], newApp : "ui_board", all : true});
    runCommand("forceView", {apps : ["ui_display"], newApp : "ui_board", all : true});
  },
}
*/

const _combat = "16,90,67";
hotkeys[_combat] = {
  name : "Toggle Combat",
  combo : _keyTrans(_combat),
  exe : function() {
    if (game.state && game.state.data.combat) {
      delete game.state.data.combat;
      game.state.sync("disableCombat");
    }
    else {
      if (game.locals["turnOrder"] && game.locals["turnOrder"].data && Object.keys(game.locals["turnOrder"].data.combat.engaged).length) {
        var compare = function (obj1, obj2) {
          return sync.eval(game.templates.initiative.compare, {i1 : obj1, i2 : obj2});
        }

        game.state.data.combat = duplicate(game.locals["turnOrder"].data.combat);
        var randomInit = duplicate(game.locals["turnOrder"].data.combat.current);
        // roll the randoms if it isn't a player
        var pEnts = {};
        for (var k in game.players.data) {
          if (game.players.data[k].entity && !hasSecurity(k, "Game Master")) {
             pEnts[game.players.data[k].entity] = k;
          }
        }
        for (var i in randomInit.e) {
          if (!pEnts[randomInit.e[i]] && compare(game.state.data.combat.engaged[randomInit.e[i]], {}) == 0) {
            var sp;
            var ok;
            if (game.state.data.combat.engaged[randomInit.e[i]]) {
              if (game.state.data.combat.engaged[randomInit.e[i]].sp) {
                sp = game.state.data.combat.engaged[randomInit.e[i]].sp;
              }
              if (game.state.data.combat.engaged[randomInit.e[i]].ok) {
                ok = game.state.data.combat.engaged[randomInit.e[i]].ok;
              }
            }
            game.state.data.combat.engaged[randomInit.e[i]] = calc.initiative(game.entities.data[randomInit.e[i]]);
            game.state.data.combat.engaged[randomInit.e[i]].sp = sp;
            game.state.data.combat.engaged[randomInit.e[i]].ok = ok;
          }
        }
        game.state.data.combat.current = {};

        for (var id in game.state.data.combat.engaged) {
          if (compare(game.state.data.combat.engaged[id], game.state.data.combat.current) > 0) {
            game.state.data.combat.current = duplicate(game.state.data.combat.engaged[id]);
          }
        }
        game.state.data.combat.round = sync.newValue("Round", 0);
        game.state.sync("updateState");
        runCommand("enableCombat");
      }
      else {
        sendAlert({text : "No Combat Configured"});
      }
    }
  },
}

const _media = "16,90,77";
hotkeys[_media] = {
  name : "Media Player",
  combo : _keyTrans(_media),
  exe : function() {
    if ($("#media-player").length) {
      if ($("#media-player").is(":visible")) {
        $("#media-player").hide();
      }
      else {
        $("#media-player").show();
        var max = util.getMaxZ(".ui-popout");
        $("#media-player").css("z-index", max+1);
      }
    }
    else {
      var newApp = sync.newApp("ui_media", true);

      var popOut = ui_popOut({
        target : $("body"),
        title : "Youtube Player",
        id : "media-player",
        close : function(ev, ui) {
          popOut.hide();
          return false;
        },
        style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
      }, newApp);
      popOut.resizable();
    }
  }
}

const _mediaplay = "16,90,83";
hotkeys[_mediaplay] = {
  name : "Play/Pause Media",
  combo : _keyTrans(_mediaplay),
  exe : function() {
    if (mediaPlayer && mediaPlayer.video) {
      if (mediaPlayer.isPlaying && !mediaPlayer.isPlaying()) {
        runCommand("media", {cmd : "play"});
      }
      else {
        mediaPlayer.pause();
      }
    }
  }
}

const _options = "16,90,79";
hotkeys[_options] = {
  name : "Game Configuration",
  combo : _keyTrans(_options),
  exe : function() {
    var frame = layout.page({title: "Game Configuration", prompt : "Change information on how this server", blur: 0.5, id : "gameOptions"});

    var newApp = sync.newApp("ui_gameCtrl", game.config);
    newApp.appendTo(frame);
  }
}

const _nextTurn = "16,90,39";
hotkeys[_nextTurn] = {
  name : "Next Turn",
  combo : _keyTrans(_nextTurn),
  exe : function() {
    var obj = game.state;
    var data = game.state.data;
    var compare = function (obj1, obj2) {
      return sync.eval(game.templates.initiative.compare, {i1 : obj1, i2 : obj2});
    }

    var inits = [];
    for (var i in data.combat.engaged) {
      var ref = Math.max(inits.length-1, 0);
      while (ref != null && ref >= 0) {
        if (ref == inits.length && inits.length == 0) {
          var added = duplicate(data.combat.engaged[i]);
          added.e = [i];
          inits.push(added);
          ref = null;
        }
        else {
          if (compare(data.combat.engaged[i], inits[ref]) > 0) {
            var added = duplicate(data.combat.engaged[i]);
            added.e = [i];
            if (ref == inits.length-1) {
              inits.push(added);
            }
            else {
              util.insert(inits, ref+1, added);
            }
            ref = null;
          }
          else if (compare(data.combat.engaged[i], inits[ref]) == 0) {
            inits[ref].e = inits[ref].e || [];
            if (!util.contains(inits[ref].e, i)) {
              inits[ref].e.push(i);
            }
            ref = null;
          }
        }
        if (ref != null) {
          ref--;
        }
      }
      if (ref != null && ref == -1) {
        var added = duplicate(data.combat.engaged[i]);
        added.e = [i];
        var newInit = [added];
        for (var j=0; j<inits.length; j++) {
          newInit.push(inits[j]);
        }
        inits = newInit;
      }
    }

    var turn;
    for (var j in inits) {
      if (compare(data.combat.current, inits[j]) == 0) {
        turn = parseInt(j);
        break;
      }
    }

    var newTurn = turn-1;
    function changeTurn() {
      if (turn == 0) {
        newTurn = inits.length-1;
        sync.val(data.combat.round, sync.val(data.combat.round) + 1);
        for (var key in data.combat.engaged) {
          delete data.combat.engaged[key].ok;
          delete data.combat.engaged[key].sp;
        }
      }
      else {
        for (var key in data.combat.engaged) {
          if (compare(inits[turn], data.combat.engaged[key]) == 0) {
            data.combat.engaged[key].ok = true;
          }
        }
      }
      data.combat.current = inits[newTurn];
      obj.sync("updateState");
    }
    for (var key in game.players.data) {
      var player = game.players.data[key];
      if (player.entity && data.combat.engaged[player.entity] && !data.combat.engaged[player.entity].ok) {
        if (compare(data.combat.engaged[player.entity], inits[turn]) == 0) {
          if ($("#confirm-skip-turn").length) {
            changeTurn();
            layout.coverlay("confirm-skip-turn");
          }
          else {
            var popOut = ui_prompt({
              target : $("body"),
              id : "confirm-skip-turn",
              confirm : "Skip Player(s)?",
              click : function(ev, inputs) {
                changeTurn();
              }
            });
          }
          return;
        }
      }
    }
    changeTurn();
  }
}
const _topTurn = "16,90,38";
hotkeys[_topTurn] = {
  name : "Last Round",
  combo : _keyTrans(_topTurn),
  exe : function() {
    var obj = game.state;
    var data = game.state.data;
    var compare = function (obj1, obj2) {
      return sync.eval(game.templates.initiative.compare, {i1 : obj1, i2 : obj2});
    }

    var inits = [];
    for (var i in data.combat.engaged) {
      var ref = Math.max(inits.length-1, 0);
      while (ref != null && ref >= 0) {
        if (ref == inits.length && inits.length == 0) {
          var added = duplicate(data.combat.engaged[i]);
          added.e = [i];
          inits.push(added);
          ref = null;
        }
        else {
          if (compare(data.combat.engaged[i], inits[ref]) > 0) {
            var added = duplicate(data.combat.engaged[i]);
            added.e = [i];
            if (ref == inits.length-1) {
              inits.push(added);
            }
            else {
              util.insert(inits, ref+1, added);
            }
            ref = null;
          }
          else if (compare(data.combat.engaged[i], inits[ref]) == 0) {
            inits[ref].e = inits[ref].e || [];
            if (!util.contains(inits[ref].e, i)) {
              inits[ref].e.push(i);
            }
            ref = null;
          }
        }
        if (ref != null) {
          ref--;
        }
      }
      if (ref != null && ref == -1) {
        var added = duplicate(data.combat.engaged[i]);
        added.e = [i];
        var newInit = [added];
        for (var j=0; j<inits.length; j++) {
          newInit.push(inits[j]);
        }
        inits = newInit;
      }
    }

    var turn;
    for (var j in inits) {
      if (compare(data.combat.current, inits[j]) == 0) {
        turn = parseInt(j);
        break;
      }
    }

    var newTurn = 0;
    sync.val(data.combat.round, sync.val(data.combat.round) - 1);
    data.combat.current = inits[newTurn];
    for (var key in data.combat.engaged) {
      data.combat.engaged[key].ok = true;
    }
    obj.sync("updateState");
  }
}
const _lastTurn = "16,90,37";
hotkeys[_lastTurn] = {
  name : "Last Turn",
  combo : _keyTrans(_lastTurn),
  exe : function() {
    var obj = game.state;
    var data = game.state.data;
    var compare = function (obj1, obj2) {
      return sync.eval(game.templates.initiative.compare, {i1 : obj1, i2 : obj2});
    }

    var inits = [];
    for (var i in data.combat.engaged) {
      var ref = Math.max(inits.length-1, 0);
      while (ref != null && ref >= 0) {
        if (ref == inits.length && inits.length == 0) {
          var added = duplicate(data.combat.engaged[i]);
          added.e = [i];
          inits.push(added);
          ref = null;
        }
        else {
          if (compare(data.combat.engaged[i], inits[ref]) > 0) {
            var added = duplicate(data.combat.engaged[i]);
            added.e = [i];
            if (ref == inits.length-1) {
              inits.push(added);
            }
            else {
              util.insert(inits, ref+1, added);
            }
            ref = null;
          }
          else if (compare(data.combat.engaged[i], inits[ref]) == 0) {
            inits[ref].e = inits[ref].e || [];
            if (!util.contains(inits[ref].e, i)) {
              inits[ref].e.push(i);
            }
            ref = null;
          }
        }
        if (ref != null) {
          ref--;
        }
      }
      if (ref != null && ref == -1) {
        var added = duplicate(data.combat.engaged[i]);
        added.e = [i];
        var newInit = [added];
        for (var j=0; j<inits.length; j++) {
          newInit.push(inits[j]);
        }
        inits = newInit;
      }
    }

    var turn;
    for (var j in inits) {
      if (compare(data.combat.current, inits[j]) == 0) {
        turn = parseInt(j);
        break;
      }
    }

    var newTurn = turn+1;
    if (turn == inits.length-1) {
      newTurn = 0;
      sync.val(data.combat.round, sync.val(data.combat.round) - 1);
      for (var key in data.combat.engaged) {
        data.combat.engaged[key].ok = true;
      }
    }
    else {
      for (var key in data.combat.engaged) {
        if (compare(inits[turn], data.combat.engaged[key]) == 0) {
          delete data.combat.engaged[key].ok;
        }
      }
    }
    data.combat.current = inits[newTurn];
    obj.sync("updateState");
  }
}
const _finalTurn = "16,90,40";
hotkeys[_finalTurn] = {
  name : "Next Round",
  combo : _keyTrans(_finalTurn),
  exe : function() {
    var obj = game.state;
    var data = game.state.data;
    var compare = function (obj1, obj2) {
      return sync.eval(game.templates.initiative.compare, {i1 : obj1, i2 : obj2});
    }

    var inits = [];
    for (var i in data.combat.engaged) {
      var ref = Math.max(inits.length-1, 0);
      while (ref != null && ref >= 0) {
        if (ref == inits.length && inits.length == 0) {
          var added = duplicate(data.combat.engaged[i]);
          added.e = [i];
          inits.push(added);
          ref = null;
        }
        else {
          if (compare(data.combat.engaged[i], inits[ref]) > 0) {
            var added = duplicate(data.combat.engaged[i]);
            added.e = [i];
            if (ref == inits.length-1) {
              inits.push(added);
            }
            else {
              util.insert(inits, ref+1, added);
            }
            ref = null;
          }
          else if (compare(data.combat.engaged[i], inits[ref]) == 0) {
            inits[ref].e = inits[ref].e || [];
            if (!util.contains(inits[ref].e, i)) {
              inits[ref].e.push(i);
            }
            ref = null;
          }
        }
        if (ref != null) {
          ref--;
        }
      }
      if (ref != null && ref == -1) {
        var added = duplicate(data.combat.engaged[i]);
        added.e = [i];
        var newInit = [added];
        for (var j=0; j<inits.length; j++) {
          newInit.push(inits[j]);
        }
        inits = newInit;
      }
    }

    var turn;
    for (var j in inits) {
      if (compare(data.combat.current, inits[j]) == 0) {
        turn = parseInt(j);
        break;
      }
    }

    data.combat.current = inits[inits.length-1];
    sync.val(data.combat.round, sync.val(data.combat.round) + 1);
    for (var key in data.combat.engaged) {
      delete data.combat.engaged[key].ok;
      delete data.combat.engaged[key].sp;
    }
    obj.sync("updateState");
  }
}

var _down = {};
function controlsKeyDown(e) {
  e.keyCode = e.keyCode || e.which;
  _down[e.keyCode] = true;
  if (!($(':focus').is("input") || $(':focus').is("textarea"))) {
    var updateList = {};
    var spliceData = {list : []};
    var deleteSelections = {};
    for (var i in boardApi.pix.selections) {
      var selectData = boardApi.pix.selections[i];
      var board = getEnt(selectData.board);
      if (board && board.data) {
        if (selectData.index != null) {
          if (selectData.type == "p") {
            var pieceData = board.data.layers[selectData.layer].p[selectData.index];
            if (pieceData) {
              var ent = getEnt(pieceData.eID);
              if (hasSecurity(getCookie("UserID"), "Rights", board.data) || (ent && hasSecurity(getCookie("UserID"), "Rights", ent.data))) {
                var oldX = pieceData.x;
                var oldY = pieceData.y;
                var diffX = 0;
                var diffY = 0;

                var layer = selectData.layer;
                var override = false;

                if (e.keyCode == 46) { // delete
                  spliceData.target = board.data.layers[selectData.layer].p;
                  layout.coverlay($(".piece-quick-edit"));
                  if (hasSecurity(getCookie("UserID"), "Rights", board.data)) {
                    deleteSelections[i] = selectData;
                    boardApi.pix.selections[i].selected.visible = false;
                    //boardApi.pix.destroyObject(selectData.layer, selectData.type, selectData.index, board);
                  }
                }
                else if (e.keyCode == 37) {
                  pieceData.x = pieceData.x - (board.data.gridW || pieceData.w);
                  diffX = (board.data.gridW || pieceData.w) * -1;
                  selectData.wrap.update();
                  e.stopPropagation();
                  e.preventDefault();
                  //updateList[board.id()] = "updateAsset";
                }
                else if (e.keyCode == 38) {
                  pieceData.y = pieceData.y - (board.data.gridH || pieceData.h);
                  diffY = (board.data.gridH || pieceData.h) * -1;
                  selectData.wrap.update();
                  e.stopPropagation();
                  e.preventDefault();
                  //updateList[board.id()] = "updateAsset";
                }
                else if (e.keyCode == 39) {
                  pieceData.x = pieceData.x + (board.data.gridW || pieceData.w);
                  diffX = (board.data.gridW || pieceData.w);
                  selectData.wrap.update();
                  e.stopPropagation();
                  e.preventDefault();
                  //updateList[board.id()] = "updateAsset";
                }
                else if (e.keyCode == 40) {
                  pieceData.y = pieceData.y + (board.data.gridH || pieceData.h);
                  diffY = (board.data.gridH || pieceData.h);
                  selectData.wrap.update();
                  e.stopPropagation();
                  e.preventDefault();
                  //updateList[board.id()] = "updateAsset";
                }
                else if (e.keyCode == 32) { // space bar
                  boardApi.pix.scrollTo($("#"+selectData.app), pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2);
                }
                if (diffX || diffY){
                  layout.coverlay($(".piece-quick-edit"));
                  selectData.wrap.move(e, diffX, diffY);
                  boardApi.pix.scrollTo($("#"+selectData.app), pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2);
                  if (boardApi.pix.fog[board.id()] && boardApi.pix.fog[board.id()].length && pieceData.eID) {
                    var range;
                    if (pieceData.eID && pieceData.o && pieceData.o.Sight) {
                      var ent = getEnt(pieceData.eID);
                      var context = sync.defaultContext();
                      if (ent && ent.data) {
                        context[ent.data._t] = duplicate(ent.data);
                      }
                      var auraData = pieceData.o.Sight;
                      range = boardApi.pix.scale(sync.eval(auraData.d, context), board, true);
                    }
                    boardApi.pix.apps[selectData.app].views[selectData.layer+"-"+selectData.type+"-"+selectData.index] = boardApi.pix.buildDynamicFog(board, $("#"+selectData.app), pieceData.x + pieceData.w/2, pieceData.y + pieceData.h/2, range);
                    boardApi.pix.rebuildDynamicFog(board, $("#"+selectData.app));
                  }
                }
              }
            }
          }
          else {
            var tileData = board.data.layers[selectData.layer][selectData.type][selectData.index];
            if (tileData) {
              if (e.keyCode == 46) { // delete
                layout.coverlay($(".piece-quick-edit"));
                spliceData.target = board.data.layers[selectData.layer][selectData.type];
                if (hasSecurity(getCookie("UserID"), "Rights", board.data)) {
                  deleteSelections[i] = selectData;
                  boardApi.pix.selections[i].selected.visible = false;
                }
              }
              else if (e.keyCode == 37) {
                tileData.x = tileData.x - (board.data.gridW || tileData.w);
                diffX = (board.data.gridW || tileData.w) * -1;
                selectData.wrap.update();
                e.stopPropagation();
                e.preventDefault();
                //updateList[board.id()] = "updateAsset";
              }
              else if (e.keyCode == 38) {
                tileData.y = tileData.y - (board.data.gridH || tileData.h);
                diffY = (board.data.gridH || tileData.h) * -1;
                selectData.wrap.update();
                e.stopPropagation();
                e.preventDefault();
                //updateList[board.id()] = "updateAsset";
              }
              else if (e.keyCode == 39) {
                tileData.x = tileData.x + (board.data.gridW || tileData.w);
                diffX = (board.data.gridW || tileData.w);
                selectData.wrap.update();
                e.stopPropagation();
                e.preventDefault();
                //updateList[board.id()] = "updateAsset";
              }
              else if (e.keyCode == 40) {
                tileData.y = tileData.y + (board.data.gridH || tileData.h);
                diffY = (board.data.gridH || tileData.h);
                selectData.wrap.update();
                e.stopPropagation();
                e.preventDefault();
                //updateList[board.id()] = "updateAsset";
              }
              else if (e.keyCode == 32) { // space bar
                boardApi.pix.scrollTo($("#"+selectData.app), tileData.x + tileData.w/2, tileData.y + tileData.h/2);
              }
            }
          }
        }
      }
    }
    if (Object.keys(deleteSelections).length) {
      var rebuild = {};
      for (var i in deleteSelections) {
        var selectData = deleteSelections[i];
        if (selectData.type) {
          if (!rebuild[selectData.board]) {
            rebuild[selectData.board] = {};
          }
          var boardData = rebuild[selectData.board];
          if (!boardData[selectData.layer]) {
            boardData[selectData.layer] = {};
          }
          if (!boardData[selectData.layer][selectData.type]) {
            boardData[selectData.layer][selectData.type] = {indexs : []};
          }
          boardData[selectData.layer][selectData.type].indexs.push(Number(selectData.index));
          if (boardData[selectData.layer][selectData.type].rebuild == null || boardData[selectData.layer][selectData.type].rebuild > selectData.index) {
            boardData[selectData.layer][selectData.type].rebuild = Number(selectData.index);
          }
        }
      }
      //boardApi.pix.destroyObject(selectData.layer, selectData.type, selectData.index, board);
      var undo = duplicate(board.data.layers);
      for (var bID in rebuild) {
        var boardData = rebuild[bID];
        var board = getEnt(bID);
        if (board && board.data) {
          for (var layer in boardData) {
            var layerData = boardData[layer];
            var update = {
              layer : layer,
              id : bID,
              cmd : "destroy",
              rebuild : {},
            };
            var last = duplicate(board.data.layers[layer]);
            for (var type in layerData) {
              var typeData = layerData[type];
              update.rebuild[type] = typeData.rebuild;

              typeData.indexs.sort();
              for (var idx=typeData.indexs.length-1; idx>=0; idx--) {
                board.data.layers[layer][type].splice(typeData.indexs[idx], 1);
              }
            }
            update.result = duplicate(board.data.layers[layer]);
            boardApi.pix.applyUpdate(getCookie("UserID"), update, last);
            runCommand("updateBoardLayer", update);
          }
        }
      }
      boardApi.pix.selections = {};
    }
    for (var key in updateList) {
      if (game.entities.data[key]) {
        if (updateList[key]) {
          util.addUndo(game.entities.data[key], game.entities.data[key].data, updateList[key]);
        }
        else {
          util.addUndo(game.entities.data[key], game.entities.data[key].data);
        }
      }
    }
    spliceData.list.sort(function(a,b){return a-b;});
    for (var i=spliceData.list.length-1; i>=0; i--) {
      spliceData.target.splice(spliceData.list[i], 1);
    }
    spliceData = {list : []};
    for (var key in updateList) {
      if (game.entities.data[key]) {
        if (updateList[key]) {
          game.entities.data[key].sync(updateList[key]);
        }
        else {
          game.entities.data[key].update();
        }
      }
    }
  }
  if (_nextKey < Date.now()) {
    for (var key in hotkeys) {
      var codes = key.split(",");
      var exec = key;
      for (var ci in codes) {
        if (!_down[parseInt(codes[ci])]) {
          exec = false;
          break;
        }
      }
      if (exec) {
        hotkeys[exec].exe(hotkeys[exec], exec);
        if (hotkeys[exec].override) {
          e.stopPropagation();
          e.preventDefault();
        }
        _nextKey = Date.now() + 500;
      }
    }
  }
}

function controlsKeyUp(e) {
  delete _down[e.keyCode];
  if (e.keyCode == "18" && (!($(':focus').is("input") || $(':focus').is("textarea")))) {
    e.preventDefault();
  }
}

function controlsKeyPress(e) {

}

function toggleHotKeysDisplay() {
  if (!$("#overlay-hotkeys").length) {
    var show = layout.overlay({target : $("#viewPort"), id : "overlay-hotkeys", style : {"background-color" : "rgba(0,0,0,0.5)"}});
    show.click(function(){
      layout.coverlay(show);
      layout.coverlay("overlay-hotkeys");
    });

    var list = $("<div>").appendTo(show);
    list.addClass("flexcolumn");
    list.css("width", "50%");
    list.css("width", "50%");
    list.css("margin", "auto");
    list.css("font-size", "0.6em");
    for (var key in hotkeys) {
      var hotkey = hotkeys[key];

      var hotkeyDiv = $("<div>").appendTo(list);
      hotkeyDiv.addClass("flexmiddle");

      var title = $("<div class='flexmiddle highlight2 hardoutline' style='padding : 0.2em'><b class='alttext'>"+hotkey.name+"</b></div>").appendTo(hotkeyDiv);
      hotkeyDiv.append("<div class='flexmiddle'><b class='alttext'>=</b></div>");

      var controls = hotkey.combo.split(":");
      for (var i in controls) {
        var controlDiv = $("<div>").appendTo(hotkeyDiv);
        controlDiv.addClass("flexmiddle");

        var combos = controls[i].split("+");
        for (var j in combos) {
          var control = combos[j];
          var icon = $("<div>").appendTo(controlDiv);
          icon.css("background-size", "contain");
          icon.css("background-repeat", "no-repeat");
          icon.css("background-position", "center");
          if (control == "mright") {
            icon.css("background-image", "url('/content/mouse_right.png')");
            icon.css("width", "3em");
            icon.css("height", "3em");
          }
          else if (control == "mleft") {
            icon.css("background-image", "url('/content/mouse_left.png')");
            icon.css("width", "3em");
            icon.css("height", "3em");
          }
          else if (control == "arrow-left") {
            icon.addClass("flexmiddle hardoutline");
            icon.css("background-color", "white");
            icon.css("padding", "0.2em");
            icon.css("font-weight", "bolder");
            icon.css("color", "black");
            icon.append(genIcon({raw : true, icon : "arrow-left"}));
          }
          else if (control == "arrow-up") {
            icon.addClass("flexmiddle hardoutline");
            icon.css("background-color", "white");
            icon.css("padding", "0.2em");
            icon.css("font-weight", "bolder");
            icon.css("color", "black");
            icon.append(genIcon({raw : true, icon : "arrow-up"}));
          }
          else if (control == "arrow-right") {
            icon.addClass("flexmiddle hardoutline");
            icon.css("background-color", "white");
            icon.css("padding", "0.2em");
            icon.css("font-weight", "bolder");
            icon.css("color", "black");
            icon.append(genIcon({raw : true, icon : "arrow-right"}));
          }
          else if (control == "arrow-down") {
            icon.addClass("flexmiddle hardoutline");
            icon.css("background-color", "white");
            icon.css("padding", "0.2em");
            icon.css("font-weight", "bolder");
            icon.css("color", "black");
            icon.append(genIcon({raw : true, icon : "arrow-down"}));
          }
          else {
            icon.addClass("flexmiddle hardoutline");
            icon.css("background-color", "white");
            icon.css("padding", "0.2em");
            icon.css("font-weight", "bolder");
            icon.css("color", "black");
            icon.text(control);
          }
          if (j < combos.length-1) {
            controlDiv.append("<b class='alttext'>+</b>");
          }
        }
      }
    }
  }
  else {
    layout.coverlay("overlay-hotkeys", 500);
  }
}

const _channel1 = "16,17,49";
hotkeys[_channel1] = {
  name : "Voice Channel 1",
  combo : _keyTrans(_channel1),
  exe : function() {
    if ($("#media-channels-"+getCookie("UserID")).length) {
      if ($($("#media-channels-"+getCookie("UserID")).children()[0]).css("opacity") == "0.5") {
        sendAlert({text : "Entered Voice Channel 1", color : $($("#media-channels-"+getCookie("UserID")).children()[0]).css("background-color")});
      }
      else {
        sendAlert({text : "Left Voice Channel 1", color : $($("#media-channels-"+getCookie("UserID")).children()[0]).css("background-color")});
      }
      $($("#media-channels-"+getCookie("UserID")).children()[0]).click();
    }
  },
}

const _channel2 = "16,17,50";
hotkeys[_channel2] = {
  name : "Voice Channel 2",
  combo : _keyTrans(_channel2),
  exe : function() {
    if ($("#media-channels-"+getCookie("UserID")).length) {
      if ($($("#media-channels-"+getCookie("UserID")).children()[1]).css("opacity") == "0.5") {
        sendAlert({text : "Entered Voice Channel 2", color : $($("#media-channels-"+getCookie("UserID")).children()[1]).css("background-color")});
      }
      else {
        sendAlert({text : "Left Voice Channel 2", color : $($("#media-channels-"+getCookie("UserID")).children()[1]).css("background-color")});
      }
      $($("#media-channels-"+getCookie("UserID")).children()[1]).click();
    }
  },
}

const _channel3 = "16,17,51";
hotkeys[_channel3] = {
  name : "Voice Channel 3",
  combo : _keyTrans(_channel3),
  exe : function() {
    if ($("#media-channels-"+getCookie("UserID")).length) {
      if ($($("#media-channels-"+getCookie("UserID")).children()[2]).css("opacity") == "0.5") {
        sendAlert({text : "Entered Voice Channel 3", color : $($("#media-channels-"+getCookie("UserID")).children()[2]).css("background-color")});
      }
      else {
        sendAlert({text : "Left Voice Channel 3", color : $($("#media-channels-"+getCookie("UserID")).children()[2]).css("background-color")});
      }
      $($("#media-channels-"+getCookie("UserID")).children()[2]).click();
    }
  },
}
