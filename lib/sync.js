function replaceAll(str, match, replace) {
  var loop = 0;
  var returnStr = str;
  while (returnStr.length != returnStr.replace(match, replace).length) {
    returnStr = returnStr.replace(match, replace);
    loop++;
    if (loop > 1000) {
      console.log("overflow");
      return returnStr;
    }
  }
  return returnStr;
}


Object.values = function(objects) { // why the fuck doesn't this exist by default
  var arr = [];
  for(var key in objects) {
    arr.push(objects[key]);
  }
  return arr;
}


var sync = {};

function parseValue(value) {
  if (value === "") {
    return null;
  }
  if (value == null || isNaN(value)) {
    return value;
  }
  return parseInt(value);
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
    for (var key in valueObj.modifiers) {
      if (valueObj.modifiers[key] != "none") {
        total = total + eval(valueObj.modifiers[key]) || 0;
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
var diceRegex = /(\d*)d(\d+)/i; // find a <x>d<y>
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
      if (type && type.toLowerCase() == "b") {
        if (!returnEqs.equations[0] || returnEqs.equations.length < selector && returnEqs.equations[0].v >= val.v) {
          returnEqs.equations.push(val);
        }
      }
      else if (type && type.toLowerCase() == "w") {
        if (!returnEqs.equations[0] || returnEqs.equations.length < selector && returnEqs.equations[0].v <= val.v) {
          returnEqs.equations.push(val);
        }
      }
      else if (type && type.toLowerCase() == "r") {
        if (returnEqs.equations.length < selector) {
          returnEqs.equations.push(val);
        }
      }
      else {
        returnEqs.equations.push(val);
      }
    }
    if (match[3]) {
      var newEqs = sync.executeQuery(match[3].substring(1,match[3].length), targets, noRoll);
      for (var i in newEqs.equations) {
        returnEqs.equations.push(newEqs.equations[i]);
      }
    }
  }
  else {
    returnEqs.equations = [sync.process(str, targets)];
  }
  var total = 0;
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
      console.error(equation);
      return "0";
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
  if (targets[key] && !Array.isArray(targets[key])) {
    return targets[key];
  }
  for (var cmKey in targets) {
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

sync.reduce = function(equation, targets, noRoll, fillOnce) {
  var str = String(equation);

  // insurance
  var maxLoop = 1000;
  var loop = 0;

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
      console.error(equation);
      return "0";
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

sync.result = function(equation, targets) {
  var str = sync.reduce(String(equation), targets);
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
      console.error(equation);
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
  try {
    return eval(res);
  }
  catch(err) {
    console.error(err);
    console.log("Error evaluating equation", res);
    return res;
  }
}

sync.evalDice = function(term) {
  var dice = term.match(diceRegex);
  if (isNaN(term) && dice) {
    var res;
    if (dice) {
      for (var i=0; i<(dice[1] || 1); i++) {
        res = "(" + Math.ceil(Math.random() * dice[2]);
        for (var j=0; j<dice[1]-1; j++) {
          var val = Math.ceil(Math.random() * dice[2]);
          res = res + "+" + val; // its a bit long winded, but we want to track everything
        }
        res = res + ")";
      }
    }
    return res || 0;
  }
  else {
    return term;
  }
}

sync.defaultContext = function() {
  var context = {};
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

exports.newValue = sync.newValue;
exports.modifier = sync.modifier;
exports.removeModifier = sync.removeModifier;
exports.clamped = sync.clamped;
exports.modified = sync.modified;
exports.val = sync.val;
exports.unModified = sync.unModified;
exports.rawVal = sync.rawVal;
exports.substitute = sync.substitute;
exports.reduce = sync.reduce;
exports.execute = sync.execute;
exports.executeQuery = sync.executeQuery;
exports.eval = sync.eval;
exports.result = sync.result;
exports.traverse = sync.traverse;
