// This library is meant to provide an easy way (only for me most likely)
// to automatically update document elements with live data. React was too bulky
// for me to learn so I wrote this
var _appuid = 0;
var _render = {};
var sync = {};

sync.render = function(uiName, renderFunc) {
  if (uiName && renderFunc) {
    _render[uiName] = renderFunc;
  }
  else {
    return _render[uiName];
  }
}

sync.newApp = function(uiName, obj, scope) {
  var rObj = $("<div>");
  rObj.attr('ui-name', uiName);
  rObj.attr('id', 'app_'+_appuid);
  rObj.addClass("application flexcolumn");

  rObj.scroll(function() {
    $(this).attr("_lastScrollTop", $(this).scrollTop());
    $(this).attr("_lastScrollLeft", $(this).scrollLeft());
  });
  _appuid = _appuid + 1;

  if (_render[uiName] && (obj || scope)) {
    var output = sync.render(uiName)(obj, rObj, scope);
    output.appendTo(rObj);

    output.find("[_lastScrollTop]").each(function(){
      $(this).scrollTop($(this).attr("_lastScrollTop"));
    });
    output.find("[_lastScrollLeft]").each(function(){
      $(this).scrollLeft($(this).attr("_lastScrollLeft"));
    });
  }

  return rObj;
}

var _syncuid = 0;

// javascript objects
function _deepCompare(oldUi, newUi) {
  var chillun = newUi.children();
  var done = false;
  for (var index in oldUi.children()) {
    if (!done && newUi.children()[index] && newUi.children()[index] != oldUi.children()[index]) {
      console.log(oldUi.children()[index]);
      console.log(newUi.children()[index]);
      $(oldUi.children()[index]).replaceWith(newUi.children()[index]);
      done = true;
    }
  }
}

sync.updateApp = function(ref, obj){
  if (obj.data) {
    var output = sync.render(ref.attr("ui-name"))(obj, ref);
    // compare output to the current element, replacing different parts
    //_deepCompare(ref.children(), output);
    ref.empty();
    ref.append(output);
    // preserve submenus
    output.find("[_lastScrollTop]").each(function(){
      $(this).scrollTop($(this).attr("_lastScrollTop"));
    });
    output.find("[_lastScrollLeft]").each(function(){
      $(this).scrollLeft($(this).attr("_lastScrollLeft"));
    });
    if (ref.css("overflow-y") == "scroll") {
      ref.scrollTop(ref.attr("_lastScrollTop"));
    }
    else {
      output.scrollTop(ref.attr("_lastScrollTop"));
    }

    if (ref.css("overflow-y") == "scroll") {
      ref.scrollLeft(ref.attr("_lastScrollLeft"));
    }
    else {
      output.scrollLeft(ref.attr("_lastScrollLeft"));
    }
  }
  return false;
}

sync.update = function(obj, newObj, keys) {
  if (newObj) {
    if (keys) {
      for (var i in keys) {
        obj.data[keys[i]] = newObj[keys[i]];
      }
    }
    else {
      obj.data = newObj;
    }
  }
  if (game.config && game.config.data.offline && getCookie("offlineGame")) {
    localStorage.setItem(getCookie("offlineGame"), JSON.stringify(game));
  }
  // re-renders all apps that are connected to it
  if (obj["_apps"].length > 0) {
    for (var index = obj["_apps"].length - 1; index >= 0; index--) {
      var ref = $("#"+obj["_apps"][index]);
      if (ref.length > 0) { // not empty
        if (obj.data) {
          var output = sync.render(ref.attr("ui-name"))(obj, ref);
          // compare output to the current element, replacing different parts
          //_deepCompare(ref.children(), output);
          ref.empty();
          ref.append(output);
          // preserve submenus
          output.find("[_lastScrollTop]").each(function(){
            $(this).scrollTop($(this).attr("_lastScrollTop"));
          });
          output.find("[_lastScrollLeft]").each(function(){
            $(this).scrollLeft($(this).attr("_lastScrollLeft"));
          });
          if (ref.css("overflow-y") == "scroll") {
            ref.scrollTop(ref.attr("_lastScrollTop"));
          }
          else {
            output.scrollTop(ref.attr("_lastScrollTop"));
          }

          if (ref.css("overflow-y") == "scroll") {
            ref.scrollLeft(ref.attr("_lastScrollLeft"));
          }
          else {
            output.scrollLeft(ref.attr("_lastScrollLeft"));
          }
        }
      }
      else {
        // garbage collect apps that are no longer in existence
        obj["_apps"].splice(index, 1);
      }
    }
  }
}

sync.copy = function(obj) {
  var recurseCopy;
  return newObj;
}

sync.rebuildApp = function(targetApp) {
  var found = false;
  for (var id in _syncList) {
    var obj = _syncList[id];
    if (util.contains(obj._apps, targetApp)) {
      obj.update();
      found = true;
    }
  }
}

sync.replaceApps = function(data) {
  var appList = $(".application");
  for (var i=0; i<appList.length; i++) {
    var app = appList[i];
    if (util.contains(data.apps, $(app).attr("ui-name"))) {
      // i don't add it to the object because the first time should track down
      // the appropriate object for that app
      var newApp = sync.newApp(data.newApp);
      for (var j=0; j<app.attributes.length; j++) {
        var attrib = app.attributes[j];
        if (attrib.specified == true && attrib.name != "ui-name" && attrib.name != "id") {
          if (attrib.name == "class") {
            newApp.addClass(attrib.value);
          }
          else if (attrib.name == "style" && attrib.value){
            var split = attrib.value.split(";");
            for (var key in split) {
              var subSplit = split[key].split(":");
              if (subSplit) {
                newApp.css(subSplit[0], subSplit[1]);
              }
            }
          }
          else {
            newApp.attr(attrib.name, attrib.value);
          }
        }
      }
      newApp.attr("_lastApp", $(app).attr("ui-name"));
      var parent = $(app).parent();
      $(app).remove();
      parent.append(newApp);
      newApp.append(sync.render(newApp.attr("ui-name"))(null, newApp, {}));
      if (!data.all) { // only do one
        break;
      }
    }
  }
}

var _syncList = {};

sync.dummyObj = function(id, defaultApps) {
  var apps = [];
  if (defaultApps) {
    apps = defaultApps;
  }
  var rObj = {
    _lid : id, // index
    _apps : apps, // array of id's that represent applications
    listen : [],
  };
  rObj.removeApp = function(newApp){
    for (var index in rObj["_apps"]) {
      if (rObj["_apps"][index] == newApp.attr("id")) {
        rObj["_apps"].splice(index, 1);
      }
    }
  }
  rObj.addApp = function(newApp){
    for (var index in rObj["_apps"]) {
      if (rObj["_apps"][index] == newApp.attr("id")) {
        return;
      }
    }
    rObj["_apps"].push(newApp.attr("id"));
    if (rObj.data != null) {
      var output = sync.render(newApp.attr("ui-name"))(rObj, newApp);
      // compare output to the current element, replacing different parts
      //_deepCompare(ref.children(), output);
      newApp.empty();
      newApp.append(output);
      newApp.find("[_lastScrollTop]").each(function(){
        $(this).scrollTop($(this).attr("_lastScrollTop"));
      });
      newApp.find("[_lastScrollLeft]").each(function(){
        $(this).scrollLeft($(this).attr("_lastScrollLeft"));
      });
    }
  };
  rObj.update = function(newObj, target){
    for (var i in rObj.listen) {
      if (rObj.listen[i] && !rObj.listen[i](rObj, newObj, target)) {
        delete rObj.listen[i];
      }
    }
    sync.update(rObj, newObj, target);
  }; // locally updates
  rObj.id = function(){return rObj["_lid"]};
  rObj.sync = function(cmd, target) {
    rObj.update();
    if (connection.alive && !rObj.local) {
      if (!rObj.data._t || ((rObj.data._t == "pk" || rObj.data._t == "a" || rObj.data._t == "b") || JSON.stringify(rObj.data).length < 100000)) { // 0.01 mb
        runCommand(cmd, {id: rObj.id(), respond : false, target : target, data : jQuery.extend(true, {}, rObj.data)});
        // don't respond to the client, they already have this message
      }
      else {
        layout.page({title : "Your character sheet has become too large to store, please trim down some of your content in order to properly send this object " + rObj.id(), blur : 0.5});
      }
    }
    else {
      sendAlert({text : "CONNECTION IS BROKEN"});
    }
  };
  return rObj;
}

sync.obj = function(id, defaultApps) {
  var apps = [];
  if (defaultApps) {
    apps = defaultApps;
  }
  var rObj = {
    _lid : id, // index
    _uid : _syncuid, // internal use only
    listen : {},
    _apps : apps, // array of id's that represent applications
  };
  rObj.removeApp = function(newApp){
    for (var index in rObj["_apps"]) {
      if (rObj["_apps"][index] == newApp.attr("id")) {
        console.log("spliced");
        rObj["_apps"].splice(index, 1);
      }
    }
  }
  rObj.addApp = function(newApp){
    for (var index in rObj["_apps"]) {
      if (rObj["_apps"][index] == newApp.attr("id")) {
        return;
      }
    }
    rObj["_apps"].push(newApp.attr("id"));
    if (rObj.data != null) {
      var output = sync.render(newApp.attr("ui-name"))(rObj, newApp);
      // compare output to the current element, replacing different parts
      //_deepCompare(ref.children(), output);
      newApp.empty();
      newApp.append(output);
      newApp.find("[_lastScrollTop]").each(function(){
        $(this).scrollTop($(this).attr("_lastScrollTop"));
      });
      newApp.find("[_lastScrollLeft]").each(function(){
        $(this).scrollLeft($(this).attr("_lastScrollLeft"));
      });
    }
  };
  rObj.update = function(newObj, target){
     // locally updates
     for (var i in rObj.listen) {
       if (rObj.listen[i] && !rObj.listen[i](rObj, newObj, target)) {
         delete rObj.listen[i];
       }
     }
     sync.update(rObj, newObj, target);
  };
  rObj.id = function(){return rObj["_lid"]};
  rObj.sync = function(cmd, target) {
    rObj.update();
    if (connection.alive && !rObj.local) {
      if (!rObj.data._t || ((rObj.data._t == "pk" || rObj.data._t == "a" || rObj.data._t == "b") || JSON.stringify(rObj.data).length < 100000)) { // 0.01 mb
        runCommand(cmd, {id: rObj.id(), respond : false, target : target, data : jQuery.extend(true, {}, rObj.data)});
        // don't respond to the client, they already have this message
      }
      else {
        layout.page({title : "Your character sheet has become too large to store, please trim down some of your content in order to properly send this object", blur : 0.5});
      }
    }
  };
  _syncList[_syncuid] = rObj; // save the pointer
  _syncuid = _syncuid + 1;
  return rObj;
} // generates an object that has a unique id associated with it

function parseValue(value) {
  if (value === "") {
    return null;
  }
  if (value == null || isNaN(value)) {
    return value;
  }
  return eval(value);
}

// values
sync.newValue = function(name, value, min, max, modifiers) {
  /* {
    name : name,
    current : parseValue(value),
    min : parseValue(min),
    max : parseValue(max),
    modifiers : modifiers
  };*/
  // in order to save space, all these if statements
  var rObj = {};
  if (name != null) {
    rObj.name = name;
  }
  if (value != null) {
    rObj.current = parseValue(value);
  }
  if (min != null) {
    rObj.min = parseValue(min);
  }
  if (max != null) {
    rObj.max = parseValue(max);
  }
  if (modifiers != null) {
    rObj.modifiers = modifiers;
  }
  return rObj;
}

sync.modifier = function(valueObj, key, newVal) {
  if (!valueObj) {return;}
  if (newVal != null) {
    if (!valueObj.modifiers) {
      valueObj.modifiers = {};
    }
    valueObj.modifiers[key] = parseValue(newVal);
  }
  else {
    if (!valueObj.modifiers) {
      return null;
    }
  }
  return valueObj.modifiers[key];
}

sync.removeModifier = function(valueObj, key) {
  if (!valueObj) {return;}
  if (!valueObj.modifiers) {
    return null;
  }
  delete valueObj.modifiers[key];
  if (Object.keys(valueObj.modifiers).length < 1) {
    delete valueObj.modifiers; // keep this concise for database purposes
  }
}

sync.clamped = function(valueObj, inVal) {
  if (!valueObj || inVal == null) {return;}
  var result = inVal;
  if (!isNaN(inVal)) {
    if (valueObj.min != null) {
      result = Math.max(result, valueObj.min);
    }
    if (valueObj.max != null) {
      result = Math.min(result, valueObj.max);
    }
  }
  return result;
}

sync.modified = function(valueObj, compareValue, clamped) {
  if (!valueObj) {return;}
  var total = 0;
  if (compareValue == null) {
    compareValue = valueObj.current;
  }
  if (isNaN(compareValue)) {
    total = "";
  }
  else {
    var ctx = sync.defaultContext();
    for (var key in valueObj.modifiers) {
      if (valueObj.modifiers[key] != "none") {
        total = total + sync.eval(valueObj.modifiers[key], ctx) || 0;
      }
    }
  }
  if (clamped) {
    return sync.clamped(valueObj, Number(compareValue) + Number(total));
  }
  else {
    return compareValue + total;
  }
}

sync.val = function(valueObj, newVal) {
  if (!valueObj) {return;}
  if (!(valueObj instanceof Object)) {
    return valueObj;
  }
  if (newVal != null) {
    valueObj.current = sync.clamped(valueObj, parseValue(newVal));
  }
  else {
    if (valueObj.current == null || isNaN(valueObj.current)) {
      return valueObj.current;
    }
    return sync.clamped(valueObj, sync.modified(valueObj, Number(valueObj.current)));
  }
}

sync.unModified = function(valueObj) {
  if (!valueObj) {return;}
  return sync.clamped(valueObj, Number(valueObj.current));
}

sync.rawVal = function(valueObj, newVal) {
  if (!valueObj) {return;}
  if (!(valueObj instanceof Object)) {
    return valueObj;
  }
  if (newVal != null) {
    valueObj.current = newVal;
  }
  else {
    return valueObj.current;
  }
}


// regular Expressions, define them once
var diceAddRegex = /([0-9]*)[\s]*([+|-])[\s]*([-]*[0-9]*)/; // find addition
var diceNumber = /\d+/;
var diceRegex = /(\d*)d(\d+)([k|d]([l|h])?[\d+])?/i; // find a <x>d<y>
var diceQuery = /([^\[]*)\[([^\[^\]]+)\]([\+|-].*)*/i; // how many times will it run
var queryType = /([\d|\)|}])([B|R|W])([\d|\(|{])?/i;
var clampRegex =  /\(([^(^)]*)\)([frc])*([_][\d]*)*([|][\d]*)*/i;
var lookupMatch = /([RM])?@([\w|.]*)/i;
var variableRegex = /([#|$])([\w\.]*)([ ])*(=[^;]*;)/i;

sync.executeQuery = function(equation, targets, noRoll) {
  var str = String(equation || "");
  var match = str.match(diceQuery);
  var returnEqs = {
    str : equation,
    pool : {},
    loc : svd.location,
    equations : [],
  };
  if (match) {
    match[1] = String(sync.result(match[1], targets));
    var query = match[1].match(queryType);
    var rolls = 1;
    var type;
    var selector;
    var compare;
    if (query) {
      rolls = sync.eval(match[1].substring(0, query.index+1), targets, noRoll) || 1;
      type = query[2];
      selector = sync.eval(query[3], targets, noRoll) || 1;
    }
    else {
      rolls = sync.eval(match[1], targets, noRoll);
    }
    for (var i=0; i<rolls; i++) {
      var val = sync.process(match[2], targets, noRoll);
      if (type && type.toLowerCase() == "r") {
        if (returnEqs.equations.length < selector) {
          returnEqs.equations.push(val);
        }
      }
      else {
        returnEqs.equations.push(val);
      }
    }
    if (type && type.toLowerCase() == "w") {
      returnEqs.equations.sort(function(a,b){return a.v-b.v;});
      var newEqs = [];
      for (var j=returnEqs.equations.length-1; j>=selector; j--) {
        newEqs.push(returnEqs.equations[j].v);
        returnEqs.equations.splice(j, 1);
      }
      returnEqs.pool.discarded = newEqs;
    }
    else if (type && type.toLowerCase() == "b") {
      returnEqs.equations.sort(function(a,b){return b.v-a.v;});
      var newEqs = [];
      for (var j=returnEqs.equations.length-1; j>=selector; j--) {
        newEqs.push(returnEqs.equations[j].v);
        returnEqs.equations.splice(j, 1);
      }
      returnEqs.pool.discarded = newEqs;
    }
    if (match[3]) {
      var newEqs = sync.executeQuery(match[3].substring(1, match[3].length), targets, noRoll);
      for (var i in newEqs.equations) {
        returnEqs.equations.push(newEqs.equations[i]);
      }
    }
  }
  else {
    returnEqs.equations = [sync.process(str, targets)];
  }
  var total = 0;
  var rolled = {};
  for (var index in returnEqs.equations) {
    if (!returnEqs.equations[index].ctx) {
      returnEqs.equations[index].ctx = {};
    }
    returnEqs.equations[index].ctx.total = sync.newValue(null, returnEqs.equations[index].v);
    total += returnEqs.equations[index].v || 0;
    if (returnEqs.equations[index].ctx.die) {
      var diceData = game.templates.dice.pool[sync.rawVal(returnEqs.equations[index].ctx.die)];
      rolled[sync.rawVal(returnEqs.equations[index].ctx.die)] = rolled[sync.rawVal(returnEqs.equations[index].ctx.die)] || 0;
      rolled[sync.rawVal(returnEqs.equations[index].ctx.die)] += 1;
      if (diceData && diceData.results) {
        var valueData = diceData.results[returnEqs.equations[index].v];
        if (noRoll && diceData.results[returnEqs.equations[index].e]) {
          valueData = diceData.results[returnEqs.equations[index].e];
          returnEqs.equations[index].v = returnEqs.equations[index].e;
        }
        for (var key in valueData) {
          if (returnEqs.pool[key]) {
            returnEqs.pool[key] += valueData[key];
          }
          else {
            returnEqs.pool[key] = valueData[key];
          }
        }
      }
    }
  }
  if (returnEqs.equations && returnEqs.equations.length) {
    returnEqs.pool["dice"] = returnEqs.equations.length;
    returnEqs.pool["rolled"] = rolled;
  }
  returnEqs.pool["total"] = total;
  return returnEqs;
}

var svd = {};
sync.context = function(equation, targets, noRoll) {
  var str = equation;
  var context = {};
  targets = targets || {};

  var maxLoop = 1000;
  var loop = 0;
  var vMatch = variableRegex.exec(str);
  // save localVaribles
  var cmps = /([\/><\!\~\=])/; // important for conditional logic
  while (vMatch) {
    if (vMatch[2] && vMatch[4] && vMatch[4][0] == "=") {
      var stack = [0];
      for (var i=1; i<vMatch[4].length; i++) {
        if (vMatch[4][i] == "=" && !((vMatch[4][i-1] || "").match(cmps) || (vMatch[4][i+1] || "").match(cmps))) {
          stack.push(i);
        }
        else if (vMatch[4][i] == ";") {
          stack.pop();
          if (stack.length == 0) {
            stack = i+1; // record the successful index
            break;
          }
        }
      }
      if (!(stack instanceof Object)) {
        var evalStr = vMatch[4].substring(1, stack-1);
        // this is what should be evaluated
        var res = evalStr;
        if (vMatch[1] == "#") {
          if (noRoll) {
            res = evalStr;
          }
          else {
            res = sync.eval(evalStr, targets);
          }
        }
        if (sync.traverse(targets, vMatch[2]) instanceof Object) {
          sync.rawVal(sync.traverse(targets, vMatch[2]), res);
        }
        else {
          sync.traverse(targets, vMatch[2], sync.newValue(null, res));
        }
        sync.traverse(context, vMatch[2], sync.newValue(null, res));
        vMatch[0] = (vMatch[1] || "") +(vMatch[2] || "") + (vMatch[3] || "") + vMatch[4].substring(0, stack);
      }
    }
    str = str.replace(vMatch[0], "");
    vMatch = variableRegex.exec(str);
    loop++;
    if (loop > maxLoop) {
      sendAlert({text : "Error Processing Equation"});
      console.log(equation);
      return "0";
    }
  }

  var tmatch = str.match(tableMatch);
  if (calcAPI["table"] || calcAPI["constant"]) {
    while (tmatch) {
      var cmd = "table";
      var trav = tmatch[1];
      var fn = tmatch[2];
      var val = "";
      var parenths = [];
      var args = [fn];
      if (tmatch.index + tmatch[0].length < str.length) {
        if (str[tmatch.index + tmatch[0].length] == "(") {
          parenths.push(tmatch.index + tmatch[0].length);
          var lastIndex = parenths[0];
          for (var i=parenths[0]+1;i<str.length;i++) {
            if (str[i] == "(") {
              parenths.push(i);
            }
            else if (str[i] == ")") {
              parenths.splice(parenths.length-1,1);
            }
            lastIndex = i;
            if (parenths.length == 0) {
              var splitList = str.substring(tmatch.index+tmatch[0].length+1, lastIndex).split(",");
              for (var i=0; i<splitList.length; i++) {
                args.push(splitList[i]);
              }
              tmatch[0] = tmatch[0] + str.substring(tmatch.index+tmatch[0].length, lastIndex+1);
              break;
            }
          }
        }
        else {
          cmd = "constant";
        }
      }
      else {
        cmd = "constant";
      }
      val = calcAPI[cmd](args, targets);
      if (val instanceof Object) {
        val = JSON.stringify(val);
      }
      str = str.replace(tmatch[0], val);
      tmatch = str.match(tableMatch);
      loop++;
      if (loop > maxLoop) {
        sendAlert({text : "Error Processing Equation"});
        console.log(equation);
        return "0";
      }
    }
  }

  if (!context.die) {
    if (game.templates && game.templates.dice && game.templates.dice.pool[str]) {
      context.die = sync.newValue(null, str);
      if (str != game.templates.dice.pool[str].value) {
        str = game.templates.dice.pool[str].value;
      }
    }
    else {
      var d = diceRegex.exec(equation);
      if (d) {
        if (!d[3]) {
          context.die = d[0];
        }
        else {
          context.die = "d"+d[2];
        }
      }
    }
  }
  return {context : context, str : str};
}

sync.process = function(equation, targets, noRoll) {
  var returnObj = {};

  var context = sync.context(equation, targets);
  returnObj.ctx = duplicate(context.context);
  merge(context.context, targets);
  returnObj.e = context.str;
  if (!noRoll) {
    returnObj.r = sync.reduce(context.str, context.context);
    returnObj.v = sync.eval(returnObj.r, context.context);
  }
  return returnObj;
}

sync.keySearch = function(key, targets) {
  if (targets.eval) {
    for (var refKey in targets.eval) {
      if (isNaN(refKey) && refKey.toLowerCase() == key.toLowerCase()) {
        return targets.eval[refKey];
      }
    }
  }
  if (targets[key] && !Array.isArray(targets[key])) {
    return targets[key];
  }
  if (isNaN(key)) {
    for (var refKey in targets) {
      if (isNaN(refKey) && refKey.toLowerCase() == key.toLowerCase()) {
        return targets[refKey];
      }
    }
  }
  for (var cmKey in targets) {
    if (cmKey[0] != "_") {
      if (!Array.isArray(targets[cmKey]) && targets[cmKey] instanceof Object) {
        if (targets[cmKey][key]) {
          return targets[cmKey][key];
        }
        else {
          var res = sync.keySearch(key, targets[cmKey]);
          if (res) {
            return res;
          }
        }
      }
    }
  }
}

sync.reduce = function(equation, targets, noRoll, fillOnce) {
  var str = String(equation);

  // insurance
  var maxLoop = 1000;
  var loop = 0;

  var fmatch = str.match(fnMatch);
  while (fmatch) {
    var trav = fmatch[1];
    var fn = fmatch[2];
    var val = "";
    if (calcAPI[fn]) {
      var parenths = [];
      var args = [];
      if (fmatch.index + fmatch[0].length < str.length && str[fmatch.index + fmatch[0].length] == "(") {
        parenths.push(fmatch.index + fmatch[0].length);
        var lastIndex = parenths[0];
        for (var i=parenths[0]+1;i<str.length;i++) {
          if (str[i] == "(") {
            parenths.push(i);
          }
          else if (str[i] == ")") {
            parenths.splice(parenths.length-1,1);
          }
          lastIndex = i;
          if (parenths.length == 0) {
            var splitList = str.substring(fmatch.index+fmatch[0].length+1, lastIndex).split(",");
            for (var i=0; i<splitList.length; i++) {
              args.push(splitList[i]);
            }
            fmatch[0] = fmatch[0] + str.substring(fmatch.index+fmatch[0].length, lastIndex+1);
            break;
          }
        }
      }
      val = calcAPI[fn](args, targets);
      if (val instanceof Object) {
        val = JSON.stringify(val);
      }
    }
    str = str.replace(fmatch[0], val);
    fmatch = str.match(fnMatch);
    loop++;
    if (loop > maxLoop) {
      sendAlert({text : "Error Processing Equation"});
      console.log(equation);
      return "0";
    }
  }

  var tmatch = str.match(tableMatch);
  if (calcAPI["table"] || calcAPI["constant"]) {
    while (tmatch) {
      var cmd = "table";
      var trav = tmatch[1];
      var fn = tmatch[2];
      var val = "";
      var parenths = [];
      var args = [fn];
      if (tmatch.index + tmatch[0].length < str.length) {
        if (str[tmatch.index + tmatch[0].length] == "(") {
          parenths.push(tmatch.index + tmatch[0].length);
          var lastIndex = parenths[0];
          for (var i=parenths[0]+1;i<str.length;i++) {
            if (str[i] == "(") {
              parenths.push(i);
            }
            else if (str[i] == ")") {
              parenths.splice(parenths.length-1,1);
            }
            lastIndex = i;
            if (parenths.length == 0) {
              var splitList = str.substring(tmatch.index+tmatch[0].length+1, lastIndex).split(",");
              for (var i=0; i<splitList.length; i++) {
                args.push(splitList[i]);
              }
              tmatch[0] = tmatch[0] + str.substring(tmatch.index+tmatch[0].length, lastIndex+1);
              break;
            }
          }
        }
        else {
          cmd = "constant";
        }
      }
      else {
        cmd = "constant";
      }
      val = calcAPI[cmd](args, targets);
      if (val instanceof Object) {
        val = JSON.stringify(val);
      }
      str = str.replace(tmatch[0], val);
      tmatch = str.match(tableMatch);
      loop++;
      if (loop > maxLoop) {
        sendAlert({text : "Error Processing Equation"});
        console.log(equation);
        return "0";
      }
    }
  }

  var varMatch = str.match(lookupMatch);
  while (varMatch) {
    // search the targets for a value
    // typically {game : {}, me : {}, local : {}, c : {}, i : {}}
    // recursively search for the key
    var val;
    if (varMatch[2].match("\\.")) {
      val = sync.traverse(targets, varMatch[2]);
    }
    else {
      // look for it myself
      val = sync.keySearch(varMatch[2], targets);
    }
    if (val != null && val !== false) {
      if (val instanceof Object) {
        if (varMatch[1] == "R") {
          val = sync.rawVal(val);
        }
        else if (varMatch[1] == "M") {
          val = sync.modified(val, 0);
        }
        else {
          val = sync.val(val);
        }
      }
    }
    if (val) {
      str = str.replace(varMatch[0], val);
    }
    else {
      str = str.replace(varMatch[0], "0");
    }
    varMatch = str.match(lookupMatch);
    loop++;
    if (loop > maxLoop) {
      sendAlert({text : "Error Processing Equation"});
      console.log(equation);
      return "0";
    }
  }
  if (!fillOnce) {
    var tmatch = str.match(tableMatch);
    if (calcAPI["table"] || calcAPI["constant"]) {
      while (tmatch) {
        var cmd = "table";
        var trav = tmatch[1];
        var fn = tmatch[2];
        var val = "";
        var parenths = [];
        var args = [fn];
        if (tmatch.index + tmatch[0].length < str.length) {
          if (str[tmatch.index + tmatch[0].length] == "(") {
            parenths.push(tmatch.index + tmatch[0].length);
            var lastIndex = parenths[0];
            for (var i=parenths[0]+1;i<str.length;i++) {
              if (str[i] == "(") {
                parenths.push(i);
              }
              else if (str[i] == ")") {
                parenths.splice(parenths.length-1,1);
              }
              lastIndex = i;
              if (parenths.length == 0) {
                var splitList = str.substring(tmatch.index+tmatch[0].length+1, lastIndex).split(",");
                for (var i=0; i<splitList.length; i++) {
                  args.push(splitList[i]);
                }
                tmatch[0] = tmatch[0] + str.substring(tmatch.index+tmatch[0].length, lastIndex+1);
                break;
              }
            }
          }
          else {
            cmd = "constant";
          }
        }
        else {
          cmd = "constant";
        }
        val = calcAPI[cmd](args, targets);
        if (val instanceof Object) {
          val = JSON.stringify(val);
        }
        str = str.replace(tmatch[0], val);
        tmatch = str.match(tableMatch);
        loop++;
        if (loop > maxLoop) {
          sendAlert({text : "Error Processing Equation"});
          console.log(equation);
          return "0";
        }
      }
    }
  }

  if (!noRoll) {
    var diceMatch = diceRegex.exec(str);
    while (diceMatch) {
      var rep = sync.evalDice(diceMatch[0]);
      if (str.match(diceMatch[0]+"]")) {
        str = str.replace(diceMatch[0]+"]", diceMatch[0]);
      }
      str = str.replace(diceMatch[0], rep);

      diceMatch = diceRegex.exec(str);
    }
  }

  str = replaceAll(str, "--", "+");
  str = replaceAll(str, "+-", "-");
  str = replaceAll(str, "-+", "+");
  str = replaceAll(str, "++", "+");

  return str || "0";
}

var fnMatch = /(@):([\w]*)/i

var tableMatch = /(#):([\w]*)/i
var condMatch = /(\?):([\w]*)/i

var calcAPI = {
  sign : function(args, targets){
    var val = (Number(sync.eval(args[0], targets))>=0)?("+"+Number(sync.eval(args[0], targets))):(Number(sync.eval(args[0], targets)));
    return "'"+val+"'";
  },
  int : function(args, targets){
    return parseInt(sync.eval(args[0], targets));
  },
  num : function(args, targets){
    return parseFloat(sync.eval(args[0], targets));
  },
  str : function(args, targets) {
    return String(args[0]);
  },
  raw : function(args, targets) {
    return String(sync.reduce(args[0], targets, true, true));
  },
  gm : function(args, targets){
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      return "1";
    }
    return "0";
  },
  armor : function(args, targets) {
    if (!targets || !game.templates || !game.templates.display) {return "0"}
    if (targets["c"] && !args[1]) {
      var val;
      if (game.templates.display.sheet.rules && game.templates.display.sheet.rules.baseArmor) {
        val = duplicate(sync.rawVal(game.templates.display.sheet.rules.baseArmor)) || 0;
      }
      else {
        val = sync.eval(game.templates.constants.basearmor, targets) || 0;
      }
      if (val instanceof Object) {
        for (var k in val) {
          val[k] = sync.eval(val[k], targets);
        }
      }
      else {
        val = sync.eval(val, targets);
      }
      if (targets["c"].inventory) {
        for (var index in targets["c"].inventory) {
          var itemData = targets["c"].inventory[index];
          itemData.tags = itemData.tags || {};
          var itemArmor = duplicate(sync.rawVal(itemData.equip.armor)) || 0;
          if (itemData.tags["equipped"] && itemArmor) {
            var armorBonus = 0;
            for (var i in itemData.equip.armor.modifiers) {
              armorBonus += sync.eval(itemData.equip.armor.modifiers[i], targets);
            }
            if (itemArmor instanceof Object) {
              for (var k in val) {
                if (itemArmor[k]) {
                  val[k] += sync.eval(itemArmor[k], targets) + armorBonus;
                }
                else {
                  val[k] += armorBonus;
                }
              }
            }
            else {
              val += sync.eval(itemArmor, targets) + armorBonus;
            }
          }
        }
      }
      if (args[0]){
        return val[args[0]];
      }
      else {
        return val;
      }
    }
    if (targets["i"]) {
      var itemData = targets["i"];
      var itemArmor = duplicate(sync.rawVal(itemData.equip.armor)) || 0;
      if (itemArmor) {
        if (args[1]) {
          itemArmor = 0;
        }
        var armorBonus = 0;
        for (var i in itemData.equip.armor.modifiers) {
          armorBonus += sync.eval(itemData.equip.armor.modifiers[i], targets);
        }
        if (itemArmor instanceof Object) {
          for (var k in itemArmor) {
            itemArmor[k] = sync.eval(itemArmor[k], targets) + armorBonus;
          }
        }
        else {
          itemArmor = sync.eval(itemArmor, targets) + armorBonus;
        }
        return itemArmor;
      }
      return 0;
    }
    return 0;
  },
  weight : function(args, targets) {
    if (!targets || !game.templates || !game.templates.display) {return "0"}
    if (targets["c"]) {
      var weight = 0;
      for (var index in targets["c"].inventory) {
        weight += (sync.rawVal(targets["c"].inventory[index].info.quantity) || 0) * (sync.rawVal(targets["c"].inventory[index].info.weight) || 0);
      }
      return weight;
    }
  },
  equip : function(args, targets) {
    if (!targets || !game.templates || !game.templates.display) {return "0"}
    if (targets["c"]) {
      if (game.templates.display.sheet.rules && game.templates.display.sheet.rules[args[0]]) {
        val = duplicate(sync.rawVal(game.templates.display.sheet.rules[args[0]])) || 0;
      }
      else {
        val = sync.eval(game.templates.constants[args[0]], targets) || 0;
      }
      if (val instanceof Object) {
        for (var k in val) {
          val[k] = sync.eval(val[k], targets);
        }
      }
      else {
        val = sync.eval(val, targets);
      }
      if (targets["c"].inventory) {
        for (var index in targets["c"].inventory) {
          var itemData = targets["c"].inventory[index];
          itemData.tags = itemData.tags || {};
          var itemArmor = duplicate(sync.rawVal(itemData.equip[args[1]])) || 0;
          if (itemData.tags["equipped"] && itemArmor) {
            var armorBonus = 0;
            for (var i in itemData.equip[args[1]].modifiers) {
              armorBonus += sync.eval(itemData.equip[args[1]].modifiers[i], targets);
            }
            if (itemArmor instanceof Object) {
              for (var k in val) {
                if (itemArmor[k]) {
                  val[k] += sync.eval(itemArmor[k], targets) + armorBonus;
                }
                else {
                  val[k] += armorBonus;
                }
              }
            }
            else {
              val += sync.eval(itemArmor, targets) + armorBonus;
            }
          }
        }
      }
      return val;
    }
    if (targets["i"]) {
      var itemData = targets["i"];
      var itemArmor = duplicate(sync.rawVal(itemData.equip[args[0]])) || 0;
      if (itemArmor) {
        var armorBonus = 0;
        for (var i in itemData.equip[args[0]].modifiers) {
          armorBonus += sync.eval(itemData.equip[args[0]].modifiers[i], targets);
        }
        if (itemArmor instanceof Object) {
          for (var k in itemArmor) {
            itemArmor[k] = sync.eval(itemArmor[k], targets) + armorBonus;
          }
        }
        else {
          itemArmor = sync.eval(itemArmor, targets) + armorBonus;
        }
        return itemArmor;
      }
      return 0;
    }
    return 0;
  },
  t : function(args, targets) {
    if (!targets) {return "0"}
    if (targets["c"] && !args[1]) {
      if (targets["c"].tags[args[0]]) {
        return 1;
      }
      else {
        return 0;
      }
    }
    if (targets[args[1]]) {
      if (targets[args[1]].tags[args[0]]) {
        return 1;
      }
      else {
        return 0;
      }
    }
  },
  "!" : function(args, targets) {
    var maxLoop = 1000;
    var loop = 0;
    var cachedTargets = duplicate(targets);
    var expVal = sync.eval(args[0], cachedTargets);
    cachedTargets.val = expVal;
    var cond = sync.eval(args[1], cachedTargets);
    while (cond) {
      cachedTargets.val = sync.eval(args[0], cachedTargets);
      expVal = expVal + cachedTargets.val;
      cond = sync.eval(args[1], cachedTargets);
      loop++;
      if (loop > maxLoop) {
        sendAlert({text : "Error Processing Equation"});
        console.log(equation);
        return "0";
      }
    }
    return expVal;
  },
  total : function(args, targets) {
    var maxLoop = 1000;
    var loop = 0;
    var expVal = sync.eval(args[0], targets);
    var cond = sync.eval(args[1], targets);
    while (loop < cond) {
      expVal = expVal + sync.eval(args[0], targets);
      cond = sync.eval(args[1], targets);
      loop++;
      if (loop > maxLoop) {
        sendAlert({text : "Error Processing Equation"});
        console.log(equation);
        return "0";
      }
    }
    return expVal;
  },
  /*roll : function(args, targets) {
    setTimeout(function(){
      util.processEvent(args[0]);
    }, 100);
  },
  chat : function(args, targets) {
    setTimeout(function(){
      util.chatEvent(args[0], sync.eval(args[1] || "@me.name", targets));
    }, 100);
  },*/
  rand : function(args, targets) {
    if (Number(args[0]) >= Math.random()) {
      return 1;
    }
    return 0;
  },
  table : function(args, targets) {
    var maxLoop = 1000;
    var loop = 0;
    var expVal = sync.eval(args[0], targets);
    var cond = sync.eval(args[1], targets);

    if (game.templates.tables[expVal]) {
      if (game.templates.tables[expVal][cond]) {
        return sync.eval(game.templates.tables[expVal][cond], targets);
      }
      else {
        var reg = /(\d*)-(\d*)/i;
        var keys = Object.keys(game.templates.tables[expVal]);
        for (var i in keys) {
          var val = keys[i];
          var match = val.match(reg);
          if (match) {
            if (match[1] <= cond && cond <= match[2]) {
              return sync.eval(game.templates.tables[expVal][val], targets);
            }
            loop++;
            if (loop > maxLoop) {
              sendAlert({text : "Error Processing Equation"});
              console.log(equation);
              return "0";
            }
          }
        }
      }
    }
    return "0";
  },
  constant : function(args, targets) {
    var key = sync.eval(args[0], targets);
    if (game.templates.constants && (game.templates.constants[key] || game.templates.constants[String(key).toLowerCase()])) {
      return sync.eval(game.templates.constants[key] || game.templates.constants[String(key).toLowerCase()], targets);
    }
    return "0";
  },
  empty : function(args, targets) {
    var key = sync.eval(args[0], targets);
    if (key instanceof Object) {
      return Object.keys(key).length;
    }
    return "0";
  },
};

sync.result = function(equation, targets, noRoll, fillOnce) {
  var str = sync.reduce(String(equation), targets, noRoll, fillOnce);
  str = replaceAll(str, "<?<", "(");
  str = replaceAll(str, ">?>", ")");
  var maxLoop = 1000;
  var loop = 0;

  var match = str.match(clampRegex);
  while (match) {
    if (match[2] || match[3] || match[4] || match[5]) {
      var res = match[1];
      if (match[2] == "c") {
        res = Math.ceil(sync.eval(res, targets));
      }
      else if (match[2] == "f") {
        res = Math.floor(sync.eval(res, targets));
      }
      else if (match[2] == "r") {
        res = Math.round(sync.eval(res, targets));
      }
      if (match[3] != null) {
        res = Math.max(sync.eval(res, targets), Number(match[3].replace("_", "")));
      }
      if (match[4] != null) {
        res = Math.min(sync.eval(res, targets), Number(match[4].replace("|", "")));
      }
      if (match[5] != null) {
        res = Math.pow(sync.eval(res, targets), Number(match[5].replace("^", "")));
      }
      str = str.replace(match[0], (res || 0));
    }
    else {
      // skip over this one
      str = str.replace(match[0], "<?<"+match[1]+">?>");
    }
    match = str.match(clampRegex);
    loop++;
    if (loop > maxLoop) {
      sendAlert({text : "Error Processing Equation"});
      console.log(equation);
      return "0";
    }
  }
  str = replaceAll(str, "<?<", "(");
  str = replaceAll(str, ">?>", ")");
  str = replaceAll(str, "--", "+");
  str = replaceAll(str, "+-", "-");
  str = replaceAll(str, "-+", "+");
  str = replaceAll(str, "++", "+");


  return str || "0";
}

sync.eval = function(equation, targets) {
  var res = sync.result(equation, targets);
  if (equation != null && String(equation).length > 400) {
    sendAlert({text : "Macro is too large"});
    console.log(equation);
    return 0;
  }
  try {
    if (res[0] = "{" && res[res.length-1] == "}") {
      return JSON.parse(res);
    }
    else {
      var evl = eval(res);
      if (evl instanceof Function) {
        return res;
      }
      else {
        return evl;
      }
    }
  }
  catch(err) {
    return res;
  }
}

sync.evalDice = function(term) {
  var dice = term.match(diceRegex);
  if (isNaN(term) && dice) {
    var res;
    if (dice) {
      var values = [];
      for (var i=0; i<(dice[1] || 1); i++) {
        values.push(Math.ceil(chance.natural({min: 1, max: dice[2]})));
      }
      if (dice[3]) {
        //descending order;
        values.sort(function(a,b){
          if (b > a) {
            return -1;
          }
          else if (a > b) {
            return 1;
          }
          return 0;
        });
        if (dice[3][0] == "k") {
          if (dice[4]) {
            var amount = dice[3].substring(2, dice[3].length);
            if (dice[4] == "h") {
              values.splice(values.length-amount-1, values.length-amount);
            }
            else if (dice[4] == "l") {
              values.splice(amount, values.length-amount);
            }
          }
          else {
            var amount = dice[3].substring(1, dice[3].length);
            values.splice(amount, values.length-amount);
          }
        }
        else if (dice[3][0] == "d") {
          if (dice[4]) {
            var amount = dice[3].substring(2, dice[3].length);
            if (dice[4] == "h") {
              values.splice(0, amount);
            }
            else if (dice[4] == "l") {
              values.splice(values.length-amount-1, amount);
            }
          }
          else {
            var amount = dice[3].substring(1, dice[3].length);
            values.splice(values.length-amount-1, amount);
          }
        }
      }

      res = "(" + values[0];
      for (var j=1; j<values.length; j++) {
        res = res + "+" + values[j]; // its a bit long winded, but we want to track everything
      }
      res = res + ")";
      /*for (var i=0; i<(dice[1] || 1); i++) {
        res = "(" + Math.ceil(chance.natural({min: 1, max: dice[2]}));
        for (var j=0; j<dice[1]-1; j++) {
          var val = Math.ceil(chance.natural({min: 1, max: dice[2]}));
          res = res + "+" + val; // its a bit long winded, but we want to track everything
        }
        res = res + ")";
      }*/
    }
    return res || 0;
  }
  else {
    return term;
  }
}

sync.defaultContext = function() {
  var context = {
    setting : duplicate(game.state.setting),
    me : {
      cName : getPlayerCharacterName(getCookie("UserID")),
      char : getPlayerCharacter(getCookie("UserID")),
      pName : getPlayerName(getCookie("UserID")),
      name : "(`@me.cName`!=`0`)?(`@me.cName(@me.pName)`):(`@me.pName`)",
    },
    location : svd.location
  };

  if (game.templates && game.templates.security) {
    for (var priv in game.templates.security.player) {
      if (game.players.data[getCookie("UserID")] && game.players.data[getCookie("UserID")].rank == game.templates.security.player[priv]) {
        context.me.rank = "'"+priv+"'";
      }
    }
  }
  return context;
}

sync.traverse = function(object, string, value) {
  var split = String(string || "").split(".");
  var target = object;
  while (string && split.length) {
    var key = split[0];
    split.splice(0, 1);
    if (target[key] && (value == null || split.length)) {
      target = target[key];
    }
    else if (isNaN(key) && !target[key] && (value == null || split.length)) { // reading only
      // case insensitive reading
      var searching = false;
      for (var refKey in target) {
        if (isNaN(refKey) && refKey.toLowerCase() == key.toLowerCase()) {
          target = target[refKey];
          searching = true;
          break;
        }
      }
      if (!searching) {
        if (value != null && split.length) {
          if (!target[key]) {
            target[key] = {};
          }
          target = target[key];
        }
        else if (value != null) {
          if (value === "") {
            if (Array.isArray(target)) {
              target.splice(key, 1);
            }
            else {
              delete target[key];
            }
            return;
          }
          else {
            target[key] = value;
            target = target[key];
          }
        }
        else {
          return false;
        }
      }
    }
    else {
      if (value != null && split.length) {
        if (!target[key]) {
          target[key] = {};
        }
        target = target[key];
      }
      else if (value != null) {
        if (value === "") {
          if (Array.isArray(target)) {
            target.splice(key, 1);
          }
          else {
            delete target[key];
          }
          return;
        }
        else {
          target[key] = value;
          target = target[key];
        }
      }
      else {
        return false;
      }
    }
  }
  return target;
}
