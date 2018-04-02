const applyKeyReg = new RegExp("@applyKey", 'g');
const applyTargetReg = new RegExp("@applyTarget", 'g');

sync.render("ui_entryList", function(obj, app, scope){
  if (!obj) {return $("<div>");}
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), minimized : (app.attr("minimized") == "true")};

  var data = obj.data;
  var div = $("<div>");
  div.addClass("fit-xy");

  var value = sync.traverse(data, scope.lookup);

  if (value === false) {
    sync.traverse(data, scope.lookup, []);
  }

  var context = sync.defaultContext();
  context[obj.data._t || "c"] = obj.data;
  var ignore = scope.ignore;

  var keys;
  if (scope.list) {
    keys = {};
    for (var i in scope.list) {
      keys[scope.list[i]] = true;
    }
  }

  if (hasSecurity(getCookie("UserID"), "Rights", obj.data) && scope.reposition) {
    div.addClass(scope.drop);
    div.sortable({
      filter : ".sortableContent",
      connectWith : scope.connectWith,
      over : function(ev, ui){
        if ($(ui.item).attr("index") != null && $(ui.item).attr("index") != obj.id() && $(ui.item).attr("key") != null && $(ui.item).attr("path") != null) {
          if (!$("#"+app.attr("id")+scope.drop+"-drag-overlay").length) {
            var olay = layout.overlay({
              target : div,
              id : app.attr("id")+scope.drop+"-drag-overlay",
              style : {"background-color" : "rgba(0,0,0,0.5)"}
            });
            olay.addClass("flexcolumn flexmiddle alttext");
            olay.css("font-size", "2em");
            olay.css("pointer-events", "none");
            olay.css("z-index", util.getMaxZ(".ui-popout"));
            olay.append("<b>Drop</b>");
          }
        }
      },
      out : function(ev, ui) {
        layout.coverlay(app.attr("id")+scope.drop+"-drag-overlay");
      },
      receive : function(ev, ui) {
        var otherEnt = getEnt($(ui.item).attr("index"));
        if (otherEnt) {
          var otherValue = sync.traverse(otherEnt.data, $(ui.item).attr("path"));
          var newValue = otherValue[$(ui.item).attr("key")];
          if (newValue) {
            value.push(duplicate(newValue));
            if (hasSecurity(getCookie("UserID"), "Rights", otherEnt.data)) {
              otherValue.splice($(ui.item).attr("key"), 1);
              otherEnt.sync("updateAsset");
            }

            obj.sync("updateAsset");
          }
          else {
            sendAlert({text : "No data provided"});
          }
        }
        layout.coverlay(app.attr("id")+scope.drop+"-drag-overlay");
      },
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
        if (newIndex != null && value.length) {
          var old = value.splice($(ui.item).attr("key"), 1);
          if (old[0]) {
            util.insert(value, newIndex, old[0]);
          }
          obj.sync("updateAsset");
        }
      }
    });
  }

  var displayStr = JSON.stringify(scope.applyUI);

  for (var index in (keys || value)) {
    var entryData = value[index];
    var ignoring = false;

    if (ignore) {
      if (ignore instanceof String) {
        ignoring = sync.eval(ignore, context);
      }
      else if (ignore instanceof Object) {
        ignoring = util.contains(ignore, index);
      }
    }
    if (!ignoring) {
      var entryData = value[index];

      var entryWrap = $("<div>").appendTo(div);
      entryWrap.addClass("flexcolumn flex sortableContent");
      entryWrap.attr("key", index);
      entryWrap.attr("index", obj.id());
      entryWrap.attr("path", scope.lookup);

      context["applyTarget"] = scope.lookup+"."+index;
      context["applyKey"] = index;

      var display = displayStr.replace(applyKeyReg, index);
      display = display.replace(applyTargetReg, scope.lookup+"."+index);

      display = JSON.parse(display);

      var ui = sync.render("ui_processUI")(obj, app, {display : display, context : context, viewOnly : scope.viewOnly}).appendTo(entryWrap);
    }
  }

  return div;
});

const skillKeyReg = new RegExp("@skillKey", 'g');
const skillTargetReg = new RegExp("@skillTarget", 'g');
const statKeyReg = new RegExp("@statKey", 'g');

sync.render("ui_skillList", function(obj, app, scope){
  if (!obj) {return $("<div>");}
  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), minimized : (app.attr("minimized") == "true")};

  var data = obj.data;
  var div = $("<div>");
  div.addClass("fit-xy");

  if (scope.classes) {
    div.addClass(scope.classes);
  }

  var value = sync.traverse(data, scope.lookup);

  if (value === false) {
    sync.traverse(data, scope.lookup, {});
  }
  var context = sync.defaultContext();
  context[obj.data._t || "c"] = obj.data;
  var ignore = scope.ignore;

  var keys;
  if (scope.list) {
    keys = {};
    for (var i in scope.list) {
      keys[scope.list[i]] = true;
    }
  }

  var skillRegex = /\((.+)\)/;
  var displayStr = JSON.stringify(scope.applyUI);
  for (var index in (keys || value)) {
    var entryData = value[index];
    var ignoring = false;

    context["skill"] = data.skills[index];
    context["skillKey"] = index;

    if (ignore) {
      if (ignore instanceof String) {
        ignoring = sync.eval(ignore, context);
      }
      else if (ignore instanceof Object) {
        ignoring = util.contains(ignore, index);
      }
    }
    if (!ignoring) {
      var entryWrap = $("<div>").appendTo(div);
      if (!scope.entryClasses) {
        entryWrap.addClass("flexcolumn flex");
      }
      else {
        entryWrap.addClass(scope.entryClasses);
      }

      var statRes;
      if (!_skillCache[data.skills[index].name]) {
        statRes = skillRegex.exec(data.skills[index].name);
        if (statRes) {
          _skillCache[data.skills[index]] = statRes[1];
        }
      }
      else {
        statRes = _skillCache[data.skills[index]];
      }

      if (statRes && data.stats[statRes[1]]) {
        context["stat"] = data.stats[statRes[1]];
        context["statKey"] = statRes[1];
      }
      var display = displayStr.replace(skillKeyReg, index);
      display = display.replace(skillTargetReg, scope.lookup + "." + index);
      if (statRes && statRes[1]) {
        display = display.replace(statKeyReg, statRes[1]);
      }
      else {
        display = display.replace(statKeyReg, "");
      }
      display = JSON.parse(display);
      var ui = sync.render("ui_processUI")(obj, app, {display : display, context : context, viewOnly : scope.viewOnly, time : true}).appendTo(entryWrap);
    }
  }

  return div;
});
