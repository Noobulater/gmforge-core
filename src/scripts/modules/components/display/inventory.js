sync.render("ui_renderItemv2", function(obj, app, scope){
  if (!obj) {return $("<div>");}
  if (!game.templates.build) {
    return sync.render("ui_renderItem")(obj, app, scope);
  }

  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};
  scope.cref = scope.cref || app.attr("char-ref") || null;
  scope.mode = app.attr("mode") || "notes";
  scope.local = scope.local || (app.attr("local") == "true");
  scope.homebrew = scope.homebrew || (app.attr("homebrew") == "true");
  scope.path = app.attr("path");
  scope.index = app.attr("index");
  var templates = scope.templates || game.templates;

  var char;
  var ctx = sync.defaultContext();
  ctx[obj.data._t] = obj.data;
  if (scope.cref) {
    char = getEnt(scope.cref);
    ctx[char.data._t] = duplicate(char.data);
  }

  var itemData = scope.itemData || obj.data;

  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexrow fit-x background outline");

  if (app.attr("homebrew")) {
    var targetIcon = $("<button>").appendTo(optionsBar);
    targetIcon.addClass("background subtitle alttext");
    targetIcon.text("Default Data Model");
    targetIcon.click(function(){
      var select = sync.newApp("ui_JSON");
      select.attr("lookup", "templates.elements."+obj.data._type);
      select.attr("closeTarget", "json-editor");
      game.locals["homebrew"].addApp(select);

      var popout = ui_popOut({
        target : $("body"),
        id : "json-editor",
        title : "Default Data Model(JSON)"
      }, select);
      popout.resizable();
    });
  }
  else {
    var selectData = {};
    for (var k in game.templates.elements) {
      selectData[k] = k;
    }
    if (Object.keys(selectData)) {
      var select = genInput({
        select : selectData,
        parent : optionsBar,
        classes : "subtitle",
        value : obj.data._type,
        disabled : scope.viewOnly,
      });
      select.change(function(){
        var elementData = game.templates.elements[$(this).val()];
        obj.data._drop = elementData._drop;
        obj.data._t = elementData._t;
        obj.data._type = elementData._type;

        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      });
    }
  }

  var actions = $("<button>").appendTo(optionsBar);
  actions.addClass("background subtitle alttext");
  if (app.attr("mode") == "attributes") {
    actions.removeClass("background");
    actions.addClass("highlight");
  }
  actions.text("Attributes");
  actions.click(function(){
    if (app.attr("mode") == "attributes") {
      app.removeAttr("mode");
    }
    else {
      app.attr("mode", "attributes");
    }
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var actions = $("<button>").appendTo(optionsBar);
  actions.addClass("background subtitle alttext");
  if (app.attr("mode") == "html") {
    actions.removeClass("background");
    actions.addClass("highlight");
  }
  actions.text("Sheet");
  actions.click(function(){
    var content = $("<div>");
    content.addClass("flexcolumn fit-xy");

    var select = genInput({
      parent : content,
      type : "textarea",
      classes : "flex subtitle",
      disabled : scope.viewOnly,
    });
    if (obj.data._d && obj.data._d.content) {
      select.text(obj.data._d.content);
    }
    else if (game.templates.display.elements[obj.data._type || Object.keys(game.templates.display.elements)[0]] && game.templates.display.elements[obj.data._type || Object.keys(game.templates.display.elements)[0]].content) {
      select.text(game.templates.display.elements[obj.data._type || Object.keys(game.templates.display.elements)[0]].content);
    }
    select.change(function(){
      if ($(this).val()) {
        obj.data._d = obj.data._d || {};
        obj.data._d.content = $(this).val();
      }
      else {
        delete obj.data._d;
      }
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    content.append("<button class='fit-x spadding'>Confirm</button>");

    var popout = ui_popOut({
      target : $("body"),
      id : "json-editor",
      style : {"width" : "600px", "height" : "600px"}
    }, content);
    popout.resizable();
  });

  var actions = $("<button>").appendTo(optionsBar);
  actions.addClass("background subtitle alttext");
  if (app.attr("mode") == "calc") {
    actions.removeClass("background");
    actions.addClass("highlight");
  }
  actions.text("Math");
  actions.click(function(){
    if (app.attr("mode") == "calc") {
      app.removeAttr("mode");
    }
    else {
      app.attr("mode", "calc");
    }
    obj.update();
  });

  var actions = $("<button>").appendTo(optionsBar);
  actions.addClass("background subtitle alttext");
  if (app.attr("mode") == "actions") {
    actions.removeClass("background");
    actions.addClass("highlight");
  }
  actions.text("Hobar");
  actions.click(function(){
    if (app.attr("mode") == "actions") {
      app.removeAttr("mode");
    }
    else {
      app.attr("mode", "actions");
    }
    obj.update();
  });

//game.templates.display.item

  if (app.attr("mode") == "attributes") {
    optionsBar.empty();
    optionsBar.addClass("flexbetween");

    var reset = $("<button>").appendTo(optionsBar);
    reset.addClass("highlight lrpadding alttext flexmiddle subtitle");
    reset.text("Back to Sheet");
    reset.click(function(){
      app.removeAttr("mode");
      obj.update();
    });

    var template = {info : "", equip : "", weapon : "", spell : ""};
    var sheet = scope.sheet;
    if (app.attr("homebrew")) {
      sheet = sheet || game.locals["homebrew"].data.templates.display.elements[obj.data._type];
    }
    else {
      sheet = sheet || game.templates.display.elements[obj.data._type] || game.templates.display.elements[Object.keys(game.templates.display.elements)[0]];
    }
    if (sheet.categories) {
      template = {};
      for (var k in sheet.categories) {
        template[k] = sheet.categories[k];
      }
    }

    var reset = $("<button>").appendTo(optionsBar);
    reset.addClass("background lrpadding alttext flexmiddle subtitle");
    reset.text("Load Attributes");
    reset.click(function(){
      var content = sync.render("ui_assetPicker")(obj, app, {
        category : "i",
        filter : "i",
        select : function(ev, ui, ent, options, entities){
          if (ent.data) {
            for (var key in template) {
              obj.data[key] = duplicate(ent.data[key]);
            }
            if (!scope.local) {
              obj.sync("updateAsset");
            }
            else {
              obj.update();
            }
          }
          layout.coverlay("add-asset");
        }
      });
      var pop = ui_popOut({
        target : $("body"),
        prompt : true,
        id : "add-asset",
        title : "Pick Sheet",
        style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
      }, content);
      pop.resizable();
    });

    var scrollDiv = $("<div>").appendTo(div);
    scrollDiv.addClass("flex foreground scroll-xy");
    scrollDiv.css("position", "relative");
    scrollDiv.scroll(function(){
      app.attr("_lastScrollTop", scrollDiv.scrollTop());
      app.attr("_lastScrollLeft", scrollDiv.scrollLeft());
    });

    var list = $("<div>").appendTo(scrollDiv);
    list.addClass("lrpadding fit-x");
    list.css("position", "absolute");

    var keys = {};
    for (var key in template) {
      var path = key;
      var attrPlate = $("<div>").appendTo(list);
      attrPlate.addClass("lrpadding");
      attrPlate.css("font-size", "1.2em");
      attrPlate.append("<u class='bold lrpadding lrmargin alttext'>"+key+"</b>");

      var attrWrap = $("<div>").appendTo(attrPlate);
      attrWrap.addClass("flexcolumn subtitle white outline smooth lpadding");
      attrWrap.css("margin-bottom", "1em");
      if (template[key] == "") {
        var headerRow = $("<div>").appendTo(attrWrap);
        headerRow.addClass("flexrow padding");
        headerRow.append("<u class='subtitle flexmiddle lrmargin' style='width:100px'>Macro Key</u>");
        headerRow.append("<u class='flex subtitle flexmiddle lrmargin' style='width:100px'>Name</u>");
        headerRow.append("<u class='flex2 subtitle flexmiddle lrmargin' style='width:100px'>Value</u>");
        headerRow.append("<u class='subtitle flexmiddle lrmargin' style='width:40px'>Min</u>");
        headerRow.append("<u class='subtitle flexmiddle lrmargin' style='width:40px'>Max</u>");
        headerRow.append("<u class='subtitle flexmiddle lrmargin' style='width:70px'>Modifiers</u>");
        if (!scope.viewOnly) {
          headerRow.append(genIcon("remove").addClass("lrpadding lrmargin").css("color", "transparent"));
        }
        for (var subKey in obj.data[key]) {
          path = key + "." + subKey;
          if (path != "info.notes" && path != "info.img" && path != "info.name") {
            var attrOption = $("<div>").appendTo(attrWrap);
            attrOption.addClass("flexrow padding");
            if (!keys[subKey]) {
              attrOption.append("<text class='subtitle flexmiddle' style='width:100px'>@"+subKey+"</text>");
              keys[subKey] = true;
            }
            else {
              attrOption.append("<text class='subtitle flexmiddle' style='width:100px'>@c."+path+"</text>");
            }

            var name = genInput({
              parent : attrOption,
              classes : "line subtitle lrmargin middle",
              value : obj.data[key][subKey],
              cmd : "updateAsset",
              obj : obj,
              name : true,
              disabled : scope.viewOnly,
              style : {"width" : "150px"}
            });

            var value = genInput({
              parent : attrOption,
              classes : "line subtitle flex2 lrmargin middle",
              value : obj.data[key][subKey],
              cmd : "updateAsset",
              obj : obj,
              disabled : scope.viewOnly,
            });

            var min = genInput({
              parent : attrOption,
              classes : "line subtitle lrmargin middle",
              value : obj.data[key][subKey],
              style : {"width" : "40px"},
              cmd : "updateAsset",
              obj : obj,
              raw : "min",
              disabled : scope.viewOnly,
            });

            var max = genInput({
              parent : attrOption,
              classes : "line subtitle lrmargin middle",
              value : obj.data[key][subKey],
              style : {"width" : "40px"},
              cmd : "updateAsset",
              obj : obj,
              disabled : scope.viewOnly,
              raw : "max"
            });

            var remove = genIcon("list-alt", "Mods").appendTo(attrOption);
            remove.addClass("flexmiddle lrmargin lrpadding");
            remove.attr("path", path);
            remove.css("width", "70px");
            remove.click(function(){
              var path = $(this).attr("path");

              var content = sync.newApp("ui_modifiers");
              content.attr("viewOnly", scope.viewOnly);
              content.attr("lookup", path);
              content.attr("modsOnly", "true");
              obj.addApp(content);

              ui_popOut({
                target : $(this),
                align : "top",
                title : "Modifiers",
                id : "modify-exp",
                style : {"min-width" : "100px"},
              }, content);
            });
            if (!scope.viewOnly) {
              var remove = genIcon("remove").appendTo(attrOption);
              remove.addClass("destroy flexmiddle lrmargin lrpadding");
              remove.attr("path", path);
              remove.click(function(){
                var path = $(this).attr("path");

                ui_prompt({
                  target : $(this),
                  confirm : "Delete Attribute",
                  click : function(){
                    sync.traverse(obj.data, path, "");
                    if (!scope.local) {
                      obj.sync("updateAsset");
                    }
                    else {
                      obj.update();
                    }
                  }
                });
              });
            }
          }
        }
        if (!scope.viewOnly) {
          var headerRow = genIcon("plus", "New Attribute").appendTo(attrWrap);
          headerRow.addClass("flexmiddle fit-x create");
          headerRow.attr("category", key);
          headerRow.click(function(){
            var category = $(this).attr("category");

            var invalidKeys = {
              "length" : "system",
            }; // invalid keys

            for (var key in obj.data) {
              invalidKeys[key] = key;
            }
            for (var key in obj.data.info) {
              invalidKeys[key] = "info."+key;
            }
            for (var key in obj.data.counters) {
              invalidKeys[key] = "counters."+key;
            }
            for (var key in obj.data.stats) {
              invalidKeys[key] = "stats."+key;
            }


            for (var key in game.templates.item.info) {
              invalidKeys[key] = "item.info."+key;
            }
            for (var key in game.templates.item.equip) {
              invalidKeys[key] = "item.equip."+key;
            }
            for (var key in game.templates.item.weapon) {
              invalidKeys[key] = "item.weapon."+key;
            }
            for (var key in game.templates.item.spell) {
              invalidKeys[key] = "item.spell."+key;
            }

            ui_prompt({
              target : $(this),
              inputs : {
                "Macro Key" : "",
              },
              click : function(ev, inputs){
                var path = inputs["Macro Key"].val();
                if (path && path != "notes" && path != "img" && path != "name" && isNaN(path)) {
                  path = replaceAll(path, " ", "_");
                  path = replaceAll(path, "@", "");
                  path = replaceAll(path, "(", "_");
                  path = replaceAll(path, ")", "_");
                  path = replaceAll(path, "[", "_");
                  path = replaceAll(path, "]", "_");
                  path = replaceAll(path, "!", "_");
                  path = replaceAll(path, "#", "_");
                  path = replaceAll(path, "$", "_");
                  if (invalidKeys[path]) {
                    sendAlert({text : "This key is used somewhere else"});
                  }
                  else {
                    obj.data[category][path] = {};
                    obj.sync("updateAsset");
                  }
                }
              }
            });
          });
        }
      }
      else {
        sync.render("ui_processUI")(obj, app, {display : template[key], viewOnly : scope.viewOnly}).appendTo(attrWrap);
      }
    }
  }
  else if (app.attr("mode") == "calc") {
    obj.data._calc = obj.data._calc || [];
    var calcs = obj.data._calc;

    var warning = $("<i>").appendTo(div);
    warning.addClass("flexmiddle subtitle bold padding");
    warning.text("Calculations performed here are written to the parent character sheet, and change the values directly. Use with caution");

    var calcWrapper = $("<div>").appendTo(div);
    calcWrapper.addClass("flexcolumn flex smooth scroll-y");
    calcWrapper.css("position", "relative");

    var calcList = $("<div>").appendTo(calcWrapper);
    calcList.addClass("fit-x");
    calcList.css("position", "absolute");
    calcList.css("top", "0");
    calcList.css("left", "0");

    sync.render("ui_math")(obj, app, {calc : calcs, cref : scope.cref, viewOnly : scope.viewOnly}).appendTo(calcList);
  }
  else if (app.attr("mode") == "actions") {
    sync.render("ui_manageActionsv2")(obj, app, scope).appendTo(div);
  }
  else {
    var sheet = obj.data._d;
    if (app.attr("homebrew")) {
      sheet = sheet || game.locals["homebrew"].data.templates.display.elements[obj.data._type];
    }
    else {
      sheet = sheet || game.templates.display.elements[obj.data._type || Object.keys(game.templates.display.elements)[0]];
    }
    var displayPort = sync.render("ui_processUI")(obj, app, {display : sheet.content, viewOnly : scope.viewOnly}).appendTo(div);
    for (var i in sheet.style) {
      displayPort.css(i, sheet.style[i]);
    }
  }
  return div;
});


sync.render("ui_renderItem", function(obj, app, scope){
  if (!obj) {return $("<div>");}
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};
  scope.cref = scope.cref || app.attr("char-ref") || null;
  scope.mode = app.attr("mode") || "notes";
  scope.local = scope.local || (app.attr("local") == "true");
  scope.homebrew = scope.homebrew || (app.attr("homebrew") == "true");

  var templates = scope.templates || game.templates;
  var params = templates.display.item.params;

  var char;
  var ctx = sync.defaultContext();
  ctx[obj.data._t] = obj.data;
  if (scope.cref) {
    char = getEnt(scope.cref);
    ctx[char.data._t] = duplicate(char.data);
  }

  var itemData = scope.itemData || obj.data;

  if (!scope.itemData) {
    obj.data._flags = obj.data._flags || duplicate(obj.data.tags || {});
  }

  var div = $("<div>");
  div.addClass("fit-xy flexrow");
  if (!scope.viewOnly) {
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
        olay.css("z-index", util.getMaxZ(".ui-popout")+1);
        olay.append("<b>Drop to Load</b>");
      }
    });
    div.droppable();
    div.on('drop', function(ev, ui){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer||$(ui.draggable).data("dt");
      if (hook.call("OnDropItem", obj, app, scope, dt)) {
        if (dt && dt.getData("OBJ")) {
          var ent = JSON.parse(dt.getData("OBJ"));
          if (ent._t == "i") {
            obj.data = ent;
          }
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
        }
        else if (dt && dt.getData("Text")) {
          sync.rawVal(obj.data.info.img, dt.getData("Text"));
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
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


  var overview = $("<div>").appendTo(div);
  overview.addClass("flexcolumn outline sheet1 padding");

  var info = itemData.info;

  var itemImage = $("<div>").appendTo(overview);
  itemImage.addClass("outline smooth flexmiddle white");
  itemImage.css("background-image", "url('"+ sync.rawVal(itemData.info.img) +"')");
  itemImage.css("background-size", "contain");
  itemImage.css("background-repeat", "no-repeat");
  itemImage.css("background-position", "center");
  itemImage.css("width", "150px");
  itemImage.css("height", "150px");
  if (!scope.viewOnly) {
    itemImage.addClass("hover2");
    itemImage.click(function(){
      var imgList = sync.render("ui_filePicker")(obj, app, {
        filter : "img",
        change : function(ev, ui, value){
          sync.rawVal(itemData.info.img, value);
          if (!scope.local) {
            obj.sync("updateAsset");
          }
          else {
            obj.update();
          }
          layout.coverlay("icons-picker");
        }
      });

      var pop = ui_popOut({
        target : $(this),
        id : "icons-picker",
        prompt : true,
        style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
      }, imgList);
      pop.resizable();
    });
  }
  itemImage.contextmenu(function(ev){
    if (sync.rawVal(itemData.info.img)) {
      assetTypes["img"].contextmenu(ev, $(this), sync.rawVal(itemData.info.img));
    }
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  });

  var infoPane = $("<div>").appendTo(overview);
  infoPane.addClass("flexcolumn flexbetween fit-x padding");


  var wrap = $("<div>").appendTo(infoPane);
  wrap.addClass("flexrow flexbetween");

  wrap.append("<b>"+(info.weight.name || "Weight")+"</b>");


  var weight = genInput({
    classes : "subtitle line middle",
    parent: wrap,
    placeholder: info.weight.name || "Weight",
    value: sync.val(info.weight),
    disabled: scope.viewOnly,
    style : {width : "80px"},
    type: "number",
  })

  weight.change(function() {
    var newVal = $(this).val();
    if ($(this).val() == "") {
      newVal = null;
    }
    sync.val(info.weight, newVal);
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });


  var wrap = $("<div>").appendTo(infoPane);
  wrap.addClass("flexrow flexbetween");

  wrap.append("<b>"+(info.quantity.name || "Quantity")+"</b>");

  var quantity = genInput({
    classes : "subtitle line middle",
    parent : wrap,
    placeholder : info.quantity.name || "Quantity",
    value : info.quantity,
    disabled: scope.viewOnly,
    type : "number",
    style : {width : "80px"},
  });
  quantity.change(function() {
    sync.val(info.quantity, $(this).val());
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  }).addClass("subtitle");

  if (info.price) {
    var wrap = $("<div>").appendTo(infoPane);
    wrap.addClass("flexrow flexbetween");

    wrap.append("<b>"+(info.price.name || "Price")+"</b>");

    var price = genInput({
      classes : "subtitle line middle",
      parent : wrap,
      placeholder : info.price.name,
      title : info.price.name,
      value : info.price,
      disabled: scope.viewOnly,
      style : {width : "80px"},
    });
    price.change(function() {
      sync.val(info.price, $(this).val());
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });
  }

  overview.append("<div class='spadding'></div>");

  var tags = sync.render("ui_tags")(obj, app, {viewOnly : scope.viewOnly}).appendTo(overview);
  tags.addClass("fit-x");
  tags.removeClass("flexrow");
  tags.css("max-height", "100px");
  tags.css("overflow", "auto");


  var contentWrap = $("<div>").appendTo(div);
  contentWrap.addClass("flex2");
  contentWrap.css("position", "relative");
  contentWrap.css("overflow", "auto");

  var content = $("<div>").appendTo(contentWrap);
  content.addClass("fit-xy flexcolumn");
  content.css("position", "absolute");

  var wrap = $("<div>").appendTo(content);
  wrap.addClass("padding sheet1 outline");

  var name = genInput({
    classes : "line size4 bold fit-x",
    parent: wrap,
    placeholder: info.name.name,
    value: info.name,
    disabled: scope.viewOnly,
  });
  name.change(function() {
    sync.rawVal(info.name, $(this).val());
    if (!scope.local) {
      obj.sync("updateAsset");
    }
    else {
      obj.update();
    }
  });

  var optionsBar = $("<div>").appendTo(content);
  optionsBar.addClass("flexrow fit-x flexbetween background");

  var category = $("<div>").appendTo(optionsBar);
  category.addClass("flexrow subtitle");
  category.css("color", "#333");

  var notes = $("<button>").appendTo(category);
  notes.append("Notes");
  notes.click(function(){
    app.attr("mode", "notes");
    obj.update();
  });

  var armor = $("<button>").appendTo(category);
  armor.append("Armor");
  armor.click(function(){
    app.attr("mode", "armor");
    obj.update();
  });

  var weapon = $("<button>").appendTo(category);
  weapon.append("Weapon");
  weapon.click(function(){
    app.attr("mode", "weapon");
    obj.update();
  });

  var spell = $("<button>").appendTo(category);
  spell.append("Spell");
  spell.click(function(){
    app.attr("mode", "spell");
    obj.update();
  });

  var options = $("<div>").appendTo(optionsBar);
  options.addClass("flex");

  var options = $("<div>").appendTo(optionsBar);
  options.addClass("flexrow flexmiddle alttext");
  if (!scope.viewOnly) {
    var clear = genIcon("trash", "Clear").appendTo(options);
    clear.addClass("lrpadding subtitle");
    clear.click(function(){
      obj.data = duplicate(templates.item);
      if (!scope.local) {
        obj.sync("updateAsset");
      }
      else {
        obj.update();
      }
    });

    var load = genIcon("briefcase").appendTo(options);
    load.addClass("lrpadding subtitle");
    load.attr("title", "Load an Existing Item");
    load.click(function(){
      var content = sync.render("ui_existing")(obj, app, {lookup : (scope.mode=="spell")?("spellbook"):("inventory")});
      content.addClass("flex");

      if (content.children().length) {
        ui_popOut({
          target : $("body"),
          id : "item-picker",
          title : "Load Existing Item",
          style : {"width" : "80vw", "height" : "80vh"}
        }, content).resizable();
      }
    });
  }

  if (hasSecurity(getCookie("UserID"), "Rights")) {
    var security = genIcon("lock").appendTo(options);
    security.addClass("subtitle");
    security.attr("index", index);
    security.attr("title", "Configure who has access to this object");
    security.css("margin-right", "4px");
    security.click(function(ev){
      obj.data._s = obj.data._s || {default : 1};

      var content = sync.newApp("ui_rights");
      content.attr("viewOnly", scope.viewOnly);
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        prompt : true,
        id : "ui-rights-dialog",
      }, content);
    });
  }

  if (!scope.viewOnly) {
    var stylePage = genIcon("tint").appendTo(options);
    stylePage.addClass("subtitle")
    stylePage.attr("title", "Change the style of how this page renders");
    stylePage.click(function(){
      var newApp = sync.newApp("ui_stylePage");
      obj.addApp(newApp);

      var pop = ui_popOut({
        target : app,
        align : "right",
        id : "page-styling",
        title : "Page Style",
        style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
      }, newApp);
    });

    var actions = $("<div>").appendTo(optionsBar);
    actions.addClass("flex");

    var actions = $("<button>").appendTo(optionsBar);
    actions.addClass("background subtitle alttext");
    if (app.attr("mode") == "calc") {
      actions.removeClass("background");
      actions.addClass("highlight");
    }
    actions.text("Math");
    actions.click(function(){
      app.attr("mode", "calc");
      obj.update();
    });

    var actions = $("<button>").appendTo(optionsBar);
    actions.addClass("background subtitle alttext");
    if (app.attr("mode") == "actions") {
      actions.removeClass("background");
      actions.addClass("highlight");
    }
    actions.text("Actions");
    actions.click(function(){
      app.attr("mode", "actions");
      obj.update();
    });
  }

  var content = $("<div>").appendTo(content);
  content.addClass("padding flex flexcolumn");
  if (app.attr("mode") == "actions") {
    content.removeClass("padding");

    var charWrapper = $("<div>").appendTo(content);
    charWrapper.addClass("flexcolumn flex subtitle");
    charWrapper.css("overflow-y", "auto");
    charWrapper.attr("_lastScrollTop", app.attr("_lastScrollTop"));
    charWrapper.scroll(function(){
      app.attr("_lastScrollTop", charWrapper.scrollTop());
      app.attr("_lastScrollLeft", charWrapper.scrollLeft());
    });

    sync.render("ui_manageActions")(obj, app, scope).appendTo(charWrapper);
  }
  else if (scope.mode == "armor") {
    armor.addClass("highlight alttext");

    var armorDiv = $("<div>").appendTo(content);
    armorDiv.addClass("flexrow flex");

    if (templates.display.item.params && templates.display.item.params["equip"]) {
      for (var aKey in templates.display.item.params["equip"]) {
        var newScope = duplicate(scope);
        newScope.display = templates.display.item.params["equip"][aKey];
        newScope.char = char;
        if (scope.markup) {
          newScope.markup = scope.markup;
        }
        armorDiv.append(sync.render("ui_processUI")(obj, app, newScope));
      }
    }
    else {
      var armorRow = $("<div>").appendTo(armorDiv);
      armorRow.addClass("flex");

      var checkWrap = $("<div>").appendTo(armorRow);
      checkWrap.addClass("flexmiddle");

      var asEQ = genInput({
        parent : checkWrap,
        type : 'checkbox',
        style : {"margin-top" : "0"},
        disabled : scope.viewOnly
      });

      if (itemData.tags && itemData.tags["noEQ"]) {
        asEQ.prop("checked", true);
      }
      asEQ.change(function(){
        if ($(this).prop("checked")) {
          itemData.tags["noEQ"] = true;
        }
        else {
          delete itemData.tags["noEQ"];
        }
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update()
        }
      });
      checkWrap.append("<text class='subtitle bold'>Do not display item as Gear</text>");

      var armorPlate = $("<div>").appendTo(armorRow);

      var newScope = duplicate(scope);
      newScope.target = obj.data.equip.armor;
      newScope.char = char;
      if (scope.markup) {
        newScope.markup = scope.markup;
      }
      sync.render("ui_armorValue")(obj, app, newScope).appendTo(armorPlate);

      //sync.render("ui_armorBonuses")(obj, app, newScope).appendTo(armorPlate);

      var mods = $("<div>").appendTo(armorDiv);
      mods.addClass("flex flexcolumn");

      sync.render("ui_modifiers")(obj, app, {text : "Modifiers", lookup : "equip.armor", total : "", modsOnly : true, viewOnly : scope.viewOnly}).appendTo(mods);
    }
  }
  else if (scope.mode == "weapon") {
    weapon.addClass("highlight alttext");

    for (var i in obj.data.weapon) {
      var modRow = $("<div>").appendTo(content);
      modRow.addClass("flexrow fit-x subtitle");

      var label = genInput({
        classes : "line lrmargin bold middle",
        parent : modRow,
        value : obj.data.weapon[i].name,
        index : i,
        title : "@i.weapon."+i,
        disabled : scope.viewOnly,
        style : {"width" : "100px"},
      });
      label.change(function(){
        obj.data.weapon[$(this).attr("index")].name = $(this).val();
        obj.update();
      });

      var val = genInput({
        classes : "line flex middle",
        parent : modRow,
        value : sync.rawVal(obj.data.weapon[i]),
        index : i,
        disabled : scope.viewOnly,
      });
      val.change(function(){
        sync.rawVal(obj.data.weapon[$(this).attr("index")], $(this).val());
        obj.update();
      });

      var min = genInput({
        parent : modRow,
        classes : "line lrmargin middle subtitle",
        value : obj.data.weapon[i].min,
        index : i,
        placeholder : "Min",
        disabled : scope.viewOnly,
        style : {"width" : "24px"},
      });
      min.change(function(){
        obj.data.weapon[$(this).attr("index")].min = $(this).val();
        obj.update();
      });

      var max = genInput({
        parent : modRow,
        classes : "line middle subtitle",
        value : obj.data.weapon[i].max,
        index : i,
        placeholder : "Max",
        disabled : scope.viewOnly,
        style : {"width" : "24px"},
      });
      max.change(function(){
        obj.data.weapon[$(this).attr("index")].max = $(this).val();
        obj.update();
      });

      var mods = genIcon("list-alt").appendTo(modRow);
      mods.addClass("flexmiddle lrmargin subtitle");
      mods.attr("path", "weapon."+i);
      mods.click(function(){
        var path = $(this).attr("path");

        var content = sync.newApp("ui_modifiers");
        content.attr("viewOnly", scope.viewOnly);
        content.attr("lookup", path);
        content.attr("modsOnly", "true");
        obj.addApp(content);

        ui_popOut({
          target : $(this),
          align : "top",
          title : "Modifiers",
          id : "modify-exp",
          style : {"min-width" : "100px"},
        }, content);
      });

      if (!game.templates.item.weapon[i] || scope.homebrew ) {
        if (!scope.viewOnly) {
          var remove = genIcon("remove").appendTo(modRow);
          remove.addClass("destroy");
          remove.attr("index", i);
          remove.click(function(){
            delete obj.data.weapon[$(this).attr("index")];
            obj.update();
          });
        }
      }
    }
    if (obj.data.info.skill) {
      var skillPlate = $("<div>").appendTo(content);
      skillPlate.addClass("flexrow subtitle");
      skillPlate.append("<b class='flexmiddle' style='min-width : 60px;'>"+obj.data.info.skill.name+"</b>");

      if ($("#item-skill-list").length) {
        $("#item-skill-list").remove();
      }
      var dataList = [];

      var skillRegex = /\(([^(]+[^)]+)\)/;

      if (char) {
        for (var index in char.data.skills) {
          var skill = char.data.skills[index];
          if (skillRegex.exec(skill.name)) {
            dataList.push(skill.name);
          }
        }
      }

      var skill = genInput({
        parent : skillPlate,
        list : dataList,
        placeholder : "Enter Related Skill",
        disabled: scope.viewOnly,
      });
      if (!scope.viewOnly) {
        skill.css("background-color", "rgb(235,235,228)");
      }
      skill.val(sync.val(obj.data.info.skill));
      skill.change(function(){
        sync.val(obj.data.info.skill, $(this).val());
        if (!scope.local) {
          obj.sync("updateAsset");
        }
        else {
          obj.update();
        }
      });

      var dicePlate = $("<div>").appendTo(skillPlate);

      var skillRef;
      if (sync.val(obj.data.info.skill) && char) {
        for (var index in char.data.skills) {
          if (char.data.skills[index] && char.data.skills[index].name.toLowerCase() == sync.val(obj.data.info.skill).toLowerCase()) {
            skillRef = index;
            break;
          }
        }
      }

      var diceWrap = $("<div>").appendTo(skillPlate);
      diceWrap.addClass("flexmiddle");
      diceWrap.css("min-width", "70px");
      if (skillRef) {
        var dice = sync.render("ui_skillDice")(char, app, {skill : skillRef}).appendTo(diceWrap);
      }
    }
    if (!scope.viewOnly) {
      var newField = genIcon("plus", "New Attribute").appendTo(content);
      newField.addClass("fit-x flexmiddle subtitle");
      newField.click(function(){
        var invalidKeys = {
          "length" : "system",
        }; // invalid keys

        for (var key in game.templates.character) {
          invalidKeys[key] = key;
        }
        for (var key in game.templates.character.info) {
          invalidKeys[key] = "info."+key;
        }
        for (var key in game.templates.character.counters) {
          invalidKeys[key] = "counters."+key;
        }
        for (var key in game.templates.character.stats) {
          invalidKeys[key] = "stats."+key;
        }


        for (var key in obj.info) {
          invalidKeys[key] = "item.info."+key;
        }
        for (var key in obj.equip) {
          invalidKeys[key] = "item.equip."+key;
        }
        for (var key in obj.weapon) {
          invalidKeys[key] = "item.weapon."+key;
        }
        for (var key in obj.spell) {
          invalidKeys[key] = "item.spell."+key;
        }


        ui_prompt({
          target : $(this),
          id : "add-field",
          inputs : {
            "Macro Key" : {},
          },
          click : function(ev, inputs) {
            var path = inputs["Macro Key"].val();
            if (path && path != "notes" && path != "img" && path != "name" && isNaN(path)) {
              path = replaceAll(path, " ", "_");
              path = replaceAll(path, "@", "");
              path = replaceAll(path, "(", "_");
              path = replaceAll(path, ")", "_");
              path = replaceAll(path, "[", "_");
              path = replaceAll(path, "]", "_");
              path = replaceAll(path, "!", "_");
              path = replaceAll(path, "#", "_");
              path = replaceAll(path, "$", "_");
              if (invalidKeys[path]) {
                sendAlert({text : "This key is used somewhere else"});
              }
              else {
                obj.data.weapon[path] = sync.newValue(path, null);
                obj.update();
              }
            }
            else {
              sendAlert({text : "Invalid Macro Key"});
            }
          }
        });
      });
    }
  }
  else if (scope.mode == "spell") {
    spell.addClass("highlight alttext");

    for (var i in obj.data.spell) {
      var modRow = $("<div>").appendTo(content);
      modRow.addClass("flexrow fit-x subtitle");

      var label = genInput({
        classes : "line lrmargin bold middle",
        parent : modRow,
        value : obj.data.spell[i].name,
        index : i,
        title : "@i.spell."+i,
        disabled : scope.viewOnly,
        style : {"width" : "100px"},
      });
      label.change(function(){
        obj.data.spell[$(this).attr("index")].name = $(this).val();
        obj.update();
      });

      var val = genInput({
        classes : "line flex middle",
        parent : modRow,
        value : sync.rawVal(obj.data.spell[i]),
        index : i,
        disabled : scope.viewOnly,
      });
      val.change(function(){
        sync.rawVal(obj.data.spell[$(this).attr("index")], $(this).val());
        obj.update();
      });

      var min = genInput({
        parent : modRow,
        classes : "line lrmargin middle subtitle",
        value : obj.data.spell[i].min,
        index : i,
        placeholder : "Min",
        disabled : scope.viewOnly,
        style : {"width" : "24px"},
      });
      min.change(function(){
        obj.data.spell[$(this).attr("index")].min = $(this).val();
        obj.update();
      });

      var max = genInput({
        parent : modRow,
        classes : "line middle subtitle",
        value : obj.data.spell[i].max,
        index : i,
        placeholder : "Max",
        disabled : scope.viewOnly,
        style : {"width" : "24px"},
      });
      max.change(function(){
        obj.data.spell[$(this).attr("index")].max = $(this).val();
        obj.update();
      });

      var mods = genIcon("list-alt").appendTo(modRow);
      mods.addClass("flexmiddle lrmargin subtitle");
      mods.attr("path", "spell."+i);
      mods.click(function(){
        var path = $(this).attr("path");

        var content = sync.newApp("ui_modifiers");
        content.attr("viewOnly", scope.viewOnly);
        content.attr("lookup", path);
        content.attr("modsOnly", "true");
        obj.addApp(content);

        ui_popOut({
          target : $(this),
          align : "top",
          title : "Modifiers",
          id : "modify-exp",
          style : {"min-width" : "100px"},
        }, content);
      });

      if (!game.templates.item.spell[i] || scope.homebrew) {
        if (!scope.viewOnly) {
          var remove = genIcon("remove").appendTo(modRow);
          remove.addClass("destroy");
          remove.attr("index", i);
          remove.click(function(){
            delete obj.data.spell[$(this).attr("index")];
            obj.update();
          });
        }
      }
    }
    if (!scope.viewOnly) {
      var newField = genIcon("plus", "New Attribute").appendTo(content);
      newField.addClass("fit-x flexmiddle subtitle");
      newField.click(function(){
        var invalidKeys = {
          "length" : "system",
        }; // invalid keys

        for (var key in game.templates.character) {
          invalidKeys[key] = key;
        }
        for (var key in game.templates.character.info) {
          invalidKeys[key] = "info."+key;
        }
        for (var key in game.templates.character.counters) {
          invalidKeys[key] = "counters."+key;
        }
        for (var key in game.templates.character.stats) {
          invalidKeys[key] = "stats."+key;
        }


        for (var key in obj.info) {
          invalidKeys[key] = "item.info."+key;
        }
        for (var key in obj.equip) {
          invalidKeys[key] = "item.equip."+key;
        }
        for (var key in obj.weapon) {
          invalidKeys[key] = "item.weapon."+key;
        }
        for (var key in obj.spell) {
          invalidKeys[key] = "item.spell."+key;
        }


        ui_prompt({
          target : $(this),
          id : "add-field",
          inputs : {
            "Macro Key" : {},
          },
          click : function(ev, inputs) {
            var path = inputs["Macro Key"].val();
            if (path && path != "notes" && path != "img" && path != "name" && isNaN(path)) {
              path = replaceAll(path, " ", "_");
              path = replaceAll(path, "@", "");
              path = replaceAll(path, "(", "_");
              path = replaceAll(path, ")", "_");
              path = replaceAll(path, "[", "_");
              path = replaceAll(path, "]", "_");
              path = replaceAll(path, "!", "_");
              path = replaceAll(path, "#", "_");
              path = replaceAll(path, "$", "_");
              if (invalidKeys[path]) {
                sendAlert({text : "This key is used somewhere else"});
              }
              else {
                obj.data.spell[path] = sync.newValue(path, null);
                obj.update();
              }
            }
            else {
              sendAlert({text : "Invalid Macro Key"});
            }
          }
        });
      });
    }
  }
  else if (scope.mode == "notes") {
    notes.addClass("highlight alttext");
    content.removeClass("padding");
    content.addClass("flexcolumn");

    var newApp = sync.newApp("ui_itemNotes").appendTo(content);
    newApp.attr("hideOptions", true);
    newApp.attr("autosave", true);
    newApp.attr("entry", true);
    obj.addApp(newApp);
  }
  else if (scope.mode == "calc") {
    obj.data._calc = obj.data._calc || [];
    var calcs = obj.data._calc;
    content.addClass("subtitle");
    content.removeClass("padding");

    var warning = $("<i>").appendTo(content);
    warning.addClass("flexmiddle subtitle bold padding")
    warning.text("Calculations performed here are written to the parent character sheet, and change the values directly. Use with caution");

    var calcWrapper = $("<div>").appendTo(content);
    calcWrapper.addClass("flexcolumn flex outlinebottom smooth");
    calcWrapper.css("position", "relative");
    calcWrapper.css("overflow-y", "auto");

    var calcList = $("<div>").appendTo(calcWrapper);
    calcList.addClass("fit-x");
    calcList.css("position", "absolute");
    calcList.css("top", "0");
    calcList.css("left", "0");

    sync.render("ui_math")(obj, app, {calc : calcs, cref : scope.cref}).appendTo(calcList);
  }

  return div;
});

sync.render("ui_inventory", function(obj, app, scope) {
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true")};

  var data = obj.data;
  var inventory = $("<div>");
  if (!scope.hideTitle) {
    var title = $("<h1 style='text-align: center;'>Inventory </h1>").appendTo(inventory);
    if (!scope.viewOnly) {
      var icon = genIcon("plus").appendTo(title);
      icon.addClass("create");
      icon.click(function() {
        var frame = $("<div>");
        frame.addClass("flex flexcolumn");

        game.locals["createItem"] = game.locals["createItem"] || sync.obj("createItem");
        game.locals["createItem"].data = {};
        merge(game.locals["createItem"].data, duplicate(game.templates.item));

        var newApp = sync.newApp("ui_renderItem").appendTo(frame);
        newApp.attr("char-ref", obj.id());
        game.locals["createItem"].addApp(newApp);

        var buttonWrap = $("<div>").appendTo(frame);
        buttonWrap.addClass("flexrow");

        var confirm = $("<button>").appendTo(buttonWrap);
        confirm.addClass("flex");
        confirm.append("Create");
        confirm.click(function(){
          obj.data.inventory.push(duplicate(game.locals["createItem"].data));
          obj.sync("updateAsset");
        });

        var confirm = $("<button>").appendTo(buttonWrap);
        confirm.addClass("flex");
        confirm.append("Create and Close");
        confirm.click(function(){
          obj.data.inventory.push(duplicate(game.locals["createItem"].data));
          obj.sync("updateAsset");
          layout.coverlay("create-item");
        });
        var pop = ui_popOut({
          target : $(this),
          align : "top",
          id : "create-item",
          maximize : true,
          minimize : true,
          style : {"width" : assetTypes["i"].width, height : assetTypes["i"].height}
        }, frame);
        pop.resizable();
      });
    }
  }

  if (!scope.hideWeight) {
    var weight = $("<div>").appendTo(inventory);
    weight.addClass("fit-x flexcolumn");
    weight.css("margin-bottom", "8px");
  }
  var totalWeight = 0;

  var inventoryList = $("<div>").appendTo(inventory);
  inventoryList.addClass("flexwrap flexaround inventoryContent");
  if (!scope.viewOnly) {
    inventoryList.sortable({
      filter : ".inventoryContent",
      update : function(ev, ui) {
        var newIndex;
        var count = 0;
        $(ui.item).attr("ignore", true);
        inventoryList.children().each(function(){
          if ($(this).attr("ignore")){
            newIndex = count;
          }
          count += 1;
        });
        var old = data.inventory.splice($(ui.item).attr("index"), 1);
        util.insert(data.inventory, newIndex, old[0]);
        obj.sync("updateAsset");
      }
    });
  }

  for (var index in data.inventory) {
    var itemData = data.inventory[index];
    if (!itemData._s || hasSecurity(getCookie("UserID"), "Owner", obj.data) || hasSecurity(getCookie("UserID"), "Visible", itemData)) {
      if (!scope.mode) {
        var itemBackground = $("<div>").appendTo(inventoryList);
        itemBackground.addClass("outline flexcolumn smooth");
        itemBackground.css("padding", "4px");
        itemBackground.css("min-width", "100px");
        itemBackground.css("max-width", "200px");
        itemBackground.css("height", "100px");
        itemBackground.attr("index", index);
        itemBackground.css("background-color", "white");

        var item = $("<div>").appendTo(itemBackground);
        item.addClass("flexcolumn flex hover2");
        item.attr("index", index);

        item.click(function() {
          var frame = $("<div>");
          frame.addClass("flex flexcolumn");

          var iRef = $(this).attr("index");
          game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
          game.locals["editItem"].data = JSON.parse(JSON.stringify(data.inventory[iRef]));

          merge(game.locals["editItem"].data, duplicate(game.templates.item));

          var newApp = sync.newApp("ui_renderItem").appendTo(frame);
          newApp.attr("char-ref", obj.id());
          newApp.attr("viewOnly", scope.viewOnly);
          if (data.inventory[iRef]._s && !hasSecurity(getCookie("UserID"), "Owner", obj.data) && !hasSecurity(getCookie("UserID"), "Rights", data.inventory[iRef]))  {
            newApp.attr("viewOnly", true);
          }
          newApp.attr("local", "true");

          game.locals["editItem"].addApp(newApp);

          if (!scope.viewOnly) {
            var confirm = $("<button>").appendTo(frame);
            confirm.addClass("fit-x");
            confirm.attr("index", iRef);
            confirm.append("Confirm");
            confirm.click(function(){
              var iRef = $(this).attr("index");
              data.inventory[iRef] = duplicate(game.locals["editItem"].data);
              obj.sync("updateAsset");
              layout.coverlay("edit-item");
            });
          }
          var pop = ui_popOut({
            target : $(this),
            align : "top",
            id : "edit-item",
            maximize : true,
            minimize : true,
            style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
          }, frame);
          pop.resizable();
        });

        var infoBar = $("<div>").appendTo(item);
        infoBar.addClass("fit-x outline flexmiddle");
        infoBar.css("background-color", "white");

        if (itemData instanceof Object) {
          totalWeight = totalWeight + (sync.val(itemData.info.weight) || 0) * (sync.val(itemData.info.quantity) || 1);

          var name = $("<b>").appendTo(infoBar);
          name.css("color", "#333");
          name.append(sync.val(itemData.info.name));
          if (sync.val(itemData.info.name) && sync.val(itemData.info.name).length > 15) {
            name.addClass("subtitle spadding");
          }
          else {
            name.addClass("lrpadding");
          }
          if (sync.val(itemData.info.quantity) > 1) {
            name.append("<b style='font-size : 0.8em;'> x"+sync.val(itemData.info.quantity)+"</b>");
          }

          var itemImage = $("<div>").appendTo(item);
          itemImage.addClass("fit-x flexmiddle flex");
          itemImage.css("background-image", "url('"+ sync.val(itemData.info.img) +"')");
          itemImage.css("background-size", "contain");
          itemImage.css("background-repeat", "no-repeat");
          itemImage.css("background-position", "center");

          if (!scope.viewOnly) {
            var optionsBar = $("<div>").appendTo(item);
            optionsBar.addClass("fit-x flexrow outline flexbetween subtitle spadding");
            optionsBar.css("background-color", "white");
            optionsBar.css("color", "#333");

            var security = genIcon("lock");
            security.addClass("lrmargin");
            security.attr("index", index);
            security.attr("title", "Configure who has access to this object");
            security.appendTo(optionsBar);
            security.click(function(ev){
              var index = $(this).attr("index");
              var securityContent = $("<div>");
              function buildSecurity() {
                var secTbl = {};
                secTbl[getCookie("UserID")] = 1;
                secTbl["default"] = 1;
                secTbl = obj.data.inventory[index]._s || secTbl;
                var sec = sync.render("ui_rights")(obj, app, {
                  security : secTbl,
                  viewOnly : scope.viewOnly,
                  change : function(ev, ui, userID, newSecurity){
                    obj.data.inventory[index]._s = obj.data.inventory[index]._s || secTbl;
                    if (userID == "default" && newSecurity === "") {
                      obj.data.inventory[index]._s[userID] = "1";
                    }
                    else {
                      obj.data.inventory[index]._s[userID] = newSecurity;
                    }
                    if (!scope.local) {
                      obj.sync("updateBoard");
                    }
                    else {
                      obj.update();
                    }
                    securityContent.empty();
                    buildSecurity().appendTo(securityContent);
                  }
                });
                return sec;
              }
              buildSecurity().appendTo(securityContent);

              var pop = ui_popOut({
                id : "item-security",
                prompt : true,
                target : $(this),
                align : "top"
              }, securityContent);
              ev.stopPropagation();
              ev.preventDefault();
            });


            itemData.tags = itemData.tags || {};

            var equipWrap = $("<a>").appendTo(optionsBar);
            equipWrap.addClass("hover2 flex flexmiddle");
            equipWrap.attr("index", index);
            equipWrap.click(function(ev) {
              var itemData = data.inventory[$(this).attr("index")];
              if (itemData.tags["equipped"]) {
                delete itemData.tags["equipped"];
              }
              else {
                itemData.tags["equipped"] = 1;
              }
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
              ev.stopPropagation();
              ev.preventDefault();
            });

            if (itemData.tags["equipped"]) {
              equipWrap.text("un-equip");
              item.addClass("focus");
            }
            else {
              equipWrap.text("equip");
            }
          }
        }
        else {
          var name = $("<b>").appendTo(infoBar);
          name.addClass("lrpadding");
          name.css("color", "#333");
          name.append(itemData);
        }

        var icon = genIcon("trash");
        icon.appendTo(optionsBar);
        icon.addClass("destroy");
        icon.attr("index", index);
        icon.click(function(ev) {
          var itemIndex = $(this).attr("index");
          ui_prompt({
            target : $(this),
            id : "delete-item-confirmation",
            confirm : "Delete Item",
            click : function(){
              data.inventory.splice(itemIndex, 1);
              obj.sync("updateAsset");
            }
          });
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        });
      }
      else if (scope.mode == 'list') {
        var itemBackground = $("<div>").appendTo(inventoryList);
        itemBackground.addClass("outline flexcolumn smooth");
        itemBackground.css("padding", "4px");
        itemBackground.css("min-width", "100px");
        itemBackground.css("max-width", "200px");
        itemBackground.css("height", "100px");
        itemBackground.attr("index", index);
        itemBackground.css("background-color", "white");

        var item = $("<div>").appendTo(itemBackground);
        item.addClass("flexcolumn flex hover2");
        item.attr("index", index);

        item.click(function() {
          var frame = $("<div>");
          frame.addClass("flex flexcolumn");

          var iRef = $(this).attr("index");
          game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
          game.locals["editItem"].data = JSON.parse(JSON.stringify(data.inventory[iRef]));

          merge(game.locals["editItem"].data, duplicate(game.templates.item));

          var newApp = sync.newApp("ui_renderItem").appendTo(frame);
          newApp.attr("char-ref", obj.id());
          newApp.attr("viewOnly", scope.viewOnly);
          if (data.inventory[iRef]._s && !hasSecurity(getCookie("UserID"), "Owner", obj.data) && !hasSecurity(getCookie("UserID"), "Rights", data.inventory[iRef]))  {
            newApp.attr("viewOnly", true);
          }
          newApp.attr("local", "true");

          game.locals["editItem"].addApp(newApp);

          if (!scope.viewOnly) {
            var confirm = $("<button>").appendTo(frame);
            confirm.addClass("fit-x");
            confirm.attr("index", iRef);
            confirm.append("Confirm");
            confirm.click(function(){
              var iRef = $(this).attr("index");
              data.inventory[iRef] = duplicate(game.locals["editItem"].data);
              obj.sync("updateAsset");
              layout.coverlay("edit-item");
            });
          }
          var pop = ui_popOut({
            target : $(this),
            align : "top",
            id : "edit-item",
            maximize : true,
            minimize : true,
            style : {"width" : "500px", "height" : "350px"}
          }, frame);
          pop.resizable();
        });

        var infoBar = $("<div>").appendTo(item);
        infoBar.addClass("fit-x outline flexmiddle");
        infoBar.css("background-color", "white");

        if (itemData instanceof Object) {
          totalWeight = totalWeight + (sync.val(itemData.info.weight) || 0) * (sync.val(itemData.info.quantity) || 1);

          var name = $("<b>").appendTo(infoBar);
          name.css("color", "#333");
          name.append(sync.val(itemData.info.name));
          if (sync.val(itemData.info.quantity) > 1) {
            name.append("<b style='font-size : 0.8em;'> x"+sync.val(itemData.info.quantity)+"</b>");
          }

          var itemImage = $("<div>").appendTo(item);
          itemImage.addClass("fit-x flexmiddle flex");
          itemImage.css("background-image", "url('"+ sync.val(itemData.info.img) +"')");
          itemImage.css("background-size", "contain");
          itemImage.css("background-repeat", "no-repeat");
          itemImage.css("background-position", "center");

          if (!scope.viewOnly) {
            var optionsBar = $("<div>").appendTo(item);
            optionsBar.addClass("fit-x flexrow outline flexbetween subtitle spadding");
            optionsBar.css("background-color", "white");
            optionsBar.css("color", "#333");

            var security = genIcon("lock");
            security.attr("index", index);
            security.attr("title", "Configure who has access to this object");
            security.appendTo(optionsBar);
            security.click(function(ev){
              var index = $(this).attr("index");
              var securityContent = $("<div>");
              function buildSecurity() {
                var secTbl = {};
                secTbl[getCookie("UserID")] = 1;
                secTbl["default"] = 1;
                secTbl = obj.data.inventory[index]._s || secTbl;
                var sec = sync.render("ui_rights")(obj, app, {
                  security : secTbl,
                  viewOnly : scope.viewOnly,
                  change : function(ev, ui, userID, newSecurity){
                    obj.data.inventory[index]._s = obj.data.inventory[index]._s || secTbl;
                    if (userID == "default" && newSecurity === "") {
                      obj.data.inventory[index]._s[userID] = "1";
                    }
                    else {
                      obj.data.inventory[index]._s[userID] = newSecurity;
                    }
                    if (!scope.local) {
                      obj.sync("updateBoard");
                    }
                    else {
                      obj.update();
                    }
                    securityContent.empty();
                    buildSecurity().appendTo(securityContent);
                  }
                });
                return sec;
              }
              buildSecurity().appendTo(securityContent);

              var pop = ui_popOut({
                id : "item-security",
                prompt : true,
                target : $(this),
                align : "top"
              }, securityContent);
              ev.stopPropagation();
              ev.preventDefault();
            });


            itemData.tags = itemData.tags || {};

            var equipWrap = $("<a>").appendTo(optionsBar);
            equipWrap.addClass("hover2 flex flexmiddle");
            equipWrap.attr("index", index);
            equipWrap.click(function(ev) {
              var itemData = data.inventory[$(this).attr("index")];
              if (itemData.tags["equipped"]) {
                delete itemData.tags["equipped"];
              }
              else {
                itemData.tags["equipped"] = 1;
              }
              if (!scope.local) {
                obj.sync("updateAsset");
              }
              else {
                obj.update();
              }
              ev.stopPropagation();
              ev.preventDefault();
            });

            if (itemData.tags["equipped"]) {
              equipWrap.text("un-equip");
              item.addClass("focus");
            }
            else {
              equipWrap.text("equip");
            }
          }
        }
        else {
          var name = $("<b>").appendTo(infoBar);
          name.css("color", "#333");
          name.append(itemData);
        }

        var icon = genIcon("trash");
        icon.appendTo(optionsBar);
        icon.addClass("destroy");
        icon.attr("index", index);
        icon.click(function(ev) {
          var itemIndex = $(this).attr("index");
          ui_prompt({
            target : $(this),
            id : "delete-item-confirmation",
            confirm : "Delete Item",
            click : function(){
              data.inventory.splice(itemIndex, 1);
              obj.sync("updateAsset");
            }
          });
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        });
      }
    }
  }

  if (scope.weight) {
    var ctx = sync.defaultContext();
    ctx["c"] = obj.data;

    var tWeight = sync.eval(scope.weight, ctx);

    var percentage = totalWeight/tWeight;

    weight.append("<div class='flexmiddle subtitle bold'>Total " + game.templates.item.info.weight.name + " - " + totalWeight + " / " + tWeight + "("+Math.floor(percentage*100)+"%)</div>");

    var barWrap = $("<div>").appendTo(weight);

    var progress = $("<div>").appendTo(barWrap);
    progress.addClass("outline flex");
    progress.css("position", "relative");
    progress.css("border-radius", "2px");
    progress.css("height", "8px");
    progress.css("min-width", "20px");

    var col = "rgb("+(Math.ceil(200 * percentage))+","+(Math.ceil(200-200 * percentage))+",0)";
    progress.css("background-color", col);

    var bar = $("<div>").appendTo(progress);
    bar.addClass("outline");
    bar.css("position", "absolute");
    bar.css("right", 0);
    bar.css("width", 100-Math.ceil(percentage * 105)+"%");
    bar.css("background-color", "grey");
    bar.css("height", "100%");
  }
  else {
    if (!scope.hideWeight) {
      weight.append("<div class='flexmiddle subtitle bold'>Total " + game.templates.item.info.weight.name + " - " + totalWeight+"</div>");
    }
  }
  return inventory;
});


sync.render("ui_itemNotes", function(obj, app, scope){
  scope = scope || {};
  scope.removePadding = true;
  scope.noOutline = true;
  return sync.render("ui_characterNotes")(obj, app, scope).removeClass("padding");
});
