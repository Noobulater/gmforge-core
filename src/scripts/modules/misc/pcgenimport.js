function pcgen_import(xml, override) {
  var table = {};
  var list = xml.nodehandler.nodehandler;
  for (var key in list) {
    var data = list[key]["@attributes"];
    table[data.name] = list[key]["nodehandler"];
  }
  var importRule = {};
  importRule["Combat"] = function(src, override) {
    for (var key in src) {
      var data = src[key];
      if (data["@attributes"]) {
        if (data["@attributes"].name.toLowerCase().match("current hp")) {
          sync.rawVal(override.counters.hp, eval(data["@attributes"].name.match(diceNumber)[0]));
          override.counters.hp.max = eval(data["@attributes"].name.match(diceNumber)[0]);
        }
        else if (data["@attributes"].name.toLowerCase().match(" Saving Throw")) {
          var options = data.list.option;
          var saving = sync.rawVal(override.counters.saving);
          for (var i in options) {
            for (var j in saving) {
              var match = options[i]["#text"].toLowerCase().match(saving[j].name.toLowerCase());
              if (match) {
                var firstNumber = /[+-]\d+/;
                var d = firstNumber.exec(options[i]["#text"]);
                sync.rawVal(saving[j], eval(d[0]));
              }
            }
          }
          sync.rawVal(override.counters.saving, saving);
        }
        else if (data["@attributes"].name.toLowerCase() == "weapons") {
          for (var j in data.nodehandler) {
            var item = data.nodehandler[j];

            var newItem = duplicate(game.templates.item);
            sync.val(newItem.info.name, item["@attributes"].name);
            var dmgreg = /Damage\s*\[(\d*d\d+\+\d*)/i
            var weaponInf = item.nodehandler[0].nodehandler.text["#text"].match(dmgreg);

            if (weaponInf) {
              sync.rawVal(newItem.weapon.damage, weaponInf[1]);
            }
            override.inventory.push(newItem);
          }
        }
      }
    }
  }
  importRule["Description"] = function(src, override) {
    output.info.notes.current = '<h2 style="margin: 0; font-size: 1.4em; font-weight: bold;" data-mce-style="margin: 0; font-size: 1.4em; font-weight: bold;">Description</h2><hr style="display: block; width: 100%; height: 1px; background-color: grey; margin-top: 0px; margin-bottom: 0.5em;" data-mce-style="display: block; width: 100%; height: 1px; background-color: grey; margin-top: 0px; margin-bottom: 0.5em;">';

    for (var key in src) {
      var data = src[key];
      if (data.text["#text"]) {
        override.info.notes.current = (override.info.notes.current || "") + "<p>" + data.text["#text"] + "</p>";
      }
    }
  }
  importRule["Details"] = function(src, override) {
    for (var key in src) {
      var data = src[key];
      for (var j in override.info) {
        if (data["@attributes"].name.toLowerCase().match(override.info[j].name.toLowerCase())) {
          if (j == "name") {
            sync.rawVal(override.info[j], data.text["#text"]);
          }
          else {
            sync.rawVal(override.info[j], (sync.rawVal(override.info[j]) || "") + " " + data.text["#text"]);
          }
        }
        else if (data["@attributes"].name.toLowerCase() == "speed") {
          var firstNumber = /[+-]*\d+/;
          var match = firstNumber.exec(data.text["#text"]);
          if (match) {
            sync.rawVal(override.counters.speed, eval(match[0]));
          }
        }
        else if (data["@attributes"].name.toLowerCase() == "abilities") {
          for (var i in data.grid.row) {
            var stt = data.grid.row[i];
            for (var s in override.stats) {
              if (s.toLowerCase() == stt.cell[0]["#text"].toLowerCase().trim()) {
                sync.rawVal(override.stats[s], parseInt(stt.cell[1]["#text"]));
                sync.modifier(override.stats[s], "Stat-Bonus", Math.floor(sync.rawVal(override.stats[s])/30*15) + -5);
              }
            }
          }
        }
        else if (data["@attributes"].name.toLowerCase() == "skills") {
          for (var i in data.grid.row) {
            var stt = data.grid.row[i];
            for (var j in override.skills) {
              if (override.skills[j].name.toLowerCase().match(stt.cell[0]["#text"].toLowerCase().trim())) {
                if (eval(stt.cell[2]["#text"])) {
                  sync.rawVal(override.skills[j], 1);
                  sync.modifier(override.skills[j], "rank", eval(stt.cell[2]["#text"]));
                }
                break;
              }
            }
          }
        }
      }
    }
  }
  importRule["Equipment"] = function(src, override) {
    for (var key in src) {
      var data = src[key];
      var newItem = duplicate(game.templates.item);
      sync.val(newItem.info.name, data["@attributes"].name);
      sync.rawVal(newItem.info.notes, data.text["#text"]);
      var weaponInf = data.text["#text"].split("\n");
      var push = true;
      for (var i in weaponInf) {
        if (weaponInf[i].toLowerCase().match("damage")) {
          // all weapons are taken care of in combat section
          push = false;
          break;
        }
      }
      if (push) {
        override.inventory.push(newItem);
      }
    }
  }
  importRule["Magic"] = function(src, override) {
    for (var key in src) {
      var data = src[key];
      if (data.nodehandler) {
        var spells = data.nodehandler.nodehandler;
        for (var j in spells) {
          var firstNumber = /\d+/;
          var spellLevel = spells[j]["@attributes"].name.match(firstNumber);
          var actualSpells = spells[j].text["#text"].split("\n");

          actualSpells.splice(0, 1);
          actualSpells.splice(actualSpells.length, 1);
          for (var b=0; b<actualSpells.length; b=b+4) {
            if (actualSpells[b+3] != null) {
              var newItem = duplicate(game.templates.item);
              sync.val(newItem.info.name, actualSpells[b+0]);
              sync.modifier(newItem.spell.required, "level", spellLevel[0]);
              sync.rawVal(newItem.info.notes, (sync.rawVal(newItem.info.notes) || "") + actualSpells[b+1]);
              sync.rawVal(newItem.info.notes, (sync.rawVal(newItem.info.notes) || "") + actualSpells[b+2]);
              sync.rawVal(newItem.info.notes, (sync.rawVal(newItem.info.notes) || "") + actualSpells[b+3]);
              override.spellbook.push(newItem);
            }
            else {
              break;
            }
          }
        }
      }
    }
  }
  importRule["Misc."] = function(src, override) {
    for (var key in src) {
      var data = src[key];
      if (data["@attributes"].name.toLowerCase().match("languages")) {
        var lang = data.text["#text"].split(",");
        for (var k in lang) {
          if (lang[k].trim()) {
            override.proficient["Language "+lang[k].trim()] = true;
          }
        }
      }
      else if(data["@attributes"].name && data.text && data.text["#text"]) {
        sync.rawVal(override.info.notes, (sync.rawVal(override.info.notes) || "") + data["@attributes"].name + " : " + data.text["#text"] + "\n");
      }
    }
  }
  importRule["Special Abilities"] = function(src, override) {
    for (var key in src) {
      var data = src[key];
      if (data.text) {
        var split = (data.text["#text"] || "").split("\n");
        for (var i in split) {
          if (split[i] && split[i].trim()) {
            override.talents.push(sync.newValue(split[i]));
          }
        }
      }
    }
  }
  importRule["Weapon Summary"] = function(src, override) {
    for (var key in src) {
      var data = src[key];
      var newItem = duplicate(game.templates.item);
      sync.val(newItem.info.name, data["@attributes"].name);
      sync.rawVal(newItem.info.notes, data.text["#text"]);
      var weaponInf = data.text["#text"].split("\n");
      var push = true;
      for (var i in weaponInf) {
        if (weaponInf[i].toLowerCase().match("damage")) {
          // all weapons are taken care of in combat section
          push = false;
          break;
        }
      }
      if (push) {
        override.inventory.push(newItem);
      }
    }
  }
  console.log(table);
  for (var key in table) {
    if (importRule[key]) {
      importRule[key](table[key], override);
    }
  }
}
