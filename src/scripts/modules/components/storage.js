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

function trim(str) {
  if (str) {
    if (str instanceof Object) {
      // initiative is an example
      return str;
    }
    return str.trim();
  }
  return "";
}

function cleanseNotes(str) {
  var result = replaceAll(str, "\n", "|$br$|");
  result = replaceAll(result, "=", "|$e$|");
  result = replaceAll(result, ":", "|$c$|");
  result = replaceAll(result, ";", "|$s$|");
  result = replaceAll(result, "-", "|$h$|");
  result = replaceAll(result, ")}", "|$pb$|");
  result = replaceAll(result, ">}", "|$lb$|");
  result = replaceAll(result, "]}", "|$bb$|");
  return result;
}

function dirtyNotes(str) {
  var result = replaceAll(str, "|$br$|", "\n");
  result = replaceAll(result, "|$e$|", "=");
  result = replaceAll(result, "|$c$|", ":");
  result = replaceAll(result, "|$s$|", ";");
  result = replaceAll(result, "|$h$|", "-");
  result = replaceAll(result, "|$pb$|", ")}");
  result = replaceAll(result, "|$b$|", ">}");
  result = replaceAll(result, "|$bb$|", "]}");
  return result;
}

var tranny = {};
tranny["apts"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([^:]*):(.*)/;
    for (var i in list) {
      var data = list[i];
      var split = splitRegex.exec(data);
      if (trim(data) && split) {
        output.tags["apt_"+split[1]] = 1;
      }
      else {
        output.tags["apt_"+data] = 1;
      }
    }
  },
}
tranny["counters"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([^:]*):(.*)/;
    var options = /{([\s\S]*)}/;
    for (var i in list) {
      var data = list[i];
      var split = splitRegex.exec(data);
      if (trim(data) && split && output.counters[split[1]]) {
        var parsed = split[2];
        if (parsed.match(options)) {
            parsed = JSON.parse(parsed);
        }
        if (parsed instanceof Object) {
          merge(output.counters[split[1]], JSON.parse(split[2]), true);
        }
        else {
          if (isNaN(split[2])) {
            sync.rawVal(output.counters[split[1]], split[2]);
          }
          else {
            sync.rawVal(output.counters[split[1]], parseInt(split[2]));
          }
        }
      }
    }
  },
}
tranny["info"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([^:]*):(.*)/;
    var options = /{([\s\S]*)}/;
    for (var i in list) {
      var data = list[i];
      var split = splitRegex.exec(data);
      if (trim(data) && split) {
        var parsed = split[2];
        if (parsed.match(options)) {
          parsed = JSON.parse(parsed);
        }
        if (parsed instanceof Object) {
          if (!output.info[split[1]]) {
            output.info[split[1]] = {};
          }
          merge(output.info[split[1]], JSON.parse(split[2]), true);
        }
        else {
          if (split[1] == "notes" || split[1] == "img") {
            sync.rawVal(output.info[split[1]], dirtyNotes(split[2]));
          }
          else {
            sync.rawVal(output.info[split[1]], split[2]);
          }
        }
      }
    }
  },
}
tranny["inventory"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([0-9]+)(.*)/;
    var optionsRegex = /\[(.*)\]/;
    var options = /{([\s\S]*)}/;
    var actReg = /(.*)_a/i;
    for (var i in list) {
      var data = list[i] || "";
      // actions
      var actions = data.match(actReg);
      if (actions) {
        data = data.replace(actions[0]);
        actions = JSON.parse(actions[1]);
      }
      var split = splitRegex.exec(data);
      if (trim(data) && split) {
        var newItem = JSON.parse(JSON.stringify(templates.item));
        if (actions) {
          newItem._a = actions;
        }
        var info = newItem.info;
        var equip = newItem.equip;
        var weapon = newItem.weapon;
        var spell = newItem.spell;
        sync.rawVal(info.name, trim(split[2]));
        sync.rawVal(info.quantity, parseInt(split[1]));
        var opts = trim(split[2]).match(optionsRegex);
        if (opts) {
          sync.rawVal(info.name, trim(split[2]).replace(opts[0], ""));
          var itemSplit = opts[1].split(";");
          for (var key in itemSplit) {
            var optionSplit = itemSplit[key].split("=");
            if (optionSplit.length > 1) {
              var refKey = optionSplit[0];
              var refValue = optionSplit[1];
              if (refValue.match(options)) {
                refValue = JSON.parse(refValue);
              }
              if (refKey == "n") {
                sync.rawVal(info.notes, dirtyNotes(refValue));
              }
              else if (refKey == "s") {
                var list = dirtyNotes(refValue).split(",");
                for (var i in list) {
                  newItem.tags = newItem.tags;
                  newItem.tags[list[i]] = 1
                }
              }
              else if (refKey == "u") {
                sync.rawVal(info.img, dirtyNotes(refValue));
              }
              else if (refKey == "w") {
                sync.rawVal(info.weight, parseInt(refValue));
              }
              else if (refKey == "a") {
                if (refValue instanceof Object) {
                  merge(equip.armor, refValue, true);
                }
                else {
                  if (isNaN(refValue)) {
                    sync.rawVal(equip.armor, refValue);
                  }
                  else {
                    sync.rawVal(equip.armor, parseInt(refValue));
                  }
                }
              }
              else {
                if (weapon[refKey]) {
                  if (refValue instanceof Object) {
                    merge(weapon[refKey], refValue, true);
                  }
                  else {
                    sync.rawVal(weapon[refKey], refValue);
                  }
                }
                else if (spell[refKey]) {
                  if (refValue instanceof Object) {
                    merge(spell[refKey], refValue, true);
                  }
                  else {
                    sync.rawVal(spell[refKey], refValue);
                  }
                }
              }
            }
          }
        }
        output.inventory.push(newItem);
      }
    }
  },
}
tranny["skills"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /(.*)\[(.*)\]/;
    var options = /{([\s\S]*)}/;
    for (var i in list) {
      var data = list[i];
      var split = splitRegex.exec(data);
      if (trim(data)) {
        var skill;
        if (split) {
          skill = sync.newValue(split[1]);
          var itemSplit = split[2].split(";");
          for (var key in itemSplit) {
            var optionSplit = itemSplit[key].split("=");
            if (optionSplit.length > 1) {
              var refKey = optionSplit[0];
              var refValue = optionSplit[1];
              if (refValue.match(options)) {
                refValue = JSON.parse(refValue);
              }
              if (refKey == "r") {
                if (refValue instanceof Object) {
                  sync.rawVal(skill, refValue);
                }
                else {
                  sync.rawVal(skill, parseInt(refValue));
                }
              }
              else {
                if (refValue instanceof Object) {
                  sync.modifier(skill, refKey, refValue);
                }
                else {
                  sync.modifier(skill, refKey, parseInt(refValue));
                }
              }
            }
          }
        }
        else {
          var refValue = trim(data);
          if (refValue.match(options)) {
            skill = JSON.parse(refValue);
          }
          else {
            skill = sync.newValue(trim(data), 1);
          }
        }
        var push = true;
        for (var sID in output.skills) {
          if (output.skills[sID].name == skill.name) {
            output.skills[sID] = skill;
            push = false;
            break;
          }
        }
        if (push) {
          output.skills[Object.keys(output.skills).length + 1] = skill;
        }
      }
    }
  },
}
tranny["specials"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([^:]*):(.*)/;
    var options = /{([\s\S]*)}/;
    for (var i in list) {
      var data = list[i];
      var split = splitRegex.exec(data);
      if (trim(data) && split) {
        output.specials[Object.keys(output.specials).length] = sync.newValue(split[1], split[2]);
      }
    }
  },
}

tranny["spellbook"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([0-9]+)(.*)/;
    var options = /{([\s\S]*)}/;
    var optionsRegex = /\[(.*)\]/;
    var actReg = /(.*)_a/i;
    for (var i in list) {
      var data = list[i] || "";
      var actions = data.match(actReg);
      if (actions) {
        data = data.replace(actions[0]);
        actions = JSON.parse(actions[1]);
      }
      var split = splitRegex.exec(data);
      if (trim(data) && split) {
        var newItem = JSON.parse(JSON.stringify(templates.item));
        if (actions) {
          newItem._a = actions;
        }
        var newItem = JSON.parse(JSON.stringify(templates.item));
        var info = newItem.info;
        var equip = newItem.equip;
        var weapon = newItem.weapon;
        var spell = newItem.spell;
        sync.rawVal(info.name, trim(split[2]));
        sync.rawVal(info.quantity, parseInt(split[1]));
        var opts = trim(split[2]).match(optionsRegex);
        if (opts) {
          sync.rawVal(info.name, trim(split[2]).replace(opts[0], ""));
          var itemSplit = opts[1].split(";");
          for (var key in itemSplit) {
            var optionSplit = itemSplit[key].split("=");
            if (optionSplit.length > 1) {
              var refKey = optionSplit[0];
              var refValue = optionSplit[1];
              if (refValue.match(options)) {
                refValue = JSON.parse(refValue);
              }
              if (refKey == "n") {
                sync.rawVal(info.notes, dirtyNotes(refValue));
              }
              else if (refKey == "u") {
                sync.rawVal(info.img, dirtyNotes(refValue));
              }
              else if (refKey == "s") {
                var list = dirtyNotes(refValue).split(",");
                for (var i in list) {
                  newItem.tags = newItem.tags;
                  newItem.tags[list[i]] = 1
                }
              }
              else if (refKey == "w") {
                sync.rawVal(info.weight, parseInt(refValue));
              }
              else if (refKey == "a") {
                if (refValue instanceof Object) {
                  merge(equip.armor, refValue, true);
                }
                else {
                  if (isNaN(refValue)) {
                    sync.rawVal(equip.armor, refValue);
                  }
                  else {
                    sync.rawVal(equip.armor, parseInt(refValue));
                  }
                }
              }
              else {
                if (weapon[refKey]) {
                  if (refValue instanceof Object) {
                    merge(weapon[refKey], refValue, true);
                  }
                  else {
                    sync.rawVal(weapon[refKey], refValue);
                  }
                }
                else if (spell[refKey]) {
                  if (refValue instanceof Object) {
                    merge(spell[refKey], refValue, true);
                  }
                  else {
                    sync.rawVal(spell[refKey], refValue);
                  }
                }
              }
            }
          }
        }
        output.spellbook.push(newItem);
      }
    }
  },
}

tranny["stats"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([^:]*):(.*)/;
    var options = /{([\s\S]*)}/;
    for (var i in list) {
      var data = list[i];
      var split = splitRegex.exec(data);
      if (trim(data) && split) {
        var refKey = split[1];
        var refValue = split[2];
        if (output.stats[refKey]) {
          if (refValue.match(options)) {
            refValue = JSON.parse(refValue);
          }
          else {
            if (!isNaN(refValue)) {
              refValue = parseInt(refValue);
            }
          }
          if (refValue instanceof Object) {
            merge(output.stats[refKey], refValue, true);
          }
          else {
            sync.rawVal(output.stats[refKey], refValue);
          }
        }
      }
    }
  },
}

tranny["talents"] = {
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /(.*)\[(.*)\]/;
    var options = /{([\s\S]*)}/;
    for (var i in list) {
      var data = list[i];
      var split = splitRegex.exec(data);
      if (trim(data)) {
        if (split) {
          var talent = sync.newValue(split[1]);
          var itemSplit = split[2].split(";");
          for (var key in itemSplit) {
            var optionSplit = itemSplit[key].split("=");
            if (optionSplit.length > 1) {
              var refKey = optionSplit[0];
              var refValue = optionSplit[1];
              if (refKey != "n" && refValue.match(options)) {
                refValue = JSON.parse(refValue);
              }
              if (refKey == "n") {
                sync.rawVal(talent, dirtyNotes(refValue));
              }
              else if (refKey == "f") {
                sync.modifier(talent, "filter", dirtyNotes(refValue));
              }
              else if (refKey == "r") {
                if (refValue instanceof Object) {
                  sync.modifier(talent, "rank", refValue);
                }
                else {
                  sync.modifier(talent, "rank", refValue);
                }
              }
            }
          }
          output.talents[Object.keys(output.talents).length+1] = talent;
        }
        else {
          output.talents[Object.keys(output.talents).length+1] = sync.newValue(trim(data));
        }
      }
    }
  },
}

tranny["traits"] = {
  import : function(data, output, templates) {
    if (output.traits) {
      var list = data.split("\n");
      var splitRegex = /([^:]*):(.*)/;
      for (var i in list) {
        var data = list[i];
        var split = splitRegex.exec(data);
        if (trim(data)) {
          if (split) {
            output.tags["trait_"+trim(split[1])] = 1;
          }
          else {
            output.tags["trait_"+trim(data)] = 1;
          }
        }
      }
    }
  },
}

tranny["tags"] = { // only exists on the client b/c im lazy
  import : function(data, output, templates) {
    var list = data.split("\n");
    var splitRegex = /([^:]*):(.*)/;
    for (var i in list) {
      var data = list[i];
      if (trim(data)) {
        output.tags[trim(data)] = 1;
      }
    }
  },
}

function maxify(data, output, templates) {
  var str = replaceAll(data, "\t", "");
  var lineSplit = /([^\n]*)\n/g;
  var split = lineSplit.exec(str);
  var start = 0;
  while (split) {
    if (tranny[trim(split[1]).replace("-", "").toLowerCase()]) {
      start = split.index;
      break;
    }
    else {
      if (trim(split[1])) {
        merge(output, JSON.parse(trim(split[1])), true);
      }
    }
    split = lineSplit.exec(str);
  }

  // from the start point determine the catergory
  var category = /([\w]*)-\s*\n/;
  //str.substring(start, str.length)
  var res = str.substring(start, str.length).split(category);

  for (var i=0; i<res.length; i++) {
    if (tranny[trim(res[i]).toLowerCase()]) {
      if (trim(res[i+1])) {
        tranny[trim(res[i]).toLowerCase()].import(trim(res[i+1]), output, templates);
      }
    }
  }
}
