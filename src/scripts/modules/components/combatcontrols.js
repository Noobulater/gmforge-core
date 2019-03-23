sync.render("ui_combatControls", function(obj, app, scope){
  var data;
  var div = $("<div>");
  div.addClass("flexcolumn flex");
  if (!obj) {
    game.state.addApp(app);
    return div;
  }

  div.attr("_lastScrollTop", app.attr("_lastScrollTop_combatDiv"));
  div.attr("_lastScrollLeft", app.attr("_lastScrollTop_combatDiv"));
  div.scroll(function(){
    app.attr("_lastScrollTop_combatDiv", $(this).scrollTop());
    app.attr("_lastScrollTop_combatDiv", $(this).scrollLeft());
  });

  data = obj.data;

  if (true) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("flexrow flexaround flexwrap bold");
    optionsBar.css("font-size", "1.5em");

    if (data.combat) {
      optionsBar.addClass("outline alttext");
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        optionsBar.addClass("highlight");
      }
      else {
        optionsBar.addClass("foreground");
      }
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


      function isHiddenTurn(turnCheck){
        if (inits[turnCheck]) {
          var valid = true;
          for (var i in inits[turnCheck].e) {
            var ent = getEnt(inits[turnCheck].e[i]);
            if (ent && ent.data && !(ent.data._flags && ent.data._flags.hidden)) {
              valid = false;
              break;
            }
          }
        }
        return valid;
      }

      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        var back = genIcon("fast-backward").appendTo(optionsBar);
        back.attr("title", "Last Round");
        back.css("font-size", "1em");
        back.click(function() {
          var newTurn = 0;
          while (isHiddenTurn(newTurn)) {
            newTurn = Math.min(newTurn+1, inits.length-1);
            if (newTurn >= inits.length-1) {
              break;
            }
          }
          sync.val(data.combat.round, sync.val(data.combat.round) - 1);
          data.combat.current = inits[newTurn];
          for (var key in data.combat.engaged) {
            data.combat.engaged[key].ok = true;
          }
          obj.sync("updateCombatState");
        });

        var last = genIcon("backward").appendTo(optionsBar);
        last.attr("title", "Previous Turn");
        last.css("font-size", "1em");
        last.click(function() {
          var newTurn = turn+1;
          while (isHiddenTurn(newTurn)) {
            newTurn = Math.min(newTurn+1, inits.length-1);
            if (newTurn >= inits.length-1) {
              break;
            }
          }

          if (turn == inits.length-1) {
            newTurn = 0;
            while (isHiddenTurn(newTurn)) {
              newTurn = Math.min(newTurn+1, inits.length-1);
              if (newTurn >= inits.length-1) {
                break;
              }
            }
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
          obj.sync("updateCombatState");
        });

        var disableCombat = genIcon("resize-full", "Disable Combat").appendTo(optionsBar);
        disableCombat.css("font-size", "0.6em");
        disableCombat.addClass("flexmiddle");
        disableCombat.click(function() {
          var pop = ui_popOut({
            id : "confirm-disable-combat",
            target : $(this),
            noCss : true,
            prompt : true,
            style : {"font-size" : "1.4em"}
          }, $("<b class='lpadding fit-x hover2'>Confirm?</b>")).addClass("background alttext");
          var max = util.getMaxZ(".ui-popout");
          pop.css("z-index", max+1);
          pop.click(function(){
            delete obj.data.combat;
            obj.sync("disableCombat");
            $(this).remove();
          });
        });

        var next = genIcon("play").appendTo(optionsBar);
        next.attr("title", "Next Turn");
        next.css("font-size", "1em");
        next.click(function() {
          var newTurn = turn-1;
          while (isHiddenTurn(newTurn)) {
            newTurn = Math.max(newTurn-1, 0);
            if (newTurn <= 0) {
              break;
            }
          }

          function changeTurn() {
            if (turn == 0) {
              newTurn = inits.length-1;
              while (isHiddenTurn(newTurn)) {
                newTurn = Math.max(newTurn-1, 0);
                if (newTurn <= 0) {
                  break;
                }
              }
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
            for (var key in data.combat.engaged) {
              if (compare(inits[newTurn], data.combat.engaged[key]) == 0) {
                if (game.templates.initiative.skip && sync.eval(game.templates.initiative.skip, {c : duplicate(getEnt(key))})) {
                  data.combat.engaged[key].ok = true;
                }
              }
            }
            data.combat.current = inits[newTurn];
            obj.sync("updateCombatState");
          }
          for (var key in game.players.data) {
            var player = game.players.data[key];
            if (player.entity && data.combat.engaged[player.entity] && !data.combat.engaged[player.entity].ok) {
              if (compare(data.combat.engaged[player.entity], inits[turn]) == 0) {
                var pop = ui_popOut({
                  id : "confirm-skip-turn",
                  target : $(this),
                  noCss : true,
                  prompt : true,
                  style : {"font-size" : "1.4em"}
                }, $("<b class='lpadding fit-x hover2'>Skip Players</b>")).addClass("background alttext");
                var max = util.getMaxZ(".ui-popout");
                pop.css("z-index", max+1);
                pop.click(function(){
                  changeTurn();
                  $(this).remove();
                });
                return;
              }
            }
          }
          changeTurn();
        });

        var top = genIcon("fast-forward").appendTo(optionsBar);
        top.attr("title", "Next Round");
        top.css("font-size", "1em");
        top.click(function() {
          var newTurn = inits.length-1;
          while (isHiddenTurn(newTurn)) {
            newTurn = Math.max(newTurn-1, 0);
            if (newTurn <= 0) {
              break;
            }
          }

          data.combat.current = inits[newTurn];
          sync.val(data.combat.round, sync.val(data.combat.round) + 1);
          for (var key in data.combat.engaged) {
            delete data.combat.engaged[key].ok;
            delete data.combat.engaged[key].sp;
          }
          for (var key in data.combat.engaged) {
            if (game.templates.initiative.skip && sync.eval(game.templates.initiative.skip, {c : duplicate(getEnt(key))})) {
              data.combat.engaged[key].ok = true;
            }
          }
          obj.sync("updateCombatState");
        });

        if (data.combat.round && sync.val(data.combat.round) != null) {
          var round = $("<b>").appendTo(optionsBar);
          round.addClass("flexmiddle subtitle");

          round.text(data.combat.round.name + " " + sync.val(data.combat.round) || 0);
        }
      }
      else {
        genIcon("", "Combat Enabled").appendTo(optionsBar);
      }
      layout.coverlay($(".my-turn"), 500);
      var update = false;
      for (var key in game.players.data) {
        var player = game.players.data[key];
        if (player && player.entity) {
          if (data.combat.engaged[player.entity] && inits[turn] && compare(data.combat.engaged[player.entity], inits[turn]) == 0) {
            update = true;
            if (!data.combat.engaged[player.entity].ok) {
              if ($("#player-image-plate-"+key).length && !hasSecurity(key, "Assistant Master")) {
                var target = $("#player-image-plate-"+key);
                if ($("#web-cam-"+key).length && getCookie("UserID") != key) {
                  target = $("#web-cam-"+key);
                }
                if (key == getCookie("UserID")) {
                  optionsBar.empty();
                  optionsBar.addClass("highlight hover2 flexrow");
                  optionsBar.removeClass("foreground");
                  var button = $("<div>").appendTo(optionsBar);
                  button.addClass("flex flexmiddle");
                  button.attr("UserID", key);
                  button.attr("title", "Click to pass your turn over to the next person");
                  button.css("font-size", "2em");
                  button.css("font-family", "Nodesto Caps Condensed");
                  button.text("I've completed my turn");
                  button.click(function(){
                    if (game.state.data.combat) {
                      var player = game.players.data[$(this).attr("UserID")];
                      if (data.combat.engaged[player.entity]) {
                        data.combat.engaged[player.entity].ok =  true;

                        var change = true;
                        for (var eIDs in inits[turn].e) {
                          if (!data.combat.engaged[inits[turn].e[eIDs]].ok) {
                            change = false;
                            break;
                          }
                        }
                        if (change) {
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
                            for (var key in data.combat.engaged) {
                              if (compare(inits[newTurn], data.combat.engaged[key]) == 0) {
                                if (game.templates.initiative.skip && sync.eval(game.templates.initiative.skip, {c : duplicate(getEnt(key))})) {
                                  data.combat.engaged[key].ok = true;
                                }
                              }
                            }
                            data.combat.current = inits[newTurn];
                            obj.sync("updateCombatState");
                          }
                          changeTurn();
                        }
                        else {
                          obj.sync("updateCombatState");
                        }
                      }
                    }
                  });
                  if ($("#main-menu").length && $("#main-menu").css("opacity") == 0 && $("#main-menu").attr("docked") && !$("#main-menu").attr("locked")) {
                    $("#combat-button").click();
                    util.dockReveal($("#main-menu"));
                  }
                }
              }
            }
          }
        }
      }
      game.players.update();
    }
    else {
      optionsBar.css("color", "white");

      var enableCombat = genIcon("resize-small", "Enable Combat");
      if (!app.attr("hideCombat")) {
        optionsBar.addClass("background outline");
      }
      else if ($("#quick-combat").length == 0 || !$("#quick-combat").is(":visible")) {
        enableCombat = genIcon("resize-small", "Setup Combat");
      }
      enableCombat.appendTo(optionsBar);

      enableCombat.css("font-size", "1em");
      enableCombat.click(function() {
        if (app.attr("hideCombat") && ($("#quick-combat").length == 0 || !$("#quick-combat").is(":visible"))) {
          var charList = sync.newApp("ui_combatControls");
          charList.addClass("white");
          game.state.addApp(charList);
          if ($("#quick-combat").length == 0) {
            var pop = ui_popOut({
              align : "top-left",
              target : $($(".main-dock")[3]),
              id : "quick-combat",
              title : "Combat",
              minimize : true,
              maximize : true,
              close : function(){
                pop.hide();
              },
              style : {"width" : "400px", "height" : "300px"}
            }, charList);
            pop.resizable();
            //pop.hover(function(){}, function(){$(this).hide();})
          }
          else {
            $("#quick-combat").show();
          }
          if ($("#quick-combat").attr("docked")) {
            util.dockReveal($("#quick-combat"));
          }
          obj.update();
        }
        else {
          if (game.locals["turnOrder"].data && Object.keys(game.locals["turnOrder"].data.combat.engaged).length) {
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
                var context = sync.defaultContext();
                context[game.entities.data[randomInit.e[i]].data._t] = duplicate(game.entities.data[randomInit.e[i]].data);
                game.state.data.combat.engaged[randomInit.e[i]] = sync.executeQuery(game.templates.initiative.query, context).pool;
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
            game.state.sync("updateCombatState");
            runCommand("enableCombat");
          }
        }
      });
    }
  }

  if (!data.combat && !hasSecurity(getCookie("UserID"), "Assistant Master")) {
    div.empty();
    div.addClass("flexmiddle");
    div.append("<b>No Combat</b>");
    return div;
  }

  if (!app.attr("hideCombat")) {
    if (!obj.data.combat) {
      if (!game.locals["turnOrder"]) {
        game.locals["turnOrder"] = sync.obj("turnOrder");
        game.locals["turnOrder"].data = {combat : {engaged : {}, current : {}}};
      }
      for (var index in game.players.data) {
        if (game.players.data[index].entity) {
          game.locals["turnOrder"].data.combat.engaged[game.players.data[index].entity] = {};
        }
      }

      var charList = sync.newApp("ui_turnOrder");
      game.locals["turnOrder"].addApp(charList);
      charList.appendTo(div);
    }
    else {
      var charList = sync.newApp("ui_combat");
      obj.addApp(charList);
      charList.appendTo(div);
    }
  }

  return div;
});
