sync.render("ui_library", function(obj, app, scope) {
  scope = scope || {viewOnly : (app.attr("viewOnly") == "true")};

  game.locals["gameLibrary"] = game.locals["gameLibrary"] || sync.obj();
  obj = game.locals["gameLibrary"];

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  /*$("<b class='flexmiddle fit-x subtitle alttext'>Content Type</b>").appendTo(optionsBar);

  var curSession = $("<div>").appendTo(optionsBar);
  curSession.addClass("flexmiddle outline bold spadding white smooth hover2 highlight alttext");
  curSession.text("Current Session");
  curSession.click(function(){
    $(this).addClass("highlight alttext");
    gameList.removeClass("highlight alttext");
    obj.data = {
      a : [],
      b : [],
      c : [],
      p : [],
      v : [],
      inventory : [],
      talents : [],
      spellbook : [],
    };
    for (var i in game.entities.data) {
      var ent = game.entities.data[i];
      if (hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
        if (ent.data._t == "b") {
          obj.data.b.push(ent.data);
        }
        if (ent.data._t == "c") {
          obj.data.c.push(ent.data);
          for (var i in ent.data.inventory) {
            var item = JSON.stringify(ent.data.inventory[i]);
            if (!util.contains(obj.data.inventory, item)) {
              obj.data.inventory.push(item);
            }
          }
          for (var i in ent.data.spellbook) {
            var item = JSON.stringify(ent.data.spellbook[i]);
            if (!util.contains(obj.data.spellbook, item)) {
              obj.data.spellbook.push(item);
            }
          }
        }
        if (ent.data._t == "p") {
          obj.data.p.push(ent.data);
        }
        if (ent.data._t == "v") {
          obj.data.v.push(ent.data);
          for (var i in ent.data.inventory) {
            var item = JSON.stringify(ent.data.inventory[i]);
            if (!util.contains(obj.data.inventory, item)) {
              obj.data.inventory.push(item);
            }
          }
        }
      }
    }
    for (var i in obj.data.inventory) {
      obj.data.inventory[i] = JSON.parse(obj.data.inventory[i]);
    }
    for (var i in obj.data.spellbook) {
      obj.data.spellbook[i] = JSON.parse(obj.data.spellbook[i]);
    }
    obj.data.inventory.sort(function(obj1, obj2){
      return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
    });
    obj.data.spellbook.sort(function(obj1, obj2){
      return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
    });
    app.removeAttr("library");
    obj.update();
  });

  var gameList = $("<div>").appendTo(optionsBar);
  gameList.addClass("flexmiddle outline bold spadding white smooth hover2");
  gameList.text("Game Library");

  gameList.click(function(){
    $(this).addClass("highlight alttext");
    curSession.removeClass("highlight alttext");*/
  var localList = game.config.data.library || [];
  obj.data = {
    a : [],
    b : [],
    c : [],
    p : [],
    v : [],
    inventory : [],
    talents : [],
    spellbook : [],
    custom : true,
  };
  if (localList) {
    // loads the content package so we can merge it's contents
    if (localList.a && localList.a.length) {
      obj.data.a = obj.data.a.concat(duplicate(localList.a));
    }
    if (localList.b && localList.b.length) {
      obj.data.b = obj.data.b.concat(duplicate(localList.b));
    }
    if (localList.c && localList.c.length) {
      obj.data.c = obj.data.c.concat(duplicate(localList.c));
    }
    if (localList.p && localList.p.length) {
      obj.data.p = obj.data.p.concat(duplicate(localList.p));
    }
    if (localList.v && localList.v.length) {
      obj.data.v = obj.data.v.concat(duplicate(localList.v));
    }
    if (localList.inventory && localList.inventory.length) {
      obj.data.inventory = obj.data.inventory.concat(duplicate(localList.inventory));
    }
    if (localList.talents && localList.talents.length) {
      obj.data.talents = obj.data.talents.concat(duplicate(localList.talents));
    }
    if (localList.spellbook && localList.spellbook.length) {
      obj.data.spellbook = obj.data.spellbook.concat(duplicate(localList.spellbook));
    }
  }

  obj.data.a.sort(function(obj1, obj2){
    return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
  });
  obj.data.b.sort(function(obj1, obj2){
    return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
  });
  obj.data.c.sort(function(obj1, obj2){
    return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
  });
  obj.data.p.sort(function(obj1, obj2){
    return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
  });
  obj.data.v.sort(function(obj1, obj2){
    return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
  });

  obj.data.inventory.sort(function(obj1, obj2){
    return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
  });
  obj.data.talents.sort(function(obj1, obj2){
    return sync.rawVal(obj1.name).toLowerCase().localeCompare(sync.rawVal(obj2.name).toLowerCase());
  });
  obj.data.spellbook.sort(function(obj1, obj2){
    return sync.rawVal(obj1.info.name).toLowerCase().localeCompare(sync.rawVal(obj2.info.name).toLowerCase());
  });

  /*app.attr("library", "true");
  obj.update();
  });*/


  var newApp = sync.newApp("ui_libraryBuild").appendTo(div);
  obj.addApp(newApp);

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexrow flexbetween foreground spadding subtitle");

  var custom = $("<div>").appendTo(optionsBar);
  custom.addClass("flexcolumn hover2 white flex alttext lpadding flexmiddle");
  custom.css("background-image", "url('/content/games/custom.png')");
  custom.css("background-size", "cover");
  custom.css("background-repeat", "no-repeat");
  custom.css("background-position", "center");

  custom.append("<b class='flexmiddle smooth fit-x' style='background-color : rgba(0,0,0,0.8);'>Current Game</b>");

  custom.click(function(){
    obj.data = {
      a : [],
      b : [],
      c : [],
      p : [],
      v : [],
      inventory : [],
      talents : [],
      spellbook : [],
    };
    for (var i in game.config.data.library) {
      obj.data[i] = duplicate(game.config.data.library[i]);
    }
    obj.data.custom = true;
    obj.update();
  });

  var dnd5e = $("<div>").appendTo(optionsBar);
  dnd5e.addClass("flexcolumn hover2 white flex2 alttext lpadding flexmiddle");
  dnd5e.css("background-image", "url('"+("http://www.enworld.org/forum/attachment.php?attachmentid=62061&d=1402069890&stc=1")+"')");
  dnd5e.css("background-size", "cover");
  dnd5e.css("background-repeat", "no-repeat");
  dnd5e.css("background-position", "center");

  dnd5e.append("<b class='flexmiddle smooth fit-x' style='background-color : rgba(0,0,0,0.8);'>Dungeons and Dragons 5th Edition SRD</b>");

  dnd5e.click(function(){
    newApp.append("<div class='flexmiddle fit-x'><div class='loader'></div></div>");
    delete obj.data.custom;
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/dnd5e/characters.txt",
      dataType: "text",
      success : function(data) {
        obj.data.c = JSON.parse(data);
        obj.update();
      }
    });
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/dnd5e/equipment.txt",
      dataType: "text",
      success : function(data) {
        obj.data.inventory = JSON.parse(data || "[]");
        /*for (var i in obj.data.inventory) {
          if (sync.rawVal(obj.data.inventory[i].weapon.damage)) {
            sync.rawVal(obj.data.inventory[i].weapon.damage);
          }
        }*/
        obj.update();
      }
    });
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/dnd5e/spellbook.txt",
      dataType: "text",
      success : function(data) {
        obj.data.spellbook = JSON.parse(data);
        obj.update();
      }
    });
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/dnd5e/info.txt",
      dataType: "text",
      success : function(data) {
        var dummyObj = sync.obj();
        dummyObj.data = {info : JSON.parse(data)};

        var content = sync.newApp("ui_renderPage");
        content.attr("viewOnly", true);
        dummyObj.addApp(content);
        var pop = ui_popOut({
          target : $("body"),
          id : "preview-terms",
          style : {"width" : assetTypes["p"].width, "height" : assetTypes["p"].height}
        }, content);
      }
    });
  });

  var pathfinder = $("<div>").appendTo(optionsBar);
  pathfinder.addClass("flexcolumn hover2 white flex2 alttext lpadding flexmiddle");
  pathfinder.css("background-image", "url('"+("https://paizo.com/image/content/Logos/PathfinderRPGLogo_500.jpeg")+"')");
  pathfinder.css("background-size", "cover");
  pathfinder.css("background-repeat", "no-repeat");
  pathfinder.css("background-position", "center");

  pathfinder.append("<b class='flexmiddle smooth fit-x' style='background-color : rgba(0,0,0,0.8);'>Pathfinder SRD</b>");
  pathfinder.click(function(){
    delete obj.data.custom;
    newApp.append("<div class='flexmiddle fit-x'><div class='loader'></div></div>");
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/pathfinder/characters.txt",
      dataType: "text",
      success : function(data) {
        obj.data.c = JSON.parse(data || "[]");
        obj.update();
      }
    });
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/pathfinder/info.txt",
      dataType: "text",
      success : function(data) {
        var dummyObj = sync.obj();
        dummyObj.data = {info : JSON.parse(data)};

        var content = sync.newApp("ui_renderPage");
        content.attr("viewOnly", true);
        dummyObj.addApp(content);
        var pop = ui_popOut({
          target : $("body"),
          id : "preview-terms",
          style : {"width" : assetTypes["p"].width, "height" : assetTypes["p"].height}
        }, content);
      }
    });

    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/pathfinder/equipment.txt",
      dataType: "text",
      success : function(data) {
        obj.data.inventory = JSON.parse(data || "[]");
        obj.update();
      }
    });
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/pathfinder/spellbook.txt",
      dataType: "text",
      success : function(data) {
        obj.data.spellbook = JSON.parse(data || "[]");
        obj.update();
      }
    });
    $.ajax({
      url : "https://files.gmforge.io/file/compendiums/pathfinder/equipment.txt",
      dataType: "text",
      success : function(data) {
        obj.data.inventory = JSON.parse(data || "[]");
        obj.update();
      }
    });
  });

  return div;
});

sync.render("ui_libraryBuild", function(obj, app, scope) {
  scope = scope || {viewOnly : (app.attr("viewOnly") == "true")};

  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var navBar = genNavBar("foreground alttext subtitle", "flex", "6px");
  $(navBar.children()[0]).removeClass("background");
  navBar.appendTo(div);
  navBar.addClass("flex");

  function tabWrap(target, parent) {
    var search = $("<div>").appendTo(parent);
    search.addClass("outlinebottom background fit-x flexrow flexaround alttext");

    var searchIcon = genIcon("search").appendTo(search);
    searchIcon.addClass("lrpadding");
    searchIcon.attr("title", "Search");

    var searchInput = genInput({
      classes : "flex2",
      parent : search,
      placeholder : "Search Terms",
      value : app.attr("lastSearchTerm"),
    });
    searchInput.addClass("flex subtitle");
    searchInput.css("color", "#333");

    if (data.custom) {
      var insert = genIcon("share-alt", "Import").appendTo(search);
      insert.addClass("flex flexmiddle subtitle");
      insert.click(function(ev){
        var content = sync.render("ui_assetPicker")(obj, app, {
          filter : target,
          select : function(ev, ui, ent, options, entities){
            var entData = duplicate(ent.data);
            entData._s = {}; // clear security
            obj.data[target].push(entData);
            game.config.data.library = game.config.data.library || {};
            game.config.data.library[target] = obj.data[target];
            game.config.sync("updateConfig");
            obj.update();
            layout.coverlay("add-asset");
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
      });
    }

    var listedChars = $("<div>").appendTo(parent);
    listedChars.addClass("flexcolumn flex outlinebottom");
    listedChars.attr("_lastScrollTop", app.attr("_lastScrollTop_chars"));
    listedChars.css("overflow-y", "auto");
    listedChars.css("position", "relative");
    listedChars.scroll(function(){
      app.attr("_lastScrollTop_chars", $(this).scrollTop());
    });

    var listWrap = $("<div>").appendTo(listedChars);
    listWrap.addClass("fit-x flexcolumn flexmiddle");
    listWrap.css("position", "absolute");
    if (data.custom) {
      if (target == "inventory" || target == "spellbook") {
        listedChars.on("dragover", function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (!_dragTransfer && !$("#"+app.attr("id")+"-drag-overlay").length) {
        		var olay = layout.overlay({
              target : app,
              id : app.attr("id")+"-drag-overlay",
              style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
            });
            olay.addClass("flexcolumn flexmiddle alttext");
            olay.css("font-size", "2em");
            olay.css("z-index", util.getMaxZ(".ui-popout")+1);
            olay.append("<b>Drop to Insert</b>");
          }
      	});
        listedChars.on('drop', function(ev, ui ){
          ev.preventDefault();
          ev.stopPropagation();
          if (!_dragTransfer) {
            var dt = ev.originalEvent.dataTransfer||$(ui.draggable).data("dt");
            if (dt && dt.getData("OBJ")) {
              var entData = JSON.parse(dt.getData("OBJ"));
              if (entData._t == "i") {
                entData._s = {}; // clear security
                obj.data[target].push(entData);
                game.config.data.library = game.config.data.library || {};
                game.config.data.library[target] = obj.data[target];
                game.config.sync("updateConfig");
                obj.update();
              }
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
      else {
        listedChars.addClass("dropContent");
        listedChars.sortable({
          handle : ".nofilter",
          over : function(ev, ui){
            if ($(ui.item).attr("index")) {
              if (!$("#"+app.attr("id")+"-drag-overlay").length) {
                var olay = layout.overlay({
                  target : app,
                  id : app.attr("id")+"-drag-overlay",
                  style : {"pointer-events" : "none", "background-color" : "rgba(0,0,0,0.5)"}
                });
                olay.addClass("flexcolumn flexmiddle alttext");
                olay.css("font-size", "2em");
                olay.append("<b>Drop to Insert</b>");
                olay.css("z-index", util.getMaxZ(".ui-popout")+1);
              }
            }
          },
          out : function(ev, ui) {
            layout.coverlay(app.attr("id")+"-drag-overlay");
          },
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
            // create a piece if there is an entity reference
            if ($(ui.item).attr("index")) {
              var ent = getEnt($(ui.item).attr("index"));
              if (ent && hasSecurity(getCookie("UserID"), "Rights", ent.data) && (ent.data._t == "c" || ent.data._t == "b" || ent.data._t == "p")) {
                var entData = duplicate(ent.data);
                entData._s = {}; // clear security
                obj.data[entData._t].push(entData);
                game.config.data.library = game.config.data.library || {};
                game.config.data.library[entData._t] = obj.data[entData._t];
                game.config.sync("updateConfig");
                obj.update();
                layout.coverlay("add-asset");
              }
            }
            layout.coverlay(app.attr("id")+"-drag-overlay");
            ev.stopPropagation(); //don't go through boards
          }
        });
      }
    }
    searchInput.keyup(function(){
      var str = ($(this).val() || "").toLowerCase();
      listWrap.children().each(function(){
        if ($(this).attr("index") && str) {
          var ent = obj.data[target][$(this).attr("index")];
          if (ent) {
            var name = (sync.rawVal(ent.info.name) || "").toLowerCase();
            var hide = false;
            for (var tag in ent.tags) {
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
          $(this).fadeIn();
        }
      });
    });

    for (var i in obj.data[target]) {
      var dummyObj = sync.obj(-1);
      dummyObj.data = obj.data[target][i];
      var charList = sync.render("ui_ent")(dummyObj, app, {
        height : 40,
        click : function(ev, ui, charObj) {
          var newApp;
          var width = "40vw";
          var height = "70vh";
          if (target[0] == "s") {
            width = assetTypes["i"].width;
            height = assetTypes["i"].height;
          }
          else {
            width = assetTypes[target[0]].width;
            height = assetTypes[target[0]].height;
          }
          if (target == "b") {
            newApp = sync.newApp("ui_board");
          }
          else if (target == "c") {
            newApp = sync.newApp("ui_characterSheet");
            newApp.attr("from", "ui_characterSummary");
          }
          else if (target == "p") {
            newApp = sync.newApp("ui_renderPage");
          }
          /*else if (target == "v") {
            newApp = sync.newApp("ui_vehicle");
          }*/
          else if (target == "inventory" || target == "spellbook") {
            newApp = sync.newApp("ui_renderItem", null, {viewOnly : true, itemData : charObj.data, spellBool : (target == "spellbook")});
          }
          newApp.attr("viewOnly", "true");

          charObj.addApp(newApp);
          var pop = ui_popOut({
            target : app,
            title : sync.rawVal(charObj.data.info.name),
            minimize : true,
            dragThickness : "0.5em",
            style : {"width" : width, "height" : height},
          }, newApp);
          pop.resizable();
        },
        contextmenu : function(ev, plate, charObj) {
          if (obj.data.custom) {
            var index = plate.attr("index");
            var actionsList = [{
              name : "Remove",
              click : function(ev, ui){
                obj.data[target].splice(index, 1);
                game.config.data.library = game.config.data.library || {};
                game.config.data.library[target] = obj.data[target];
                game.config.sync("updateConfig");
                obj.update();
              }
            }];
            ui_dropMenu(plate, actionsList, {id : "remove-library"});
          }
        }
      });
      charList.appendTo(listWrap);
      charList.addClass("fit-x");
      charList.attr("draggable", true);
      charList.attr("index", i);
      charList.on("dragstart", function(ev){
        var dt = ev.originalEvent.dataTransfer;
        var tempObj = duplicate(obj.data[target][$(this).attr("index")]);
        tempObj.tags = tempObj.tags || {};
        if (_down["17"]) {
          delete tempObj.tags["temp"];
        }
        else {
          tempObj.tags["temp"] = true;
        }
        dt.setData("OBJ", JSON.stringify(tempObj));
        if (target == "spellbook") {
          dt.setData("spell", true);
        }
      });
    }
    if (listWrap.children().length > 1) {
      listWrap.children().each(function(){
        $(this).removeClass("outline");
        $(this).addClass("outlinebottom");
      });
    }
  }

  /*navBar.generateTab("Adventures", "book", function(parent) {
    app.attr("tab", "Adventures");
  });*/
  if (obj.data.c && obj.data.c.length || obj.data.custom) {
    navBar.generateTab("Actors", "user", function(parent) {
      tabWrap("c", parent);

      app.attr("tab", "Actors");
    });
  }
  if (obj.data.inventory && obj.data.inventory.length || obj.data.custom) {
    navBar.generateTab("Items", "briefcase", function(parent) {
      tabWrap("inventory", parent);

      app.attr("tab", "Items");
    });
  }
  if (obj.data.b && obj.data.b.length || obj.data.custom) {
    navBar.generateTab("Maps", "globe", function(parent) {
      tabWrap("b", parent);

      app.attr("tab", "Maps");
    });
  }
  if (obj.data.p && obj.data.p.length || obj.data.custom) {
    navBar.generateTab("Resources", "duplicate", function(parent) {
      tabWrap("p", parent);

      app.attr("tab", "Resources");
    });
  }

  if (obj.data.spellbook && obj.data.spellbook.length || obj.data.custom) {
    navBar.generateTab("Spells", "flash", function(parent) {
      tabWrap("spellbook", parent);

      app.attr("tab", "Spells");
    });
  }

  if (obj.data.talents && obj.data.talents.length) {
    navBar.generateTab("Talents", "screenshot", function(parent) {
      var searchBar = $("<div>").appendTo(parent);
      searchBar.addClass("fit-x flexrow flexwrap background alttext");

      var searchIcon = genIcon("search").appendTo(searchBar);
      searchIcon.addClass("lrpadding");
      searchIcon.attr("title", "Search");

      var searchInput = genInput({
        parent : searchBar,
        placeholder : "Search Terms",
        value : app.attr("lastSearchTerm"),
      });
      searchInput.addClass("flex subtitle");
      searchInput.css("color", "#333");

      var wrapper = $("<div>").appendTo(parent);
      wrapper.addClass("flexcolumn flex outlinebottom");

      var contentWrapper = $("<div>").appendTo(wrapper);
      contentWrapper.addClass("fit-x flex");
      contentWrapper.css("overflow", "auto");
      searchInput.keyup(function(){
        listWrap.children().hide();
        var term = ($(this).val() || "").toLowerCase();
        listWrap.children().each(function(){
          var ent = obj.data.talents[$(this).attr("index")];
          if ((ent.name || "").toLowerCase().match(term)) {
            $(this).show();
          }
        });
      });

      for (var index in obj.data.talents) {
        var wrapper = $("<div>").appendTo(contentWrapper);
        wrapper.addClass("flexrow flexbetween outlinebottom");
        wrapper.css("background-color", "white");
        wrapper.attr("draggable", true);
        wrapper.attr("index", index);
        wrapper.on("dragstart", function(ev){
          var dt = ev.originalEvent.dataTransfer;
          dt.setData("OBJ", JSON.stringify(obj.data.talents[$(this).attr("index")]));
          dt.setData("key", $(this).attr("index"));
          if (target == "spellbook") {
            dt.setData("spell", true);
          }
        });

        var talentCont = $("<div>").appendTo(wrapper);
        talentCont.addClass("flex hover2 flexbetween");
        talentCont.css("cursor", "pointer");
        talentCont.attr("index", index);
        talentCont.css("padding-bottom", "1em");
        talentCont.click(function(){
          var content = $("<div>");
          content.append(sync.render("ui_renderTalent")(obj, app, {talentData : obj.data.talents[$(this).attr("index")], viewOnly : scope.viewOnly}));
          ui_popOut({
            target : $(this),
            id : "content-preview",
            align : "bottom",
            style : {"max-width" : "50vw"}
          }, content);
        });
        var talentData = duplicate(obj.data.talents[index]);
        sync.render("ui_renderTalent")(obj, app, {talentData: talentData, viewOnly: true}).appendTo(talentCont);
      }

      app.attr("tab", "Talents");
    });
  }
  /*navBar.generateTab("Vehicles", "plane", function(parent) {
    tabWrap("v", parent);

    app.attr("tab", "Vehicles");
  });*/

  navBar.selectTab(app.attr("tab") || "Items");

  $("<i class='subtitle fit-x flexmiddle'>Drag and drop to create new assets</i>").appendTo(div);

  return div;
});
