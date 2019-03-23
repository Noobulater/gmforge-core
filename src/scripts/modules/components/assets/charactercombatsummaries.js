sync.render("ui_characterCombatSummary", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), noOutline : app.attr("noOutline") == "true"};

  // don't edit cloud entities
  if (isNaN(obj.id()) && obj.id().match("_")) {
    scope.viewOnly = true;
    scope.local = true;
  }

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");
  obj.data.tags = obj.data.tags || {};


  var charDiv = sync.render("ui_characterSummary")(obj, app, {minimized: true, hide : obj.data._flags.hidden, width : "auto", height : scope.height || app.attr("height"), name : sync.eval(app.attr("name"), {c : duplicate(obj.data)})});
  if (scope.noOutline) {
    charDiv.removeClass("outline");
  }
  charDiv.addClass("flex hover2");
  charDiv.attr("index", obj.id());
  charDiv.appendTo(div);

  return div;
});


sync.render("ui_combatManager", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flexcolumn fit-xy");

  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};
  obj = game.entities;

  var combatApp = sync.newApp("ui_combatControls");
  combatApp.appendTo(div);
  game.state.addApp(combatApp);

  return div;
});


sync.render("ui_characterCombatList", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flexcolumn flex dropContent");
  div.sortable({
    handle : ".test",
    connectWith : ".dropContent",
    update : function(ev, ui) {
      if ($(ui.item).attr("src")) {
        if ($(ui.item).attr("src") == "state") {
          game.state.update(); // refresh the list
        }
        else if ($(ui.item).attr("src") == "players") {
          game.players.update(); // refresh the list
        }
        else {
          game.entities.data[$(ui.item).attr("src")].update(); // refresh the list
        }
      }
      else {
        game.entities.update(); // refresh the list
      }
      var state = game.state.data;
      var combat = state.combat;
      if (combat && combat.initiative) {
        runCommand("joinCombat", {id : $(ui.item).attr("index"), data : {}});
      }
      else {
        var obj = {};
        obj[$(ui.item).attr("index")] = {};
        runCommand("enableCombat", {id : $(ui.item).attr("index"), data : {data : obj}});
      }
      $(ui.item).remove();
      ev.stopPropagation();
      return false;
    }
  });

  if (!obj) {
    game.entities.addApp(app);
    return div;
  }

  var state = game.state.data;
  var combat = state.combat;

  if (combat) {
    var participants = {};
    for (var index in obj.data) {
      var charObj = obj.data[index];
      if (charObj && charObj.data["_t"] == "c") {
        if (charObj.data.counters.initiative) {
          participants[index] = sync.val(charObj.data.counters.initiative);
        }
      }
    }

    var organized = sync.render("_turnOrder")([], null, {data : participants});
    var turn = sync.val(combat.initiative) || 0;

    var turnDiv = $("<div>").appendTo(div);
    turnDiv.addClass("flexwrap");

    for (var j=organized.length-1; j>=0; j--) {
      var turnPlate = $("<div>");
      turnPlate.addClass("outline");
      turnPlate.css("min-width", "20%");
      if (j == turn) {
        turnPlate.addClass("highlight");
      }
      var header = $("<div>").appendTo(turnPlate);
      header.addClass("fit-x flexaround");
      header.append("<b>Initiative "+organized[j].i+"</b>");

      var charPlate = $("<div>").appendTo(turnPlate);
      charPlate.addClass("fit-x flexaround dropContent");
      charPlate.attr("turn", j);
      charPlate.sortable({
        handle : ".test",
        connectWith : ".dropContent",
        update : function(ev, ui) {
          if ($(ui.item).attr("src")) {
            if ($(ui.item).attr("src") == "state") {
              game.state.update(); // refresh the list
            }
            else if ($(ui.item).attr("src") == "players") {
              game.players.update(); // refresh the list
            }
            else {
              game.entities.data[$(ui.item).attr("src")].update(); // refresh the list
            }
          }
          else {
            game.entities.update(); // refresh the list
          }
          var newDat = duplicate(organized[$(ui.item).parent().attr("turn")]);
          delete newDat.e;

          runCommand("joinCombat", {id : $(ui.item).attr("index"), data : newDat});
          $(ui.item).remove();
          ev.stopPropagation();
          return false;
        }
      });
      if (organized[j]) {
        for (var idx in organized[j].e) {
          var index = organized[j].e[idx];
          if (participants[index]) {
            var charObj = obj.data[index];
            var info = charObj.data.info;
            var counters = charObj.data.counters;
            if (counters.initiative && (!info.hide || j == turn)) {
              if (!turnPlate.parent().length) {
                turnPlate.appendTo(turnDiv);
              }
              var charDiv = sync.newApp("ui_characterCombatSummary").appendTo(charPlate);
              charDiv.attr("index", charObj.id());
              charDiv.attr("src", "state");
              charObj.addApp(charDiv);
            }
          }
        }
      }
    }
  }

  return div;
});
