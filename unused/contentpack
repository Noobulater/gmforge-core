sync.render("ui_contentList", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");
  div.css("position", "relative");

  if (!obj) {
    game.locals["storage"] = game.locals["storage"] || sync.obj("storage");
    game.locals["storage"].addApp(app);

    runCommand("retreiveStorage");
    return div;//$("<div class='flexmiddle'><b>Loading...</b></div>");
  }

  var list = [];
  if (game.locals["newContent"]) {
    list.push(game.locals["newContent"]);
  }
  if (obj) {
    var data = obj.data;
    for (var i in data.l) {
      if (data.l[i] && data.l[i].a == "pk" && data.l[i]._uid) {
        if (isNaN(data.l[i]._uid)) {
          if (data.l[i]._uid.match(getCookie("UserID"))) {
            var splt = data.l[i]._uid.split("_");
            if (splt[1]) {
              list.push(data.s[splt[1]]);
            }
          }
          else if (data.s[data.l[i]._uid]) {
            list.push(data.s[data.l[i]._uid]);
          }
        }
        else {
          list.push(data.s[data.l[i]._uid]);
        }
      }
    }
  }
  if (list.length) {
    var wrap = $("<div>").appendTo(div);
    wrap.addClass("flex outlinebottom");
    wrap.css("position", "relative");
    wrap.css("overflow", "auto");

    var content = sync.render("ui_entList")(obj, app, {
      list : list,
      draw : function(ui, ent) {
        $(ui.children()[0]).removeClass("flexbetween");
        $(ui.children()[0]).addClass("flexcolumn");
        $(ui.children()[0]).css("position", "relative");
        var img = $($(ui.children()[0]).children()[0]);
        img.css("max-width", "100%");
        img.css("height", "auto");
        if (obj != game.locals["newContent"]) {
          for (var i in data.l) {
            if (data.s[data.l[i]._uid] == ent) {
              var del = genIcon("remove").appendTo($(ui.children()[0]));
              del.addClass("lrpadding");
              del.attr("title", "Unsubscribe");
              del.attr("index", i);
              del.css("position", "absolute");
              del.css("right", "0");
              del.css("top", "0");
              del.click(function(ev){
                var l = duplicate(data.l);
                l[$(this).attr("index")] = {delete : true};
                runCommand("moveAssets", {l : l});
                ui.remove();
                sendAlert({text : "Unsubscribing"});
                ev.stopPropagation();
                ev.preventDefault();
                return false;
              });
            }
          }
        }
      },
      click : function(ev, ui, eObj) {
        var newApp = sync.newApp("ui_contentEditor");
        eObj.addApp(newApp);

        var pop = ui_popOut({
          target : app,
          align : "top",
          id : "content-package",
          dragThickness : "0.5em",
          minimize : true,
          title : sync.rawVal(eObj.data.info.name),
          style : {"width" : "50vw", "height" : "50vh"}
        }, newApp);
        pop.resizable();
      },
    });
    content.addClass("fit-xy");
    content.css("position", "absolute");
    content.css("top", "0");
    content.css("left", "0");
    content.appendTo(wrap);

    var library = genIcon("cloud-download", "find more packs").appendTo(div);
    library.addClass("fit-x flexmiddle subtitle");
    library.click(function(){
      var frame = layout.page({title: "Community Chest", blur : 0.5, width: "90%", id: "community-chest"});
      if (layout.mobile) {
        frame.css("width", "95vw");
      }
      var newApp = sync.newApp("ui_newMarket", null, {});
      newApp.appendTo(frame);
      newApp.css("height", "80vh");
    });

    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("background alttext flexrow flexaround spadding");

    var newPack = genIcon("plus", "Create New Package").appendTo(optionsBar);
    newPack.addClass("subtitle");
    newPack.click(function(){
      game.locals["newContent"] = sync.obj();
      game.locals["newContent"].data = duplicate(game.templates.content);
      sync.rawVal(game.locals["newContent"].data.info.name, "Local Package");

      var newApp = sync.newApp("ui_contentEditor");
      game.locals["newContent"].addApp(newApp);

      var pop = ui_popOut({
        target : app,
        align : "top",
        id : "content-package",
        dragThickness : "0.5em",
        minimize : true,
        title : sync.rawVal(game.locals["newContent"].data.info.name),
        style : {"width" : "50vw", "height" : "50vh"}
      }, newApp);
      pop.resizable();
    });

    return div;
  }
  else {
    div.append("<i class='subtitle lrpadding flex flexmiddle'>No Content Packs Found</i>");

    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("background alttext flexrow flexaround spadding");

    var newPack = genIcon("plus", "Create New Package").appendTo(optionsBar);
    newPack.addClass("subtitle");
    newPack.click(function(){
      game.locals["newContent"] = sync.obj();
      game.locals["newContent"].data = duplicate(game.templates.content);
      sync.rawVal(game.locals["newContent"].data.info.name, "Local Package");

      var newApp = sync.newApp("ui_contentEditor");
      game.locals["newContent"].addApp(newApp);

      var pop = ui_popOut({
        target : app,
        align : "top",
        id : "content-package",
        dragThickness : "0.5em",
        minimize : true,
        title : sync.rawVal(game.locals["newContent"].data.info.name),
        style : {"width" : "50vw", "height" : "50vh"}
      }, newApp);
      pop.resizable();
    });
    return div;
  }
});

sync.render("ui_contentEditor", function(obj, app, scope) {
  scope = scope || {viewOnly : (app.attr("viewOnly") == "true")};

  var categories = {
    "a" : {n : "Adventures", i : "book", ui : "ui_planner", width : "60vw", height : "40vh"},
    "b" : {n : "Maps", i : "globe", ui : "ui_board", width : assetTypes["b"].width, height : assetTypes["b"].height},
    "c" : {n : "Actors", i : "user", ui : "ui_characterSheet", width : assetTypes["c"].width, height : assetTypes["c"].height},
    "i" : {n : "Items/Spells", i : "briefcase", ui : "ui_renderItem", width : assetTypes["i"].width, height : assetTypes["i"].height},
    "p" : {n : "Resources", i : "file", ui : "ui_renderPage", width : "600px", height : "800px"},
    "v" : {n : "Vehicles", i : "plane", ui : "ui_vehicle", width : "50vw", height : "40vh"},
  };

  var div = $("<div>");
  div.addClass("flex flexcolumn");

  if (!obj) {
    return sync.render("ui_contentList")(obj, app, scope);
  }
  var data = obj.data;
  if (obj.data["_uid"] && isNaN(obj.data["_uid"]) && !obj.data["_uid"].toLowerCase().match(getCookie("UserID").toLowerCase())) {
    scope.viewOnly = true;
  }
  console.log(data);
  if (!(data.b instanceof Object)) {
    data.b = JSON.parse(data.b || "[]");
  }
  if (!(data.c instanceof Object)) {
    data.c = JSON.parse(data.c || "[]");
  }
  if (!(data.p instanceof Object)) {
    data.p = JSON.parse(data.p || "[]");
  }
  if (!(data.v instanceof Object)) {
    data.v = JSON.parse(data.v || "[]");
  }

  if (!(data.inventory instanceof Object)) {
    data.inventory = JSON.parse(data.inventory || "[]");
  }
  if (!(data.spellbook instanceof Object)) {
    data.spellbook = JSON.parse(data.spellbook || "[]");
  }
  /*if (!(data.talents instanceof Object)) {
    data.talents = JSON.parse(data.talents || "[]");
  }*/

  if (!scope.viewOnly || app.attr("from")) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("foreground padding subtitle alttext flexrow flexaround");
    if (app.attr("from")) {
      var back = genIcon("arrow-left").appendTo(optionsBar);
      back.attr("title", "To List");
      back.click(function(){
        obj.removeApp(app);
        app.attr("ui-name", "ui_contentList");
        game.locals["storage"] = game.locals["storage"] || sync.obj("storage");
        game.locals["storage"].addApp(app);
      });
    }

    if (!scope.viewOnly) {
      if (obj.data["_uid"]) {
        var trash = genIcon("trash", "Delete Content").appendTo(optionsBar);
        trash.attr("title", "Delete this Content");
        trash.click(function(){
          ui_prompt({
            target : $(this),
            id : "confirm-delete-content",
            click : function(){
              sendAlert({text : "You must delete this from your storage"});
            }
          });
        });
      }

      var clear = genIcon("remove", "Clear Content").appendTo(optionsBar);
      clear.attr("title", "Clear the Contents of this Content");
      clear.click(function(){
        ui_prompt({
          target : $(this),
          id : "confirm-clear-adventure",
          click : function(){
            obj.data = duplicate(game.templates.content);
            obj.sync("updateAsset");
          }
        });
      });

      var store = genIcon("cloud-upload", "Export Content as Package");
      if (obj.data["_uid"]) {
        store = genIcon("cloud-upload", "Re-Package Content");
      }
      store.appendTo(optionsBar);
      store.attr("title", "Save Content as Package");
      store.click(function(){
        var dupe = {_s : obj.data._s};
        dupe.info = duplicate(obj.data.info);
        dupe.b = JSON.stringify(obj.data.b);
        dupe.c = JSON.stringify(obj.data.c);
        dupe.p = JSON.stringify(obj.data.p);
        dupe.v = JSON.stringify(obj.data.v);
        dupe._c = obj.data._c;
        dupe._t = "pk";
        dupe._uid = duplicate(obj.data._uid);
        dupe.inventory = JSON.stringify(obj.data.inventory);
        dupe.spellbook = JSON.stringify(obj.data.spellbook);
        dupe.talents = JSON.stringify(obj.data.talents);
        runCommand("storeContent", dupe);
        layout.coverlay("quick-storage-popout");
      });
    }
  }

  var body = genNavBar('foreground subtitle alttext', null, "4px");
  $(body.children()[0]).removeClass("background");
  body.addClass("fit-xy flexcolumn");
  body.appendTo(div);

  body.generateTab("Content Package Info", "info-sign", function(parent){
    parent.addClass("flexcolumn flex");

    var content = $("<div>").appendTo(parent);
    content.addClass("flexcolumn flex");

    var newApp = sync.render("ui_editPage")(obj, app, scope);
    if (scope.viewOnly) {
      newApp = sync.render("ui_renderPage")(obj, app, {viewOnly : true});
    }
    content.append(newApp);
    if (app) {
      app.attr("_tab", "Content Package Info");
    }
  });

  /*body.generateTab("Character Factory", "list-alt", function(parent){
    parent.addClass("flexcolumn flex");

    var content = $("<div>").appendTo(parent);
    content.addClass("flexcolumn flex");
    content.css("position", "relative");
    $("<b class='highlight smooth spadding outline alttext' style='position:absolute;'>Beta</b>").appendTo(content);
    var newApp = sync.render("ui_genEditor")(obj, app, scope);
    content.append(newApp);
    if (app) {
      app.attr("_tab", "Character Factory");
    }
  });*/

  function tabWrap(name, icon, filter, click) {
    body.generateTab(name, icon, function(parent){
      parent.addClass("flexcolumn fit-y");

      //var create = genIcon("plus", "Create "+name.substring(0,name.length-1)+"").appendTo(optionsBar);

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
      var target = "c";
      if (filter == "i") {
        if (name == "Spells") {
          target = "spellbook";
        }
        else {
          target = "inventory";
        }
      }
      else if (filter == "b") {
        target = "b";
      }
      else if (filter == "p") {
        target = "p";
      }
      else if (filter == "v") {
        target = "v";
      }

      for (var i in obj.data[target]) {
        var dummyObj = sync.obj(-1);
        dummyObj.data = obj.data[target][i];
        var charList = sync.render("ui_ent")(dummyObj, app, {
          small : true,
          draw : function(ui, charObj) {
            if (!scope.viewOnly) {
              var remove = genIcon("trash").appendTo(ui);
                remove.click(function(ev){
                obj.data[target].splice(ui.attr("index"), 1);
                obj.update();

                ev.stopPropagation();
                ev.preventDefault();
              });
            }
          },
          click : function(ev, ui, charObj) {
            var newApp;
            var width = "40vw";
            var height = "70vh";
            if (categories[target]) {
              width = categories[target].width;
              height = categories[target].height;
              newApp = sync.newApp(categories[target].ui);
            }
            else if (target == "inventory" || target == "spellbook") {
              width = categories["i"].width;
              height = categories["i"].height;
              newApp = sync.newApp(categories["i"].ui, null, {viewOnly : true, itemData : charObj.data, spellBool : (target == "spellbook")});
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
          }
        });
        charList.appendTo(listWrap);
        charList.addClass("fit-x");
        charList.attr("draggable", true);
        charList.attr("index", i);
        charList.on("dragstart", function(ev){
          var dt = ev.originalEvent.dataTransfer;
          dt.setData("OBJ", JSON.stringify(obj.data[target][$(this).attr("index")]));
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


      var optionsBar = $("<div>").appendTo(parent);
      optionsBar.addClass("fit-x flexbetween outline flexwrap background alttext");

      var searchBar = $("<div>").appendTo(optionsBar);
      searchBar.addClass("flexmiddle");

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

      if (!scope.viewOnly) {
        var add = genIcon("share-alt", "Insert "+name+"").appendTo(optionsBar);
        if (filter == "i") {
          add.click(function(){
            var content = $("<div>");
            content.addClass("flexaround flexwrap");
            var finalList = [];
            for (var key in game.entities.data) {
              var ent = game.entities.data[key];
              if (ent && (ent.data["_t"] == "c" || ent.data["_t"] == "v") && hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
                var list = [];
                var inventory = ent.data.inventory;
                for (var itemKey in inventory) {
                  var itemData = inventory[itemKey];
                  if (itemData && itemData["_t"] == "i" && !util.contains(finalList, JSON.stringify(itemData))) {
                    list.push(finalList.length);
                    finalList.push(JSON.stringify(itemData));
                  }
                }
                if (list.length) {
                  var container = $("<div>").appendTo(content);
                  container.addClass("subtitle");

                  var charDiv = sync.render("ui_characterSummary")(ent, app, {minimized: true});
                  charDiv.addClass("background alttext");
                  charDiv.appendTo(container);

                  for (var itemKey in list) {
                    var itemData = JSON.parse(finalList[list[itemKey]]);
                    var itemPlate = $("<div>").appendTo(container);
                    itemPlate.css("margin-left", "8px");
                    itemPlate.addClass("outline hover2");
                    if (sync.rawVal(itemData.info.img)) {
                      var img = $("<img>").appendTo(itemPlate);
                      img.attr("width", "auto");
                      img.attr("height", "25px");
                      img.attr("src", sync.rawVal(itemData.info.img));
                    }
                    var namePlate = $("<b>").appendTo(itemPlate);
                    namePlate.append(sync.rawVal(itemData.info.name));
                    itemPlate.attr("index", list[itemKey]);
                    itemPlate.click(function(ev){
                      var itemData = finalList[$(this).attr("index")];
                      click(ev, $(this), JSON.parse(itemData));
                    });
                  }
                }
              }
            }
            if (finalList.length){
              ui_popOut({
                target : div,
                id : "content-insert",
                align : "top",
                style : {"max-width" : "80vw", "max-height" : "35vh", "overflow-y" : "scroll"}
              }, content);
            }
          });
          var importText = genIcon("import", "Import "+name+" as List");//.appendTo(optionsBar);
          importText.click(function(){
            var content = $("<div>");
            content.addClass("flexcolumn flexmiddle");

            var textArea = $("<textarea>").appendTo(content);
            textArea.addClass("fit-x");
            textArea.css("width", "400px");
            textArea.css("height", "400px");
            textArea.attr("placeholder", "Seperate Entries with a new line, or comma's");

            var button = $("<button>Confirm</button>").appendTo(content);
            button.addClass("fit-x");
            button.click(function(){
              if (name == "Spells") {
                var tempChar = duplicate(game.templates.character);
                maxify("SPELLBOOK-\n"+(textArea.val() || ""), tempChar, game.templates);

                for (var i in tempChar.spellbook) {
                  var str = JSON.stringify(tempChar.spellbook[i]);
                  var stop = false;
                  for (var j in data.spellbook) {
                    if (str == JSON.stringify(data.spellbook[j])) {
                      layout.coverlay("import-subsection");
                      stop = true;
                      break;
                    }
                  }
                  if (!stop) {
                    obj.data.spellbook.push(tempChar.spellbook[i]);
                  }
                }
              }
              else {
                var tempChar = duplicate(game.templates.character);
                maxify("INVENTORY-\n"+(textArea.val() || ""), tempChar, game.templates);

                for (var i in tempChar.inventory) {
                  var str = JSON.stringify(tempChar.inventory[i]);
                  var stop = false;
                  for (var j in data.inventory) {
                    if (str == JSON.stringify(data.inventory[j])) {
                      layout.coverlay("import-subsection");
                      stop = true;
                      break;
                    }
                  }
                  if (!stop) {
                    obj.data.inventory.push(tempChar.inventory[i]);
                  }
                }
              }

              layout.coverlay("import-subsection");
              obj.update();
            });
            ui_popOut({
              target : $(this),
              id : "import-subsection"
            }, content);
          });
        }
        else {
          add.click(function(){
            var ignore = {};
            for (var i in game.entities.data) {
              if (isNaN(i)) {
                ignore[i] = true;
              }
            }
            for (var key in obj.data.entities) {
              ignore[obj.data.entities[key]] = true;
            }
            var content = sync.render("ui_entList")(obj, app, {
              filter : filter,
              click : click,
              ignore : ignore,
            });
            if (content.children().length > 0) {
              ui_popOut({
                target : $(this),
                id : "content-insert",
              }, content);
            }
          });
        }
      }

      if (app) {
        app.attr("_tab", name);
      }
    });
  }
  tabWrap("Actors", "user", "c",
  function(ev, ui, eObj) {
    data.c.push(duplicate(eObj.data));
    obj.update();
    layout.coverlay("content-insert");
  });
  tabWrap("Items", "briefcase", "i",
    function(ev, ui, eObj) {
      var str = JSON.stringify(eObj);
      for (var i in data.inventory) {
        if (str == JSON.stringify(data.inventory[i])) {
          sendAlert({text : "Dupicate Item Detected", duration : data.duration || 3000});
          layout.coverlay("content-insert");
          return;
        }
      }
      data.inventory.push(eObj);
      obj.update();
      layout.coverlay("content-insert");
    }
  );
  tabWrap("Maps", "globe", "b",
  function(ev, ui, eObj) {
    data.b.push(duplicate(eObj.data));
    obj.update();
    layout.coverlay("content-insert");
  });
  tabWrap("Resources", "duplicate", "p",
  function(ev, ui, eObj) {
    data.p.push(duplicate(eObj.data));
    obj.update();
    layout.coverlay("content-insert");
  });
  tabWrap("Spells", "flash", "i",
    function(ev, ui, eObj) {
      var str = JSON.stringify(eObj);
      for (var i in data.spellbook) {
        if (str == JSON.stringify(data.spellbook[i])) {
          sendAlert({text : "Dupicate Spell Detected", duration : data.duration || 3000});
          layout.coverlay("content-insert");
          return;
        }
      }
      data.spellbook.push(eObj);
      obj.update();
      layout.coverlay("content-insert");
    }
  );

/*  body.generateTab("Talents", "screenshot", function(parent){
    parent.addClass("flexcolumn flex");

    var optionsBar = $("<div>").appendTo(parent);
    optionsBar.addClass("fit-x flexaround flexwrap background alttext outline");

    var searchBar = $("<div>").appendTo(optionsBar);
    searchBar.addClass("flexmiddle");

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

    if (!scope.viewOnly) {
      var add = genIcon("share-alt", "Insert Talent").appendTo(optionsBar);
      add.click(function(){
        var content = $("<div>");
        content.addClass("flexaround flexwrap");
        var finalList = [];
        for (var key in game.entities.data) {
          var ent = game.entities.data[key];
          if (ent && ent.data.talents && hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
            var list = [];
            var talents = ent.data.talents;
            for (var itemKey in talents) {
              var itemData = talents[itemKey];
              if (itemData && !util.contains(finalList, JSON.stringify(itemData))) {
                list.push(finalList.length);
                finalList.push(JSON.stringify(itemData));
              }
            }
            if (list.length) {
              var container = $("<div>").appendTo(content);
              container.addClass("subtitle");

              var charDiv = sync.render("ui_characterSummary")(ent, app, {minimized: true});
              charDiv.addClass("background alttext");
              charDiv.appendTo(container);

              for (var itemKey in list) {
                var itemData = JSON.parse(finalList[list[itemKey]]);
                var itemPlate = sync.render("ui_renderTalent")(obj, app, {talentData : itemData, viewOnly : true}).appendTo(container);
                itemPlate.addClass("outline hover2");
                itemPlate.attr("index", list[itemKey]);
                itemPlate.click(function(ev){
                  var itemData = JSON.parse(finalList[$(this).attr("index")]);
                  obj.data.talents.push(itemData);
                  obj.update();
                  layout.coverlay("content-insert");
                });
              }
            }
          }
        }
        if (finalList.length){
          ui_popOut({
            target : div,
            id : "content-insert",
            align : "top",
            style : {"max-width" : "80vw", "max-height" : "35vh", "overflow-y" : "scroll"}
          }, content);
        }
      });
      var importText = genIcon("import", "Import Talents as List").appendTo(optionsBar);
      importText.click(function(){
        var content = $("<div>");
        content.addClass("flexcolumn flexmiddle");

        var textArea = $("<textarea>").appendTo(content);
        textArea.addClass("fit-x");
        textArea.css("width", "400px");
        textArea.css("height", "400px");
        textArea.attr("placeholder", "Seperate Entries with a new line, or comma's");

        var button = $("<button>Confirm</button>").appendTo(content);
        button.addClass("fit-x");
        button.click(function(){
          var tempChar = duplicate(game.templates.character);
          maxify("TALENTS-\n"+(textArea.val() || ""), tempChar, game.templates);

          for (var i in tempChar.talents) {
            var str = JSON.stringify(tempChar.talents[i]);
            var stop = false;
            for (var j in data.inventory) {
              if (str == JSON.stringify(data.talents[j])) {
                layout.coverlay("import-subsection");
                stop = true;
                break;
              }
            }
            if (!stop) {
              obj.data.talents.push(tempChar.talents[i]);
            }
          }
          layout.coverlay("import-subsection");
          obj.update();
        });
        ui_popOut({
          target : $(this),
          id : "import-subsection"
        }, content);
      });
    }

    var wrapper = $("<div>").appendTo(parent);
    wrapper.addClass("flexcolumn flex");

    var contentWrapper = $("<div>").appendTo(wrapper);
    contentWrapper.addClass("fit-x flex");
    contentWrapper.css("overflow", "auto");
    if (name == "Talents") {
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
    }
    else {
      searchInput.keyup(function(){
        listWrap.children().hide();
        var term = ($(this).val() || "").toLowerCase();
        listWrap.children().each(function(){
          var ent = obj.data[target][$(this).attr("index")];
          if ((sync.rawVal(ent.info.name) || "").toLowerCase().match(term)) {
            $(this).show();
          }
        });
      });
    }

    for (var index in obj.data.talents) {
      var wrapper = $("<div>").appendTo(contentWrapper);
      wrapper.addClass("flexrow flexbetween outlinebottom");
      wrapper.css("background-color", "white");
      wrapper.attr("draggable", true);
      wrapper.attr("index", index);
      wrapper.on("dragstart", function(ev){
        var dt = ev.originalEvent.dataTransfer;
        dt.setData("OBJ", JSON.stringify(obj.data.talents[$(this).attr("index")]));
        dt.setData("target", "talents");
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
      sync.render("ui_renderTalent")(obj, app, {talentData: talentData, viewOnly: true, minimized : scope.minimized}).appendTo(talentCont);

      if (!scope.viewOnly) {
        var optionsBar = $("<div>").appendTo(wrapper);
        optionsBar.addClass("flexmiddle background outline alttext");

        var remove = genIcon("trash").appendTo(optionsBar);
        remove.attr("index", index);
        remove.click(function(){
          obj.data.talents.splice($(this).attr("index"), 1);
          obj.update();
        });
      }
    }

    app.attr("_tab", "Talents");
  });

  /*tabWrap("Vehicles", "plane", "v",
  function(ev, ui, eObj) {
    data.v.push(duplicate(eObj.data));
    obj.update();
    layout.coverlay("content-insert");
  });*/
  if (app) {
    if (!app.attr("_tab")) {
      app.attr("_tab", "Content Package Info");
    }
    body.selectTab(app.attr("_tab"));
  }
  else {
    body.selectTab("Content Package Info");
  }

  return div;
});
