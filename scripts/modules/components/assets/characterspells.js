sync.render("ui_characterSpellSlots", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var data = obj.data;

  var spellSlots = $("<div>");
  var title = $("<h1 style='text-align: center;'>Spell Slots </h1>").appendTo(spellSlots);
  if (!scope.viewOnly) {
    var icon = genIcon("plus").appendTo(title);
    icon.addClass("create");
    icon.click(function() {
      var content = $("<div>");
      content.append("<b style='display : block;'>Slot Level?</b>");
      var input = genInput({
        parent : content,
        value : 0,
        type : "number",
        min : 0,
        style : {"width": "100%", "display" : "block"}
      });
      var confirm = $("<button>").appendTo(content);
      confirm.addClass("fit-x");
      confirm.append("Confirm");
      confirm.click(function(){
        if (!data.spells[input.val()]) {
          data.spells[input.val()] = [];
        }
        data.spells[input.val()].push({u : 1});
        obj.sync("updateAsset");
        layout.coverlay("new-spell-slot");
      });

      var popout = ui_popOut({
        target : $(this),
        id : "new-spell-slot",
      }, content);
    });
  }

  var slotList = $("<div>").appendTo(spellSlots);
  slotList.addClass("flexaround flexwrap");
  slotList.css("margin", "1em");

  for (var level in data.spells) {
    if (data.spells[level] && data.spells[level].length) {
      var slotContainer = $("<div>").appendTo(slotList);
      slotContainer.css("background-color", "white");
      slotContainer.addClass("outline padding smooth");
      slotContainer.css("margin", "4px");
      slotContainer.append("<b class='outlinebottom fit-x flexmiddle'>Level " + level + " Spells</b>");

      var slots = $("<div>").appendTo(slotContainer);
      slots.addClass("flexcolumn");
      slots.css("padding", "4px");

      for (var index in data.spells[level]) {
        var spellSlot = data.spells[level][index];
        var slot = $("<div>").appendTo(slots);
        slot.addClass("spadding");

        var infoPlate = $("<div>").appendTo(slot);
        infoPlate.addClass("flexrow flexaround")
        if (!spellSlot.u) {
          slot.css("background-color", "rgb(235,235,228)");
        }
        else {
          slot.addClass("outlinebottom");
        }

        if (spellSlot.s == null) {
          slot.css("background-color", "");
        }

        if (!scope.viewOnly && spellSlot.s) {
          var refresh = genIcon("refresh");
          refresh.addClass("padding");
          refresh.attr("level", level);
          refresh.attr("slot", index);
          refresh.appendTo(infoPlate);
          refresh.click(function(){
            data.spells[$(this).attr("level")][$(this).attr("slot")].u = 1;
            obj.sync("updateAsset");
          });
        }

        var infoBar = $("<div>").appendTo(infoPlate);
        infoBar.addClass("flexbetween subtitle");
        if (!spellSlot.s) {
          var attune = genIcon("book", "Attune Spell");
          attune.addClass("flexmiddle padding");
          attune.attr("level", level);
          attune.attr("slot", index);
          attune.appendTo(infoBar);
          if (!scope.viewOnly) {
            attune.click(function(){
              var spellList = $("<div>");
              spellList.css("max-height", "50vh");
              spellList.css("overflow-y", "auto");

              for (var itemIndex in data.spellbook) {
                var itemData = data.spellbook[itemIndex];

                if (!sync.val(itemData.spell.level) || sync.val(itemData.spell.level) <= $(this).attr("level")) {
                  var spellPlate = $("<div>").appendTo(spellList);
                  spellPlate.addClass("flexbetween flexmiddle hover2 outline");
                  spellPlate.css("cursor", "pointer");
                  spellPlate.attr("level", $(this).attr("level"));
                  spellPlate.attr("slot", $(this).attr("slot"));
                  spellPlate.attr("index", itemIndex)
                  if (sync.val(itemData.info.img)) {
                    var img = $("<img>").appendTo(spellPlate);
                    img.addClass("lrpadding");
                    img.attr("width", "25px");
                    img.attr("src", sync.val(itemData.info.img));
                  }
                  spellPlate.append("<b class='padding'>"+(sync.val(itemData.info.name) || "")+"</b>");
                  spellPlate.append(genIcon({icon : "book", raw : true}).addClass("lrpadding"));
                  spellPlate.click(function() {
                    obj.data.spells[$(this).attr("level")][$(this).attr("slot")].s =  $(this).attr("index");
                    obj.sync("updateAsset");
                    layout.coverlay("attune-spell");
                  });
                }
              }
              if (spellList.children().length) {
                var popout = ui_popOut({
                  target : $(this),
                  id : "attune-spell",
                  title : "Pick a Spell"
                }, spellList);
              }
            });
          }
          if (!scope.viewOnly) {
            var remove = genIcon("remove");
            remove.appendTo(infoBar);
            remove.addClass("destroy lrpadding");
            remove.attr("level", level);
            remove.attr("slot", index);
            remove.click(function(){
              data.spells[$(this).attr("level")].splice(parseInt($(this).attr("slot")), 1);
              obj.sync("updateAsset");
            });
          }
        }
        else {
          var itemData = data.spellbook[spellSlot.s];
          if (itemData) {
            var spellPlate = $("<div>").appendTo(infoPlate);
            spellPlate.addClass("flexbetween hover3 subtitle padding");
            spellPlate.attr("level", level);
            spellPlate.attr("slot", index);

            spellPlate.append("<b class='flexmiddle'>"+(sync.val(itemData.info.name) || "")+"</b>");
            if (!scope.viewOnly) {
              spellPlate.click(function() {
                delete obj.data.spells[$(this).attr("level")][$(this).attr("slot")].s;
                obj.sync("updateAsset");
              });
            }
          }
          if (!scope.viewOnly) {
            var spend = genIcon("fire");
            spend.addClass("padding");
            spend.attr("level", level);
            spend.attr("slot", index);
            spend.appendTo(infoPlate);
            spend.click(function(){
              data.spells[$(this).attr("level")][$(this).attr("slot")].u = 0;
              obj.sync("updateAsset");
            });
          }
        }
      }
    }
  }

  return spellSlots;
});

sync.render("ui_characterSpellList", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var data = obj.data;
  var div = $("<div>");
  div.css("background-color", "white");
  if (!scope.filter) {
    div.sortable({
      filter : ".spellContent",
      update : function(ev, ui) {
        var newIndex;
        var count = 0;
        $(ui.item).attr("ignore", true);
        div.children().each(function(){
          if ($(this).attr("ignore")){
            newIndex = count;
          }
          count += 1;
        });
        var old = data.spellbook.splice($(ui.item).attr("index"), 1);
        util.insert(data.spellbook, newIndex, old[0]);
        for (var level in data.spells) {
          if (data.spells[level] && data.spells[level].length) {
            for (var index in data.spells[level]) {
              var spellSlot = data.spells[level][index];
              if (spellSlot.s == $(ui.item).attr("index")) {
                delete spellSlot.s;
              }
            }
          }
        }
        obj.sync("updateAsset");
      }
    });
  }
  for (var index in data.spellbook) {
    var itemData = data.spellbook[index];
    if (itemData && (!scope.filter || scope.filter == sync.val(itemData.spell.level))) {
      var itemWrap = $("<div>").appendTo(div);
      itemWrap.addClass("outline hover2 fit-x flexcolumn spellContent smooth");
      itemWrap.attr("index", index);

      var itemCont = $("<div>").appendTo(itemWrap);
      itemCont.addClass("flexbetween");
      itemCont.attr("index", index);
      itemWrap.click(function(){
        var frame = $("<div>");
        frame.addClass("flex");

        var iRef = $(this).attr("index");
        game.locals["editSpell"] = game.locals["editSpell"] || sync.obj("editSpell");
        game.locals["editSpell"].data = duplicate(data.spellbook[iRef]);

        merge(game.locals["editSpell"].data, duplicate(game.templates.item));

        var newApp = sync.newApp("ui_renderItem").appendTo(frame);
        newApp.attr("spell", "true");
        game.locals["editSpell"].addApp(newApp);

        if (!scope.viewOnly) {
          var confirm = $("<button>").appendTo(frame);
          confirm.addClass("fit-x");
          confirm.append("Confirm");
          confirm.click(function(){
            data.spellbook[iRef] = duplicate(game.locals["editSpell"].data);
            obj.sync("updateAsset");
            layout.coverlay("edit-spell");
          });
        }
        var pop = ui_popOut({
          target : $(this),
          align : "top",
          maximize : true,
          minimize : true,
          style : {"width" : "500px", "height" : "350px"}
        }, frame);
        pop.resizable();
      });

      if (scope.minimized) {
        itemCont.addClass("subtitle lrpadding");
        itemCont.append("<b class='lrpadding'>"+sync.val(itemData.info.name)+"</b>");

        if (!scope.viewOnly) {
          var icon = genIcon("trash").appendTo(itemCont);
          icon.addClass("destroy spadding");
          icon.attr("index", index);
          icon.click(function() {
            // remove from spells, and remove from equipment
            var itemIndex = $(this).attr("index");
            ui_prompt({
              target : $(this),
              id : "delete-spell-confirmation",
              confirm : "Delete Spell",
              click : function(){
                data.spellbook.splice(itemIndex, 1);
                obj.sync("updateAsset");
              }
            });
            return false;
          });
        }
      }
      else {
        if (sync.val(itemData.info.img)) {
          var imgDiv = $("<div>").appendTo(itemCont);
          imgDiv.addClass("flexbetween");
          imgDiv.css("width", "25%");
          imgDiv.css("height", "200px");
          imgDiv.css("display", "inline-block");

          imgDiv.css("background-image", "url('"+ sync.val(itemData.info.img) +"')");
          imgDiv.css("background-size", "contain");
          imgDiv.css("background-repeat", "no-repeat");
          imgDiv.css("background-position", "center");
        }

        var item = $("<div>").appendTo(itemCont);
        item.addClass("flex spadding")
        item.css("cursor", "pointer");

        var itemDiv = $("<div>").appendTo(item);
        itemDiv.addClass("flexbetween fit-x");

        var name = $("<b>").appendTo(itemDiv);
        name.addClass("lrpadding");
        name.append(sync.val(itemData.info.name));
        if (itemData.spell.components && sync.val(itemData.spell.components)) {
          name.append("("+sync.val(itemData.spell.components)+")");
        }

        var level = $("<b>").appendTo(itemDiv);
        level.append("Level - "+(sync.val(itemData.spell.level) || 0));

        var timeDiv = $("<div>").appendTo(item);
        timeDiv.addClass("flexbetween subtitle");

        var matDiv = $("<div>").appendTo(timeDiv);
        if (sync.rawVal(itemData.spell.duration)) {
          $("<b>"+itemData.spell.duration.name+" - </b>").appendTo(matDiv);

          var name = $("<t>").appendTo(matDiv);
          name.append(sync.val(itemData.spell.duration));
        }

        var matDiv = $("<div>").appendTo(timeDiv);
        if (sync.rawVal(itemData.spell.time)) {
          $("<b>"+itemData.spell.time.name+" - </b>").appendTo(matDiv);

          var name = $("<t>").appendTo(matDiv);
          name.append(sync.val(itemData.spell.time));
        }

        var matDiv = $("<div>").appendTo(item);
        matDiv.addClass("subtitle");
        if (sync.rawVal(itemData.spell.required)) {
          $("<b>Materials - </b>").appendTo(matDiv);

          var name = $("<t>").appendTo(matDiv);
          name.append(sync.rawVal(itemData.spell.required));
        }

        var weaponDiv = $("<div>").appendTo(item);
        weaponDiv.addClass("flexbetween subtitle");
        for (var key in itemData.weapon) {
          if (sync.val(itemData.weapon[key])) {
            var matDiv = $("<div>").appendTo(weaponDiv);
            $("<b>"+itemData.weapon[key].name+" - </b>").appendTo(matDiv);

            var name = $("<t>").appendTo(matDiv);
            name.append(sync.val(itemData.weapon[key]));
          }
        }

        if (sync.val(itemData.info.notes)) {
          $("<b>Spell Description</b>").appendTo(item);

          var notes = $("<p>").appendTo(item);
          notes.append(sync.val(itemData.info.notes));
        }

        if (!scope.viewOnly) {
          var icon = genIcon("trash").appendTo(itemCont);
          icon.addClass("destroy spadding");
          icon.attr("index", index);
          icon.click(function() {
            // remove from spells, and remove from equipment
            var itemIndex = $(this).attr("index");
            ui_prompt({
              target : $(this),
              id : "delete-spell-confirmation",
              confirm : "Delete Spell",
              click : function(){
                for (var level in data.spells) {
                  for (var slot in data.spells) {
                    if (data.spells[level][slot] && data.spells[level][slot].s == itemIndex) {
                      delete obj.data.spells[level][slot].s;
                    }
                  }
                }
                data.spellbook.splice(itemIndex, 1);
                obj.sync("updateAsset");
              }
            });
            return false;
          });
        }
      }
    }
  }

  return div;
});

sync.render("ui_characterSpellList", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var data = obj.data;
  var div = $("<div>");
  if (!scope.filter) {
    div.sortable({
      filter : ".spellContent",
      update : function(ev, ui) {
        var newIndex;
        var count = 0;
        $(ui.item).attr("ignore", true);
        div.children().each(function(){
          if ($(this).attr("ignore")){
            newIndex = count;
          }
          count += 1;
        });
        var old = data.spellbook.splice($(ui.item).attr("index"), 1);
        util.insert(data.spellbook, newIndex, old[0]);
        for (var level in data.spells) {
          if (data.spells[level] && data.spells[level].length) {
            for (var index in data.spells[level]) {
              var spellSlot = data.spells[level][index];
              if (spellSlot.s == $(ui.item).attr("index")) {
                delete spellSlot.s;
              }
            }
          }
        }
        obj.sync("updateAsset");
      }
    });
  }
  for (var index in data.spellbook) {
    var itemData = data.spellbook[index];
    if (itemData && (!scope.filter || scope.filter == sync.val(itemData.spell.level))) {
      var itemWrap = $("<div>").appendTo(div);
      itemWrap.addClass("outline hover2 fit-x flexcolumn spellContent smooth");
      itemWrap.attr("index", index);

      var itemCont = $("<div>").appendTo(itemWrap);
      itemCont.addClass("flexbetween");
      itemCont.attr("index", index);
      itemWrap.click(function(){
        var frame = $("<div>");
        frame.addClass("flex flexcolumn");

        var iRef = $(this).attr("index");
        game.locals["editSpell"] = game.locals["editSpell"] || sync.obj("editSpell");
        game.locals["editSpell"].data = duplicate(data.spellbook[iRef]);

        merge(game.locals["editSpell"].data, duplicate(game.templates.item));

        var newApp = sync.newApp("ui_renderItem").appendTo(frame);
        newApp.attr("spell", "true");
        game.locals["editSpell"].addApp(newApp);

        if (!scope.viewOnly) {
          var confirm = $("<button>").appendTo(frame);
          confirm.addClass("fit-x");
          confirm.append("Confirm");
          confirm.click(function(){
            data.spellbook[iRef] = duplicate(game.locals["editSpell"].data);
            obj.sync("updateAsset");
            layout.coverlay("edit-spell");
          });
        }
        var pop = ui_popOut({
          target : $(this),
          align : "top",
          id : "edit-spell",
          maximize : true,
          minimize : true,
          style : {"width" : "500px", "height" : "350px"}
        }, frame);
        pop.resizable();
      });

      if (scope.minimized) {
        itemCont.addClass("subtitle spadding");
        itemCont.append("<b class='lrpadding'>"+sync.val(itemData.info.name)+"</b>");

        if (!scope.viewOnly) {
          var icon = genIcon("trash").appendTo(itemCont);
          icon.addClass("destroy lrpadding");
          icon.attr("index", index);
          icon.click(function() {
            // remove from spells, and remove from equipment
            var itemIndex = $(this).attr("index");
            ui_prompt({
              target : $(this),
              id : "delete-spell-confirmation",
              confirm : "Delete Spell",
              click : function(){
                data.spellbook.splice(itemIndex, 1);
                obj.sync("updateAsset");
              }
            });
            return false;
          });
        }
      }
      else {
        if (sync.val(itemData.info.img)) {
          var imgDiv = $("<div>").appendTo(itemCont);
          imgDiv.addClass("flexbetween");
          imgDiv.css("width", "25%");
          imgDiv.css("height", "200px");
          imgDiv.css("display", "inline-block");

          imgDiv.css("background-image", "url('"+ sync.val(itemData.info.img) +"')");
          imgDiv.css("background-size", "contain");
          imgDiv.css("background-repeat", "no-repeat");
          imgDiv.css("background-position", "center");
        }

        var item = $("<div>").appendTo(itemCont);
        item.css("flex", "2");
        item.css("padding", "8px");
        item.css("cursor", "pointer");

        var itemDiv = $("<div>").appendTo(item);
        itemDiv.addClass("flexbetween fit-x");

        var name = $("<b>").appendTo(itemDiv);
        name.addClass("lrpadding");
        name.append(sync.val(itemData.info.name));
        if (itemData.spell.components && sync.val(itemData.spell.components)) {
          name.append("("+sync.val(itemData.spell.components)+")");
        }

        var level = $("<b>").appendTo(itemDiv);
        level.append(itemData.spell.level.name+" - "+(sync.val(itemData.spell.level) || 0));

        var weaponDiv = $("<div>").appendTo(item);
        weaponDiv.addClass("flexbetween subtitle");
        for (var key in itemData.weapon) {
          if (sync.val(itemData.weapon[key])) {
            var matDiv = $("<div>").appendTo(weaponDiv);
            $("<b>"+itemData.weapon[key].name+" - </b>").appendTo(matDiv);

            var name = $("<t>").appendTo(matDiv);
            name.append(sync.val(itemData.weapon[key]));
          }
        }

        var timeDiv = $("<div>").appendTo(item);
        timeDiv.addClass("flexbetween subtitle");

        var matDiv = $("<div>").appendTo(timeDiv);
        if (sync.rawVal(itemData.spell.duration)) {
          $("<b>"+itemData.spell.duration.name+" - </b>").appendTo(matDiv);

          var name = $("<t>").appendTo(matDiv);
          name.append(sync.val(itemData.spell.duration));
        }

        var matDiv = $("<div>").appendTo(timeDiv);
        if (sync.rawVal(itemData.spell.time)) {
          $("<b>"+itemData.spell.time.name+" - </b>").appendTo(matDiv);

          var name = $("<t>").appendTo(matDiv);
          name.append(sync.val(itemData.spell.time));
        }

        var matDiv = $("<div>").appendTo(item);
        matDiv.addClass("subtitle");

        if (sync.rawVal(itemData.spell.required)) {
          $("<b>Materials - </b>").appendTo(matDiv);

          var name = $("<t>").appendTo(matDiv);
          name.append(sync.rawVal(itemData.spell.required));
        }

        if (sync.val(itemData.info.notes)) {
          $("<b>Spell Description</b>").appendTo(item);

          var notes = $("<p>").appendTo(item);
          notes.append(sync.val(itemData.info.notes));
        }

        if (!scope.viewOnly) {
          var icon = genIcon("trash").appendTo(itemCont);
          icon.addClass("destroy lrpadding");
          icon.attr("index", index);
          icon.click(function() {
            // remove from spells, and remove from equipment
            var itemIndex = $(this).attr("index");
            ui_prompt({
              target : $(this),
              id : "delete-spell-confirmation",
              confirm : "Delete Spell",
              click : function(){
                for (var level in data.spells) {
                  for (var slot in data.spells) {
                    if (data.spells[level][slot] && data.spells[level][slot].s == itemIndex) {
                      delete obj.data.spells[level][slot].s;
                    }
                  }
                }
                data.spellbook.splice(itemIndex, 1);
                obj.sync("updateAsset");
              }
            });
            return false;
          });
        }
      }
    }
  }

  return div;
});

sync.render("ui_characterSpells", function(obj, app, scope){
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var data = obj.data;
  var div = $("<div>");

  // scan and find all the different levels
  var levels = {};
  for (var index in data.spellbook) {
    var itemData = data.spellbook[index];
    if (itemData && sync.val(itemData.spell.level) != null) {
      levels[sync.val(itemData.spell.level)] = true;
    }
  }
  if (!scope.hideTitle) {
    var title = $("<h1 style='text-align: center;'>Spells </h1>").appendTo(div);
    if (!scope.viewOnly) {
      var icon = genIcon("plus").appendTo(title);
      icon.addClass("create");
      icon.click(function() {
        var frame = $("<div>");
        frame.addClass("flex flexcolumn");

        game.locals["createSpell"] = game.locals["createSpell"] || sync.obj("createSpell");
        game.locals["createSpell"].data = {};
        merge(game.locals["createSpell"].data, duplicate(game.templates.item));

        var newApp = sync.newApp("ui_renderItem").appendTo(frame);
        newApp.attr("spell", "true");
        newApp.attr("info", true);
        newApp.attr("weapon", true);

        game.locals["createSpell"].addApp(newApp);

        var buttonWrap = $("<div>").appendTo(frame);
        buttonWrap.addClass("flexrow");

        var confirm = $("<button>").appendTo(buttonWrap);
        confirm.addClass("flex");
        confirm.append("Create");
        confirm.click(function(){
          obj.data.spellbook.push(duplicate(game.locals["createSpell"].data));
          obj.sync("updateAsset");
        });

        var confirm = $("<button>").appendTo(buttonWrap);
        confirm.addClass("flex");
        confirm.append("Create and Close");
        confirm.click(function(){
          obj.data.spellbook.push(duplicate(game.locals["createSpell"].data));
          obj.sync("updateAsset");
          layout.coverlay("create-spell");
        });
        var pop = ui_popOut({
          target : $(this),
          id : "create-spell",
          align : "top",
          maximize : true,
          minimize : true,
          style : {"width" : "500px", height : "350px"}
        }, frame);
        pop.resizable();
      });
    }
  }

  var spellTabs = genNavBar();
  spellTabs.css("margin", "1em");
  spellTabs.css("background-color", "white");
  spellTabs.appendTo(div);

  spellTabs.generateTab("All Spells", "list", function(parent) {
    var columns = $("<div>").appendTo(parent);
    columns.addClass("flexrow flexaround flexwrap outlinebottom");
    for (var level in levels) {
      var container = $("<div>").appendTo(columns);
      container.addClass("flexcolumn flexmiddle");

      var title = $("<b>").appendTo(container);
      title.append("Level - " + level);

      var list = sync.render("ui_characterSpellList")(obj, app, {viewOnly: scope.viewOnly, filter : level, minimized : true});
      list.appendTo(container);
    }

    var container = $("<div>").appendTo(parent);
    container.addClass("flexcolumn");
    container.css("margin", "1em");

    var title = $("<div>").appendTo(container);
    title.addClass("flexbetween");
    title.append("<b>List</b>");

    var sortWrap = $("<div>").appendTo(title);
    sortWrap.addClass("flexrow flexaround");

    var minimize = genIcon("resize-small", "Minimize");
    if (app.attr("hideSpells")) {
      minimize = genIcon("resize-full", "Maximize");
    }
    minimize.appendTo(sortWrap);
    minimize.addClass("lrpadding");
    minimize.click(function(){
      if (app.attr("hideSpells")) {
        app.removeAttr("hideSpells");
      }
      else {
        app.attr("hideSpells", true);
      }
      obj.update();
    });

    var sort = genIcon("list", "Sort");
    sort.appendTo(sortWrap);
    sort.addClass("lrpadding");
    sort.click(function(){
      data.spellbook.sort(function(a,b) {
        if (sync.val(a.info.name) < sync.val(b.info.name)) {
          return -1;
        }
        if (sync.val(a.info.name) > sync.val(b.info.name)) {
          return 1;
        }
        // a must be equal to b
        return 0;
      });
      // clear equipped
      for (var level in data.spells) {
        if (data.spells[level] && data.spells[level].length) {
          for (var index in data.spells[level]) {
            var spellSlot = data.spells[level][index];
            delete spellSlot.s;
          }
        }
      }
      obj.sync("updateAsset");
    });

    var list = sync.render("ui_characterSpellList")(obj, app, {viewOnly: scope.viewOnly, minimized : app.attr("hideSpells") == "true"});
    list.appendTo(container);

    if (app) {
      app.attr("spell_tab", "All Spells");
    }
  });

  function tabWrap(level) {
    spellTabs.generateTab(level, "", function(parent) {
      var columns = $("<div>").appendTo(parent);
      columns.addClass("flexcolumn");
      columns.append(sync.render("ui_characterSpellList")(obj, app, {viewOnly: scope.viewOnly, filter : level}));

      if (app) {
        app.attr("spell_tab", level);
      }
    });
  }

  for (var key in levels) {
    tabWrap(key);
  }

  if (app) {
    if (!app.attr("spell_tab")) {
      app.attr("spell_tab", "All Spells");
    }
    spellTabs.selectTab(app.attr("spell_tab"));
  }
  else {
    spellTabs.selectTab("All Spells");
  }

  return div;
});
