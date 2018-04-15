sync.render("ui_ent", function(ent, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly") == "true"}
  var info = {name : sync.val(ent.data.info.name) || "[No Name]", img : sync.val(ent.data.info.img)};
  if (ent.data["_t"] == "a") {
    info.img = info.img || "/content/icons/Book1000p.png";
  }
  if (ent.data["_t"] == "b") {
    info.img = info.img;
  }
  if (ent.data["_t"] == "c") {
    info.img = info.img || "/content/icons/blankchar.png";
  }
  if (ent.data["_t"] == "i") {
    info.img = info.img || "/content/icons/Toolbox1000p.png";
  }
  if (ent.data["_t"] == "p") {
    info.img = info.img || "/content/icons/Scroll1000p.png";
  }
  if (ent.data["_t"] == "pk") {
    info.img = info.img || "/content/icons/Chest1000p.png";
  }
  if (ent.data["_t"] == "v") {
    info.img = info.img || "/content/icons/blankvehicle.png";
  }

  var plate = $("<div>");
  plate.addClass("flexrow outline ent");
  plate.attr("index", ent.id());
  if (isNaN(ent.id()) && ent.id().match("_") && ent.data && ent.data._t != "pk") {
    plate.addClass("inactive");
  }
  var namePlate = $("<div>").appendTo(plate);
  namePlate.addClass("flexbetween flex lrpadding");

  if (ent.data["_t"] == "b" && !info.img && !ent.data.map && !layout.mobile) {
    buildBoardIcon(ent.data, "20px", "20px").appendTo(namePlate);
  }
  else if ((info.img && !scope.app) || (ent.data["_t"] == "b")) {
    var imgWrap = $("<div>").appendTo(namePlate);
    imgWrap.addClass("flexmiddle");
    imgWrap.css("width", ((parseInt(scope.height) || 20) * 3) + "px");
    imgWrap.css("height", scope.height || "auto");
    if (ent.data["_t"] == "b") {
      imgWrap.contextmenu(function(ev){
        assetTypes["img"].contextmenu(ev, $(this), ent.data.map);
        return false;
      });
      imgWrap.css("background-image", "url('"+(ent.data.map)+"')");
      imgWrap.css("background-size", "contain");
      imgWrap.css("background-repeat", "no-repeat");
      imgWrap.css("background-position", "center");
    }
    else {
      imgWrap.css("background-image", "url('"+(info.img)+"')");
      imgWrap.css("background-size", "cover");
      imgWrap.css("background-repeat", "no-repeat");
      imgWrap.css("background-position", "center 25%");
    }
    if (ent.data.tags && ent.data.tags["temp"]) {
      imgWrap.append("<b class='inactive smooth spadding subtitle' title='Assets tagged with 'temp' are deleted when their tokens are removed from a map'>Temp.</b>");
    }
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      imgWrap.addClass("hover2");
      imgWrap.click(function(ev){
        var applied = false;
        $(".application[ui-name='ui_display']").each(function(){
          if (!applied && $(this).attr("tabKey") != null) {
            if (ent.data["_t"] == "b") {
              util.slideshow(ent.data.map);
            }
            else {
              util.slideshow(info.img);
            }

            ev.stopPropagation();
            ev.preventDefault();
          }
        });
      });
    }
  }
  if (scope.app && !layout.mobile) {
    if (ent.data["_t"] != "b") {
      var img = sync.newApp("ui_image").appendTo(namePlate);
      img.removeClass("application");
      img.addClass("flexcolumn");
      img.attr("viewOnly", true);
      img.attr("mode", "preview");
      img.attr("showTemp", true);
      img.css("width", ((parseInt(scope.height) || 20) * 3) + "px");
      img.css("height", scope.height || "auto");
      ent.addApp(img);
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        img.addClass("hover2");
        img.click(function(ev){
          var applied = false;
          $(".application[ui-name='ui_display']").each(function(){
            if (!applied && $(this).attr("tabKey") != null) {
              util.slideshow(info.img);
              ev.stopPropagation();
              ev.preventDefault();
            }
          });
        });
      }
    }

    var name = sync.newApp("ui_tab");
    name.addClass("flex flexmiddle lrpadding subtitle");

    if (!scope.minimized) {
      name.addClass("spadding");
    }

    ent.addApp(name);
    name.appendTo(namePlate);
  }
  else {
    var name = $("<b>");
    name.addClass("flex flexmiddle lrpadding subtitle");
    name.text(info.name);
    name.appendTo(namePlate);
  }

  if (scope.draw) {
    scope.draw(plate, ent);
  }
  if (scope.click) {
    plate.addClass("hover2");
    function wrapClick(plate, wObj) {
      namePlate.click(function(ev){
        scope.click(ev, $(this), wObj);
      });
      /*if (wObj.data._t == "c") {
        namePlate.contextmenu(function(ev){
          if (hasSecurity(getCookie("UserID"), "Rights", wObj.data)) {
            var commands = [];
            for (var key in _actions) {
              if (!_actions[key].condition || _actions[key].condition(wObj)) {
                commands.push(
                  {name : _actions[key].name || key,
                    attr : {key : key},
                    click : function(ev, ui){
                      if (_actions[ui.attr("key")].click) {
                        _actions[ui.attr("key")].click(ev, plate, wObj, app, scope);
                      }
                    }
                  }
                );
              }
            }
            ui_dropMenu($(this), commands, {id : "c-actions"});
          }
          ev.preventDefault();
          return false
        });
      }
      else if (wObj.data._t == "p") {
        namePlate.contextmenu(function(ev){
          if (hasSecurity(getCookie("UserID"), "Rights", wObj.data)) {

          }
        });
      }*/
    }
    wrapClick(plate, ent);
  }

  plate.contextmenu(function(ev){
    if (!scope.contextmenu) {
      assetTypes.contextmenu(ev, plate, ent, app, scope);
    }
    else {
      scope.contextmenu(ev, plate, ent);
    }

    return false;
  });
  return plate;
});

sync.render("ui_entList", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true"};

  var div = $("<div>");
  div.css("overflow", "auto");

  var list = scope.list || game.entities.data;
  for (var i in list) {
    var ent = list[i];
    if (!(list[i] instanceof Object)) {
      ent = getEnt(list[i]);
    }
    if ((!scope.filter && ent) || (ent && ent.data["_t"] == scope.filter && (!scope.ignore || !scope.ignore[ent.id()]))) {
      if (!scope.rights || (hasSecurity(getCookie("UserID"), scope.rights, ent.data))) {
        var plate = sync.render("ui_ent")(ent, app, scope).appendTo(div);
        plate.removeClass("outline");
        if (i < list.length-1) {
          plate.addClass("outlinebottom");
        }
        plate.attr("key", i);
      }
    }
  }
  return div;
});

var _hiddenFolders = {};
sync.render("ui_assetManager", function(obj, app, scope) {
  scope = scope || {
    viewOnly : app.attr("viewOnly") == "true",
    category : (app.attr("category") || "c"),
    hideFolders : (app.attr("hideFolders")),
  };
  if (!obj) {
    if (scope.hideFolders) {
      app.attr("hideFolders", scope.hideFolders);
    }
    game.entities.addApp(app);
    return $("<div>");
  }

  var div = $("<div>");
  div.addClass("flexcolumn");
  div.css("min-height", "100%");

  var categories = {
    //"a" : {n : "Adventures", i : "book", ui : "ui_planner", width : "60vw", height : "80vh"},
    "c" : {n : "Actors", i : "user", ui : "ui_characterSheet", width : assetTypes["c"].width, height : assetTypes["c"].height},
    "i" : {n : "Items/Spells", i : "briefcase", ui : "ui_renderItem", width : assetTypes["i"].width, height : assetTypes["i"].height},
    "b" : {n : "Maps", i : "globe", ui : "ui_board", width : "60vw", height : "60vh"},
    "p" : {n : "Resources", i : "file", ui : "ui_editPage", width : assetTypes["p"].width, height : assetTypes["p"].height},
    //"v" : {n : "Vehicles", i : "plane", ui : "ui_vehicle", width : "50vw", height : "40vh"},
  };
  var inUse = {};

  var wrap = $("<div>").appendTo(div);
  wrap.addClass("flexrow flexwrap flexbetween alttext foreground spadding");

  var search = $("<div>").appendTo(wrap);
  search.addClass("flexrow flex flexmiddle lrmargin");

  var searchIcon = genIcon("search").appendTo(search);
  searchIcon.addClass("lrpadding");
  searchIcon.attr("title", "Search");
  /*searchIcon.click(function(){
    var newApp = sync.newApp("ui_quickSearch");

    game.locals["quicksearch"] = game.locals["quicksearch"] || sync.obj();
    game.locals["quicksearch"].data = game.locals["quicksearch"].data || {filters : {"storage" : true}};

    game.locals["quicksearch"].addApp(newApp);

    ui_popOut({
      target : $("body"),
      id : "quick-search",
      style : {width : "60vw", height : "40vh"}
    }, newApp);
  });*/

  var searchInput = genInput({
    classes : "flex",
    parent : search,
    placeholder : "Search Terms",
    style : {color : "#333"}
  }).addClass("subtitle");
  searchInput.keyup(function(ev){
    var str = ($(this).val() || "").toLowerCase();
    list.children().each(function(){
      if ($(this).attr("index") && str) {resourceWrap.hide();
        resourceWrap.hide();
        var ent = getEnt($(this).attr("index"));
        if (ent) {
          var name = (sync.rawVal(ent.data.info.name) || "").toLowerCase();
          var hide = false;
          for (var tag in ent.data.tags) {
            if (tag.match(String(str))) {
              hide = true;
              break;
            }
          }
          if (name.match(String(str))) {
            hide = true;
          }
          if (!hide) {
            $(this).hide();
          }
          else {
            $(this).show();
          }
        }
      }
      else {
        resourceWrap.show();
        $(this).fadeIn();
      }
    });
  });


  var buttonWrap = $("<div>").appendTo(wrap);
  buttonWrap.addClass("flexrow subtitle flexwrap");

  for (var i in categories) {
    if (!layout.mobile || i == "c") {
      var button = $("<button>").appendTo(buttonWrap);
      if (i == scope.category) {
        button.addClass("highlight alttext");
        button.append(genIcon(categories[i].i));
      }
      else {
        button.append(genIcon(categories[i].i).css("color", "#333"));
      }
      button.attr("type", i);
      button.attr("title", categories[i].n);
      button.click(function(){
        game.locals["newAssetList"] = [];
        app.attr("category", $(this).attr("type"));
        obj.update();
      });
    }
  }

  var libraryWrap = $("<div>").appendTo(buttonWrap);
  libraryWrap.addClass("flexcolumn flexmiddle lrmargin subtitle alttext");

  var library = genIcon("book", "Content Library").appendTo(libraryWrap);
  library.css("color", "white");
  library.click(function(){
    var newApp = sync.newApp("ui_library", null, {});

    var pop = ui_popOut({
      target : $("body"),
      id : "game-library",
      align : "left",
      minimize : true,
      prompt : true,
      title : "Game Library",
      style : {"width" : "600px", "height" : "600px"}
    }, newApp);
    pop.resizable();
  });

  var newFolder = genIcon("folder-close", "New Folder").appendTo(libraryWrap);
  newFolder.click(function(){
    var security = {};
    security[getCookie("UserID")] = 1;
    security[game.owner] = 1;
    game.config.data.organized = game.config.data.organized || [];
    game.config.data.organized.push({n : "New Folder", eIDs : [], f : []});
    if (!scope.local) {
      game.config.sync("updateConfig");
    }
    else {
      game.config.update();
    }
    rebuildFolders();
    layout.coverlay("new-folder");
  });

  var listedChars = $("<div>").appendTo(div);
  listedChars.addClass("flexcolumn flex");
  listedChars.css("position", "relative");
  listedChars.css("overflow-y", "auto");
  listedChars.attr("_lastScrollTop", app.attr("_lastScrollTop_chars"));
  listedChars.scroll(function(){
    app.attr("_lastScrollTop_chars", $(this).scrollTop());
  });

  var listWrap = $("<div>").appendTo(listedChars);
  listWrap.addClass("fit-x flexcolumn flex");

  if (!layout.mobile) {
    listedChars.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      if (!$("#"+app.attr("id")+"-drag-overlay").length) {
    		var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none", "z-index" : util.getMaxZ(".ui-popout")+1}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.css("z-index", util.getMaxZ(".ui-popout")+1);
        olay.append("<b>Drop to Create</b>");
      }
  	});
    listedChars.on('drop', function(ev, ui){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer||$(ui.draggable).data("dt");
      var ent = JSON.parse(dt.getData("OBJ"));

      game.locals["newAssetList"] = game.locals["newAssetList"] || [];
      var lastKeys = Object.keys(game.entities.data);
      game.entities.listen["newAsset"] = function(rObj, newObj, target) {
        var change = true;
        for (var key in game.entities.data) {
          if (!util.contains(lastKeys, key)) {
            game.locals["newAssetList"].push(key);
            change = false;
          }
        }
        return change;
      }
      app.attr("category", ent._t);
      if (ent._t == "b") {
        if (!game.config.data.offline) {
          runCommand("createBoard", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }
      else if (ent._t == "c") {
        createCharacter(ent, true);
        game.entities.update();
      }
      else if (ent._t == "i") {
        if (!game.config.data.offline) {
          runCommand("createItem", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }
      else if (ent._t == "p") {
        if (!game.config.data.offline) {
          runCommand("createPage", ent);
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

  	listedChars.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
  	});
  }

  var resourceWrap = $("<div>").appendTo(listWrap);

  function buildSubFolders(path, expand) {
    var folderData = sync.traverse(game.config.data.organized, path);

    var folderPlate = $("<div>");
    folderPlate.addClass("flexcolumn fit-x");

    if (expand) {
      folderPlate.css("min-height", "100%");
    }

    var folder = $("<div>").appendTo(folderPlate);
    folder.addClass("foreground alttext subtitle flexrow lrpadding dropContent");

    if (folderData.c) {
      folder.css("background", folderData.c);
    }

    var folderNameInput = genInput({
      parent : folder,
      value : folderData.n,
      classes : "middle line"
    });
    folderNameInput.change(function(){
      folderData.n = $(this).val();
      folderName.empty();
      folderName.append(genIcon((_hiddenFolders[path])?("folder-open"):("folder-close"), folderData.n, true));
      if (!scope.local) {
        game.config.sync("updateConfig");
      }
      else {
        game.config.update();
      }
      obj.update();
      folderNameInput.blur();
    });
    folderNameInput.blur(function(){
      $(this).hide();
      folderName.show();
    });
    folderNameInput.hide();

    var folderName = genIcon((_hiddenFolders[path])?("folder-open"):("folder-close"), (path == null)?("Root"):(folderData.n), true).appendTo(folder);

    folder.append("<div class='flex'></div>");
    folder.attr("path", path);
    if (path != null) {
      folder.contextmenu(function(ev){
        createFolder.click();
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      });
      folderName.click(function(ev){
        folderNameInput.show();
        folderNameInput.focus();
        $(this).hide();
        ev.stopPropagation();
        ev.preventDefault();
      });

      folder.addClass("hover2");
      folder.click(function(ev){
        if (_hiddenFolders[$(this).attr("path")]) {
          folderContents.hide();
          delete _hiddenFolders[$(this).attr("path")];
        }
        else {
          folderContents.show();
          _hiddenFolders[$(this).attr("path")] = true;
        }
        folderName.empty();
        folderName.append(genIcon((_hiddenFolders[path])?("folder-open"):("folder-close"), folderData.n, true));
      });
    }
    folder.sortable({
      handle : ".nohandle",
      connectWith : ".dropContent",
      helper: function(ev, drag) {
        return drag.clone().css("pointer-events","none").addClass("white").appendTo("body").show();
      },
      containment: "body",
      update : function(ev, ui) {
        ev.stopPropagation();
        ev.preventDefault();
        var folderData = sync.traverse(game.config.data.organized, path);
        var ui = $(ui.item);
        var newOrder = [];
        resourceList.children().each(function(){
          if ($(this).attr("arrayIndex")) {
            newOrder.push(duplicate(folderData.eIDs[$(this).attr("arrayIndex")]));
          }
        });
        if (!folderData.eIDs || newOrder.length >= folderData.eIDs.length) {
          if (!util.contains(newOrder, ui.attr("index"))) {
            newOrder.push(ui.attr("index"));
            if (ui.attr("path")) {
              var childFolder = sync.traverse(game.config.data.organized, ui.attr("path"));
              var childData = childFolder.eIDs[ui.attr("arrayIndex")];
              childFolder.eIDs.splice(ui.attr("arrayIndex"), 1);
            }
          }
          newOrder.sort(function(a,b){
            var obj1 = getEnt(a);
            var obj2 = getEnt(b);
            return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
          });
          folderData.eIDs = newOrder;
          rebuildFolders();
          if (!scope.local) {
            game.config.sync("updateConfig");
          }
          else {
            game.config.update();
          }
          obj.update();
        }
      }
    });

    //folder.append(genIcon("folder-open", "Open Folder"));

    var createFolder = genIcon("plus", "Add").appendTo(folder);
    createFolder.attr("path", path);
    createFolder.click(function(ev){

      var optionList = [];
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
        optionList.push({
          icon : "tint",
          style : {"background-color" : submenu[i], "color" : "transparent"},
          attr : {col : submenu[i]},
          click : function(ev, ui){
            var target = sync.traverse(game.config.data.organized, path);
            target.c = ui.attr("col");
            if (!scope.local) {
              game.config.sync("updateConfig");
            }
            else {
              game.config.update();
            }
            rebuildFolders();
          },
        });
      }
      optionList.push({
        icon : "tint",
        style : {"background-image" : "url('/content/checkered.png')", "color" : "transparent"},
        click : function(ev, ui){
          var target = sync.traverse(game.config.data.organized, path);
          delete target.c;
          if (!scope.local) {
            game.config.sync("updateConfig");
          }
          else {
            game.config.update();
          }
          rebuildFolders();
        }
      });
      optionList.push({
        icon : "cog",
        click : function(){
          var primaryCol = sync.render("ui_colorPicker")(obj, app, {
            hideColor : true,
            custom : true,
            colorChange : function(ev, ui, value){
              var target = sync.traverse(game.config.data.organized, path);
              target.c = value;
              if (!scope.local) {
                game.config.sync("updateConfig");
              }
              else {
                game.config.update();
              }
              rebuildFolders();
            }
          });

          ui_popOut({
            target : colPreview,
            id : "piece-color",
          }, primaryCol);
        },
      });

      var path = $(this).attr("path");
      var actionsList = [
        {
          name : "Asset",
          click : function(ev){
            var ignore = {};
            for (var i in folderData.eIDs) {
              ignore[folderData.eIDs[i]] = true;
            }
            var content = sync.render("ui_assetPicker")(obj, app, {
              ignore : ignore,
              select : function(ev, ui, ent, options, entities){
                var target = sync.traverse(game.config.data.organized, path);
                target.eIDs = target.eIDs || [];
                if (!util.contains(target.eIDs, ent.id())) {
                  target.eIDs.push(ent.id());
                  target.eIDs.sort(function(a,b){
                    var obj1 = getEnt(a);
                    var obj2 = getEnt(b);
                    return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
                  });
                  if (!scope.local) {
                    game.config.sync("updateConfig");
                  }
                  else {
                    game.config.update();
                  }
                  obj.update();
                  layout.coverlay("add-asset");
                }
                else {
                  sendAlert({text : "Asset already in folder"});
                  return false;
                }
              }
            });
            var pop = ui_popOut({
              target : $("body"),
              prompt : true,
              id : "add-asset",
              title : "Add Asset",
              style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
            }, content);
            pop.resizable();
          }
        },
        {
          name : "Color",
          align : "center",
          submenu : optionList,
        },
        {
          name : "Tag Assets",
          click : function(){
            var newTags = sync.obj();
            newTags.data = {tags : {}};
            for (var i in folderData.eIDs) {
              var ent = getEnt(folderData.eIDs[i]);
              if (ent && ent.data && ent.data.tags) {
                for (var k in ent.data.tags) {
                  if (ent.data.tags[k]) {
                    newTags.data.tags[k] = ent.data.tags[k];
                  }
                }
                for (var k in newTags.data.tags) {
                  if (!ent.data.tags[k]) {
                    delete newTags.data.tags[k];
                  }
                }
              }
            }
            newTags.data.compareTags = duplicate(newTags.data.tags);
            newTags.listen["tagListen"] = function(oldObj, newObj) {
              var folderData = sync.traverse(game.config.data.organized, path);
              for (var k in oldObj.data.tags) {
                if (!oldObj.data.tags[k] && oldObj.data.compareTags[k]) {
                  oldObj.data.compareTags[k] = false;
                }
                else if (oldObj.data.tags[k] && !oldObj.data.compareTags[k]) {
                  oldObj.data.compareTags[k] = true;
                }
              }
              for (var i in folderData.eIDs) {
                var ent = getEnt(folderData.eIDs[i]);
                if (ent && ent.data && ent.data.tags) {
                  for (var k in oldObj.data.compareTags) {
                    if (oldObj.data.compareTags[k]) {
                      ent.data.tags[k] = oldObj.data.tags[k];
                      console.log(k);
                    }
                    else {
                      delete ent.data.tags[k];
                    }
                  }
                  ent.sync("updateAsset");
                }
              }
              return true;
            }

            var content = sync.newApp("ui_tags");
            content.attr("viewOnly", scope.viewOnly);
            newTags.addApp(content);

            var frame = ui_popOut({
              target : folderPlate,
              prompt : true,
              align : "bottom",
              title : "Shared Tags",
              style : {"max-width" : folderPlate.width() || "30vw"},
              id : app.attr("id")+"-tag-list"
            }, content);
          }
        },
        {
          name : "Sub Folder",
          click : function(){
            folderData.f = folderData.f || [];
            folderData.f.push({
              n : "Sub Folder",
            });
            rebuildFolders();
            if (!scope.local) {
              game.config.sync("updateConfig");
            }
            else {
              game.config.update();
            }
          }
        }
      ];

      ui_dropMenu($(this), actionsList, {id : "add-resource"});
      ev.stopPropagation();
      ev.preventDefault();
    });
    if (path != null) {
      var destroy = genIcon("remove").appendTo(folder);
      destroy.addClass("destroy lrmargin");
      destroy.attr("title", "Remove folder");
      destroy.click(function(ev){
        ui_prompt({
          target : $(this),
          confirm : "Remove Folder?",
          click : function(){
            var index = path.split(".")[path.split(".").length-1];
            var newPath = path.substring(0, Math.max(0, (path.length)-(3+index.length))) || index;
            var parentFolder = sync.traverse(game.config.data.organized, newPath);
            if (newPath == index) {
              game.config.data.organized.splice(index, 1);
            }
            else {
              parentFolder.f.splice(index, 1);
            }
            rebuildFolders();
            if (!scope.local) {
              game.config.sync("updateConfig");
            }
            else {
              game.config.update();
            }
            obj.update();
          }
        });
        ev.stopPropagation();
        ev.preventDefault();
      });
    }

    var folderContents = $("<div>").appendTo(folderPlate);
    folderContents.addClass("flexcolumn fit-x");
    if (path && !_hiddenFolders[path]) {
      folderContents.hide();
    }
    if (expand) {
      folderContents.addClass("flex");
    }

    if (folderData.f) {
      for (var i in folderData.f) {
        buildSubFolders(path+".f."+i).css("padding-left", "1em").appendTo(folderContents);
      }
    }
    var resourceList = $("<div>").appendTo(folderContents);
    if (expand) {
      resourceList.addClass("flex");
    }

    if (folderData.eIDs && folderData.eIDs.length) {
      resourceList.attr("path", path);
      resourceList.addClass("outline smooth dropContent");
      resourceList.css("margin-left", "1em");
      resourceList.sortable({
        helper: function(ev, drag) {
          return drag.clone().css("pointer-events","none").addClass("white").appendTo("body").show();
        },
        containment: "body",
        connectWith : ".dropContent",
        start : function(ev, ui)
        {
          $(ui.item).trigger("dragstart");
        },
        update : function(ev, ui) {
          ev.stopPropagation();
          ev.preventDefault();

          var folderData = sync.traverse(game.config.data.organized, path);
          var ui = $(ui.item);
          var newOrder = [];
          resourceList.children().each(function(){
            if ($(this).attr("arrayIndex")) {
              newOrder.push(duplicate(folderData.eIDs[$(this).attr("arrayIndex")]));
            }
          });
          if (!folderData.eIDs || newOrder.length >= folderData.eIDs.length) {
            if (!util.contains(newOrder, ui.attr("index"))) {
              newOrder.push(ui.attr("index"));
              if (ui.attr("path")) {
                var childFolder = sync.traverse(game.config.data.organized, ui.attr("path"));
                var childData = childFolder.eIDs[ui.attr("arrayIndex")];
                childFolder.eIDs.splice(ui.attr("arrayIndex"), 1);
              }
            }
            newOrder.sort(function(a,b){
              var obj1 = getEnt(a);
              var obj2 = getEnt(b);
              return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
            });
            folderData.eIDs = newOrder;
            rebuildFolders();
            if (!scope.local) {
              game.config.sync("updateConfig");
            }
            else {
              game.config.update();
            }
            obj.update();
          }
        }
      });
      var removeID = [];
      for (var i in folderData.eIDs) {
        var ent = getEnt(folderData.eIDs[i]);
        if (!ent || !ent.data) {
          removeID.push(i);
        }
      }
      for (var i=removeID.length-1; i>=0; i--) {
        folderData.eIDs.splice(removeID[i], 1);
      }
      var entPlate;
      for (var i in folderData.eIDs) {
        var ent = getEnt(folderData.eIDs[i]);
        if (ent && ent.data) {
          inUse[folderData.eIDs[i]] = true;
          var entPlate = sync.render("ui_ent")(ent, resourceList, {
            minimized : true,
            app : true,
            draw : function(ui, charObj) {
              ui.css("font-size", "1.2em");
              ui.removeClass("outline");
              ui.attr("draggable",true);
              ui.on("dragstart", function(ev){
                ui.data("dt",new DataTransfer())
                var dt = ui.data("dt");
                dt.setData("OBJ", JSON.stringify(charObj.data));
              });

              if (charObj.data._t == "b" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
                var button = $("<button>").appendTo(ui);
                button.addClass("subtitle hover2");

                var deleteButton = genIcon("eye-close", "GM Only").appendTo(button);
                deleteButton.attr("title", "Use Map as a GM Only tab");
                deleteButton.css("color", "#333");
                button.click(function() {
                  game.state.data.tabs = game.state.data.tabs || [];
                  var useTab = true;
                  for (var i in game.state.data.tabs) {
                    if (game.state.data.tabs[i].index == charObj.id()) {
                      useTab = false;
                      break;
                    }
                  }

                  if (useTab) {
                    game.state.data.tabs.push({index : charObj.id(), ui : "ui_board", _s : {"default" : "@:gm()"}});
                    game.state.sync("updateState");
                    layout.coverlay($(this).attr("id")+"-actions");
                  }
                  else {
                    sendAlert({text : "Map already in use"});
                  }
                });
              }
              else if (charObj.data._t == "p") {
                var button = $("<button>").appendTo(ui);
                button.addClass("subtitle hover2");

                var deleteButton = genIcon("eye-open", "View").appendTo(button);
                deleteButton.attr("title", "View Page");
                deleteButton.css("color", "#333");
                button.click(function() {
                  var content = sync.newApp("ui_renderPage");
                  content.attr("viewOnly", true);
                  charObj.addApp(content);
                  var popout = ui_popOut({
                    title : sync.rawVal(charObj.data.info.name),
                    target : ui,
                    align : "bottom",
                    minimize : true,
                    maximize : true,
                    prompt : true,
                    dragThickness : "0.5em",
                    resizable : true,
                    style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
                  }, content);
                  popout.resizable();
                  popout.css("padding", "0px");
                  popout.addClass("floating-app");
                });
              }
              if (game.locals["newAssetList"] && util.contains(game.locals["newAssetList"], charObj.id())) {
                var button = $("<div>").appendTo(ui);
                button.addClass("subtitle flexmiddle");

                var newLabel = $("<text>").appendTo(button);
                newLabel.addClass("highlight smooth alttext flexmiddle lrpadding");
                newLabel.text("New");
              }
              if (hasSecurity(getCookie("UserID"), "Owner", charObj.data)) {
                var button = $("<div>").appendTo(ui);
                button.addClass("subtitle flexmiddle");

                var deleteButton = genIcon("remove").appendTo(button);
                deleteButton.addClass("destroy");
                deleteButton.css("margin-right", "4px");
                deleteButton.attr("title", "Remove asset from folder");
                deleteButton.click(function() {
                  var ui = $(this).parent().parent().parent();
                  if (ui.attr("path")) {
                    var childFolder = sync.traverse(game.config.data.organized, ui.attr("path"));
                    var childData = childFolder.eIDs[ui.attr("arrayIndex")];
                    childFolder.eIDs.splice(ui.attr("arrayIndex"), 1);
                    if (!scope.local) {
                      game.config.sync("updateConfig");
                    }
                    else {
                      game.config.update();
                    }
                    obj.update();
                  }
                });
              }
              ui.addClass("fit-x");
            },
            click : function(ev, ui, charObj) {
              if (scope.category == "c") {
                charClick(ev, $("body"), charObj, obj, app, scope);
              }
              else if (scope.category == "b") {
                game.state.data.tabs = game.state.data.tabs || [];
                var useTab = true;
                for (var i in game.state.data.tabs) {
                  if (game.state.data.tabs[i].index == charObj.id()) {
                    useTab = false;
                    break;
                  }
                }

                if (useTab) {
                  game.state.data.tabs.push({index : charObj.id(), ui : "ui_board"});
                  game.state.sync("updateState");
                  layout.coverlay($(this).attr("id")+"-actions");
                }
                else {
                  sendAlert({text : "Map already in use"});
                }
              }
              else {
                var content = sync.newApp(categories[scope.category].ui);
                content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", charObj.data));
                var popout = ui_popOut({
                  title : sync.rawVal(charObj.data.info.name),
                  target : $("body"),
                  minimize : true,
                  maximize : true,
                  dragThickness : "0.5em",
                  resizable : true,
                  style : {width : categories[scope.category].width, height : categories[scope.category].height},
                }, content);
                popout.css("padding", "0px");
                popout.addClass("floating-app");

                charObj.addApp(content);
              }
            }
          }).appendTo(resourceList);
          entPlate.attr("path", path);
          entPlate.attr("index", ent.id());
          entPlate.attr("arrayIndex", i);
          entPlate.addClass("outlinebottom");
        }
      }
      if (!expand && entPlate) {
        entPlate.removeClass("outlinebottom");
      }
    }

    return folderPlate;
  }

  function rebuildFolders(){
    resourceWrap.empty();
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      for (var i in game.config.data.organized) {
        buildSubFolders(String(i), true).appendTo(resourceWrap);
      }
    }
  }
  rebuildFolders();

  var entList = [];
  for (var i in game.entities.data) {
    if (game.entities.data[i] && game.entities.data[i].data && game.entities.data[i].data._t == scope.category) {
      entList.push(i);
    }
  }
  entList.sort(function(obj1, obj2){
    if (game.locals["newAssetList"]) {
      if (util.contains(game.locals["newAssetList"], obj1) && !util.contains(game.locals["newAssetList"], obj2)) {
        return -1;
      }
      else if (util.contains(game.locals["newAssetList"], obj1) && util.contains(game.locals["newAssetList"], obj2)) {
        var obj1 = getEnt(obj1);
        var obj2 = getEnt(obj2);
        return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
      }
      else if (!util.contains(game.locals["newAssetList"], obj1) && util.contains(game.locals["newAssetList"], obj2)) {
        return 1;
      }
    }
    var obj1 = getEnt(obj1);
    var obj2 = getEnt(obj2);
    return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
  });

  var list = sync.render("ui_entList")(game.entities, app, {
    filter : scope.category, rights : "Visible",
    list : entList,
    minimized : true,
    app : true,
    draw : function(ui, charObj) {
      ui.css("font-size", "1.4em");
      ui.attr("draggable",true);
      ui.on("dragstart", function(ev){
        ui.data("dt",new DataTransfer())
        var dt = ui.data("dt");
        dt.setData("OBJ", JSON.stringify(charObj.data));
      });

      if (charObj.data._t == "b" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
        var button = $("<button>").appendTo(ui);
        button.addClass("subtitle hover2");

        var deleteButton = genIcon("eye-close", "GM Only").appendTo(button);
        deleteButton.attr("title", "Use Map as a GM Only tab");
        deleteButton.css("color", "#333");
        button.click(function() {
          game.state.data.tabs = game.state.data.tabs || [];
          var useTab = true;
          for (var i in game.state.data.tabs) {
            if (game.state.data.tabs[i].index == charObj.id()) {
              useTab = false;
              break;
            }
          }

          if (useTab) {
            game.state.data.tabs.push({index : charObj.id(), ui : "ui_board", _s : {"default" : "@:gm()"}});
            game.state.sync("updateState");
            layout.coverlay($(this).attr("id")+"-actions");
          }
          else {
            sendAlert({text : "Map already in use"});
          }
        });
      }
      else if (charObj.data._t == "p") {
        var button = $("<button>").appendTo(ui);
        button.addClass("subtitle hover2");

        var deleteButton = genIcon("eye-open", "View").appendTo(button);
        deleteButton.attr("title", "View Page");
        deleteButton.css("color", "#333");
        button.click(function() {
          var content = sync.newApp("ui_renderPage");
          content.attr("viewOnly", true);
          charObj.addApp(content);
          var popout = ui_popOut({
            title : sync.rawVal(charObj.data.info.name),
            target : ui,
            align : "bottom",
            minimize : true,
            maximize : true,
            prompt : true,
            dragThickness : "0.5em",
            resizable : true,
            style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
          }, content);
          popout.resizable();
          popout.css("padding", "0px");
          popout.addClass("floating-app");
        });
      }
      if (game.locals["newAssetList"] && util.contains(game.locals["newAssetList"], charObj.id())) {
        var button = $("<div>").appendTo(ui);
        button.addClass("subtitle flexmiddle");

        var newLabel = $("<text>").appendTo(button);
        newLabel.addClass("highlight smooth alttext flexmiddle lrpadding");
        newLabel.text("New");
      }
      if (hasSecurity(getCookie("UserID"), "Owner", charObj.data)) {
        var button = $("<div>").appendTo(ui);
        button.addClass("subtitle flexmiddle");

        var deleteButton = genIcon("trash").appendTo(button);
        deleteButton.css("margin-right", "4px");
        deleteButton.attr("title", "Delete Asset");
        deleteButton.click(function() {
          var popOut = ui_prompt({
            target : $(this),
            id : "confirm-delete-asset",
            confirm : "Delete Asset",
            click : function(){
              runCommand("deleteAsset", {id: charObj.id()});
              delete game.entities.data[charObj.id()];
              game.entities.update();
            }
          });
        });
      }
      ui.addClass("fit-x");
    },
    click : function(ev, ui, charObj) {
      if (scope.category == "c") {
        charClick(ev, $("body"), charObj, obj, app, scope);
      }
      else if (scope.category == "b") {
        game.state.data.tabs = game.state.data.tabs || [];
        var useTab = true;
        for (var i in game.state.data.tabs) {
          if (game.state.data.tabs[i].index == charObj.id()) {
            useTab = false;
            break;
          }
        }

        if (useTab) {
          game.state.data.tabs.push({index : charObj.id(), ui : "ui_board"});
          game.state.sync("updateState");
          layout.coverlay($(this).attr("id")+"-actions");
        }
        else {
          sendAlert({text : "Map already in use"});
        }
      }
      else {
        var content = sync.newApp(categories[scope.category].ui);
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", charObj.data));
        var popout = ui_popOut({
          title : sync.rawVal(charObj.data.info.name),
          target : $("body"),
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {width : categories[scope.category].width, height : categories[scope.category].height},
        }, content);
        popout.css("padding", "0px");
        popout.addClass("floating-app");

        charObj.addApp(content);
      }
    }
  });
  list.addClass("white dropContent flex");

  list.appendTo(listWrap);
  if (list.children().length) {
    list.children().each(function(){
      $(this).removeClass("outline");
      $(this).addClass("outlinebottom");
      if (inUse[$(this).attr("index")]) {
        $(this).hide();
      }
    });
  }
  if (!layout.mobile) {
    list.sortable({
      connectWith : ".dropContent",
      start : function(ev, ui) {
        listedChars.scrollTop(0);
        $(ui.item).trigger("dragstart");
      },
      helper: function(ev, drag) {
        return drag.clone().css("pointer-events","none").addClass("white").appendTo("body").show();
      },
      containment: "body",
      update : function(ev, ui) {
        ev.stopPropagation();
        ev.preventDefault();
        var ui = $(ui.item);
        if (ui.attr("path") && ui.attr("arrayIndex")) {
          var childFolder = sync.traverse(game.config.data.organized, ui.attr("path"));
          var childData = childFolder.eIDs[ui.attr("arrayIndex")];
          childFolder.eIDs.splice(ui.attr("arrayIndex"), 1);
          if (!scope.local) {
            game.config.sync("updateConfig");
          }
          else {
            game.config.update();
          }
          obj.update();
        }
      }
    });
  }


  $("<i class='subtitle fit-x flexmiddle'>Drop assets onto a map</i>").appendTo(div);

  var creationBar = $("<div>").appendTo(div);
  creationBar.addClass("flexrow flexbetween foreground padding subtitle alttext");

  //if (scope.category == "b") {
  //}
  //else if (scope.category == "c") {
    var createChar = genIcon("user", "New Actor").appendTo(creationBar);
    createChar.attr("title", "Create Actor");
    createChar.click(function(){
      app.attr("category", "c");
      createCharacter(duplicate(game.templates.character), null, null, null, true);
      sendAlert({text : "Created Actor"});
      app.removeAttr("hideAssets");
      game.entities.update();
    });
  //}
  //else if (scope.category == "i") {
    var button = genIcon("briefcase", "New Item");
    button.attr("title", "Create a new Item/Spell");
    button.appendTo(creationBar);
    button.click(function() {
      app.attr("category", "i");
      app.removeAttr("hideAssets");
      game.locals["newAssetList"] = game.locals["newAssetList"] || [];
      var lastKeys = Object.keys(game.entities.data);
      game.entities.listen["newAsset"] = function(rObj, newObj, target) {
        var change = true;
        for (var key in game.entities.data) {
          if (!util.contains(lastKeys, key)) {
            game.locals["newAssetList"].push(key);
            change = false;
          }
        }
        return change;
      }
      if (!game.config.data.offline) {
        runCommand("createItem", {});
      }
      else {
        game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
        game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
        game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.item);
        game.entities.update();
      }
      sendAlert({text : "Created Item"});
    });
  //}
  //else if (scope.category == "p") {
  var button = genIcon("globe", "New Map").appendTo(creationBar);
  button.addClass("lrpadding");
  button.attr("title", "Creates a New Map");
  button.click(function(){
    ui_prompt({
      target : $(this),
      inputs : {
        "Map Name" : {placeholder : "[No Name]"},
      },
      click : function(ev, inputs){
        app.attr("category", "b");
        app.removeAttr("hideAssets");
        game.locals["newAssetList"] = game.locals["newAssetList"] || [];
        var lastKeys = Object.keys(game.entities.data);
        game.entities.listen["newAsset"] = function(rObj, newObj, target) {
          var change = true;
          for (var key in game.entities.data) {
            if (!util.contains(lastKeys, key)) {
              game.locals["newAssetList"].push(key);
              change = false;
            }
          }
          return change;
        }
        if (!game.config.data.offline) {
          runCommand("createBoard", {info : {name : sync.newValue("Name", inputs["Map Name"].val() || "[No Name]")}});
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;

          var board = {"_t" : "b"};
          board.info = {name : sync.newValue(null, "[No Name]")};
          board.sheets = [];
          board.layers = [{
            n : "Background Layer",
            t : [],
            p : [],
            d : [],
          },
          {
            n : "Player Layer",
            t : [], //tiles
            p : [], //pieces
            d : [], //drawing
          },
          {
            n : "GM Layer",
            _s : 1,
            t : [], //tiles
            p : [], //pieces
            d : [], //drawing
          }];

          board.w = 1600;
          board.h = 1600;
          board.gridX = 0;
          board.gridY = 0;
          board.gridW = 32;
          board.gridH = 32;
          board.gc = "rgba(0,0,0,0.25)";
          board.vZ = 100;

          board.options = {};
          game.entities.data["tempObj"+game.config.data.offline++].data = board;
          game.entities.update();
        }
        sendAlert({text : "Created map"});
      }
    });
  });


  var button = genIcon("file", "New Resource");
  button.attr("title", "Create a new Resource");
  button.appendTo(creationBar);
  button.click(function() {
    app.attr("category", "p");
    game.locals["newAssetList"] = game.locals["newAssetList"] || [];
    var lastKeys = Object.keys(game.entities.data);
    game.entities.listen["newAsset"] = function(rObj, newObj, target) {
      var change = true;
      for (var key in game.entities.data) {
        if (!util.contains(lastKeys, key)) {
          game.locals["newAssetList"].push(key);
          change = false;
        }
      }
      return change;
    }
    app.removeAttr("hideAssets");
    if (!game.config.data.offline) {
      var content = $("<div>");
      var contentList = $("<div>").appendTo(content);
      for (var key in util.resourceTypes) {
        var button = $("<div>")
        button.addClass("hover2 alttext spadding flexmiddle");
        button.attr("type", util.resourceTypes[key]);
        if (util.resourceTypes[key] == "Rich Text") {
          button.appendTo(content);
          button.addClass("highlight");
          button.text("Normal Notes");
        }
        else {
          button.addClass("background subtitle");
          button.appendTo(contentList);
          button.text(util.resourceTypes[key]);
        }
        button.click(function(){
          runCommand("createPage", {data : {override : {info : {mode : sync.newValue("Mode", $(this).attr("type"))}}}});
          layout.coverlay("resource-select");
          sendAlert({text : "Created Resource"});
        });
      }
      ui_popOut({
        prompt : true,
        title : "Type",
        align : "top",
        target : $(this),
        id : "resource-select"
      }, content);
    }
    else {
      game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
      game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
      game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.page);
      game.entities.update();
    }
  });


  return div;
});
