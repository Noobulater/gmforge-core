sync.render("ui_quickSearch", function(obj, app, scope){
  var data = obj.data;

  var div = $("<div>");
  div.addClass("flexcolumn flex");

  var search = $("<div>").appendTo(div);
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

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexrow flexaround flexwrap spadding background outline");

  var categories = {
    "storage" : {n : "Storage", i : "/content/icons/BeltPouch1000p.png"},
    "game" : {n : "In Session", i : "/content/icons/BeltPouch1000p.png"},
    //"a" : {n : "Adventures", i : "/content/icons/Book1000p.png", ui : "ui_planner", width : "60vw", height : "40vh"},
    "c" : {n : "Actors", i : "/content/icons/blankchar.png", ui : "ui_characterSheet", width : assetTypes["c"].width, height : assetTypes["c"].height},
    "i" : {n : "Items", i : "/content/icons/Sword1000p.png", ui : "ui_renderItem", width : assetTypes["i"].width, height : assetTypes["i"].height},
    "b" : {n : "Maps", i : "/content/icons/PictureFrame1000p.png", ui : "ui_board", width : assetTypes["b"].width, height : assetTypes["b"].height},
    "p" : {n : "Resources", i : "/content/icons/Scroll1000p.png", ui : "ui_renderPage", width : assetTypes["p"].width, height : assetTypes["p"].height},
    "s" : {n : "Spells", i : "/content/icons/Staff1000p.png", ui : "ui_renderItem", width : assetTypes["i"].width, height : assetTypes["i"].height},
    //"v" : {n : "Vehicles", i : "/content/icons/blankvehicle.png", ui : "ui_vehicle", width : "50vw", height : "40vh"},
  };
  var results = $("<div>").appendTo(div);
  results.addClass("flexrow flex");
  //put all the recently found stuff here

  for (var index in categories) {
    var wrap = $("<button>").appendTo(optionsBar);
    wrap.addClass("outline hover2 flexrow flexmiddle subtitle");
    wrap.attr("index", index);
    if (!data.filters[index]) {
      wrap.addClass("highlight alttext");
    }

    wrap.append("<img src='"+categories[index].i+"' style='width : 20px; height : 20px;'></img>");
    wrap.append("<div class='flexmiddle lrpadding'>"+categories[index].n+"</div>");
    wrap.click(function(){
      if ($(this).hasClass("highlight")) {
        $(this).removeClass("highlight alttext");
        data.filters[$(this).attr("index")] = true;
      }
      else {
        $(this).addClass("highlight alttext");
        delete data.filters[$(this).attr("index")];
      }
      buildResults(searchInput.val());
    });
  }

  function buildResults(term) {
    results.empty();
    var categories = {
      //"a" : {n : "Adventures", i : "book", ui : "ui_planner", width : "60vw", height : "40vh"},
      "c" : {n : "Actors", i : "user", ui : "ui_characterSheet", width : assetTypes["c"].width, height : assetTypes["c"].height},
      "b" : {n : "Maps", i : "globe", ui : "ui_board", width : assetTypes["b"].width, height : assetTypes["b"].height},
      "p" : {n : "Resources", i : "file", ui : "ui_renderPage", width : assetTypes["p"].width, height : assetTypes["p"].height},
      //"v" : {n : "Vehicles", i : "plane", ui : "ui_vehicle", width : "60vw", height : "50vh"},
    };
    if (!data.filters["game"]) {
      for (var i in game.entities.data) {
        // search through all entities
        var ent = game.entities.data[i];
        var proceed = null;
        var name;
        if (!data.filters[ent.data._t]) {
          if (ent.data._t == "b" || ent.data._t == "g") {
            name = ent.data.name;
            if (name && name.toLowerCase().match(term.toLowerCase())) {
              proceed = true;
            }
          }
          else {
            name = sync.rawVal(ent.data.info.name);
            if (name && name.toLowerCase().match(term.toLowerCase())) {
              proceed = true;
            }
            if (ent.data._t == "c" || ent.data._t == "v") {
              if (!data.filters["i"]) {
                for (var invKey in ent.data.inventory) {
                  var refData = ent.data.inventory[invKey]
                  if (sync.rawVal(refData.info.name) && sync.rawVal(refData.info.name).toLowerCase().match(term.toLowerCase())) {
                    if (!(proceed instanceof Object)) {
                      proceed = $("<div>");
                      proceed.addClass("flexcolumn lrpadding subtitle");
                      proceed.css("padding-left", "1em");
                      proceed.css("padding-right", "1em");
                    }
                    var refPlate = $("<div>").appendTo(proceed);
                    refPlate.addClass("flexrow outline hover2");
                    refPlate.attr("index", ent.id());

                    if (sync.rawVal(refData.info.img)) {
                      var img = $("<img>").appendTo(refPlate);
                      img.attr("width", "auto");
                      img.attr("height", "25px");
                      img.attr("src", sync.rawVal(refData.info.img));
                    }
                    var namePlate = $("<b class='flex flexmiddle'>").appendTo(refPlate);
                    namePlate.append(sync.rawVal(refData.info.name));

                    refPlate.attr("key", invKey);
                    refPlate.attr("draggable", true);
                    refPlate.on("dragstart", function(ev){
                      var ent = game.entities.data[$(this).attr("index")];
                      var dt = ev.originalEvent.dataTransfer;
                      dt.setData("OBJ", JSON.stringify(ent.data.inventory[$(this).attr("key")]));
                    });

                    refPlate.click(function(){
                      var ent = game.entities.data[$(this).attr("index")];
                      var newApp = sync.newApp(categories[ent.data._t].ui);
                      if (isNaN(ent.id()) && ent.id().match("_")) {
                        newApp.attr("viewOnly", "true");
                        newApp.attr("local", "true");
                      }
                      else if (!hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
                        newApp.attr("viewOnly", "true");
                      }
                      if (ent.data._t == "c") {
                        newApp.attr("char_tab", "Inventory");
                        if (_down[16]) {
                          newApp.attr("ui-name", "ui_characterSummary");
                        }
                        else {
                          newApp.attr("from", "ui_characterSummary");
                        }
                      }
                      ent.addApp(newApp);

                      var popOut = ui_popOut({
                        target : $(this),
                        minimize : true,
                        dragThickness : "0.5em",
                        style : {"width" : categories[ent.data._t].width || "", "height" : categories[ent.data._t].height || ""},
                      }, newApp);
                      popOut.resizable();
                    });
                  }
                }
              }
              if (!data.filters["s"]) {
                for (var invKey in ent.data.spellbook) {
                  var refData = ent.data.spellbook[invKey];
                  if (sync.rawVal(refData.info.name) && sync.rawVal(refData.info.name).toLowerCase().match(term.toLowerCase())) {
                    if (!(proceed instanceof Object)) {
                      proceed = $("<div>");
                      proceed.addClass("flexcolumn subtitle");
                      proceed.css("padding-left", "1em");
                      proceed.css("padding-right", "1em");
                    }
                    var refPlate = $("<div>").appendTo(proceed);
                    refPlate.addClass("flexrow outline hover2");
                    refPlate.attr("index", ent.id());
                    if (sync.rawVal(refData.info.img)) {
                      var img = $("<img>").appendTo(refPlate);
                      img.attr("width", "auto");
                      img.attr("height", "25px");
                      img.attr("src", sync.rawVal(refData.info.img));
                    }
                    var namePlate = $("<b class='flex flexmiddle'>").appendTo(refPlate);
                    namePlate.append(sync.rawVal(refData.info.name));


                    refPlate.attr("key", invKey);
                    refPlate.attr("draggable", true);
                    refPlate.on("dragstart", function(ev){
                      var ent = game.entities.data[$(this).attr("index")];
                      var dt = ev.originalEvent.dataTransfer;
                      dt.setData("OBJ", JSON.stringify(ent.data.spellbook[$(this).attr("key")]));
                      dt.setData("spell", true);
                    });
                    refPlate.click(function(){
                      var ent = game.entities.data[$(this).attr("index")];
                      var newApp = sync.newApp(categories[ent.data._t].ui);
                      if (isNaN(ent.id()) && ent.id().match("_")) {
                        newApp.attr("viewOnly", "true");
                        newApp.attr("local", "true");
                      }
                      else if (!hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
                        newApp.attr("viewOnly", "true");
                      }
                      if (ent.data._t == "c") {
                        newApp.attr("char_tab", "Spell Book");
                        if (_down[16]) {
                          newApp.attr("ui-name", "ui_characterSummary");
                        }
                        else {
                          newApp.attr("from", "ui_characterSummary");
                        }
                      }
                      ent.addApp(newApp);

                      var popOut = ui_popOut({
                        target : $(this),
                        minimize : true,
                        dragThickness : "0.5em",
                        style : {"width" : categories[ent.data._t].width || "", "height" : categories[ent.data._t].height || ""},
                      }, newApp);
                      popOut.resizable();
                    });
                  }
                }
              }
            }
          }

          if (proceed) {
            if (!categories[ent.data._t].div) {
              var col = $("<div>").appendTo(results);
              col.addClass("flexcolumn flex fit-y");
              col.css("position", "relative");
              col.css("overflow-y", "auto");

              var list = $("<div>").appendTo(col);
              list.addClass("fit-x");
              list.css("position", "absolute");
              list.append("<b>"+categories[ent.data._t].n+"</b>");

              categories[ent.data._t].div = list;
            }
            var entList = sync.render("ui_ent")(ent, app, {
              draw : function(plate, ent) {
                //plate.addClass("_"+ent.data._t+"_"+replaceAll(fIndex, ".", "-"));

                var optionsBar = plate;

                if (isNaN(ent.id()) && ent.id().match("_") && ent.data && ent.data._t != "pk") {
                  var cloudWrap = $("<div>").appendTo(optionsBar);
                  cloudWrap.addClass("alttext background outline flexmiddle lrpadding");
                  cloudWrap.attr("title", "Download Asset");
                  cloudWrap.append(genIcon("cloud-download"));
                  cloudWrap.click(function(ev){
                    if (game.locals["storage"]) {
                      for (var i in game.locals["storage"].data.l) {
                        var listEntry = game.locals["storage"].data.l[i];
                        if (ent.data._c == getCookie("UserID") && listEntry._uid == ent.id().split("_")[1]) {
                          listEntry.move = true;
                          runCommand("moveAssets", {l : game.locals["storage"].data.l});
                          delete listEntry.move;
                          break;
                        }
                      }
                    }
                    else {
                      sendAlert({text : "Asset Storage hasn't loaded yet"});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                  });
                }
                else if (!isNaN(ent.id()) && ent.data._uid && ent.data._c == getCookie("UserID")) {
                  var cloudWrap = $("<div>").appendTo(optionsBar);
                  cloudWrap.addClass("alttext highlight outline flexmiddle lrpadding");
                  cloudWrap.attr("title", "Store Asset");
                  cloudWrap.attr("index", ent.id());
                  cloudWrap.append(genIcon("cloud-upload"));
                  cloudWrap.click(function(ev){
                    if (game.locals["storage"]) {
                      /*var lookupList = fIndex.split(".");
                      var lookup = lookupList.splice(0,1);
                      if (lookupList.length) {
                        for (var i in lookupList) {
                          lookup = lookup + ".f."+lookupList[i];
                        }
                      }
                      var target = sync.traverse(obj.data.organized, lookup);
                      for (var i in target.eIDs) {
                        if (target.eIDs[i] == ent.id()) {
                          target.eIDs[i] = getCookie("UserID")+"_"+ent.data._uid;
                        }
                      }*/
                      runCommand("storeAsset", {id : $(this).attr("index"), del : true});
                      if (!scope.local) {
                        obj.sync("updateConfig");
                      }
                      else {
                        obj.update();
                      }
                    }
                    else {
                      sendAlert({text : "Asset Storage hasn't loaded yet"});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    cloudWrap.remove();
                    return false;
                  });
                }
              },
              click : function(ev, ui, ent){
                var newApp = sync.newApp(categories[ent.data._t].ui);
                if (isNaN(ent.id()) && ent.id().match("_")) {
                  newApp.attr("viewOnly", "true");
                  newApp.attr("local", "true");
                }
                else if (!hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
                  newApp.attr("viewOnly", "true");
                }
                if (ent.data._t == "c") {
                  if (_down[16]) {
                    newApp.attr("ui-name", "ui_characterSummary");
                  }
                  else {
                    newApp.attr("from", "ui_characterSummary");
                  }
                }
                ent.addApp(newApp);

                var popOut = ui_popOut({
                  target : ui,
                  minimize : true,
                  dragThickness : "0.5em",
                  style : {"width" : categories[ent.data._t].width || "", "height" : categories[ent.data._t].height || ""},
                }, newApp);
                popOut.resizable();
              }
            }).appendTo(categories[ent.data._t].div);
            if (proceed instanceof Object) {
              proceed.appendTo(categories[ent.data._t].div);
            }
          }
        }
      }
    }
    if (!data.filters["storage"]) {
      for (var i in game.locals["storage"].data.s) {
        // search through all entities
        var ent = game.locals["storage"].data.s[i];
        var proceed = null;
        var name;
        if (ent.data._t != "pk" && ent.data._t != "st" && !data.filters[ent.data._t]) {
          if (ent.data._t == "b" || ent.data._t == "g") {
            name = ent.data.name;
            if (name && name.toLowerCase().match(term.toLowerCase())) {
              proceed = true;
            }
          }
          else {
            name = sync.rawVal(ent.data.info.name);
            if (name && name.toLowerCase().match(term.toLowerCase())) {
              proceed = true;
            }
            if (ent.data._t == "c" || ent.data._t == "v") {
              if (!data.filters["i"]) {
                for (var invKey in ent.data.inventory) {
                  var refData = ent.data.inventory[invKey]
                  if (sync.rawVal(refData.info.name) && sync.rawVal(refData.info.name).toLowerCase().match(term.toLowerCase())) {
                    if (!(proceed instanceof Object)) {
                      proceed = $("<div>");
                      proceed.addClass("flexcolumn lrpadding subtitle");
                      proceed.css("padding-left", "1em");
                      proceed.css("padding-right", "1em");
                    }
                    var refPlate = $("<div>").appendTo(proceed);
                    refPlate.addClass("outline hover2");
                    refPlate.attr("index", i);
                    if (sync.rawVal(refData.info.img)) {
                      var img = $("<img>").appendTo(refPlate);
                      img.attr("width", "auto");
                      img.attr("height", "25px");
                      img.attr("src", sync.rawVal(refData.info.img));
                    }
                    var namePlate = $("<b>").appendTo(refPlate);
                    namePlate.append(sync.rawVal(refData.info.name));

                    refPlate.attr("key", invKey);
                    refPlate.attr("draggable", true);
                    refPlate.on("dragstart", function(ev){
                      var ent = game.entities.data[$(this).attr("index")];
                      var dt = ev.originalEvent.dataTransfer;
                      dt.setData("OBJ", JSON.stringify(ent.data.inventory[$(this).attr("key")]));
                    });
                    refPlate.click(function(){
                      var ent = game.locals["storage"].data.s[$(this).attr("index")];

                      var newApp = sync.newApp(categories[ent.data._t].ui);
                      newApp.attr("viewOnly", "true");
                      newApp.attr("local", "true");
                      if (ent.data._t == "c") {
                        newApp.attr("char_tab", "Inventory");
                        if (_down[16]) {
                          newApp.attr("ui-name", "ui_characterSummary");
                        }
                        else {
                          newApp.attr("from", "ui_characterSummary");
                        }
                      }
                      ent.addApp(newApp);

                      var popOut = ui_popOut({
                        target : $(this),
                        minimize : true,
                        dragThickness : "0.5em",
                        style : {"width" : categories[ent.data._t].width || "", "height" : categories[ent.data._t].height || ""},
                      }, newApp);
                      popOut.resizable();
                    });
                  }
                }
              }
              if (!data.filters["s"]) {
                for (var invKey in ent.data.spellbook) {
                  var refData = ent.data.spellbook[invKey];
                  if (sync.rawVal(refData.info.name) && sync.rawVal(refData.info.name).toLowerCase().match(term.toLowerCase())) {
                    if (!(proceed instanceof Object)) {
                      proceed = $("<div>");
                      proceed.addClass("flexcolumn subtitle");
                      proceed.css("padding-left", "1em");
                      proceed.css("padding-right", "1em");
                    }
                    var refPlate = $("<div>").appendTo(proceed);
                    refPlate.addClass("outline hover2");
                    refPlate.attr("index", i);
                    if (sync.rawVal(refData.info.img)) {
                      var img = $("<img>").appendTo(refPlate);
                      img.attr("width", "auto");
                      img.attr("height", "25px");
                      img.attr("src", sync.rawVal(refData.info.img));
                    }
                    var namePlate = $("<b>").appendTo(refPlate);
                    namePlate.append(sync.rawVal(refData.info.name));

                    refPlate.attr("key", invKey);
                    refPlate.attr("draggable", true);
                    refPlate.on("dragstart", function(ev){
                      var ent = game.entities.data[$(this).attr("index")];
                      var dt = ev.originalEvent.dataTransfer;
                      dt.setData("OBJ", JSON.stringify(ent.data.inventory[$(this).attr("key")]));
                      dt.setData("spell", true);
                    });
                    refPlate.click(function(){
                      var ent = game.locals["storage"].data.s[$(this).attr("index")];

                      var newApp = sync.newApp(categories[ent.data._t].ui);
                      newApp.attr("viewOnly", "true");
                      newApp.attr("local", "true");
                      if (ent.data._t == "c") {
                        newApp.attr("char_tab", "Inventory");
                        if (_down[16]) {
                          newApp.attr("ui-name", "ui_characterSummary");
                        }
                        else {
                          newApp.attr("from", "ui_characterSummary");
                        }
                      }
                      ent.addApp(newApp);

                      var popOut = ui_popOut({
                        target : $(this),
                        minimize : true,
                        dragThickness : "0.5em",
                        style : {"width" : categories[ent.data._t].width || "", "height" : categories[ent.data._t].height || ""},
                      }, newApp);
                      popOut.resizable();
                    });
                  }
                }
              }
            }
          }

          if (proceed) {
            if (!categories[ent.data._t].div) {
              var col = $("<div>").appendTo(results);
              col.addClass("flexcolumn flex fit-y");
              col.css("position", "relative");
              col.css("overflow-y", "auto");

              var list = $("<div>").appendTo(col);
              list.addClass("fit-x");
              list.css("position", "absolute");
              list.append("<b>"+categories[ent.data._t].n+"</b>");

              categories[ent.data._t].div = list;
            }
            var entList = sync.render("ui_ent")(ent, app, {
              draw : function(plate, ent) {
                //plate.addClass("_"+ent.data._t+"_"+replaceAll(fIndex, ".", "-"));

                var optionsBar = plate;

                if (isNaN(ent.id()) && ent.id().match("_") && ent.data && ent.data._t != "pk") {
                  var cloudWrap = $("<div>").appendTo(optionsBar);
                  cloudWrap.addClass("alttext background outline flexmiddle lrpadding");
                  cloudWrap.attr("title", "Download Asset");
                  cloudWrap.append(genIcon("cloud-download"));
                  cloudWrap.click(function(ev){
                    if (game.locals["storage"]) {
                      for (var i in game.locals["storage"].data.l) {
                        var listEntry = game.locals["storage"].data.l[i];
                        if (ent.data._c == getCookie("UserID") && listEntry._uid == ent.id().split("_")[1]) {
                          listEntry.move = true;
                          runCommand("moveAssets", {l : game.locals["storage"].data.l});
                          delete listEntry.move;
                          break;
                        }
                      }
                    }
                    else {
                      sendAlert({text : "Asset Storage hasn't loaded yet"});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                  });
                }
                else if (!isNaN(ent.id()) && ent.data._uid && ent.data._c == getCookie("UserID")) {
                  var cloudWrap = $("<div>").appendTo(optionsBar);
                  cloudWrap.addClass("alttext highlight outline flexmiddle lrpadding");
                  cloudWrap.attr("title", "Store Asset");
                  cloudWrap.attr("index", ent.id());
                  cloudWrap.append(genIcon("cloud-upload"));
                  cloudWrap.click(function(ev){
                    if (game.locals["storage"]) {
                      /*var lookupList = fIndex.split(".");
                      var lookup = lookupList.splice(0,1);
                      if (lookupList.length) {
                        for (var i in lookupList) {
                          lookup = lookup + ".f."+lookupList[i];
                        }
                      }
                      var target = sync.traverse(obj.data.organized, lookup);
                      for (var i in target.eIDs) {
                        if (target.eIDs[i] == ent.id()) {
                          target.eIDs[i] = getCookie("UserID")+"_"+ent.data._uid;
                        }
                      }*/
                      runCommand("storeAsset", {id : $(this).attr("index"), del : true});
                      if (!scope.local) {
                        obj.sync("updateConfig");
                      }
                      else {
                        obj.update();
                      }
                    }
                    else {
                      sendAlert({text : "Asset Storage hasn't loaded yet"});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    cloudWrap.remove();
                    return false;
                  });
                }
              },
              click : function(ev, ui, ent){
                var newApp = sync.newApp(categories[ent.data._t].ui);
                if (isNaN(ent.id()) && ent.id().match("_")) {
                  newApp.attr("viewOnly", "true");
                  newApp.attr("local", "true");
                }
                else if (!hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
                  newApp.attr("viewOnly", "true");
                }
                if (ent.data._t == "c") {
                  if (_down[16]) {
                    newApp.attr("ui-name", "ui_characterSummary");
                  }
                  else {
                    newApp.attr("from", "ui_characterSummary");
                  }
                }
                ent.addApp(newApp);

                var popOut = ui_popOut({
                  target : ui,
                  minimize : true,
                  dragThickness : "0.5em",
                  style : {"width" : categories[ent.data._t].width || "", "height" : categories[ent.data._t].height || ""},
                }, newApp);
                popOut.resizable();
              }
            }).appendTo(categories[ent.data._t].div);
            if (proceed instanceof Object) {
              proceed.appendTo(categories[ent.data._t].div);
            }
          }
        }
      }
    }
  }

  searchInput.keyup(function(){
    buildResults($(this).val());
  });

  return div;
});
