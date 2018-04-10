function charClick(ev, ui, charObj, obj, app, scope) {
  if (hasSecurity(getCookie("UserID"), "Visible", charObj.data)) {
    if (charObj.data._t == "c" && _down[17] && !isNaN(charObj.id())) {
      if (ui.parent().hasClass("card-selected")) {
        ui.parent().removeClass("card-selected");
        util.untarget(charObj.id());
        sendAlert({text : "Released Target"});
      }
      else {
        ui.parent().addClass("card-selected");
        util.target(charObj.id());
        sendAlert({text : "Targeted"});
      }
      return true;
    }
    else {
      if (layout.mobile) {
        obj.removeApp(app);
        game.entities.removeApp(app);
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
          if (!hasSecurity(getCookie("UserID"), "Rights", charObj.data)) {
            newApp.attr("viewOnly", "true");
          }
          charObj.addApp(newApp);
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
          if (!hasSecurity(getCookie("UserID"), "Rights", charObj.data)) {
            newApp.attr("viewOnly", "true");
          }
          charObj.addApp(newApp);
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
}

function createCharacter(charData, dontRoll, returnCreate, noResults, popup, supressCreate) {
  var nameBank = util.nameBank;
  var rolled = {stats : {}, counters : {}};
  var rollResult = $("<div>");
  rollResult.addClass("flexcolumn");
  rollResult.css("font-size", "1.2em");
  var appendStats = false;
  if (!dontRoll) {
    for (var i in charData.stats) {
      var stat = charData.stats[i];
      for (var j in stat.modifiers) {
        stat.current = (stat.current || "0") + "+" + stat.modifiers[j];
      }
      var results = sync.executeQuery(String(stat.current), charData);
      var totalStr = "";
      var total = 0;

      for (var d in results.equations) {
        totalStr += results.equations[d].r + "+";
        total += results.equations[d].v;
      }
      if (stat.current != totalStr.substring(0,totalStr.length-1)) {
        if (!appendStats) {
          rollResult.append("<b>Stats</b>");
          appendStats = true;
        }
        rolled.stats[i] = "<b>"+stat.name+"</b><li class='subtitle' style='margin-left:1.5em; margin-right:1.5em;'>"+stat.current+" = "+totalStr.substring(0,totalStr.length-1)+" = " + total;
        rollResult.append("<div class='subtitle'>"+rolled.stats[i]+"</li></div>");
      }
      stat.current = total;
      if (stat.max != null && stat.current > stat.max) {
        stat.max = stat.current;
      }
      stat.modifiers = {};
    }

    var appendCounter = false;
    for (var i in charData.counters) {
      var counter = charData.counters[i];
      for (var j in counter.modifiers) {
        counter.current = (counter.current || "0") + "+" + counter.modifiers[j];
      }
      if (!(counter.current instanceof Object) && i != "hit") {
        var results = sync.executeQuery(String(counter.current), charData);
        var totalStr = "";
        var total = 0;
        for (var d in results.equations) {
          totalStr += results.equations[d].r + "+";
          total += results.equations[d].v;
        }
        if (counter.current != totalStr.substring(0,totalStr.length-1)) {
          if (!appendCounter) {
            rollResult.append("<b>Counters</b>");
          }
          rolled.counters[i] = "<b>"+counter.name+"</b><li class='subtitle' style='margin-left:1.5em; margin-right:1.5em;'>"+counter.current+" = "+totalStr.substring(0,totalStr.length-1)+" = " + total;
          rollResult.append("<div class='subtitle'>"+rolled.counters[i]+"</li></div>");
          appendCounter = true;
        }
        counter.current = sync.eval(counter.current);
        if (i == ((game.templates.display.sheet.health)?(game.templates.display.sheet.health.split(".")[1]):("wounds"))) {
          counter.max = sync.modified(counter.current, 0);
        }
        if (counter.max != null && counter.current > counter.max) {
          counter.max = counter.current;
        }
        counter.modifiers = {};
      }
    }
    sync.rawVal(charData.info.name, nameBank[Math.floor(nameBank.length * Math.random())]);
  }
  if (!supressCreate) {
    game.locals["newAssetList"] = game.locals["newAssetList"] || [];
    var lastKeys = Object.keys(game.entities.data);
    game.entities.listen["newAsset"] = function(rObj, newObj, target) {
      var change = true;
      for (var key in game.entities.data) {
        if (!util.contains(lastKeys, key)) {
          game.locals["newAssetList"].push(key);
          assetTypes["c"].preview(getEnt(key), $("body"));
          change = false;
        }
      }
      return change;
    }
    if (!game.config.data.offline) {
      runCommand("createCharacter", charData);
    }
    else {
      game.entities.data["tempObj"+game.config.data.offline] = sync.obj("tempObj"+game.config.data.offline);
      game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
      game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(charData);
      game.entities.update();
    }
  }
  if (returnCreate) {
    return charData;
  }
}

sync.render("ui_characterSheet", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  if (!obj || !obj.data || obj.data["_t"] != "c") {
    if (app && layout.mobile) {
      app.attr("ui-name", "ui_characterList");
      game.entities.addApp(app);
    }
    return div;
  }

  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    local : (app.attr("local") == "true"),
    markup : app.attr("markup") == "true",
    editing : app.attr("editing") == "true",
  };

  // don't edit cloud entities
  if (obj.id() && isNaN(obj.id()) && obj.id().match("_") && !scope.editing && !(game.config && game.config.data.offline)) {
    scope.viewOnly = true;
    scope.local = true;
  }

  var sheet = scope.sheet || game.templates.display.sheet;
  var ctx = sync.defaultContext();
  ctx["c"] = obj.data;

  if (app.attr("attributes")) {
    div.removeClass("flexcolumn");
    div.addClass("foreground");
    div.css("overflow", "auto");
    div.scroll(function(){
      app.attr("_lastScrollTop", div.scrollTop());
      app.attr("_lastScrollLeft", div.scrollLeft());
    });

    var buttonList = $("<div>").appendTo(div);
    buttonList.addClass("flexrow foreground");
    buttonList.css("margin-bottom", "1em");

    var reset = $("<button>").appendTo(buttonList);
    reset.addClass("highlight lrpadding alttext flexmiddle");
    reset.text("Back to Sheet");
    reset.click(function(){
      app.removeAttr("attributes");
      obj.update();
    });

    var keys = {};

    var template = {stats : "", info : "", counters : "", skills : ""};
    for (var key in template) {
      var path = key;
      var attrPlate = $("<div>").appendTo(div);
      attrPlate.addClass("lrpadding lrmargin");
      attrPlate.css("font-size", "1.2em");
      attrPlate.append("<u class='bold lrpadding lrmargin alttext'>"+key+"</b>");

      var attrWrap = $("<div>").appendTo(attrPlate);
      attrWrap.addClass("flexcolumn subtitle white outline smooth lpadding");
      attrWrap.css("margin-bottom", "1em");

      var headerRow = $("<div>").appendTo(attrWrap);
      headerRow.addClass("flexrow padding");
      headerRow.append("<u class='subtitle flexmiddle lrmargin' style='width:100px'>Macro Key</u>");
      headerRow.append("<u class='flex subtitle flexmiddle lrmargin' style='width:100px'>Name</u>");
      headerRow.append("<u class='flex2 subtitle flexmiddle lrmargin' style='width:100px'>Value</u>");
      headerRow.append("<u class='subtitle flexmiddle lrmargin' style='width:40px'>Min</u>");
      headerRow.append("<u class='subtitle flexmiddle lrmargin' style='width:40px'>Max</u>");
      headerRow.append(genIcon("remove").addClass("lrpadding lrmargin").css("color", "transparent"));
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
            style : {"width" : "150px"}
          });

          var value = genInput({
            parent : attrOption,
            classes : "line subtitle flex2 lrmargin middle",
            value : obj.data[key][subKey],
            cmd : "updateAsset",
            obj : obj,
          });

          var min = genInput({
            parent : attrOption,
            classes : "line subtitle lrmargin middle",
            value : obj.data[key][subKey],
            style : {"width" : "40px"},
            cmd : "updateAsset",
            obj : obj,
            raw : "min",
          });

          var max = genInput({
            parent : attrOption,
            classes : "line subtitle lrmargin middle",
            value : obj.data[key][subKey],
            style : {"width" : "40px"},
            cmd : "updateAsset",
            obj : obj,
            raw : "max"
          });

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
                obj.sync("updateAsset");
              }
            });
          });
        }
      }

      var headerRow = genIcon("plus", "New Attribute").appendTo(attrWrap);
      headerRow.addClass("flexmiddle fit-x create");
      headerRow.attr("category", key);
      headerRow.click(function(){
        var key = $(this).attr("category");

        ui_prompt({
          target : $(this),
          inputs : {
            "Macro Key" : "",
          },
          click : function(ev, inputs){
            var path = inputs["Macro Key"].val();
            if (path && path != "notes" && path != "img" && path != "name") {
              path = replaceAll(path, " ", "_");
              path = replaceAll(path, "@", "");
              path = replaceAll(path, "(", "_");
              path = replaceAll(path, ")", "_");
              path = replaceAll(path, "[", "_");
              path = replaceAll(path, "]", "_");
              path = replaceAll(path, "!", "_");
              path = replaceAll(path, "#", "_");
              path = replaceAll(path, "$", "_");
              obj.data[key][path] = {};
              obj.sync("updtaeAsset");
            }
          }
        });
      });
    }

    return div;
  }

  /*
  var content = $("<div>");
  content.addClass("flexcolumn");

  content.append("<b>Attribute</b>");

  var dataList = $("<datalist>").appendTo(content);
  dataList.attr("id", "homebrew-list-edit");
  dataList.css("height", "200px");

  var template = {stats : "", info : "", counters : ""};
  for (var key in template) {
    var path = key;
    for (var subKey in obj.data[key]) {
      path = key + "." + subKey;
      if (path != "info.notes" && path != "info.img") {
        var option = $("<option>").appendTo(dataList);
        option.attr("value", path);
      }
    }
  }

  var input = genInput({
    parent : content,
    type : "list",
    list : "homebrew-list-edit",
    id : "homebrew-target-input",
    placeholder : "Field Target",
  });

  var options = $("<div>").appendTo(content);
  options.addClass("flexrow flexaround flexwrap");

  var confirm = $("<button>").appendTo(options);
  confirm.addClass("highlight alttext flex");
  confirm.append("Delete");
  confirm.click(function(){
    if (input.val() && input.val() != "info.notes" && input.val() != "info.img") {
      var traverse = sync.traverse(obj.data, input.val(), "");
      obj.sync("updateAsset");
      sendAlert({text : "Field deleted"});
      layout.coverlay("quick-sheet-add-field");
    }
    else {
      input.val("");
      sendAlert({text : "Restricted Field"});
    }
  });

  var confirm = $("<button>").appendTo(options);
  confirm.addClass("background alttext flex");
  confirm.append("Create");
  confirm.click(function(){
    if (input.val() && input.val() != "info.notes" && input.val() != "info.img") {
      var traverse = sync.traverse(obj.data, input.val());
      if (traverse === false) {
        ui_prompt({
          target : $(this),
          inputs : {
            "Enter new field name" : ""
          },
          click : function(ev, inputs){
            sync.traverse(obj.data, input.val(), {name : inputs["Enter new field name"].val()});
            obj.sync("updateAsset");
            sendAlert({text : "Field created"});
            layout.coverlay("quick-sheet-add-field");
          }
        });
      }
    }
    else {
      input.val("");
      sendAlert({text : "Restricted Field"});
    }
  });

  var pop = ui_popOut({
    target : $(this),
    id : "quick-sheet-add-field",
  }, content);
  */

  if (app.attr("viewingData")) {
    var calcs = duplicate(obj.data._calc || sheet.calc || []);

    var buttonList = $("<div>").appendTo(div);
    buttonList.addClass("flexrow foreground subtitle flexaround");
    if (!app.attr("homebrew")) {
      var reset = $("<button>").appendTo(buttonList);
      reset.addClass("highlight lrpadding alttext flexmiddle");
      reset.text("RESET");
      reset.click(function(){
        delete obj.data._calc;

        app.removeAttr("viewingData");
        obj.sync("updateAsset");
      });
    }

    var discard = $("<button>").appendTo(buttonList);
    discard.addClass("highlight alttext flexmiddle");
    discard.text("Discard Changes");
    discard.click(function(){
      app.removeAttr("viewingData");
      obj.update();
    });

    if (hasSecurity(getCookie("UserID"), "Rights", obj.data) || app.attr("homebrew")) {
      var confirm = $("<button>").appendTo(buttonList);
      confirm.addClass("background alttext flexmiddle");
      confirm.text("Confirm Calculations");
      confirm.click(function(){
        obj.data._calc = calcs;

        app.removeAttr("viewingData");
        obj.sync("updateAsset");
      });
    }
    else if (!app.attr("homebrew")) {
      reset.remove();
    }

    var header = $("<highlight>").appendTo(div);
    header.addClass("fit-x flexmiddle");
    header.text("Automatic Calculations");

    var calcWrapper = $("<div>").appendTo(div);
    calcWrapper.addClass("flexcolumn margin flex outline smooth");
    calcWrapper.css("position", "relative");
    calcWrapper.css("overflow-y", "auto");

    var calcList = $("<div>").appendTo(calcWrapper);
    calcList.addClass("fit-x");
    calcList.css("position", "absolute");
    calcList.css("top", "0");
    calcList.css("left", "0");
    if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
      calcList.sortable({
        filter : ".inventoryContent",
        update : function(ev, ui) {
          var newIndex;
          var count = 0;
          $(ui.item).attr("ignore", true);
          calcList.children().each(function(){
            if ($(this).attr("ignore")){
              newIndex = count;
            }
            count += 1;
          });
          var old = calcs.splice($(ui.item).attr("index"), 1);
          util.insert(calcs, newIndex, old[0]);
          buildCalc();
          ev.stopPropagation();
          ev.preventDefault();
        }
      });
    }

    if (!obj.data._calc) {
      calcList.css("opacity", "0.25");
      calcList.css("pointer-events", "none");

      var calcDefault = $("<highlight>").appendTo(calcWrapper);
      calcDefault.addClass("fit-xy flexcolumn flexmiddle");
      calcDefault.append("<text>System Calculations</text><br><text class='subtitle'>Click to overwrite system</text>");
      calcDefault.click(function(){
        calcDefault.remove();
        calcList.css("opacity", "");
        calcList.css("pointer-events", "");
      });
    }

    var dataList = $("<datalist>").appendTo(calcWrapper);
    dataList.attr("id", "calc-list-edit");

    var template = {stats : "", info : "", counters : ""};
    for (var key in template) {
      var path = key;
      for (var subKey in obj.data[key]) {
        path = key + "." + subKey;
        if (path != "info.notes" && path != "info.img") {
          var option = $("<option>").appendTo(dataList);
          option.attr("value", path);
        }
      }
    }
    function buildCalc() {
      var lastScroll = calcList.scrollTop();
      calcList.empty();

      for (var i=0; i<calcs.length; i++) {
        var calcData = calcs[i];

        var calcWrap = $("<div>").appendTo(calcList);
        calcWrap.addClass("flexrow flexmiddle spadding lightoutline smooth inactive link");
        calcWrap.attr("index", i);

        var target = genInput({
          parent : calcWrap,
          list : "calc-list-edit",
          type : "list",
        });
        target.attr("index", i);
        target.val(calcData.target);
        target.change(function(){
          calcs[$(this).attr("index")].target = String($(this).val());
          buildCalc();
        });

        var equalsRaw = $("<div>").appendTo(calcWrap);
        equalsRaw.addClass("subtitle bold flexmiddle lrmargin");
        equalsRaw.append("=");

        var valueInput = $("<textarea>").appendTo(calcWrap);
        valueInput.addClass("flex");
        valueInput.attr("index", i);
        valueInput.text(calcData.eq);
        valueInput.change(function(){
          calcs[$(this).attr("index")].eq = String($(this).val());
          buildCalc();
        });

        var equals = $("<div>").appendTo(calcWrap);
        equals.addClass("subtitle bold flexmiddle lrmargin");
        equals.append("=");

        var val = sync.eval(calcData.eq, ctx);
        var equalsVal = $("<div>").appendTo(calcWrap);
        equalsVal.addClass("flexmiddle");
        equalsVal.append(val);

        $("<div>").addClass("spadding").appendTo(calcWrap);

        var condition = genIcon("question-sign").appendTo(calcWrap);
        condition.addClass("lrmargin");
        condition.attr("index", i);
        condition.click(function(){
          var calcData = calcs[$(this).attr("index")];

          ui_prompt({
            target : $(this),
            id : "change-condition",
            inputs : {
              "Condition" : $("<textarea>").css("height", "100px").addClass("fit-x subtitle").text(calcData.cond),
            },
            click : function(ev, inputs) {
              calcData.cond = String(inputs["Condition"].val() || "");
              buildCalc();
            }
          });
        });

        var remove = genIcon("remove").appendTo(calcWrap);
        remove.addClass("lrmargin destroy");
        remove.attr("index", i);
        remove.click(function(){
          var index = $(this).attr("index");
          ui_prompt({
            target : $(this),
            id : "change-condition",
            confirm : "REMOVE CALCULATION",
            click : function(ev, inputs) {
              calcs.splice(index, 1);
              buildCalc();
            }
          });
        });

        if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
          equalsVal.addClass("bold");
          condition.addClass("create");
        }
        else {
          equalsVal.addClass("dull subtitle");
          condition.addClass("destroy");
        }
      }
      calcList.scrollTop(lastScroll);
      if (hasSecurity(getCookie("UserID"), "Rights", obj.data) || app.attr("homebrew")) {
        var addCalc = genIcon("plus", "Add Calculation").appendTo(calcList);
        addCalc.addClass("fit-x flexmiddle create");
        addCalc.click(function(){
          calcs.push({});
          buildCalc();
        });
      }
    }
    buildCalc();

    var warning = $("<i>").appendTo(div);
    warning.addClass("flexmiddle subtitle bold")
    warning.text("Calculations that are applied automatically after a sheet has been changed. Calculations are applied in sequential order, allowing you to reference a value affected by a previous calculation");

    return div;
  }

  if (app.attr("viewingNotes")) {
    var content = sync.newApp("ui_editPage").appendTo(div);
    content.attr("targetApp", app.attr("id"));
    obj.addApp(content);

    return div;
  }

  if (app.attr("viewingActions")) {
    div.removeClass("flexcolumn");
    div.addClass("foreground");
    div.css("overflow", "auto");
    div.scroll(function(){
      app.attr("_lastScrollTop", div.scrollTop());
      app.attr("_lastScrollLeft", div.scrollLeft());
    });

    var buttonList = $("<div>").appendTo(div);
    buttonList.addClass("flexrow foreground");
    buttonList.css("margin-bottom", "1em");

    var reset = $("<button>").appendTo(buttonList);
    reset.addClass("highlight lrpadding alttext flexmiddle");
    reset.text("Save Changes");
    reset.click(function(){
      app.removeAttr("viewingActions");
      obj.sync("updateAsset");
    });

    var actionObj = sync.dummyObj();
    actionObj.data = {context : {c : obj.id()}};

    game.locals["actions"] = game.locals["actions"] || [];
    game.locals["actions"].push(actionObj);

    var charWrapper = $("<div>").appendTo(div);
    charWrapper.addClass("flexcolumn flex");
    charWrapper.css("overflow-y", "auto");
    charWrapper.attr("_lastScrollTop", app.attr("_lastScrollTop"));
    charWrapper.scroll(function(){
      app.attr("_lastScrollTop", charWrapper.scrollTop());
      app.attr("_lastScrollLeft", charWrapper.scrollLeft());
    });

    sync.render("ui_manageActions")(obj, app, scope).appendTo(charWrapper);

    /*var newApp = sync.newApp("ui_actions").appendTo(div);
    newApp.addClass("spadding");
    actionObj.addApp(newApp);*/
    return div;
  }

  if (app.attr("viewingRights")) {
    var buttonList = $("<div>").appendTo(div);
    buttonList.addClass("flexrow foreground");
    buttonList.css("margin-bottom", "1em");

    var reset = $("<button>").appendTo(buttonList);
    reset.addClass("highlight lrpadding alttext flexmiddle");
    reset.text("Back to Sheet");
    reset.click(function(){
      app.removeAttr("viewingRights");
      obj.update();
    });

    var content = sync.newApp("ui_rights").appendTo(div);
    content.attr("viewOnly", scope.viewOnly);
    content.attr("last_rights", "indv");
    obj.addApp(content);

    return div;
  }

  if (!app.attr("homebrew") && !scope.editing) {
    var calc = obj.data._calc || sheet.calc || [];
    for (var i=0; i<calc.length; i++) {
      if (!calc[i].cond || sync.eval(calc[i].cond, ctx)) {
        var val = sync.eval(calc[i].eq, ctx);
        var target = sync.traverse(obj.data, calc[i].target);
        if (target instanceof Object) {
          sync.rawVal(target, val);
        }
        else {
          sync.traverse(obj.data, calc[i].target, val);
        }
      }
    }
    for (var id in obj.data.inventory) {
      var itemData = obj.data.inventory[id];
      ctx["i"] = itemData;
      var calc = itemData._calc || [];
      for (var i=0; i<calc.length; i++) {
        if (!calc[i].cond || sync.eval(calc[i].cond, ctx)) {
          var val = sync.eval(calc[i].eq, ctx);
          var target = sync.traverse(obj.data, calc[i].target);
          if (target instanceof Object) {
            sync.rawVal(target, val);
          }
          else {
            sync.traverse(obj.data, calc[i].target, val);
          }
        }
      }
    }
    for (var id in obj.data.spellbook) {
      var itemData = obj.data.spellbook[id];
      ctx["i"] = itemData;
      var calc = itemData._calc || [];
      for (var i=0; i<calc.length; i++) {
        if (!calc[i].cond || sync.eval(calc[i].cond, ctx)) {
          var val = sync.eval(calc[i].eq, ctx);
          var target = sync.traverse(obj.data, calc[i].target);
          if (target instanceof Object) {
            sync.rawVal(target, val);
          }
          else {
            sync.traverse(obj.data, calc[i].target, val);
          }
        }
      }
    }
    delete ctx["i"];
  }

  var data = obj.data || {info : {}};

  if (!scope.viewOnly) {
    div.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (_dragTransfer) {
        var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.css("z-index", util.getMaxZ(".ui-popout")+1);
        if (_dragTransfer.roll) {
          olay.addClass("focus");
          olay.append("<b>Targeting</b>");
        }
      }
      else if (!$("#"+app.attr("id")+"-drag-overlay").length) {
    		var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.css("z-index", util.getMaxZ(".ui-popout")+1);
        olay.append("<b>Drop to Create</b>");
      }
  	});
    div.on('drop', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      if (_dragTransfer) {
        if (_dragTransfer.roll) {
          optionsBar.addClass("card-selected");
          sendAlert({text : "Targeted " + sync.rawVal(obj.data.info.name)});
          var pop = ui_dropMenu(app, util.buildActions(_dragTransfer.roll), {id : "dice-action", align : "center", style : {"font-size" : "1.6em"}});
        }
      }
      else {
        var dt = ev.originalEvent.dataTransfer;
        if (dt.getData("OBJ")) {
          var ent = JSON.parse(dt.getData("OBJ"));
          if (ent._t == "i") {
            if (dt.getData("spell") || ent.tags["spell"]) {
              obj.data.spellbook.push(ent);
            }
            else {
              obj.data.inventory.push(ent);
            }
          }
          else if (dt.getData("target")) {
            obj.data[dt.getData("target")][dt.getData("key")](ent);
          }
          else {

          }
          obj.sync("updateAsset");
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

  var info = data.info;
  if (!scope.local) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("flexaround background boxinshadow alttext");
    optionsBar.css("color", "white");
    optionsBar.attr("index", obj.id());
    div.contextmenu(function(ev){
      if (!_down["16"]) {
        var menu = assetTypes.contextmenu(ev, optionsBar, obj, app, scope);
        menu.css("left", ev.pageX - 10);
        menu.css("top", ev.pageY - 10);
        util.windowBound(menu);
        return false;
      }
    });

    if (app.attr("simpleEditing")) {
      if (hasSecurity(getCookie("UserID"), "Rights", obj.data) || app.attr("homebrew")) {
        var quickSheet = $("<button>").appendTo(optionsBar);
        quickSheet.addClass("highlight subtitle alttext");
        quickSheet.text("Stop Editing");
        quickSheet.click(function(){
          if (JSON.stringify(obj.data._d.content) == JSON.stringify(game.templates.display.sheet.content)) {
            if (JSON.stringify(obj.data._d.style) == JSON.stringify(game.templates.display.sheet.style)) {
              delete obj.data._d;
              console.log("deleted");
            }
          }
          app.removeAttr("simpleEditing");
          obj.sync("updateAsset");
        });

        var quickSheet = $("<button>").appendTo(optionsBar);
        quickSheet.addClass("background subtitle alttext");
        quickSheet.text("Blank Sheet");
        quickSheet.click(function(){
          ui_prompt({
            target : $(this),
            confirm : "Clear Sheet?",
            click : function() {
              obj.data._d = {style : duplicate(game.templates.display.sheet.style) || {}, content : {classes : "flexcolumn flex padding", display : []}};
              app.attr("simpleEditing", true);
              obj.update();
            }
          });
        });
        var quickSheet = $("<button>").appendTo(optionsBar);
        quickSheet.addClass("background subtitle alttext");
        quickSheet.text("Default Sheet");
        quickSheet.click(function(){
          obj.data._d = {style : duplicate(game.templates.display.sheet.style) || {}, content : duplicate(game.templates.display.sheet.content)};
          app.attr("simpleEditing", true);
          obj.update();
        });
        var quickSheet = $("<button>").appendTo(optionsBar);
        quickSheet.addClass("background subtitle alttext");
        quickSheet.text("Pre-made Sheet");
        quickSheet.click(function(){
          var actionList = util.customSheets(obj, app, scope, sheet);
          ui_dropMenu($(this), actionList, {id : "quick-sheet-drop", "z-index" : util.getMaxZ(".ui-popout")+1});
        });
      }
    }
    else {
      if (app.attr("from") && game.templates.display.sheet.summary) {
        var back = genIcon("arrow-left").appendTo(optionsBar);
        back.addClass("lrmargin");
        back.attr("title", "Back");
        back.click(function(){
          if (layout.mobile) {
            runCommand("selectPlayerEntity");
            obj.removeApp(app);
            var old = app.attr("ui-name");
            app.attr("ui-name", "ui_assetManager");
            app.attr("from", old);
            game.entities.addApp(app);
          }
          else {
            var old = app.attr("ui-name");
            app.attr("ui-name", app.attr("from"));
            app.attr("from", old);
            obj.update();
          }
          var parent = app.parent();
          if (parent && parent.parent() && parent.parent().parent() && parent.parent().parent().hasClass("ui-popout")) {
            parent = parent.parent().parent();
            parent.css("width", "");
            parent.css("height", "");
            parent.css("max-height", "");
            parent.resizable();
          }
        });
        div.mousemove(function(){
          if (_down["17"]) {
            div.css("cursor", "pointer");
          }
          else {
            div.css("cursor", "");
          }
        });
        div.click(function(ev){
          if (_down["17"]) {
            if (optionsBar.hasClass("card-selected")) {
              optionsBar.removeClass("card-selected");
              util.untarget(obj.id());
              sendAlert({text : "Released Target"});
            }
            else {
              optionsBar.addClass("card-selected");
              util.target(obj.id());
              sendAlert({text : "Targeted"});
            }
          }
        });
      }
      if (!app.attr("homebrew")) {
        var icon = $("<button>").appendTo(optionsBar);
        icon.addClass("background subtitle alttext");
        if (optionsBar.hasClass("card-selected")) {
          icon.text("Release Target");
        }
        else {
          icon.text("Target");
        }
        icon.click(function() {
          if ($(this).text() == "Target") {
            $(this).text("Release Target");
            if (optionsBar.hasClass("card-selected")) {
              optionsBar.removeClass("card-selected");
              util.untarget(obj.id());
            }
            else {
              optionsBar.addClass("card-selected");
              util.target(obj.id());
            }
          }
          else {
            $(this).text("Target");
            if (optionsBar.hasClass("card-selected")) {
              optionsBar.removeClass("card-selected");
              util.untarget(obj.id());
            }
            else {
              optionsBar.addClass("card-selected");
              util.target(obj.id());
            }
          }
        });
      }

      var buffer = $("<div>").appendTo(optionsBar);
      buffer.addClass("flex");

      if (!scope.viewOnly) {
        if (!app.attr("homebrew")) {
          var securityWrap = $("<button>").appendTo(optionsBar);
          securityWrap.addClass("background subtitle alttext");

          var security = genIcon("lock", "Grant Access").appendTo(securityWrap);
          security.attr("title", "Edit who has access to this character");
          security.click(function(){
            if (app.attr("viewingRights")) {
              app.removeAttr("viewingRights");
            }
            else {
              app.attr("viewingRights", true);
            }
            obj.update();
          });
        }

        var buffer = $("<div>").appendTo(optionsBar);
        buffer.addClass("flex");

        var title = genIcon("tint").appendTo(optionsBar);
        title.addClass("lrmargin");
        title.attr("title", "Change Notes Style");
        title.click(function(){
          var newApp = sync.newApp("ui_stylePage");
          obj.addApp(newApp);

          var pop = ui_popOut({
            target : $(this),
            prompt : true,
            id : "page-styling",
            title : "Notes Style",
            style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
          }, newApp);
        });

        var cog = genIcon("cog").appendTo(optionsBar);
        cog.css("margin-right", "4px");
        cog.attr("title", "Manage attributes");
        cog.click(function(){
          if (app.attr("attributes")) {
            app.removeAttr("attributes");
          }
          else {
            app.attr("attributes", true);
          }
          obj.update();
        });
        if (!app.attr("homebrew")) {
          var icon = $("<button>").appendTo(optionsBar);
          icon.addClass("background subtitle alttext");
          icon.text("Update Map Piece");
          icon.click(function() {
            if (boardApi.pix.selections && Object.keys(boardApi.pix.selections).length == 1) {
              var selectData = boardApi.pix.selections[Object.keys(boardApi.pix.selections)[0]];
              var ent = getEnt(selectData.board);
              if (selectData.layer && ent && ent.data && ent.data.layers && ent.data.layers[selectData.layer] && ent.data.layers[selectData.layer].p[selectData.index]) {
                found = true;
                var dupe = duplicate(ent.data.layers[selectData.layer].p[selectData.index]);
                delete dupe.x;
                delete dupe.y;
                dupe.w = boardApi.pix.scale(dupe.w, ent, true);
                dupe.h = boardApi.pix.scale(dupe.h, ent, true);
                delete dupe.l;
                delete dupe.e;
                delete dupe.v;
                if (dupe.i) {
                  obj.data.info.img.min = dupe.i;
                }
                else {
                  delete obj.data.info.img.min;
                }
                sendAlert({text : "Saved as default piece"});

                obj.data.info.img.modifiers = dupe;
                obj.sync("updateAsset");
              }
              else {
                sendAlert({text : "Invalid Piece"});
              }
            }
            else {
              sendAlert({text : "Select a single piece to save as the default map piece "})
            }
          });
        }

        var calculations = $("<button>").appendTo(optionsBar);
        calculations.addClass("background subtitle alttext");
        calculations.text("Math");
        calculations.click(function(){
          app.attr("viewingData", true);
          obj.update();
        });
        if (hasSecurity(getCookie("UserID"), "Rights", obj.data) || app.attr("homebrew")) {
          var quickSheet = $("<button>").appendTo(optionsBar);
          quickSheet.addClass("background subtitle alttext");
          quickSheet.text("Sheet");
          quickSheet.click(function(){
            obj.data._d = obj.data._d || {style : duplicate(game.templates.display.sheet.style) || {}, content : duplicate(game.templates.display.sheet.content)};
            app.attr("simpleEditing", true);
            obj.update();
          });
        }
        if (hasSecurity(getCookie("UserID"), "Rights", obj.data) || app.attr("homebrew")) {
          var tags = $("<button>").appendTo(optionsBar);
          tags.addClass("background subtitle alttext");
          tags.text("Notes");
          tags.click(function(){
            app.attr("viewingNotes", true);
            obj.update();
          });
        }

        var tags = $("<button>").appendTo(optionsBar);
        tags.addClass("background subtitle alttext");
        tags.text("Tags");
        if (app.attr("viewingTags")) {
          tags.removeClass("background");
          tags.addClass("highlight");
        }
        tags.click(function(){
          if (app.attr("viewingTags")) {
            app.removeAttr("viewingTags");
          }
          else {
            app.attr("viewingTags", true);
          }
          obj.update();
        });
        if (!app.attr("homebrew")) {
          var actions = $("<button>").appendTo(optionsBar);
          actions.addClass("background subtitle alttext");
          if (app.attr("viewingActions")) {
            actions.removeClass("background");
            actions.addClass("highlight");
          }
          actions.text("Actions");
          actions.click(function(){
            if (app.attr("viewingActions")) {
              app.removeAttr("viewingActions");
              div.empty();
            }
            else {
              app.attr("viewingActions", true);
            }
            obj.update();
          });
          actions.contextmenu(function(ev){
            var actionObj = sync.dummyObj();
            actionObj.data = {context : {c : obj.id()}};

            game.locals["actions"] = game.locals["actions"] || [];
            game.locals["actions"].push(actionObj);

            var newApp = sync.newApp("ui_actions");
            newApp.addClass("spadding");
            actionObj.addApp(newApp);

            var pop = ui_popOut({
              target : $(this),
              minimize : true,
              dragThickness : "0.5em",
              title : "Actions",
              align : "bottom",
              style : {"width" : "300px"},
            }, newApp);
            pop.resizable();

            ev.stopPropagation();
            return false;
          });
        }

        if (hasSecurity(getCookie("UserID"), "Rights", data) && hasSecurity(getCookie("UserID"), "Assistant Master")) {
          if (hasSecurity(getCookie("UserID"), "Owner", data)) {
            var syncLabel;
            if (data._c == -1) {
              syncLabel = genIcon("remove").appendTo(optionsBar);
              syncLabel.addClass("alttext background outline");
              syncLabel.attr("title", "Duplicate to move to Asset Storage");
            }
            else {
              if (data._uid) {
                if (data._sync) {
                  var syncLabel = genIcon("refresh").appendTo(optionsBar);
                  syncLabel.addClass("alttext highlight smooth outline lrpadding");
                  syncLabel.attr("title", "This is saved, and is in-sync with Asset Storage");
                  syncLabel.click(function(ev){
                    runCommand("updateSync", {id : obj.id(), data : false});
                    ev.stopPropagation();
                    return false;
                  });
                }
                else {
                  var syncLabel = genIcon("cloud").appendTo(optionsBar);
                  syncLabel.addClass("alttext highlight smooth outline lrpadding");
                  syncLabel.attr("title", "This is saved, but is not in-sync with Asset Storage");
                  syncLabel.click(function(ev){
                    runCommand("updateSync", {id : obj.id(), data : true});
                    ev.stopPropagation();
                    return false;
                  });
                }
              }
              else {
                var syncLabel = genIcon("cloud")//.appendTo(optionsBar);
                syncLabel.addClass("lrpadding");
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
            }
          }
        }
      }
    }
  }
  else if (obj.id() && isNaN(obj.id()) && obj.id().match(getCookie("UserID"))) {
    var optionsBar = $("<div>").appendTo(div);
    optionsBar.addClass("flexaround background");
    optionsBar.css("color", "white");

    var cloudWrap = genIcon("cloud-download", "Download Asset").appendTo(optionsBar);
    cloudWrap.attr("title", "Download Asset");

    cloudWrap.click(function(ev){
      if (game.locals["storage"]) {
        for (var i in game.locals["storage"].data.l) {
          var listEntry = game.locals["storage"].data.l[i];
          var split = obj.id().split("_");
          if (obj.data._c == getCookie("UserID") && listEntry._uid == split[1]) {
            listEntry.move = true;
            runCommand("moveAssets", {l : game.locals["storage"].data.l});
            delete listEntry.move;
            game.entities.listen[obj.id()] = function(src, update, target) {
              for (var key in src.data) {
                var newEnt = src.data[key];
                if (newEnt.data && newEnt.data._c == split[0] && newEnt.data._uid == split[1]) {
                  obj.removeApp(app);
                  newEnt.addApp(app);
                  return false;
                }
              }
              return true;
            }
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

  if (app.attr("viewingTags")) {
    var tags = sync.render("ui_tags")(obj, app, scope).appendTo(div);
    tags.addClass("foreground outlinebottom");
  }

  var charWrapper = $("<div>").appendTo(div);
  charWrapper.addClass("flexcolumn flex");
  charWrapper.css("overflow-y", "auto");
  charWrapper.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  charWrapper.scroll(function(){
    app.attr("_lastScrollTop", charWrapper.scrollTop());
    app.attr("_lastScrollLeft", charWrapper.scrollLeft());
  });


  var charContents = $("<div>").appendTo(charWrapper);
  charContents.addClass("fit-xy flexcolumn");

  var list = $("<div>").appendTo(charContents);
  list.addClass("fit-x flexaround flexwrap");

  var ctx = sync.defaultContext();
  ctx[obj.data._t] = obj.data;

  if (obj.data._d) { // flat sheets
    sheet = obj.data._d;

    for (var i in sheet.style) {
      charWrapper.css(i, sheet.style[i]);
    }

    var newScope = duplicate(scope);
    newScope.display = sheet.content;
    if (scope.markup || app.attr("simpleEditing")) {
      newScope.markup = "editing";
    }
    newScope.context = ctx;
    charContents.append(sync.render("ui_processUI")(obj, app, newScope));
    if (app.attr("simpleEditing")) {
      function sheetElementMenu(parent, path) {
        var contents = $("<div>");
        contents.addClass("flexrow flex subtitle foreground");

        var newOptionWrap = $("<div>").appendTo(contents);
        newOptionWrap.addClass("bold flexrow flexmiddle alttext");

        if (path) {
          var moveUp = genIcon("arrow-up").appendTo(newOptionWrap);
          moveUp.addClass("lrmargin");
          moveUp.click(function(){
            var replace = path.replace(app.attr("id")+"_0", "");
            while (replace.match("-")) {
              replace = replace.replace("-", ".");
            }
            if (replace[0] == ".") {
              replace = replace.substring(1, replace.length);
            }

            var index = replace.split("\.");
            index = index[index.length-1];
            var final = replace.substring(0, replace.length-1-index.length);
            var arr = sync.traverse(obj.data._d.content, final);
            if (arr && Array.isArray(arr)) {
              util.insert(arr, 0, arr.splice(index, 1)[0]);
              obj.update();
              $("#sheet-element-menu").remove();
            }
          });
        }


        var type = $("<div>").appendTo(newOptionWrap);
        type.addClass("flexmiddle button hover2 bold spadding outline smooth");
        type.attr("id", "edit-element");
        type.css("color", "#333");
        type.css("text-shadow", "none");
        if (parent.hasClass("flexrow")) {
          type.append(genIcon("cog", "Row"));
        }
        else {
          type.append(genIcon("cog", "Column"));
        }
        type.click(function(){
          var replace = path.replace(app.attr("id")+"_0", "");
          while (replace.match("-")) {
            replace = replace.replace("-", ".");
          }
          if (replace[0] == ".") {
            replace = replace.substring(1, replace.length);
          }

          var select = sync.newApp("ui_elementMenu");
          if (replace != null && replace.trim()) {
            select.attr("lookup", "_d.content."+replace);
          }
          else {
            select.attr("lookup", "_d.content");
          }
          select.attr("closeTarget", "json-editor");
          obj.addApp(select);

          var popout = ui_popOut({
            target : $(this),
            title : "JSON Edit",
            id : "json-editor",
          }, select);
          popout.resizable();
        });

        var newOption = genIcon("plus", "Add...").appendTo(newOptionWrap);
        newOption.attr("id", "add-new-element");
        newOption.addClass("bold alttext lrmargin");
        newOption.click(function(){
          var interfaces = duplicate(util.interfaces);

          contents.empty();
          contents.addClass("flexaround alttext");
          contents.css("font-size", "1.2em");

          for (var category in interfaces) {
            var list = $("<div>").appendTo(contents);
            list.addClass("flexcolumn margin");
            list.append("<b class='fit-x flexmiddle underline'>"+category+"</b>");

            for (var key in interfaces[category]) {
              var intData = interfaces[category][key];

              var inputWrap = $("<div>").appendTo(list);
              inputWrap.addClass("flexmiddle subtitle");

              var inputLink = genIcon(null, key).appendTo(inputWrap);
              inputLink.attr("index", key);
              inputLink.attr("category", category);
              inputLink.click(function(){
                var inputData = duplicate(interfaces[$(this).attr("category")][$(this).attr("index")]);
                function submitData() {
                  if (!path) {
                    obj.data._d.content.display = obj.data._d.content.display || [];
                    obj.data._d.content.display.push(inputData.content);
                  }
                  else {
                    var replace = path.replace(app.attr("id")+"_0", "");
                    while (replace.match("-")) {
                      replace = replace.replace("-", ".");
                    }
                    if (replace[0] == ".") {
                      replace = replace.substring(1, replace.length);
                    }
                    var target = sync.traverse(obj.data._d.content, replace);
                    target.display = target.display || [];
                    target.display.push(inputData.content);
                  }
                  obj.update();
                  pop.remove();
                }
                if (!inputData.arguments) {
                  submitData();
                }
                else {
                  var inputs = {};

                  for (var arg in inputData.arguments) {
                    var argData = inputData.arguments[arg];
                    inputs[arg] = {};
                    if (argData.datalist) {
                      var dataList = $("<datalist>").appendTo(contents);
                      dataList.attr("id", "argument-data-list");

                      if (argData.datalist == "character") {
                        var template = {stats : "", info : "", counters : ""};
                        for (var key in template) {
                          var pathKey = key;
                          for (var subKey in obj.data[key]) {
                            pathKey = key + "." + subKey;
                            if (pathKey != "info.notes" && pathKey != "info.img") {
                              var option = $("<option>").appendTo(dataList);
                              option.attr("value", pathKey);
                            }
                          }
                        }
                      }
                      else {
                        for (var i in argData.datalist) {
                          var option = $("<option>").appendTo(dataList);
                          option.attr("value", argData.datalist[i]);
                        }
                      }

                      inputs[arg] = {
                        type : "list",
                        list : "argument-data-list",
                      };
                    }
                    inputs[arg].category = $(this).attr("category");
                    inputs[arg].index = $(this).attr("index");
                    inputs[arg].arg = arg;
                    inputs[arg].placeholder = argData.placeholder;
                    inputs[arg].value = argData.default;
                  }

                  ui_prompt({
                    target : $(this),
                    inputs : inputs,
                    click : function(ev, inputs){
                      for (var key in inputs) {
                        var inputEl = inputs[key];
                        var intData = interfaces[inputEl.attr("category")][inputEl.attr("index")];
                        var argData = interfaces[inputEl.attr("category")][inputEl.attr("index")].arguments[inputEl.attr("arg")];
                        inputData.content = JSON.parse(replaceAll(JSON.stringify(inputData.content), inputEl.attr("arg"), inputEl.val()));
                      }
                      submitData();
                    },
                  });
                }
              });
            }
          }
        });

        if (path) {
          var moveDown = genIcon("arrow-down").appendTo(newOptionWrap);
          moveDown.addClass("lrmargin");
          moveDown.click(function(){
            var replace = path.replace(app.attr("id")+"_0", "");
            while (replace.match("-")) {
              replace = replace.replace("-", ".");
            }
            if (replace[0] == ".") {
              replace = replace.substring(1, replace.length);
            }

            var index = replace.split("\.");
            index = index[index.length-1];
            var final = replace.substring(0, replace.length-1-index.length);
            var arr = sync.traverse(obj.data._d.content, final);
            if (arr && Array.isArray(arr)) {
              arr.push(arr.splice(index, 1)[0]);
              obj.update();
              $("#sheet-element-menu").remove();
            }
          });
        }

        var newOption = $("<button>").appendTo(contents);
        newOption.addClass("bold flexcolumn flexmiddle outline flex hover2 destroy");
        newOption.append(genIcon("trash"));
        newOption.css("margin-right", "20px");
        newOption.click(function(){
          var replace = path.replace(app.attr("id")+"_0", "");
          while (replace.match("-")) {
            replace = replace.replace("-", ".");
          }
          if (replace[0] == ".") {
            replace = replace.substring(1, replace.length);
          }

          var index = replace.split("\.");
          index = index[index.length-1];
          var final = replace.substring(0, replace.length-1-index.length);
          var arr = sync.traverse(obj.data._d.content, final);
          if (arr && Array.isArray(arr)) {
            arr.splice(index, 1);
            $("#sheet-element-menu").remove();
            obj.update();
          }
        });

        if (!$("#sheet-element-menu").length || $("#sheet-element-menu").hasClass("prompt")) {
          var pop = ui_popOut({
            target : parent,
            noCss : true,
            pin : false,
            prompt : true,
            align : "top",
            id : "sheet-element-menu",
          }, contents);
        }
      }

      charContents.hover(function(ev){
        if ($(".selected").length == 0) {
          sheetElementMenu($(this));
        }
        ev.stopPropagation();
      });
      charContents.click(function(){
        var replace = path.replace(app.attr("id")+"_0", "");
        while (replace.match("-")) {
          replace = replace.replace("-", ".");
        }
        if (replace[0] == ".") {
          replace = replace.substring(1, replace.length);
        }

        var select = sync.newApp("ui_JSON");
        select.attr("lookup", "_d.contents"+replace);
        select.attr("closeTarget", "json-editor");
        obj.addApp(select);

        var popout = ui_popOut({
          target : $(this),
          id : "json-editor",
        }, select);
        popout.resizable();
      });
      function build(sData, lastLookup) {
        var first = false;
        if (!lastLookup) {
          lastLookup = app.attr("id")+"_0";
          first = true;
        }
        var name = lastLookup;
        var icon = "";
        if (sData.classes && sData.classes.match("flexcolumn")) {
          icon = 'resize-vertical';
          name = "Columns";
        }
        else if (sData.classes && sData.classes.match("flexrow")) {
          name = "Rows";
          icon = "resize-horizontal";
        }
        if (sData.ui) {
          name = sData.ui;
          icon = "edit";
        }
        if (sData.apps) {
          name = "Apps";
          icon = "th-large";
        }
        if (sData.link) {
          name = sData.link;
          icon = "link"
        }
        if (sData.icon) {
          name = sData.icon;
          icon = "exclamation-sign"
        }

        if (sData.name) {
          name = sData.name;
          icon = "text-color"
        }
        if (sData.target) {
          name = sData.target;
          icon = "";
        }
        function clickWrap(scope, lastLookup) {
          setTimeout(function(){
            $("#"+(newScope.markup || "")+lastLookup).mousemove(function(ev){
              if (!$("#sheet-element-menu").length || $("#sheet-element-menu").hasClass("prompt")) {
                $(".selected").removeClass("selected");
                $(this).addClass("selected");
                sheetElementMenu($(this), lastLookup);
              }
              ev.stopPropagation();
              ev.preventDefault();
            });
            $("#"+(newScope.markup || "")+lastLookup).attr("target", lastLookup);
            $("#"+(newScope.markup || "")+lastLookup).unbind("click");
            $("#"+(newScope.markup || "")+lastLookup).css("cursor", "pointer");
            $("#"+(newScope.markup || "")+lastLookup).click(function(ev){
              $(".selected").removeClass("selected");
              $(this).addClass("selected");
              $("#sheet-element-menu").remove();
              sheetElementMenu($(this), lastLookup);
              $("#sheet-element-menu").removeClass("prompt");
              $("#add-new-element").click();
              ev.stopPropagation();
            });
            $("#"+(newScope.markup || "")+lastLookup).contextmenu(function(ev){
              $(".selected").removeClass("selected");
              $(this).addClass("selected");
              $("#sheet-element-menu").remove();
              sheetElementMenu($(this), lastLookup);
              $("#sheet-element-menu").removeClass("prompt");
              $("#edit-element").click();
              ev.stopPropagation();
              return false;
            });
          }, 10);
        }
        clickWrap(newScope, lastLookup);
        if (sData.display) {
          for (var i in sData.display) {
            if (sData.display[i]) {
              build(sData.display[i], lastLookup+"-display-"+i);
            }
          }
        }
      }
      build(newScope.display);
    }
    /*
    var flatDisplay = $("<div>").appendTo(charContents);

    if (sheet.content && Object.keys(sheet.content).length && sheet.category && sheet.category.length) {
      flatDisplay.addClass("flex");
      flatDisplay.css("min-height", "25%");
      flatDisplay.css("max-height", "33%");
      flatDisplay.css("overflow", "auto");
    }
    else if (sheet.category && sheet.category.length) {
      flatDisplay.addClass("flex");
      flatDisplay.css("max-height", "100%");
      flatDisplay.css("overflow", "auto");
    }

    for (var key in sheet.category) {
      var title = $("<div>").appendTo(flatDisplay);
      title.addClass("underline");
      title.css("font-size", "1.6em");
      title.css("text-align", "left");
      title.text(sheet.category[key].name);

      if (app.attr("simpleEditing")) {
        title.empty();
        var editCategory = genIcon("edit", sheet.category[key].name).appendTo(title);
        editCategory.addClass("lrmargin");
        editCategory.attr("index", key);
        editCategory.click(function(){
          var key = $(this).attr("index");
          ui_prompt({
            target : $(this),
            inputs : {
              "Category Name" : ""
            },
            click : function(ev, inputs){
              obj.data._d.category[key].name = inputs["Category Name"].val();
              obj.sync("updateAsset");
            }
          });
        });

        var del = genIcon("remove").appendTo(title);
        del.addClass("destroy");
        del.attr("index", key);
        del.click(function(){
          obj.data._d.category.splice($(this).attr("index"), 1);
          obj.sync("updateAsset");
          layout.coverlay("edit-category");
        });
      }

      if (sheet.category[key].display instanceof String) {
        flatDisplay.append(sync.render(sheet.category[key].display)(obj, app, scope));
      }
      else {
        for (var dKey in sheet.category[key].display) {
          var newScope = duplicate(scope);
          newScope.display = sheet.category[key].display[dKey];
          if (scope.markup) {
            newScope.markup = "content";
          }
          newScope.context = ctx;
          var display = sync.render("ui_processUI")(obj, app, newScope).appendTo(flatDisplay);
          if (app.attr("simpleEditing")) {
            display.attr("category", key);
            display.attr("categoryKey", dKey);
            display.children().css("pointer-events", "none");
            display.css("cursor", "pointer");
            display.hover(function(){
              $(this).addClass("selected");
            },
            function(){
              $(this).removeClass("selected");
            });
            display.click(function(ev){
              var catKey = $(this).attr("category");
              var dKey = $(this).attr("categoryKey");

              var content = $("<div>");
              content.addClass("flexrow flexaround padding lrmargin bold");
              content.css("font-size", "1.2em");

              var moveup = genIcon("arrow-up", "Move Up").appendTo(content);
              moveup.addClass("lrmargin");
              moveup.click(function(){
                var data = obj.data._d.category[catKey].display.splice(dKey, 1);
                util.insert(obj.data._d.category[catKey].display, Math.max(dKey-1, 0), data[0]);
                obj.sync("updateAsset");
                layout.coverlay("quick-sheet-edit-field");
              });

              var movedown = genIcon("arrow-down", "Move Down").appendTo(content);
              moveup.addClass("lrmargin");
              movedown.click(function(){
                var data = obj.data._d.category[catKey].display.splice(dKey, 1);
                if (obj.data._d.category[catKey].display.length == dKey) {
                  obj.data._d.category[catKey].display.push(data[0]);
                }
                else {
                  util.insert(obj.data._d.category[catKey].display, dKey, data[0]);
                }
                obj.sync("updateAsset");
                layout.coverlay("quick-sheet-edit-field");
              });

              var remove = genIcon("remove", "Remove").appendTo(content);
              remove.addClass("destroy lrmargin");
              remove.click(function(){
                obj.data._d.category[catKey].display.splice(dKey, 1);
                obj.sync("updateAsset");
                layout.coverlay("quick-sheet-edit-field");
              });

              var pop = ui_popOut({
                target : $(this),
                id : "quick-sheet-edit-field",
              }, content);

              ev.stopPropagation();
              ev.preventDefault();
            });
          }
        }
      }
      if (app.attr("simpleEditing")) {
        var catWrap = $("<div>").appendTo(flatDisplay);
        catWrap.addClass("flexmiddle");

        var newField = genIcon("plus", "New Field").appendTo(catWrap);
        newField.addClass("fit-x create middle subtitle");
        newField.attr("category", key);
        newField.click(function(){
          var catKey = $(this).attr("category");

          var content = $("<div>");
          content.addClass("flexcolumn");

          content.append("<b>Field Target</b>");

          var dataList = $("<datalist>").appendTo(content);
          dataList.attr("id", "homebrew-list-edit");

          var template = {stats : "", info : "", counters : ""};
          for (var key in template) {
            var path = key;
            for (var subKey in obj.data[key]) {
              path = key + "." + subKey;
              if (path != "info.notes" && path != "info.img") {
                var option = $("<option>").appendTo(dataList);
                option.attr("value", path);
              }
            }
          }

          var input = genInput({
            parent : content,
            type : "list",
            list : "homebrew-list-edit",
            id : "homebrew-target-input",
            placeholder : "Field to Edit",
          });

          var options = $("<div>").appendTo(content);
          options.addClass("flexrow flexaround flexwrap");

          var minCheckWrap = $("<div>").appendTo(options);
          minCheckWrap.addClass("flexmiddle bold subtitle");

          var minCheck = genInput({
            parent : minCheckWrap,
            type : "checkbox",
            style : {"margin" : "0"},
          });

          minCheckWrap.append("Min");

          var maxCheckWrap = $("<div>").appendTo(options);
          maxCheckWrap.addClass("flexmiddle bold subtitle");

          var maxCheck = genInput({
            parent : maxCheckWrap,
            type : "checkbox",
            style : {"margin" : "0"},
          });

          maxCheckWrap.append("Max");

          var showModsWrap = $("<div>").appendTo(options);
          showModsWrap.addClass("flexmiddle bold subtitle");

          var modsCheck = genInput({
            parent : showModsWrap,
            type : "checkbox",
            style : {"margin" : "0"},
          });

          showModsWrap.append("Modifiers");


          var confirm = $("<button>").appendTo(content);
          confirm.addClass("highlight alttext");
          confirm.append("Confirm");
          confirm.click(function(){
            if (input.val() && input.val() != "info.notes" && input.val() != "info.img") {
              var traverse = sync.traverse(obj.data, input.val());
              if (traverse === false) {
                ui_prompt({
                  target : $(this),
                  inputs : {
                    "Enter new field name" : ""
                  },
                  click : function(ev, inputs) {
                    var traverse = sync.traverse(obj.data, input.val(), {name : inputs["Enter new field name"].val()});

                    var display = {};
                    display.classes = "fit-x spadding flexrow flexmiddle";
                    if (minCheck.prop("checked") || maxCheck.prop("checked") || modsCheck.prop("checked")) {
                      display.display = [
                        {classes : "flex flexrow flexmiddle lrmargin", target : input.val(), edit : {classes : "line flex lrmargin middle", cmd : "updateAsset", raw : "1"}}
                      ];
                      if (minCheck.prop("checked")) {
                        display.display.push({classes : "flex flexrow flexmiddle lrmargin", name : "min", target : input.val(), edit : {classes : "line middle flex lrmargin", cmd : "updateAsset", raw : "min"}});
                      }
                      if (maxCheck.prop("checked")) {
                        display.display.push({classes : "flex flexrow flexmiddle lrmargin", name : "max", target : input.val(), edit : {classes : "line middle flex lrmargin", cmd : "updateAsset", raw : "max"}});
                      }
                      if (modsCheck.prop("checked")) {
                        display.display.push({classes : "flexmiddle lrmargin", ui : "ui_link", scope : {classes : "flexmiddle", icon : "'list-alt'", click : "ui_modifiers", lookup : input.val(), attr : {"modsOnly" : true}}});
                      }
                      display.display.push({classes : "flexmiddle lrmargin bold", style : {"font-size" : "1.2em"}, value : "@c." + input.val()});
                    }
                    else {
                      display.display = [
                        {classes : "flex flexrow flexmiddle lrmargin", target : input.val(), edit : {classes : "line flex lrmargin", cmd : "updateAsset", raw : "1"}}
                      ];
                    }
                    layout.coverlay("quick-sheet-add-field");
                    obj.data._d.category[catKey].display = obj.data._d.category[catKey].display || [];
                    obj.data._d.category[catKey].display.push(display);
                    obj.sync("updateAsset");
                  }
                });
              }
              else {
                var display = {};
                display.classes = "fit-x spadding flexrow flexmiddle";
                if (minCheck.prop("checked") || maxCheck.prop("checked") || modsCheck.prop("checked")) {
                  display.display = [
                    {classes : "flex flexrow flexmiddle lrmargin", target : input.val(), edit : {classes : "line flex lrmargin middle", cmd : "updateAsset", raw : "1"}}
                  ];
                  if (minCheck.prop("checked")) {
                    display.display.push({classes : "flex flexrow flexmiddle lrmargin", name : "min", target : input.val(), edit : {classes : "line middle flex lrmargin", cmd : "updateAsset", raw : "min"}});
                  }
                  if (maxCheck.prop("checked")) {
                    display.display.push({classes : "flex flexrow flexmiddle lrmargin", name : "max", target : input.val(), edit : {classes : "line middle flex lrmargin", cmd : "updateAsset", raw : "max"}});
                  }
                  if (modsCheck.prop("checked")) {
                    display.display.push({classes : "flexmiddle lrmargin", ui : "ui_link", scope : {classes : "flexmiddle", icon : "'list-alt'", click : "ui_modifiers", lookup : input.val(), attr : {"modsOnly" : true}}});
                  }
                  display.display.push({classes : "flexmiddle lrmargin bold", style : {"font-size" : "1.2em"}, value : "@c." + input.val()});
                }
                else {
                  display.display = [
                    {classes : "flex flexrow flexmiddle lrmargin", target : input.val(), edit : {classes : "line flex lrmargin", cmd : "updateAsset", raw : "1"}}
                  ];
                }
                layout.coverlay("quick-sheet-add-field");
                obj.data._d.category[catKey].display = obj.data._d.category[catKey].display || [];
                obj.data._d.category[catKey].display.push(display);
                obj.sync("updateAsset");
              }
            }
            else {
              input.val("");
              sendAlert({text : "Restricted Field"});
            }
          });

          var pop = ui_popOut({
            target : $(this),
            id : "quick-sheet-add-field",
          }, content);
        });
      }
    }
    if (app.attr("simpleEditing")) {
      var catWrap = $("<div>").appendTo(flatDisplay);
      catWrap.addClass("flexmiddle");

      var newCategory = genIcon("plus", "New Category").appendTo(catWrap);
      newCategory.addClass("fit-x create middle");
      newCategory.css("font-size", "1.6em");
      newCategory.click(function(){
        obj.data._d.category.push({name : "New Category"});
        obj.sync("updateAsset");
      });
    }
    */
    if (sheet.tabs && sheet.tabs.length) {
      var tabContent = genNavBar("flexaround background alttext", "flex", "4px");
      tabContent.addClass("flex");
      function tabWrap(importData, index) {
        tabContent.generateTab(importData.name, importData.icon, function(parent) {
          var newScope = duplicate(scope);
          newScope.display = importData.display;
          newScope.context = ctx;
          if (scope.markup) {
            newScope.markup = "tabs"+index;
          }
          parent.append(sync.render("ui_processUI")(obj, app, newScope));

          if (app) {
            app.attr("char_tab", importData.name);
          }
        });
      }

      for (var index in sheet.tabs) {
        tabWrap(sheet.tabs[index], index);
      }
      if (sheet.tabs && sheet.tabs.length) {
        if (app) {
          if (!app.attr("char_tab") && sheet.tabs) {
            app.attr("char_tab", sheet.tabs[0].name);
          }
          tabContent.selectTab(app.attr("char_tab"));
        }
        else {
          tabContent.selectTab(sheet.tabs[0].name);
        }
      }

      tabContent.appendTo(charContents);
    }

    return div;
  }

  for (var i in sheet.style) {
    charWrapper.css(i, sheet.style[i]);
  }

  var newScope = duplicate(scope);
  newScope.display = sheet.content;
  if (scope.markup) {
    newScope.markup = "content";
  }
  newScope.context = ctx;
  charContents.append(sync.render("ui_processUI")(obj, app, newScope));
  if (sheet.tabs && sheet.tabs.length) {
    var tabContent = genNavBar("flexaround background alttext", "flex", "4px");
    tabContent.addClass("flex");
    function tabWrap(importData, index) {
      tabContent.generateTab(importData.name, importData.icon, function(parent) {
        var newScope = duplicate(scope);
        newScope.display = importData.display;
        newScope.context = ctx;
        if (scope.markup) {
          newScope.markup = "tabs"+index;
        }
        parent.append(sync.render("ui_processUI")(obj, app, newScope));

        if (app) {
          app.attr("char_tab", importData.name);
        }
      });
    }

    for (var index in sheet.tabs) {
      tabWrap(sheet.tabs[index], index);
    }
    if (sheet.tabs && sheet.tabs.length) {
      if (app) {
        if (!app.attr("char_tab") && sheet.tabs) {
          app.attr("char_tab", sheet.tabs[0].name);
        }
        tabContent.selectTab(app.attr("char_tab"));
      }
      else {
        tabContent.selectTab(sheet.tabs[0].name);
      }
    }

    tabContent.appendTo(charContents);
  }

  return div;
});
