sync.render("ui_armorValue", function(obj, app, scope) {
  var itemData = scope.itemData || obj.data;
  var char;
  if (scope.cref) {
    char = getEnt(scope.cref);
  }

  var newScope = duplicate(scope);

  newScope.url = "/content/icons/ShieldOutline1000p.png";
  newScope.body = {"body" : {url: "/content/icons/ShieldOutline1000p.png", coords: ["25%", 0], size: ["50%","100%"]}};
  newScope.target = scope.target;
  if (!scope.target && scope.lookup) {
    newScope.target = sync.traverse(obj.data, scope.lookup);
  }
  newScope.colorize = newScope.colorize || function(ui) {};
  newScope.click = function(e, ui) {
    if (_down["17"]) { // fuck firefox, seriously
      sync.rawVal(scope.target, parseInt(sync.rawVal(scope.target) || 0)-1);
    }
    else {
      sync.rawVal(scope.target, parseInt(sync.rawVal(scope.target) || 0)+1);
    }
    obj.update();
  };
  newScope.displayText = function(ui, key) {
    ui.css("border", "none");
    var text = sync.rawVal(newScope.target) || 0;
    if (char) {
      var bonus = sync.result("@:armor(,1)", {c : duplicate(char.data), i : duplicate(itemData)});
      if (bonus) {
        text = text + "("+bonus+")";
      }
    }
    ui.text(text);
  };

  var div = $("<div>");
  div.addClass("flexcolumn flexmiddle");

  if (scope.target && scope.target.name) {
    var title = $("<b>").appendTo(div);
    title.addClass("fit-x flexaround");
    if (!scope.viewOnly) {
      var remove = genIcon("minus").appendTo(title);
      remove.click(function(){
        sync.rawVal(scope.target, parseInt(sync.rawVal(scope.target) || 0)-1);
        obj.update();
      });
    }
    title.append(scope.target.name);
    if (!scope.viewOnly) {
      var add = genIcon("plus").appendTo(title);
      add.click(function(){
        sync.rawVal(scope.target, parseInt(sync.rawVal(scope.target) || 0)+1);
        obj.update();
      });
    }
  }

  var bodyContainer = $("<div>").appendTo(div);
  bodyContainer.addClass("flexmiddle");

  var body = sync.render("ui_body")(obj, app, newScope).appendTo(bodyContainer);
  body.css("width", scope.width || "80px");
  body.css("height", scope.height || "80px");

  return div;
});

sync.render("ui_armorParted", function(obj, app, scope) {
  var itemData = scope.itemData || obj.data;
  var char;
  if (scope.cref) {
    char = game.entities.data[scope.cref];
  }

  var newScope = duplicate(scope);
  newScope.colorize = newScope.colorize || function(ui) {};
  newScope.click = function(ev, ui) {
    var target = scope.target;
    var val = sync.rawVal(scope.target) || {};

    if (_down["17"]) {
      val[ui.attr("data-index")] = (parseInt(val[ui.attr("data-index")]) || 0) - 1;
    }
    else {
      val[ui.attr("data-index")] = (parseInt(val[ui.attr("data-index")]) || 0) + 1;
    }
    var empty = true;
    for (var key in val) {
      if (val[key] != null && val[key] != 0) {
        empty = false;
        break;
      }
    }
    if (empty) {
      sync.rawVal(scope.target, "");
    }
    else {
      sync.rawVal(scope.target, val);
    }
    obj.update();
  };
  newScope.displayText = function(ui, key) {
    ui.css("border", "none");
    var val = sync.rawVal(newScope.target) || {};
    var text = (val[key] || 0);
    if (char) {
      var itemArmor = newScope.target;
      var bonus = sync.result("@:armor(,1)", {c : duplicate(char.data), i : duplicate(itemData)});
      if (bonus) {
        text = Number(text) + Number(bonus);
      }
      text = text;
    }

    ui.text(text);
  };

  var div = $("<div>");
  div.addClass("flexcolumn flexmiddle");

  if (scope.target && scope.target.name) {
    var title = $("<b>").appendTo(div);
    title.addClass("fit-x flexaround");
    if (!scope.viewOnly) {
      var remove = genIcon("minus").appendTo(title);
      remove.click(function(){
        var val = sync.rawVal(scope.target) || {};
        for (var key in val) {
          val[key] = parseInt(val[key])-1;
        }
        var empty = true;
        for (var key in val) {
          if (val[key] != null && val[key] != 0) {
            empty = false;
            break;
          }
        }
        if (empty) {
          sync.rawVal(newScope.target, "");
        }
        else {
          sync.rawVal(newScope.target, val);
        }
        obj.update();
      });
    }
    if (!scope.hideTitle) {
      title.append(scope.target.name);
    }
    if (!scope.viewOnly) {
      var add = genIcon("plus").appendTo(title);
      add.click(function(){
        var val = sync.rawVal(scope.target) || {};
        for (var key in val) {
          val[key] = parseInt(val[key])+1;
        }
        var empty = true;
        for (var key in val) {
          if (val[key] != null && val[key] != 0) {
            empty = false;
            break;
          }
        }
        if (empty) {
          sync.rawVal(newScope.target, "");
        }
        else {
          sync.rawVal(newScope.target, val);
        };
        obj.update();
      });
    }
  }

  var bodyContainer = $("<div>").appendTo(div);
  bodyContainer.addClass("flexmiddle");

  var body = sync.render("ui_body")(obj, app, newScope).appendTo(bodyContainer);
  body.css("width", scope.width || "80px");
  body.css("height", scope.height || "80px");

  return div;
});

sync.render("ui_armorBonuses", function(obj, app, scope) {
  var itemData = scope.itemData || obj.data;
  var char;
  if (scope.cref) {
    char = game.entities.data[scope.cref];
  }

  var div = $("<div>");
  div.addClass("flexcolumn flexmiddle");

  div.append("<b>Stat Bonuses</b>");

  var checkContainer = $("<div>").appendTo(div);
  checkContainer.addClass("flexrow flexwrap");

  for (var key in game.templates.character.stats) {
    var check = $("<div>").appendTo(checkContainer);
    check.addClass("flexmiddle lrpadding");
    check.css("width", "50%");

    var dex = genInput({
      parent : check,
      type : "checkbox",
      stat : key,
      style : {"margin-top" : "0"},
      disabled : scope.viewOnly,
    });
    if (sync.modifier(scope.target, key) != null) {
      dex.prop("checked", true);
    }
    dex.change(function(){
      var ui = $(this);
      var statKey = $(this).attr("stat");
      if (ui.prop("checked")) {
        sync.modifier(scope.target, statKey, replaceAll(sync.rawVal(game.templates.display.sheet.rules.statBonus), "stat", statKey));
      }
      else {
        sync.removeModifier(scope.target, statKey);
      }
      obj.update();
    });
    var dexLabel = $("<b>+"+key+"</b>").appendTo(check);
    dexLabel.addClass("subtitle");

    var val = sync.modifier(scope.target, key);
    if (val != null && !isNaN(val)) {
      dexLabel.append("(max : "+val+")");
    }
  }

  return div;
});
