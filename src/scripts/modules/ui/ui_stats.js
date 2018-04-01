sync.render("ui_diceable", function(obj, app, scope){
  var div = $("<div>");
  if (scope.classes) {
    div.addClass(scope.classes);
  }
  else {
    div.addClass("flex flexcolumn flexmiddle");
  }

  var data = obj.data;
  var value;
  if (scope.lookup) {
    value = sync.traverse(data, scope.lookup);
  }
  if (scope.name) {
    div.append("<b>"+sync.eval(scope.name, {value : value, c : obj.data})+"</b>");
  }

  if (scope.value) {
    div.append(sync.eval(scope.value, {value : value, c : obj.data}));
  }
  else {
    div.append("<text>"+sync.val(value)+"</text>")
  }

  if (scope.action) {
    div.addClass("hover2");
    div.click(function(ev) {
      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : obj.id()}, options : scope.options, action : scope.action, msg : scope.msg};

      game.locals["actions"] = game.locals["actions"] || [];
      game.locals["actions"].push(actionObj);

      var newApp = sync.newApp("ui_actions");
      actionObj.addApp(newApp);

      var pop = ui_popOut({
        target : $(this),
        minimize : true,
        dragThickness : "0.5em",
        title : "Actions"
      }, newApp);
      pop.resizable();
    });
  }
  if (scope.eventData) {
    div.addClass("hover2");
    div.click(function(ev) {
      var context = sync.defaultContext();
      context["c"] = duplicate(obj.data);
      context["target"] = value;
      context["lookup"] = scope.lookup;
      _diceable(ev, $(this), scope.eventData, context);
    });
  }

  return div;
});

sync.render("ui_rankedStat", function(obj, app, scope) {
  var data = obj.data;

  var stat = sync.traverse(data, scope.lookup);
  var statIndex = scope.lookup.split(".");
  statIndex = statIndex[statIndex.length-1];

  var content = $("<div>");
  content.addClass("flexcolumn flexmiddle");

  var advanceDiv = $("<div>").appendTo(content);
  for (var i=1; i<6; i++) {
    var advancement = genInput({
      parent: advanceDiv,
      class: "advancement",
      type: "checkbox",
      id: statIndex+"_adv",
      rank: i,
      disabled: scope.viewOnly,
      style: {"width": "10px", "height": "10px"}
    });

    if (sync.modifier(stat, "rank") > 0 && i * 5 <= sync.modifier(stat, "rank")) {
      advancement.prop("checked", true);
    }
    if (!scope.viewOnly) {
      advancement.change(function(ev) {
        if ($(this).prop("checked")) {
          sync.modifier(stat, "rank", parseInt($(this).attr("rank")) * 5);
          obj.sync("updateAsset");
        }
        else {
          var val = Math.max(parseInt($(this).attr("rank"))-1,0) * 5;
          if (val <= 0) {
            sync.removeModifier(stat, "rank");
          }
          else {
            sync.modifier(stat, "rank", val);
          }
          obj.sync("updateAsset");
        }
      });
    }
  }

  var statValue = genInput({
    parent: content,
    class: "ui-stat",
    value: stat,
    raw: true,
    disabled: scope.viewOnly,
    obj: obj,
    cmd: "updateAsset"
  });
  if (statValue.val().length > 3) {
    statValue.addClass("subtitle");
    statValue.css("width", "80px");
  }
  var diceTemplates = game.templates.dice;
  var die = diceTemplates.pool[diceTemplates.defaults[0]].value;

  var modf;
  if (!scope.viewOnly && !scope.noMods) {
    modf = function(ev, inputs, options) {
      if (inputs["Modifier Name"].val().valid()) {
        sync.modifier(options.value, inputs["Modifier Name"].val(), parseInt(inputs["Value"].val()));
        obj.sync("updateAsset");
      }
    }
  }

  var context = sync.defaultContext();
  context["c"] = obj.data;
  context["stat"] = stat;
  context["statKey"] = statIndex;

  var statUI = ui_modified({
    title : statIndex,
    value : stat,
    modify : modf,
    click : function(ev, ui, options) {
      if (!scope.viewOnly) {
        sync.removeModifier(options.value, ui.attr("index"));
        obj.sync("updateAsset");
      }
    },
    total : sync.val(stat),
    reveal : true,
    context : context,
    diceable : scope.eventData,
    totalClick : function(ev, ui, options, context) {
      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : obj.id()}, options : scope.options, action : scope.action, msg : scope.msg};

      game.locals["actions"] = game.locals["actions"] || [];
      game.locals["actions"].push(actionObj);

      var newApp = sync.newApp("ui_actions");
      actionObj.addApp(newApp);

      var pop = ui_popOut({
        target : ui,
        minimize : true,
        dragThickness : "0.5em",
        title : "Actions"
      }, newApp);
      pop.resizable();
    },
  }, content);
  statUI.css("background-color", "white");
  return statUI;
});

sync.render("ui_fantasyStat", function(obj, app, scope) {
  var data = obj.data;

  var stat = sync.traverse(data, scope.lookup);

  var statIndex = scope.lookup.split(".");
  statIndex = statIndex[statIndex.length-1];

  var content = $("<div>");
  content.addClass("flexcolumn flexmiddle");

  var statValue;
  if (scope.raw) {
    statValue = genInput({
      parent: content,
      class: "ui-stat",
      value: sync.modifier(stat, scope.raw),
      disabled: scope.viewOnly,
    });
    statValue.change(function(){
      sync.modifier(stat, scope.raw, $(this).val());
      obj.sync("updateAsset");
    });
  }
  else {
    statValue = genInput({
      parent: content,
      class: "ui-stat",
      value: stat,
      raw: true,
      disabled: scope.viewOnly,
    });
    statValue.change(function(){
      sync.rawVal(stat, $(this).val());
      obj.sync("updateAsset");
    });
  }

  if (statValue.val().length > 3) {
    statValue.addClass("subtitle");
    statValue.css("width", "80px");
  }

  var total = sync.modified(stat, 0);
  if (total >= 0) {
    total = "+" + total;
  }

  var diceTemplates = game.templates.dice;
  var die = diceTemplates.pool[diceTemplates.defaults[0]].value;

  var modf;
  if (!scope.viewOnly && !scope.noMods) {
    modf = function(ev, inputs, options) {
      if (inputs["Modifier Name"].val().valid()) {
        sync.modifier(options.value, inputs["Modifier Name"].val(), parseInt(inputs["Value"].val()));
        obj.sync("updateAsset");
      }
    }
  }

  var context = {};
  context["c"] = obj.data;
  context["stat"] = stat;
  context["statKey"] = statIndex;

  var statUI = ui_modified({
    title : stat.name,
    value : stat,
    modify : modf,
    click : function(ev, ui, options) {
      if (!scope.viewOnly) {
        sync.removeModifier(options.value, ui.attr("index"));
        obj.sync("updateAsset");
      }
    },
    total : total,
    reveal : true,
    diceable : scope.eventData,
    context : context,
    totalClick : function(ev, ui, options, context) {
      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : obj.id()}, options : scope.options, action : scope.action, msg : scope.msg};

      game.locals["actions"] = game.locals["actions"] || [];
      game.locals["actions"].push(actionObj);

      var newApp = sync.newApp("ui_actions");
      actionObj.addApp(newApp);

      var pop = ui_popOut({
        target : ui,
        minimize : true,
        dragThickness : "0.5em",
        title : "Actions"
      }, newApp);
      pop.resizable();
    }
  }, content);
  statUI.css("background-color", "white");
  return statUI;
});

sync.render("ui_plainStat", function(obj, app, scope) {
  var data = obj.data;

  var stat = sync.traverse(data, scope.lookup);
  var statIndex = scope.lookup.split(".");
  statIndex = statIndex[statIndex.length-1];

  var content = $("<div>");
  content.addClass("flexcolumn flexmiddle");

  var statValue = genInput({
    parent: content,
    class: "ui-stat",
    value: stat,
    raw: true,
    disabled: scope.viewOnly,
    obj: obj,
    cmd: "updateAsset"
  });
  var diceTemplates = game.templates.dice;
  var die = diceTemplates.pool[diceTemplates.defaults[0]].value;

  var modf;
  if (!scope.viewOnly) {
    modf = function(ev, inputs, options) {
      if (inputs["Modifier Name"].val().valid()) {
        sync.modifier(options.value, inputs["Modifier Name"].val(), parseInt(inputs["Value"].val()));
        obj.sync("updateAsset");
      }
    }
  }

  var context = {};
  context["c"] = obj.data;
  context["stat"] = stat;
  context["statKey"] = statIndex;

  var statUI = ui_modified({
    title : stat.name,
    value : stat,
    total : sync.val(stat),
    modify : modf,
    reveal : true,
    click : function(ev, ui, options) {
      if (!scope.viewOnly) {
        sync.removeModifier(options.value, ui.attr("index"));
        obj.sync("updateAsset");
      }
    },
    context : context,
    totalClick : function(ev, ui, options, context) {
      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : obj.id()}, options : scope.options, action : scope.action};

      game.locals["actions"] = game.locals["actions"] || [];
      game.locals["actions"].push(actionObj);

      var newApp = sync.newApp("ui_actions");
      actionObj.addApp(newApp);

      var pop = ui_popOut({
        target : ui,
        minimize : true,
        dragThickness : "0.5em",
        title : "Actions"
      }, newApp);
      pop.resizable();
    },
  }, content);
  statUI.css("background-color", "white");
  return statUI;
});
