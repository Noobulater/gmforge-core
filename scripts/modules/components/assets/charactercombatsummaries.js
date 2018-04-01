sync.render("ui_characterCombatSummary", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), noOutline : app.attr("noOutline") == "true"};

  // don't edit cloud entities
  if (isNaN(obj.id()) && obj.id().match("_")) {
    scope.viewOnly = true;
    scope.local = true;
  }

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var charDiv = sync.render("ui_characterSummary")(obj, app, {minimized: true, hide : obj.data.info.hide, width : "auto", height : scope.height || app.attr("height"), name : sync.eval(app.attr("name"), {c : duplicate(obj.data)})});
  if (scope.noOutline) {
    charDiv.removeClass("outline");
  }
  charDiv.addClass("flex hover2");
  charDiv.attr("index", obj.id());
  charDiv.appendTo(div);

  var wounds = sync.traverse(obj.data, game.templates.display.sheet.health || "counters.wounds");

  if (wounds && (hasSecurity(getCookie("UserID"), "Visible", obj.data) || app.attr("showbars") == "true")) {
    var woundsBar = $("<div>");
    var altStatBar = $("<div>");
    var statBar = $("<div>").appendTo(div);

    woundsBar.appendTo(statBar);
    woundsBar.addClass("flexrow flexmiddle subtitle lrpadding");
    if (!scope.viewOnly && hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
      var remove = genIcon("minus").appendTo(woundsBar);
      remove.addClass("lrpadding");
      remove.click(function(ev){
        sync.val(wounds, sync.val(wounds)-1);
        obj.sync("updateAsset");
        ev.stopPropagation();
      });
    }

    var woundLabel = $("<b>"+wounds.name+":"+sync.val(wounds)+"/"+wounds.max+"</b>").appendTo(woundsBar);
    woundLabel.addClass("flexmiddle");
    if (scope.viewOnly || (app.attr("showbars") == "true" && !(hasSecurity(getCookie("UserID"), "Rights", obj.data)))) {
      woundLabel.addClass("lrpadding");
    }
    if (!scope.viewOnly && hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
      woundLabel.addClass("hover2");
      woundLabel.css("pointer-events", "auto");
      woundLabel.click(function(ev){
        var newApp = sync.newApp("ui_maxbox");
        newApp.attr("lookup", game.templates.display.sheet.health || "counters.wounds");
        newApp.attr("viewOnly", scope.viewOnly);

        obj.addApp(newApp);
        ui_popOut({
          target : $(this),
          id : "assign",
        }, newApp);
        ev.stopPropagation();
      });
    }
    if (!scope.viewOnly && hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
      var add = genIcon("plus").appendTo(woundsBar);
      add.addClass("lrpadding");
      add.click(function(ev){
        sync.val(wounds, sync.val(wounds)+1);
        obj.sync("updateAsset");
        ev.stopPropagation();
      });
    }
    if (wounds.max) {
      var progress = $("<div>").appendTo(woundsBar);
      progress.addClass("outline flex");
      progress.css("position", "relative");
      progress.css("border-radius", "2px");
      progress.css("height", "8px");
      progress.css("min-width", "20px");

      var percentage = Number(sync.val(wounds))/Number(wounds.max || sync.val(wounds));
      var col = "rgb("+(200-Math.ceil(200 * percentage))+","+(Math.ceil(200 * percentage))+",0)";
      progress.css("background-color", col);

      var bar = $("<div>").appendTo(progress);
      if (percentage != 1) {
        bar.addClass("outline");
      }
      bar.css("position", "absolute");
      bar.css("right", 0);
      bar.css("width", 100-Math.ceil(sync.val(wounds)/wounds.max * 105)+"%");
      bar.css("background-color", "grey");
      bar.css("height", "100%");

      woundsBar.appendTo(statBar);
      woundsBar.addClass("flexrow flexmiddle subtitle");
    }

    if (game.templates.display.sheet.altStat && obj.data.counters[game.templates.display.sheet.altStat]) {
      var altStat = obj.data.counters[game.templates.display.sheet.altStat];
      altStatBar.appendTo(statBar);
      altStatBar.addClass("flexrow flexmiddle subtitle");
      woundsBar.css("pointer-events", "none");
      altStatBar.css("pointer-events", "none");
      if (app.attr("altStat") == "true") {
        woundsBar.hide();
      }
      else {
        altStatBar.hide();
      }
      statBar.mousemove(function(ev) {
        if (_down["17"]) {
          woundsBar.hide();
          altStatBar.show();
        }
      });
      statBar.hover(function(ev){
        if (_down["17"]) {
          woundsBar.hide();
          altStatBar.show();
        }
      },
      function(){
        woundsBar.show();
        altStatBar.hide();
        app.removeAttr("altStat");
      });
      if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
        var remove = genIcon("minus").appendTo(altStatBar);
        remove.addClass("lrpadding");
        remove.click(function(ev){
          app.attr("altStat", true);
          sync.val(altStat, sync.val(altStat)-1);
          obj.sync("updateAsset");
          ev.stopPropagation();
        });
      }

      var altLabel = $("<b style='padding-right : 4px'>"+altStat.name+"."+sync.val(altStat)+"/"+altStat.max+"</b>").appendTo(altStatBar);
      altLabel.addClass("flexmiddle");
      if (!scope.viewOnly) {
        altLabel.addClass("hover2");
        altLabel.css("pointer-events", "auto");
        altLabel.click(function(){
          var newApp = sync.newApp("ui_maxbox");
          newApp.attr("lookup", "counters."+game.templates.display.sheet.altStat);
          newApp.attr("viewOnly", scope.viewOnly);

          obj.addApp(newApp);
          ui_popOut({
            target : $(this),
            id : "assign",
          }, newApp);
        });
      }
      if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
        var add = genIcon("plus").appendTo(altStatBar);
        add.addClass("lrpadding");
        add.click(function(ev){
          app.attr("altStat", true);
          sync.val(altStat, sync.val(altStat)+1);
          obj.sync("updateAsset");
          ev.stopPropagation();
        });
      }
      if (altStat.max) {
        var progress = $("<div>").appendTo(altStatBar);
        progress.addClass("outline flex");
        progress.css("position", "relative");
        progress.css("border-radius", "2px");
        progress.css("height", "8px");
        progress.css("min-width", "20px");

        var percentage = Number(sync.val(altStat))/Number(wounds.max || sync.val(altStat));
        var col = "rgb(200,200,0)";
        progress.css("background-color", col);

        var bar = $("<div>").appendTo(progress);
        if (percentage != 1) {
          bar.addClass("outline");
        }
        bar.css("position", "absolute");
        bar.css("right", 0);
        bar.css("width", 100-Math.ceil(sync.val(altStat)/altStat.max * 105)+"%");
        bar.css("background-color", "grey");
        bar.css("height", "100%");
      }
    }
  }

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
