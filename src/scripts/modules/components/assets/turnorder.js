sync.render("ui_combat", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flex flexcolumn");
  div.css("overflow-y", "auto");
  div.css("position", "relative");
  div.attr("_lastScrollTop", app.attr("_lastScrollTop_combat"));
  div.attr("_lastScrollLeft", app.attr("_lastScrollLeft_combat"));
  div.scroll(function(){
    app.attr("_lastScrollTop_combat", $(this).scrollTop());
    app.attr("_lastScrollLeft_combat", $(this).scrollLeft());
  });

  scope = scope || {viewOnly : app.attr("viewOnly") == "true", local : (app.attr("local") == "true"), minimized : app.attr("minimized") == "true"};
  if (game.config.data.offline) {
    scope.local = true;
  }
  if (scope.local) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("middle");
  }
  var data = obj.data || {combat : {engaged : {}, current : {}}};
  if (!data.combat) {
    if (obj == game.state) {
      return $("<div>");
    }
    else {
      data.combat = {engaged : {}, current : {}};
    }
  }
  var compare = function (obj1, obj2) {
    return sync.eval(game.templates.initiative.compare, {i1 : obj1, i2 : obj2});
  }

  var inits = [];
  for (var i in data.combat.engaged) {
    if (getEnt(i) && getEnt(i).data) { // only live characters matter
      var ref = Math.max(inits.length-1, 0);
      while (ref != null && ref >= 0) {
        if (ref == inits.length && inits.length == 0) {
          var added;
          if (game.templates.initiative.data) {
            added = duplicate(game.templates.initiative.data);
            for (var key in added) {
              added[key] = data.combat.engaged[i][key];
            }
          }
          else {
            added = duplicate(data.combat.engaged[i]);
          }
          added.e = [i];
          inits.push(added);
          ref = null;
        }
        else {
          if (compare(data.combat.engaged[i], inits[ref]) > 0) {
            var added;
            if (game.templates.initiative.data) {
              added = duplicate(game.templates.initiative.data);
              for (var key in added) {
                added[key] = data.combat.engaged[i][key];
              }
            }
            else {
              added = duplicate(data.combat.engaged[i]);
            }
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
        var added;
        if (game.templates.initiative.data) {
          added = duplicate(game.templates.initiative.data);
          for (var key in added) {
            added[key] = data.combat.engaged[i][key];
          }
        }
        else {
          added = duplicate(data.combat.engaged[i]);
        }
        added.e = [i];
        var newInit = [added];
        for (var j=0; j<inits.length; j++) {
          newInit.push(inits[j]);
        }
        inits = newInit;
      }
    }
  }

  var applied = false;
  var boardEnt;
  $(".application[ui-name='ui_board']").each(function(){
    if ($(this).is(":visible") && !boardEnt) {
      boardEnt = getEnt($(this).attr("index"));
    }
  });

  if (scope.local) {
    // always assign current to the random inits
    data.combat.current = duplicate(inits[0]);
  }
  var turnDiv = $("<div>").appendTo(div);
  turnDiv.addClass("fit-x dropContent");
  if (!scope.minimized) {
    turnDiv.css("min-height", "100%");
    turnDiv.css("position", "absolute");
  }
  if (hasSecurity(getCookie("UserID"), "Assistant Master") && !scope.viewOnly) {
    turnDiv.css("cursor", "pointer");
    turnDiv.click(function(ev){
      ev.stopPropagation();
      ev.preventDefault();

      var ignore = duplicate(obj.data.combat.engaged);
      var content = sync.render("ui_assetPicker")(obj, app, {
        filter : "c",
        category : "c",
        rights : "Rights",
        ignore : ignore,
        sessionOnly : true,
        select : function(ev, ui, ent, options, entities){
          var sp;
          var ok;
          var id = ent.id();
          if (obj.data.combat.engaged[id]) {
            if (obj.data.combat.engaged[id].sp) {
              sp = obj.data.combat.engaged[id].sp;
            }
            if (obj.data.combat.engaged[id].ok) {
              ok = obj.data.combat.engaged[id].ok;
            }
          }
          var context = sync.defaultContext();
          context[ent.data._t] = duplicate(ent.data);
          obj.data.combat.engaged[id] = sync.executeQuery(game.templates.initiative.query, context).pool;
          obj.data.combat.engaged[id].sp = sp;
          obj.data.combat.engaged[id].ok = ok;
          if (!scope.local) {
            obj.sync("updateCombatState");
          }
          else {
            obj.update();
          }
          options.data.ignore = options.data.ignore || {};
          options.data.ignore[id] = true;
          return true;
        }
      });
      var pop = ui_popOut({
        target : $("body"),
        prompt : true,
        id : "add-asset",
        title : "Add Combatant",
        style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
      }, content);
      pop.resizable();
    });
  }

  for (var j=inits.length-1; j>=0; j--) {
    var initWrap = $("<div>").appendTo(turnDiv);
    initWrap.addClass("flexrow flexbetween");
    if (!scope.minimized) {
      initWrap.css("padding-bottom", "0.5em");
    }

    var header = $("<div>").appendTo(initWrap);
    header.addClass("flexaround");
    header.attr("turn", j);
    if (!scope.local && (compare(data.combat.current, inits[j]) != 0 || data.combat.round == null)) {
      header.click(function(ev){
        data.combat.current = inits[$(this).attr("turn")];
        obj.sync("updateCombatState");
        ev.stopPropagation();
        ev.preventDefault();
      });
    }
    else {
      header.click(function(ev){
        ev.stopPropagation();
        ev.preventDefault();
      });
    }

    if (game.templates.initiative.display) {
      if (compare(data.combat.current, inits[j]) == 0 && data.combat.round != null) { // not prepraings
        header.addClass("highlight alttext");
        initWrap.css("font-size", "1.6em");
      }
      else if (data.combat.round != null) {
        initWrap.addClass("subtitle");
      }
      var label = sync.render("ui_processUI")(obj, app, {display : game.templates.initiative.display, context : duplicate(inits[j])}).appendTo(header);
    }
    else {
      var label = $("<b>").appendTo(header);

      if (compare(data.combat.current, inits[j]) == 0 && data.combat.round != null) { // not prepraings
        initWrap.addClass("highlight");
        initWrap.css("font-size", "1.6em");
      }
      else if (data.combat.round != null) {
        initWrap.addClass("subtitle");
        label.addClass("background");
        if (obj == game.state && hasSecurity(getCookie("UserID"), "Assistant Master")) {
          label.addClass("hover2");
        }
      }
      else {
        label.addClass("background");
        if (obj == game.state && hasSecurity(getCookie("UserID"), "Assistant Master")) {
          label.addClass("hover2");
        }
      }
      if (compare(inits[j], {}) == 0) {
        label.addClass("padding flexmiddle alttext");
        label.css("font-size", "0.8em");
        label.css("padding-top", "0.05em");
        label.css("padding-bottom", "0.05em");
        label.css("max-width", "70px");
        label.append("<text>Rolling Initiative</text>");
      }
      else {
        label.addClass("padding alttext");
        label.css("font-size", "1.6em");
        label.css("padding-top", "0.05em");
        label.css("padding-bottom", "0.05em");
        label.text((inits[j].total || 0));
      }
      label.attr("turn", j);
    }

    var turnPlate = $("<div>").appendTo(initWrap);
    turnPlate.addClass("flex flexcolumn");
    turnPlate.css("border-top", "1px solid rgba(0,0,0,0.4)");

    var charPlate = $("<div>").appendTo(turnPlate);
    charPlate.addClass("fit-x flex dropContent");
    charPlate.attr("turn", j);
    charPlate.css("min-height", "20px");
    charPlate.css("min-width", "10vw");
    function sortWrap(refPlate) {
      refPlate.sortable({
        connectWith : ".dropContent",
        out : function(ev, ui){
          refPlate.removeClass("boxinshadow");
        },
        over : function(ev, ui){
          refPlate.addClass("boxinshadow");
        },
        update : function(ev, ui) {
          ev.stopPropagation();
          var newDat = duplicate(inits[refPlate.attr("turn")]);
          delete newDat.e;
          if (newDat) {
            if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
              if (obj.data.combat.engaged[$(ui.item).attr("index")]) {
                if (obj.data.combat.engaged[$(ui.item).attr("index")].sp) {
                  newDat.sp = obj.data.combat.engaged[$(ui.item).attr("index")].sp;
                }
                if (obj.data.combat.engaged[$(ui.item).attr("index")].ok) {
                  newDat.ok = obj.data.combat.engaged[$(ui.item).attr("index")].ok;
                }
              }
              obj.data.combat.engaged[$(ui.item).attr("index")] = newDat;
              $(ui.item).remove();
              ev.stopPropagation();
              if (!scope.local) {
                obj.sync("updateCombatState");
              }
              else {
                obj.update();
              }
            }
            else {
              obj.update();
            }
          }
          return false;
        }
      });
    }
    if (!scope.viewOnly) {
      sortWrap(charPlate);
    }
    if (inits[j].e && inits[j].e.length > 5) {
      charPlate.addClass("subtitle");
    }
    for (var idx in inits[j].e) {
      var index = inits[j].e[idx];
      if (game.entities.data[index]) {
        var charObj = game.entities.data[index];
        var hidden = charObj.data.info && charObj.data.info.hide;
        if (!hidden || (hidden && hasSecurity(getCookie("UserID"), "Visible", charObj.data))) {
          var charDivWrap = $("<div>").appendTo(charPlate);
          charDivWrap.addClass("flexrow flex smooth white outlinebottom");
          charDivWrap.attr("src", "state");
          charDivWrap.attr("index", index);
          charDivWrap.attr("turn", j);
          charDivWrap.css("border-right-width", "1px");

          var color = null;

          if (boardEnt && boardEnt.data) {
            for (var lid in boardEnt.data.layers) {
              var layerData = boardEnt.data.layers[lid];
              var pieces = layerData.p;
              for (var pid in pieces) {
                var pieceData = pieces[pid];
                if (pieceData.eID == index && pieceData.c != "transparent") {
                  color = pieceData.c;
                  break;
                }
              }
              if (color) {
                break;
              }
            }
          }
          if (color && (color.match("rgb\\(255,255,255") || color.match("rgb\\(255, 255, 255") || color == "white")) {
            charDivWrap.css("color", "rgb(190,190,170)");
          }
          else {
            charDivWrap.css("color", color || "#333");
          }

          var charDiv = sync.newApp("ui_characterSummary").appendTo(charDivWrap);
          charDiv.attr("viewOnly", scope.viewOnly);
          charDiv.attr("noOutline", true);
          charDiv.attr("minimized", "true");
          charDiv.attr("hide", hidden);
          charDiv.addClass("subtitle flex");
          charDiv.removeClass("application");

          if (game.templates.initiative.charMarker) {
            var context = sync.defaultContext();
            context[charObj.data._t] = duplicate(charObj.data._t);
            context["pool"] = duplicate(data.combat.engaged[index]);
            if (game.templates.initiative.charMarker.cond == null || sync.eval(game.templates.initiative.charMarker.cond, context)) {
              var label = sync.render("ui_processUI")(obj, app, {display : game.templates.initiative.charMarker, context : context}).appendTo(charDivWrap);
            }
          }

          if (data.combat.engaged[index].ok) {
            charDivWrap.css("background-color", "rgb(235,235,228)");
            if (compare(data.combat.current, inits[j]) == 0) {
              charDivWrap.css("font-size", "0.5em");
            }
          }
          if (data.combat.engaged[index].sp) {
            charDivWrap.addClass("boxinshadow");
          }
          charDiv.click(function(ev) {
            ev.stopPropagation();
          });
          charObj.addApp(charDiv);

          function visionWrap(target, cObj, charDiv, turn) {
            if (hasSecurity(getCookie("UserID"), "Rights", cObj.data)) {
              var optionsBar = $("<div>").appendTo(target);
              optionsBar.addClass("flexrow");
              optionsBar.css("font-size", "1.4em");

              if (scope.local) {
                optionsBar.addClass("subtitle");

                var surprised = genIcon("warning-sign");
                surprised.addClass("flexmiddle spadding");
                surprised.appendTo(optionsBar);
                surprised.attr("title", "Surprised (only lasts for the first turn)");
                surprised.click(function(){
                  data.combat.engaged[cObj.id()].sp = !data.combat.engaged[cObj.id()].sp;
                  data.combat.engaged[cObj.id()].ok = data.combat.engaged[cObj.id()].sp;
                  if (!scope.local) {
                    obj.sync("updateCombatState");
                  }
                  else {
                    obj.update();
                  }
                });
              }


              if (cObj.data.info.hide) {
                var eye = genIcon("eye-close");
                eye.appendTo(optionsBar);
                eye.addClass("flexmiddle spadding");
                eye.changeIcon("eye-close");
                eye.attr("title", "Show Character");
                eye.click(function(ev){
                  if (hasSecurity(getCookie("UserID"), "Rights", cObj.data)) {
                    cObj.data.info.hide = !cObj.data.info.hide;
                    if (cObj.data.info.hide) {
                      charDiv.attr("hide", true);
                      eye.changeIcon("eye-close");
                      eye.attr("title", "Show Character");
                    }
                    else {
                      charDiv.attr("hide", false);
                      eye.changeIcon("eye-open");
                      eye.attr("title", "Hide Character");
                    }
                    cObj.sync("updateAsset");
                  }
                  else {
                    eye.remove();
                  }
                  ev.stopPropagation();
                });
              }


              var ok = $("<div>");
              ok.addClass("smooth background flexmiddle spadding");
              ok.css("cursor", "pointer");
              ok.append(genIcon("ok"));
              ok.attr("title", "Complete Turn");
              if (data.combat.engaged[cObj.id()].ok) {
                ok.addClass("create");
              }
              else {
                ok.addClass("alttext");
              }
              ok.appendTo(optionsBar);
              ok.click(function(ev){
                ev.stopPropagation();
                ev.preventDefault();
                data.combat.engaged[cObj.id()].ok = !data.combat.engaged[cObj.id()].ok;
                if (!scope.local) {
                  if (data.combat.engaged[cObj.id()].ok && compare(data.combat.current, inits[turn]) == 0 && data.combat.round != null) {
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
                              obj.data.combat.engaged[key].ok = true;
                            }
                          }
                        }
                        for (var key in data.combat.engaged) {
                          if (compare(inits[newTurn], data.combat.engaged[key]) == 0) {
                            if (game.templates.initiative.skip && sync.eval(game.templates.initiative.skip, {c : duplicate(getEnt(key))})) {
                              obj.data.combat.engaged[key].ok = true;
                            }
                          }
                        }
                        console.log("change");
                        obj.data.combat.current = inits[newTurn];
                        obj.sync("updateCombatState");
                      }
                      changeTurn();
                    }
                    else {
                      obj.sync("updateCombatState");
                    }
                  }
                  else {
                    obj.sync("updateCombatState");
                  }
                }
                else {
                  obj.update();
                }
              });
              if (scope.local) {
                var remove = genIcon("remove");
                remove.addClass("flexmiddle spadding");
                remove.appendTo(optionsBar);
                remove.attr("title", "Remove From Combat");
                remove.click(function(){
                  delete data.combat.engaged[cObj.id()];
                  if (!scope.local) {
                    obj.sync("updateCombatState");
                  }
                  else {
                    obj.update();
                  }
                });
              }
            }
          }
          if (!scope.viewOnly) {
            visionWrap(charDivWrap, charObj, charDiv, j);
          }
        }
      }
    }
    if (!charPlate.children().length) {
      turnPlate.remove();
    }
  }
  if (!scope.viewOnly) {
    //var randomPadding = $("<div>").appendTo(turnDiv);
    //randomPadding.addClass("flex dropContent");
    turnDiv.sortable({
      handle : ".nothing",
      connectWith : ".dropContent",
      over : function(ev, ui){
        console.log("oer");
        if ($(ui.item).attr("index")) {
          if (!$("#"+app.attr("id")+"-drag-overlay").length) {
            var olay = layout.overlay({
              target : turnDiv,
              id : app.attr("id")+"-drag-overlay",
              style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
            });
            var maxZ = util.getMaxZ(".ui-popout");
            olay.addClass("flexcolumn flexmiddle alttext");
            olay.css("z-index", maxZ + 1);
            olay.css("font-size", "2em");
            olay.css("pointer-events", "none");
            olay.append("<b>Drop to Add Combattant</b>");
          }
        }
      },
      out : function(ev, ui) {
        layout.coverlay(app.attr("id")+"-drag-overlay");
      },
      update : function(ev, ui) {
        if ($(ui.item).attr("index")) {
          var ent = game.entities.data[$(ui.item).attr("index")];
          var sp;
          var ok;
          if (obj.data.combat.engaged[$(ui.item).attr("index")]) {
            if (obj.data.combat.engaged[$(ui.item).attr("index")].sp) {
              sp = obj.data.combat.engaged[$(ui.item).attr("index")].sp;
            }
            if (obj.data.combat.engaged[$(ui.item).attr("index")].ok) {
              ok = obj.data.combat.engaged[$(ui.item).attr("index")].ok;
            }
          }
          var context = sync.defaultContext();
          context[ent.data._t] = duplicate(ent.data);
          obj.data.combat.engaged[$(ui.item).attr("index")] = sync.executeQuery(game.templates.initiative.query, context).pool;
          obj.data.combat.engaged[$(ui.item).attr("index")].sp = sp;
          obj.data.combat.engaged[$(ui.item).attr("index")].ok = ok;
          if (!scope.local) {
            obj.sync("updateCombatState");
          }
          else {
            obj.update();
          }
        }
        ev.stopPropagation();
        layout.coverlay(app.attr("id")+"-drag-overlay");
      }
    });
    if (!turnDiv.children().length) {
      $("<i class='subtitle fit-xy flexmiddle'>Click here or Drop an asset to begin</i>").appendTo(div);
    }
  }
  return div;
});


sync.render("ui_turnOrder", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", minimized : app.attr("minimized") == "true"};

  var div = $("<div>");
  div.addClass("flexcolumn flex");
  if (!obj) {
    game.locals["turnOrder"] = game.locals["turnOrder"] || sync.obj();
    game.locals["turnOrder"].data = game.locals["turnOrder"].data || {combat : {engaged : {}, current : {}}};
    game.locals["turnOrder"].addApp(app);
    return $("<div>");
  }

  if (obj != game.state) {
    scope.local = true;
  }

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexwrap flexaround foreground alttext subtitle");

  var trash = genIcon("trash", "Clear Combat").appendTo(optionsBar);
  trash.click(function(){
    obj.data = {combat : {engaged : {}, current : {}}};
    obj.update();
  });


  var addCombatant = genIcon("plus", "Add Combatant").appendTo(optionsBar);
  addCombatant.click(function(){
    var ignore = duplicate(obj.data.combat.engaged);
    var content = sync.render("ui_assetPicker")(obj, app, {
      filter : "c",
      category : "c",
      rights : "Rights",
      ignore : ignore,
      sessionOnly : true,
      select : function(ev, ui, ent, options, entities){
        var sp;
        var ok;
        var id = ent.id();
        if (obj.data.combat.engaged[id]) {
          if (obj.data.combat.engaged[id].sp) {
            sp = obj.data.combat.engaged[id].sp;
          }
          if (obj.data.combat.engaged[id].ok) {
            ok = obj.data.combat.engaged[id].ok;
          }
        }
        var context = sync.defaultContext();
        context[ent.data._t] = duplicate(ent.data);
        obj.data.combat.engaged[id] = sync.executeQuery(game.templates.initiative.query, context).pool;
        obj.data.combat.engaged[id].sp = sp;
        obj.data.combat.engaged[id].ok = ok;
        if (!scope.local) {
          obj.sync("updateCombatState");
        }
        else {
          obj.update();
        }
        options.data.ignore = options.data.ignore || {};
        options.data.ignore[id] = true;
        return true;
      }
    });
    var pop = ui_popOut({
      target : $("body"),
      prompt : true,
      id : "add-asset",
      title : "Add Combatant",
      style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
    }, content);
    pop.resizable();
  });

  var combatList = sync.render("ui_combat")(obj || game.locals["turnOrder"], app, scope).appendTo(div);
  combatList.addClass("flex flexcolumn");

  return div;
});


var altInitiative = {
  initPrompt : function(ev, ui, ent, obj, app, scope){
    var frame = $("<div>");

    var dice = $("<div>").appendTo(frame);
    dice.addClass("flexbetween");

    var successes = $("<div>").appendTo(dice);
    successes.addClass("flexmiddle");
    successes.css("display", "inline-block");
    successes.css("width", "auto");

    var die = $("<img>").appendTo(successes);
    die.attr("src", "/content/dice/success.png");
    die.css("width", "20px");
    die.css("height", "20px");

    var sInput = genInput({
      parent : successes,
      type : "number",
      value : 0,
      style : {"width" : "50px", "display": "inline-block"},
      min : 0,
    });

    var advantages = $("<div>").appendTo(dice);
    advantages.addClass("flexmiddle");
    advantages.css("display", "inline-block");
    advantages.css("width", "auto");

    var die = $("<img>").appendTo(advantages);
    die.attr("src", "/content/dice/advantage.png");
    die.css("width", "20px");
    die.css("height", "20px");

    var input = genInput({
      parent : advantages,
      type : "number",
      value : 0,
      style : {"width" : "50px", "display": "inline-block"},
      min : 0,
    });

    var triumphs = $("<div>").appendTo(dice);
    triumphs.addClass("flexmiddle");
    triumphs.css("display", "inline-block");
    triumphs.css("width", "auto");

    var die = $("<img>").appendTo(triumphs);
    die.attr("src", "/content/dice/triumph.png");
    die.css("width", "20px");
    die.css("height", "20px");

    var tInput = genInput({
      parent : triumphs,
      type : "number",
      value : 0,
      style : {"width" : "50px", "display": "inline-block"},
      min : 0,
    });

    if ($("#turnorder-skill-list").length) {
      $("#turnorder-skill-list").remove();
    }
    var dataList = $("<datalist>").appendTo(frame);
    dataList.attr("id", "turnorder-skill-list");

    var skillRegex = /\(([^(]+[^)]+)\)/;

    for (var index in ent.data.skills) {
      var skill = ent.data.skills[index];
      if (skillRegex.exec(skill.name)) {
        var option = $("<option>").appendTo(dataList);
        option.attr("value", skill.name);
      }
    }
    var skillVal = sync.newValue("Skill", "Cool (Pr)");
    var skill = genInput({
      parent : frame,
      type : "list",
      list : "turnorder-skill-list",
      placeholder : "Select Skill to Roll Random",
      style : {"width" : "100%"},
    });

    var skillPlate = $("<div>").appendTo(frame);

    skill.change(function(){
      sync.val(skillVal, $(this).val());
      if (sync.val(skillVal)) {
        for (var idx in ent.data.skills) {
          if (ent.data.skills[idx] && ent.data.skills[idx].name.toLowerCase() == sync.val(skillVal).toLowerCase()) {
            skillPlate.empty();
            var equations = [];

            var stat;
            var skill = ent.data.skills[idx];
            var statRes = skillRegex.exec(ent.data.skills[idx].name);
            if (statRes) {
              var statName = (statRes[1].charAt(0).toUpperCase() + statRes[1].substring(1, statRes[1].length).toLowerCase());
              stat = ent.data.stats[statName];
            }

            var originalDice = sync.val(stat);
            var ranksCount = sync.modifier(skill, "rank") || 0;

            var yellowCount = 0;
            var greenCount = originalDice;

            if (ranksCount >= greenCount) {
              greenCount = (ranksCount - greenCount);
              yellowCount = originalDice;
            }
            else {
              greenCount = (greenCount - ranksCount);
              yellowCount = ranksCount;
            }
            for (var i=0; i<yellowCount; i++) {
              var val = sync.newValue("proficiency", "1d12", null , null, {"result" : sync.result("1d12")});
              equations.push(val);
            }
            for (var i=0; i<greenCount; i++) {
              var val = sync.newValue("ability", "1d8", null ,null, {"result" : sync.result("1d8")});
              equations.push(val);
            }
            var resultTable = {};
            for (var index in equations) {
              var eq = equations[index];
              var res = sync.eval(sync.modifier(eq, "result"));
              if (res) {
                for (var key in game.templates.dice.pool[eq.name].translations[res]) {
                  if (key != "imgs") {
                    resultTable[key] = (resultTable[key] || 0) + game.templates.dice.pool[eq.name].translations[res][key];
                  }
                }
              }
            }
            sInput.val(resultTable.s);
            input.val(resultTable.a);
            tInput.val(resultTable.tri);
            //sync.render("ui_diceResults")({data : {data : {equations : equations}}}, app, {viewOnly : true}).appendTo(skillPlate);
            break;
          }
        }
      }
    });

    var button = $("<button>").appendTo(frame);
    button.css("width", "100%");
    button.append("Confirm");
    button.click(function() {
      obj.data.combat.engaged[ent.id()] = {s : parseInt(sInput.val() || 0) + parseInt(tInput.val() || 0) * 1, a : parseInt(input.val() || 0) + parseInt(tInput.val() || 0) * 1, tri : parseInt(tInput.val() || 0)};
      obj.update();
      layout.coverlay("init-popout");
    });
    ui_popOut({
      target : ui,
      id : "init-popout",
    }, frame);
  },
  initLabel : function(data, ent) {
    var header = $("<div>");
    header.addClass("flexrow flexaround flexwrap");
    if (!ent) {
      header.addClass("outline smooth");
      if (data.s) {
        var success = $("<div>").appendTo(header);
        success.addClass("smargin flexmiddle");
        var die = $("<img>").appendTo(success);
        die.attr("src", "/content/dice/success.png");
        die.css("width", "20px");
        die.css("height", "20px");

        if (data.s > 1) {
          success.append("<b style='font-size:0.8em'>x"+data.s+"</b>");
        }
      }

      if (data.a) {
        var advantage = $("<div>").appendTo(header);
        advantage.addClass("smargin flexmiddle");
        var die = $("<img>").appendTo(advantage);
        die.attr("src", "/content/dice/advantage.png");
        die.css("width", "20px");
        die.css("height", "20px");

        if (data.a > 1) {
          advantage.append("<b style='font-size:0.8em'>x"+data.a+"</b>");
        }
      }
      if (header.children().length == 0) {
        header.addClass("flexmiddle lrpadding");
        header.append("<b>No Initiative</b>");
      }
    }
    else {
      if (data.tri) {
        var advantage = $("<div>").appendTo(header);
        var die = $("<img>").appendTo(advantage);
        die.attr("src", "/content/dice/triumph.png");
        die.css("width", "20px");
        die.css("height", "20px");

        if (data.tri > 1) {
          advantage.append("<b style='font-size:0.8em'>x"+data.tri+"</b>");
        }
      }
    }
    return header;
  },
}
