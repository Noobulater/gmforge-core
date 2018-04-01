sync.render("ui_charCard", function(obj, app, scope){
  var data = obj.data;
  var info = data.info;
  var charContainer = $("<div>");
  charContainer.addClass("flexcolumn flexmiddle");
  charContainer.attr("index", obj.id());

  var charOutline = $("<div>").appendTo(charContainer);
  charOutline.addClass("outline charContent");
  charOutline.css("cursor", "pointer");

  var optionsBar = $("<div>");
  if (scope.mode != "list") {
    optionsBar.appendTo(charOutline);
  }
  optionsBar.addClass("flexrow flexaround flexwrap");

  if (hasSecurity(getCookie("UserID"), "Rights", data) && !scope.viewOnly) {
    var deleteButton = genIcon("trash").appendTo(optionsBar);
    deleteButton.attr("title", "Delete Character");
    deleteButton.click(function() {
      var popOut = ui_prompt({
        target : $(this),
        id : "confirm-delete-char",
        confirm : "Delete Character",
        click : function(){
          runCommand("deleteAsset", {id: obj.id()});
          delete game.entities.data[obj.id()];
          game.entities.update();
        }
      });
    });

    var visible = genIcon("cog").appendTo(optionsBar);
    visible.attr("title", "Doesn't reveal this character's name or image");
    visible.click(function(){
      var commands = [];
      for (var key in _actions) {
        if (!_actions[key].condition || _actions[key].condition(obj)) {
          commands.push(
            {name : _actions[key].name || key,
              attr : {key : key},
              click : function(ev, ui){
                if (_actions[ui.attr("key")].click) {
                  _actions[ui.attr("key")].click(ev, ui, obj, app, scope);
                  //sendAlert({text : "Action Executed"});
                }
              }
            }
          );
        }
      }
      ui_dropMenu($(this), commands, {id : "c-actions"});
    });
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var dupe = genIcon("duplicate");
      dupe.appendTo(optionsBar);
      dupe.attr("title", "Duplicate this character");
      dupe.click(function(){
        createCharacter(duplicate(data), true);
      });
      if (scope.edit) {
        var edit = genIcon("pencil").appendTo(optionsBar);
        edit.attr("title", "Edit this character");
        edit.click(function(ev) {
          scope.edit(ev, this, obj);
        });
      }
    }

    var security = genIcon("lock").appendTo(optionsBar);
    security.attr("title", "Configure who can access this");
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        prompt : true,
        align : "bottom",
        id : "ui-rights-dialog",
      }, content);
    });
  }

  var charDiv = $("<div>").appendTo(charOutline);
  charDiv.attr("index", obj.id());
  if (!scope.mode) {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "8em");

    charContainer.css("max-width", "150px");
    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.rawVal(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle outlinebottom");

    if (sync.rawVal(info.name) && sync.rawVal(info.name).length > 20) {
      title.addClass("subtitle");
      if (sync.rawVal(info.name).length > 35) {
        title.text(sync.rawVal(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/blankchar.png")+"')");
    icon.css("background-size", "cover");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "100%");
    icon.css("height", "6em");
  }
  else if (scope.mode == "list") {
    charContainer.removeClass("flexmiddle");
    charOutline.addClass("flex flexcolumn");

    charDiv.addClass("flex flexrow");
    charDiv.css("cursor", "pointer");

    var icon = $("<img>").appendTo(charDiv);
    icon.attr("src", (sync.val(info.img) || "/content/icons/blankchar.png"));
    icon.attr("width", "auto");
    icon.attr("height", "25px");
    icon.addClass("outline");

    var title = $("<b style='text-align : center;'>"+sync.rawVal(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle flex");

    optionsBar.appendTo(charDiv);
  }
  else if (scope.mode == "large") {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "25em");

    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.rawVal(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle outlinebottom");
    title.css("font-size", "1.5em");

    if (sync.rawVal(info.name) && sync.rawVal(info.name).length > 20) {
      title.css("font-size", "1.2em");
      title.css("text-align", "center");
      if (sync.rawVal(info.name).length > 35) {
        title.text(sync.rawVal(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/blankchar.png")+"')");
    icon.css("background-size", "contain");
    icon.css("background-position", "center");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "100%");
    icon.css("height", "15em");
  }
  charDiv.click(function(ev){
    $(".card-selected").removeClass("card-selected");
    if (_down["16"] && hasSecurity(getCookie("UserID"), "Visible", obj.data)) {
      var content = sync.newApp("ui_characterSummary");
      obj.addApp(content);
      var popOut = ui_popOut({
        target: $(this),
        id: "char-summary-"+$(this).attr("index"),
      }, content);
      //popOut.resizable();
    }
    else if (scope.click) {
      scope.click(ev, $(this), obj);
    }
  });
  if (scope.label) {
    var labelDiv = $("<div>").appendTo(icon);
    labelDiv.addClass("alttext background outline subtitle spadding");
    labelDiv.css("position", "absolute");
    if (scope.label instanceof String) {
      labelDiv.append("<i>"+scope.label+"</i>");
    }
    else {
      labelDiv.append(scope.label);
    }
  }

  if (hasSecurity(getCookie("UserID"), "Owner", data) && !scope.viewOnly) {
    var syncLabel;
    if (data._c == -1) {
      syncLabel = genIcon("remove").appendTo(icon);
      syncLabel.addClass("alttext background outline");
      syncLabel.attr("title", "Duplicate to move to Asset Storage");
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
    else {
      if (data._uid) {
        if (data._sync) {
          syncLabel = genIcon("refresh").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, and is in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : false});
            ev.stopPropagation();
            return false;
          });
        }
        else {
          syncLabel = genIcon("cloud").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, but is not in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : true});
            ev.stopPropagation();
            return false;
          });
        }
      }
      else {
        syncLabel = genIcon("cloud").appendTo(icon);
        syncLabel.addClass("outline");
        syncLabel.css("background-color", "white");
        syncLabel.attr("title", "Enable Asset Storage");
        syncLabel.click(function(ev){
          var popOut = ui_prompt({
            target : $(this),
            id : "confirm-store-char",
            confirm : "Move to Asset Storage",
            click : function(){
              runCommand("storeAsset", {id: obj.id()});
              layout.coverlay("quick-storage-popout");
              syncLabel.remove();
            }
          });
          ev.stopPropagation();
          return false;
        });
      }
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
  }

  return charContainer;
});

sync.render("ui_vehicleCard", function(obj, app, scope){
  var data = obj.data;
  var info = data.info;
  var charContainer = $("<div>");
  charContainer.addClass("flexcolumn flexmiddle");
  charContainer.attr("index", obj.id());

  var charOutline = $("<div>").appendTo(charContainer);
  charOutline.addClass("outline charContent");
  charOutline.css("cursor", "pointer");

  var optionsBar = $("<div>").appendTo(charOutline);
  optionsBar.addClass("flexaround");

  if (hasSecurity(getCookie("UserID"), "Rights", data) && !scope.viewOnly) {
    var deleteButton = genIcon("trash").appendTo(optionsBar);
    deleteButton.attr("title", "Delete Vehicle");
    deleteButton.click(function() {
      var popOut = ui_prompt({
        target : $(this),
        id : "confirm-delete-vehicle",
        confirm : "Delete Vehicle",
        click : function(){
          runCommand("deleteAsset", {id: obj.id()});
          delete game.entities.data[obj.id()];
          game.entities.update();
        }
      });
    });

    var dupe = genIcon("duplicate");
    dupe.appendTo(optionsBar);
    dupe.attr("title", "Duplicate this Vehicle");
    dupe.click(function(){
      runCommand("createVehicle", data);
    });

    var security = genIcon("lock").appendTo(optionsBar);
    security.attr("title", "Configure who can access this");
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        prompt : true,
        align : "bottom",
        id : "ui-rights-dialog",
      }, content);
    });
  }

  var charDiv = $("<div>").appendTo(charOutline);
  charDiv.attr("index", obj.id());
  if (!scope.mode) {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "8em");

    charContainer.css("max-width", "150px");
    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.rawVal(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle outlinebottom");

    if (sync.rawVal(info.name) && sync.rawVal(info.name).length > 20) {
      title.addClass("subtitle")
      if (sync.rawVal(info.name).length > 35) {
        title.text(sync.rawVal(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/blankvehicle.png")+"')");
    icon.css("background-size", "cover");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "100%");
    icon.css("height", "6em");
  }
  else if (scope.mode == "list") {
    charContainer.removeClass("flexmiddle");
    charOutline.addClass("flex flexcolumn");

    charDiv.addClass("flex flexrow");
    charDiv.css("cursor", "pointer");

    var icon = $("<img>").appendTo(charDiv);
    icon.attr("src", (sync.val(info.img) || "/content/icons/blankchar.png"));
    icon.attr("width", "auto");
    icon.attr("height", "25px");
    icon.addClass("outline");

    var title = $("<b style='text-align : center;'>"+sync.rawVal(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle flex");
  }
  else if (scope.mode == "large") {
    charDiv.css("overflow-y", "hidden");
    charDiv.css("min-width", "25em");

    charDiv.css("cursor", "pointer");

    var title = $("<b style='text-align : center;'>"+sync.rawVal(info.name)+"</b>").appendTo(charDiv);
    title.addClass("flexmiddle");
    title.css("font-size", "1.5em");

    if (sync.rawVal(info.name) && sync.rawVal(info.name).length > 20) {
      title.css("font-size", "1.2em");
      title.css("text-align", "center");
      if (sync.rawVal(info.name).length > 35) {
        title.text(sync.rawVal(info.name).substring(0, 33)+"..");
      }
    }

    var icon = $("<div>").appendTo(charDiv);
    icon.css("position", "relative");
    icon.css("background-image", "url('"+(sync.val(info.img) || "/content/icons/blankvehicle.png")+"')");
    icon.css("background-size", "contain");
    icon.css("background-position", "center");
    icon.css("background-repeat", "no-repeat");
    icon.css("width", "100%");
    icon.css("height", "15em");
  }

  charDiv.click(function(ev){
    $(".card-selected").removeClass("card-selected");
    if ($(this).attr("_lastClick") && (Date.now()-$(this).attr("_lastClick") < 1000)) {
      if (scope.click) {
        scope.click(ev, $(this), obj);
      }
      else {
        if (hasSecurity(getCookie("UserID"), "Visible", obj.data)) {
          var wid = "30vw";
          if (layout.mobile) {
            wid = "auto";
          }
          var content = sync.newApp("ui_vehicle");
          obj.addApp(content);
          var popOut = ui_popOut({
            target: $(this),
            id: "vehicle-summary-"+$(this).attr("index"),
            dragThickness : "0.5em",
            title : sync.rawVal(obj.data.info.name),
            minimize : true,
            style: {"width" : wid, "max-width" : ""}
          }, content);
          popOut.resizable();
        }
      }
      $(this).removeAttr("_lastClick");
    }
    else {
      var index = $(this).attr("index");

      $(".board-selected").removeClass("board-selected");
      $(".piece").each(function(){
        if ($(this).attr("eID") == index) {
          $(this).addClass("board-selected");
        }
      });
      charOutline.addClass("card-selected");
      util.target(index);
      $(this).attr("_lastClick", Date.now());
    }
  });
  if (scope.label) {
    var labelDiv = $("<div>").appendTo(icon);
    labelDiv.addClass("alttext background outline subtitle spadding");
    labelDiv.css("position", "absolute");
    if (scope.label instanceof String) {
      labelDiv.append("<i>"+scope.label+"</i>");
    }
    else {
      labelDiv.append(scope.label);
    }
  }

  if (hasSecurity(getCookie("UserID"), "Owner", data) && !scope.viewOnly) {
    var syncLabel;
    if (data._c == -1) {
      syncLabel = genIcon("remove").appendTo(icon);
      syncLabel.addClass("alttext background outline");
      syncLabel.attr("title", "Duplicate to move to Asset Storage");
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
    else {
      if (data._uid) {
        if (data._sync) {
          syncLabel = genIcon("refresh").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, and is in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : false});
            ev.stopPropagation();
            return false;
          });
        }
        else {
          syncLabel = genIcon("cloud").appendTo(icon);
          syncLabel.addClass("alttext background outline");
          syncLabel.attr("title", "This is saved, and is not in-sync with Asset Storage");
          syncLabel.click(function(ev){
            runCommand("updateSync", {id : obj.id(), data : true});
            ev.stopPropagation();
            return false;
          });
        }
      }
      else {
        syncLabel = genIcon("cloud").appendTo(icon);
        syncLabel.addClass("outline");
        syncLabel.css("background-color", "white");
        syncLabel.attr("title", "Enable Asset Storage");
        syncLabel.click(function(ev){
          var popOut = ui_prompt({
            target : $(this),
            id : "confirm-store-char",
            confirm : "Move to Asset Storage",
            click : function(){
              runCommand("storeAsset", {id: obj.id()});
              layout.coverlay("quick-storage-popout");
              syncLabel.remove();
            }
          });
          ev.stopPropagation();
          return false;
        });
      }
      syncLabel.css("right", "0");
      syncLabel.css("bottom", "0");
      syncLabel.css("position", "absolute");
      syncLabel.css("padding", "2px");
    }
  }

  return charContainer;
});

sync.render("ui_characterList", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");
  // content creation
  if (!layout.mobile) {
    div.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!$("#"+app.attr("id")+"-drag-overlay").length) {
    		var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.append("<b>Drop to Create</b>");
      }
  	});
    div.on('drop', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer;
      var ent = JSON.parse(dt.getData("OBJ"));
      if (ent._t == "c") {
        createCharacter(ent, true);
        game.entities.update();
      }
      else if (ent._t == "v") {
        if (!game.config.data.offline) {
          runCommand("createVehicle", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }

      layout.coverlay(app.attr("id")+"-drag-overlay");
    });

  	div.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
  	});
  }

  if (!obj) {
    game.entities.addApp(app);
    game.state.addApp(app);
    return $("<div>");
  }

  var obj = game.entities;

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexaround outline background boxinshadow");
  optionsBar.css("color", "white");

  var counter = $("<b>").appendTo(optionsBar);

  var createChar = genIcon("user", "New Character").appendTo(optionsBar);
  createChar.attr("title", "Create Character");
  createChar.click(function(){
    createCharacter(duplicate(game.templates.character));
    game.entities.update();
  });

  var createVehicle = genIcon("plane", "New Vehicle").appendTo(optionsBar);
  createVehicle.attr("title", "Create a Blank Vehicle");
  createVehicle.click(function(){
    if (!game.config.data.offline) {
      runCommand("createVehicle", {data : {}});
    }
    else {
      game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
      game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
      game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.vehicle);
      game.entities.update();
    }
  });

  var charCount = 0;

  var columnList = $("<div>").appendTo(div);
  columnList.addClass("flexrow fit-y");
  columnList.css("overflow-y", "hidden");

  var listedWrap = $("<div>").appendTo(columnList);
  listedWrap.addClass("flexcolumn fit-y");
  listedWrap.css("min-width", "200px");

  var search = $("<div>").appendTo(listedWrap);
  search.addClass("outlinebottom background fit-x flexaround alttext");

  var searchIcon = genIcon("search").appendTo(search);
  searchIcon.addClass("lrpadding");
  searchIcon.attr("title", "Search");

  var searchInput = genInput({
    parent : search,
    placeholder : "Search Terms",
    value : app.attr("lastSearchTerm"),
  });
  searchInput.addClass("flex subtitle");
  searchInput.css("color", "#333");

  var listedChars = $("<div>").appendTo(listedWrap);
  listedChars.addClass("flexcolumn fit-xy");
  listedChars.attr("_lastScrollTop", app.attr("_lastScrollTop_chars"));
  listedChars.css("overflow-y", "auto");
  listedChars.css("position", "relative");
  listedChars.scroll(function(){
    app.attr("_lastScrollTop_chars", $(this).scrollTop());
  });

  var listWrap = $("<div>").appendTo(listedChars);
  listWrap.addClass("fit-x flexcolumn flexmiddle");
  listWrap.css("position", "absolute");

  var charList = sync.render("ui_entList")(game.entities, app, {
    filter : "c",
    rights : "Visible",
    draw : function(ui, charObj) {
      if (hasSecurity(getCookie("UserID"), "Owner", charObj.data)) {
        var deleteButton = genIcon("trash").appendTo(ui);
        deleteButton.attr("title", "Delete Character");
        deleteButton.click(function() {
          var popOut = ui_prompt({
            target : $(this),
            id : "confirm-delete-char",
            confirm : "Delete Character",
            click : function(){
              runCommand("deleteAsset", {id: charObj.id()});
              delete game.entities.data[charObj.id()];
              game.entities.update();
            }
          });
        });
      }
    },
    click : function(ev, ui, charObj) {
      if (hasSecurity(getCookie("UserID"), "Visible", charObj.data)) {
        if (layout.mobile) {
          obj.removeApp(app);
          game.state.removeApp(app);
          app.attr("from", app.attr("ui-name"));
          app.attr("ui-name", "ui_characterSheet");
          if (!hasSecurity(getCookie("UserID"), "Rights", charObj.data)) {
            app.attr("viewOnly", "true");
          }
          else {
            game.players.data[getCookie("UserID")].entity = charObj.id();
            runCommand("selectPlayerEntity", {id : charObj.id()});
            app.removeAttr("viewOnly");
          }
          charObj.addApp(app);
        }
        else {
          if (!_down["16"]) {
            var newApp = sync.newApp("ui_characterSheet");
            newApp.attr("from", "ui_characterSummary");
            charObj.addApp(newApp);
            if (!hasSecurity(getCookie("UserID"), "Rights", charObj.data)) {
              newApp.attr("viewOnly", "true");
            }
            else {
              game.players.data[getCookie("UserID")].entity = charObj.id();
            }
            var pop = ui_popOut({
              target : app,
              id : "char-sheet-"+charObj.id(),
              title : sync.rawVal(charObj.data.info.name),
              minimize : true,
              dragThickness : "0.5em",
              style : {width : assetTypes["c"].width, height : assetTypes["c"].height},
            }, newApp);
            pop.resizable();
          }
          else {
            var newApp = sync.newApp("ui_characterSummary");
            charObj.addApp(newApp);
            if (!hasSecurity(getCookie("UserID"), "Rights", charObj.data)) {
              newApp.attr("viewOnly", "true");
            }
            else {
              game.players.data[getCookie("UserID")].entity = charObj.id();
            }
            var pop = ui_popOut({
              target : ui,
              id : "char-summary-"+charObj.id(),
              title : sync.rawVal(charObj.data.info.name),
              minimize : true,
              dragThickness : "0.5em",
            }, newApp);
            pop.resizable();
          }
        }
      }
    }
  });
  if (charList.children().length) {
    listWrap.append("<b class='subtitle'>Characters</b>");
  }
  charList.appendTo(listWrap);
  charList.addClass("fit-x dropContent");

  if (!layout.mobile) {
    charList.sortable({
      filter : ".charContent",
      connectWith : ".dropContent",
      update : function(ev, ui) {
        if ($(ui.item).attr("gID")) {
          var gp = game.entities.data[$(ui.item).attr("gID")];
          if (gp && gp.data.list) {
            for (var gKey in gp.data.list) {
              if (gp.data.list[gKey] == $(ui.item).attr("index")) {
                gp.data.list.splice(gKey, 1);
                gp.sync("updateGroup");
                break;
              }
            }
          }
        }
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
        game.entities.update(); // refresh the list
      }
    });
  }

  var vehList = sync.render("ui_entList")(game.entities, app, {
    filter : "v",
    rights : "Visible",
    draw : function(ui, charObj) {
      if (hasSecurity(getCookie("UserID"), "Owner", charObj.data)) {
        var deleteButton = genIcon("trash").appendTo(ui);
        deleteButton.attr("title", "Delete Vehicle");
        deleteButton.click(function() {
          var popOut = ui_prompt({
            target : $(this),
            id : "confirm-delete-vehicle",
            confirm : "Delete Vehicle",
            click : function(){
              runCommand("deleteAsset", {id: charObj.id()});
              delete game.entities.data[charObj.id()];
              game.entities.update();
            }
          });
        });
      }
    },
    click : function(ev, ui, charObj) {
      if (hasSecurity(getCookie("UserID"), "Visible", charObj.data)) {
        var newApp = sync.newApp("ui_vehicle");
        charObj.addApp(newApp);
        if (!hasSecurity(getCookie("UserID"), "Rights", charObj.data)) {
          newApp.attr("viewOnly", "true");
        }
        else {
          game.players.data[getCookie("UserID")].entity = charObj.id();
        }
        var pop = ui_popOut({
          target : app,
          id : "vehicle-sheet-"+charObj.id(),
          title : sync.rawVal(charObj.data.info.name),
          minimize : true,
          dragThickness : "0.5em",
          style : {"width" : "50vw", "height" : "40vh"},
        }, newApp);
        pop.resizable();
      }
    }
  });
  if (vehList.children().length) {
    listWrap.append("<b class='subtitle'>Vehicles</b>");
  }
  vehList.appendTo(listWrap);
  vehList.addClass("fit-x dropContent");

  if (!layout.mobile) {
    vehList.sortable({
      filter : ".charContent",
      connectWith : ".dropContent",
      update : function(ev, ui) {
        if ($(ui.item).attr("gID")) {
          var gp = game.entities.data[$(ui.item).attr("gID")];
          if (gp && gp.data.list) {
            for (var gKey in gp.data.list) {
              if (gp.data.list[gKey] == $(ui.item).attr("index")) {
                gp.data.list.splice(gKey, 1);
                gp.sync("updateGroup");
                break;
              }
            }
          }
        }
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
        game.entities.update(); // refresh the list
      }
    });
  }

  searchInput.keyup(function(){
    var inputVal = ($(this).val() || "").toLowerCase();
    app.attr("lastSearchTerm", ($(this).val() || ""));
    charList.children().show();
    charList.children().each(function(){
      var ent = game.entities.data[$(this).attr("index")];
      if (!(sync.rawVal(ent.data.info.name) || "").toLowerCase().match(inputVal)) {
        $(this).hide();
      }
    });
    vehList.children().show();
    vehList.children().each(function(){
      var ent = game.entities.data[$(this).attr("index")];
      if (!(sync.rawVal(ent.data.info.name) || "").toLowerCase().match(inputVal)) {
        $(this).hide();
      }
    });
  });

  var inputVal = (searchInput.val() || "").toLowerCase();
  app.attr("lastSearchTerm", (searchInput.val() || ""));
  charList.children().each(function(){
    var ent = game.entities.data[$(this).attr("index")];
    if (!(sync.rawVal(ent.data.info.name) || "").toLowerCase().match(inputVal)) {
      $(this).hide();
    }
  });
  vehList.children().each(function(){
    var ent = game.entities.data[$(this).attr("index")];
    if (!(sync.rawVal(ent.data.info.name) || "").toLowerCase().match(inputVal)) {
      $(this).hide();
    }
  });

  var groupWrap = $("<div>").appendTo(columnList);
  groupWrap.addClass("flex outline lpadding");
  groupWrap.css("overflow-y", "auto");
  groupWrap.css("position", "relative");
  groupWrap.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  groupWrap.scroll(function(){
    app.attr("_lastScrollTop", $(this).scrollTop());
  });

  var groupList = $("<div>").appendTo(groupWrap);
  groupList.addClass("flexrow flexwrap flex");
  groupList.css("position", "absolute");

  var grouped = [];
  for (var index in obj.data) {
    var gData = obj.data[index];
    if (gData && gData.data["_t"] == "g" && hasSecurity(getCookie("UserID"), "Visible", gData.data)) {
      charCount = charCount + 1;
      var group = sync.newApp("ui_groupCard");
      group.attr("targetApp", app.attr("id"));
      group.css("width", "auto");
      group.css("display", "inline-block");
      group.css("margin", "0px 4px 0px 4px");
      gData.addApp(group);
      // get the group members and keep track of the ones that are in groups
      if (gData.data.list) {
        for (var i=0; i<gData.data.list.length; i++) {
          grouped.push(gData.data.list[i]);
        }
      }
      group.addClass("padding flex");
      group.css("min-width", "48%");
      group.removeClass("lightoutline");
      group.appendTo(groupList);
    }
  }

  counter.append("Limits : " + charCount + "/" + (game.config.data.entityLimit + game.config.data.capacity));

  return div;
});
