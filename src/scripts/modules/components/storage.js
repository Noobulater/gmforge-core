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

sync.render("ui_storageList", function(obj, app, scope) {
  var data = obj.data;
  if (!obj.data) {
    return $("<div>");
  }
  var list = {};
  for (var i in data.l) {
    if (data.l[i].a == scope.filter) {
      list[i] = data.l[i];
    }
  }

  var div = $("<div>");
  div.addClass("fit-xy flexaround");

  var charContainer = $("<div>").appendTo(div);
  charContainer.css("width", "50%");

  var optionBar = $("<div>").appendTo(charContainer);

  var expanded = $("<div>").appendTo(div);
  expanded.css("width", "50%");
  expanded.css("max-height", "60vh");
  expanded.css("overflow", "auto");

  var filterList = {};
  for (var index in list) {
    var lData = list[index];
    for (var i in lData.t) {
      filterList[lData.t[i]] = 1;
    }
  }

  var nav = genNavBar();
  nav.addClass("alttext background");
  nav.css("padding", "");
  nav.appendTo(optionBar);
  function tabWrap(tag, icon, noFilter) {
    nav.generateTab(tag, icon, function(parent){
      var listDiv = $("<div>").appendTo(parent);
      listDiv.addClass("flexaround flexwrap");
      listDiv.css("background-color", "white");
      listDiv.css("height", "55vh");
      listDiv.css("overflow-y", "scroll");
      var target = filterList[tag];
      if (noFilter) {
        target = list;
      }
      for (var ind in target) {
        var index = ind;
        if (!noFilter) {
          index = filterList[tag][ind];
        }
        var container = $("<div>").appendTo(listDiv);

        var contentContainer = $("<div>").appendTo(container);
        contentContainer.css("min-width", "8em");
        contentContainer.attr("index", index);

        var icon = $("<div>");
        icon.addClass("outline");
        icon.css("min-width", "4em");
        for (var keyy in list[index].g) {
          if (list[index].g[keyy]) {
            if (game.locals["gameList"][list[index].g[keyy]]) {
              icon.css("background-image", "url('"+game.locals["gameList"][list[index].g[keyy]].info.img.current+"')");
            }
            else {
              icon.css("background-image", "url('/content/lock.png')");
            }
            icon.css("background-size", "contain");
            icon.css("background-repeat", "no-repeat");
            icon.css("background-position", "center");
          }
        }

        icon.css("width", "100%");
        icon.css("height", "2em");

        function buildContent(parent, contentData) {
          var card = "ui_charCard";
          var previewCard = "ui_characterSheet";
          if (contentData.data.data["_t"] == "a" || contentData.data.data["_t"] == "pk") {
            card = "ui_adventureCard";
            previewCard = "ui_renderPage";
          }
          else if (contentData.data.data["_t"] == "b") {
            card = "ui_boardCard";
            previewCard = "ui_board";
          }
          else if (contentData.data.data["_t"] == "c") {
            card = "ui_charCard";
            previewCard = "ui_characterSheet";
          }
          else if (contentData.data.data["_t"] == "g") {
            card = "ui_groupCard";
            previewCard = "ui_groupCard";
          }
          else if (contentData.data.data["_t"] == "p") {
            card = "ui_pageCard";
            previewCard = "ui_renderPage";
          }
          else if (contentData.data.data["_t"] == "t") {
            card = "ui_templateCard";
            previewCard = "ui_editor";
          }
          else if (contentData.data.data["_t"] == "v") {
            card = "ui_vehicleCard";
            previewCard = "ui_vehicleCard";
          }
          var charCard = sync.render(card)(contentData.data, app, {
            viewOnly : true,
            label : icon,
            click : function(){
              var ind = contentData.index;
              listDiv.children().each(function() {
                $(this).children().removeClass("focus");
              });
              parent.addClass("focus");

              expanded.empty();
              expanded.css("height", app.outerHeight());
              expanded.css("overflow", "auto");

              if (scope.filter == "b") {
                var tempObj = sync.obj();
                tempObj.data = duplicate(data.s[list[index]._uid].data);

                var newApp = sync.newApp(previewCard);
                newApp.addClass("fit-xy");
                if (!scope.editing) {
                  newApp.attr("viewOnly", "true");
                }
                newApp.attr("local", "true");
                tempObj.addApp(newApp);

                newApp.appendTo(expanded);
              }
              if (!scope.viewOnly) {
                if ($("#storage-popout-index-"+ind).length) {
                  $("#storage-popout-index-"+ind).remove();
                }
                var options = $("<div>").appendTo(parent);
                options.addClass("flexaround outline storage-popout");
                options.attr("id", "storage-popout-index-"+ind);

                var del = genIcon("trash").appendTo(options);
                if (!data.l[ind].delete) {
                  del.css("color", "black");
                }
                else {
                  del.addClass("destroy");
                }
                del.css("font-size", "1.5em");
                del.hover(function(){
                  ui_popOut({
                    target: $(this),
                    id: "storage-popout-desc",
                    align: "top",
                    hideclose: true
                  }, $("<b>Delete From Storage</b>"));
                  $(this).addClass("destroy");
                },
                function() {
                  $("#storage-popout-desc").remove();
                  if (!data.l[ind].delete) {
                    $(this).css("color", "black");
                  }
                });
                del.click(function() {
                  data.l[ind].delete = !data.l[ind].delete;
                  if (!data.l[ind].delete) {
                    $(this).css("color", "black");
                  }
                  else {
                    $(this).addClass("destroy");
                  }
                  return false;
                });
                if (list[index].a != "pk") {
                    var move = genIcon("share-alt").appendTo(options);
                    if (!data.l[ind].move) {
                      move.css("color", "black");
                    }
                    else {
                      move.addClass("destroy");
                    }
                    move.css("font-size", "1.5em");
                    move.hover(function(){
                      ui_popOut({
                        target: $(this),
                        id: "storage-popout-desc",
                        align: "top",
                        hideclose: true
                      }, $("<b>Move into game</b>"));
                      $(this).addClass("create");
                    },
                    function() {
                      $("#storage-popout-desc").remove();
                      if (!data.l[ind].move) {
                        $(this).css("color", "black");
                      }
                    });
                    move.click(function() {
                      data.l[ind].move = !data.l[ind].move;
                      if (!data.l[ind].move) {
                        $(this).css("color", "black");
                      }
                      else {
                        if (!data.l[ind].delete) {
                          del.click();
                        }
                        $(this).addClass("create");
                      }
                      return false;
                    });
                }

                var close = genIcon("remove").appendTo(options);
                close.css("font-size", "1.5em");
                close.click(function(){
                  $("#storage-popout-index-"+ind).remove();
                  data.l[ind].move = false;
                  data.l[ind].delete = false;
                  return false;
                });
              }
            }
          });
          charCard.addClass("background");
          charCard.appendTo(parent);
        }
        buildContent(contentContainer, {
          data : data.s[list[index]._uid],
          package : list[index].g[list[index].g.length-1],
          sheet : list[index].s,
          index : index
        });
      }
    });
  }
  if (Object.keys(list).length) {
    tabWrap("All", "th-list", true);
  }
  for (var key in filterList) {
    tabWrap(key);
    filterList[key] = [];
  }

  // built filtered lists for ease of use/less computation
  var gamePackage = game.config.data.game;
  for (var index in list) {
    var cData = data.s[list[index]._uid].data;
    var charPackage = list[index].sheet;
    if (cData) {
      for (var k in list[index].t) { // tags
        filterList[list[index].t[k]].push(index);
      }
    }
  }
  nav.selectTab(Object.keys(filterList)[0]);

  return div;
});

sync.render("ui_newStorage", function(obj, app, scope) {
  scope = scope || {viewOnly : app.attr("viewOnly") == "true", editing : app.attr("editing") == "true"};

  var div = $("<div>");
  div.addClass("flex flexrow");

  var options = $("<div>");
  if (!scope.editing) {
    options.appendTo(div);
  }
  options.addClass("flexcolumn");
  options.css("min-width", "150px");

  var search = genInput({
    parent : options,
    placeholder : "Keyword Search",
  }, 1);
  search.change(function(e) {
    var searchStr = search.val();
    if (searchStr) {
      listings.children().each(function(){
        var listWrap = $(this);
        if (listWrap.is(":visible")) {
          var listingData = game.locals["storage"].l;
          var listing = $($($(this).children()[1]).children()[0]);
          listing.children().each(function(){
            var listData = game.locals["storage"].data.s[$(this).attr("_uid")];
            if (listData && listData instanceof Object && listData.data) {
              if (listData.data.name && (listData.data.name || "").toLowerCase().match(searchStr.toLowerCase())) {
                $(this).show();
              }
              else if (listData.data.info && (sync.rawVal(listData.data.info.name || "")).toLowerCase().match(searchStr.toLowerCase())) {
                $(this).show();
              }
              else {
                $(this).hide();
              }
            }
            else {
              $(this).hide();
            }
          });
        }
      });
    }
    else {
      listings.children().each(function(){
        var listWrap = $(this);
        if (listWrap.is(":visible")) {
          var listing = $($($(this).children()[1]).children()[0]);
          listing.children().each(function(){
            $(this).show();
          });
        }
      });
    }
  });

  var categories = {
    //"a" : {n : "Adventures", i : "book", ui : "ui_planner", card : "ui_adventureCard", width : "60vw", height : "40vh"},
    "c" : {n : "Actors", i : "user", ui : "ui_characterSheet", card : "ui_charCard", width : assetTypes["c"].width, height : assetTypes["c"].height},
    //"st" : {n : "Collections", i : "picture", ui : "ui_characterSheet", card : "ui_adventureCard", ignoreGame : true},
    //"pk" : {n : "Content Packages", i : "envelope", ui : "ui_contentEditor", card : "ui_adventureCard", width : "40vw", height : "50vh"},
    //"g" : {n : "Groups", i : "unchecked", ui : "ui_groupCard", card : "ui_groupCard", width : "60vw", height : "30vh"},
    "b" : {n : "Maps", i : "globe", ui : "ui_board", card : "ui_boardCard", width : assetTypes["b"].width, height : assetTypes["b"].height},
    "p" : {n : "Resources", i : "file", ui : "ui_renderPage", card : "ui_pageCard", width : assetTypes["p"].width, height : assetTypes["p"].height},
    //"t" : {n : "Templates", i : "edit", f : "t", card : "ui_pageCard", ui : "ui_renderPage"},
    "v" : {n : "Vehicles", i : "plane", ui : "ui_vehicle", card : "ui_vehicleCard", width : "40vw", height : "30vh"},
  };

  options.append("<b>Asset Type</b>");
  for (var i in categories) {
    var assetTypeDiv = $("<div>").appendTo(options);
    assetTypeDiv.addClass("flexrow");
    assetTypeDiv.css("padding-left", "1em");

    var checkWrap = $("<div>").appendTo(assetTypeDiv);
    checkWrap.addClass("flexmiddle");

    var check = genInput({
      parent : checkWrap,
      type : "checkbox",
      style : {"margin-top" : "0px"},
      filter : i,
    });
    check.prop("checked", true);
    check.change(function(){
      if ($(this).prop("checked") == true) {
        listings.find("div[f~='"+$(this).attr("filter")+"']").fadeOut();
        if (!listings.find("div[f='"+$(this).attr("filter")+"']").is(":visible")) {
          listings.find("div[f='"+$(this).attr("filter")+"']").fadeIn();
        }
      }
      else {
        listings.find("div[f='"+$(this).attr("filter")+"']").fadeOut();
      }
    });
    genIcon(categories[i].i, categories[i].n + "").appendTo(checkWrap);
  }

  options.append("<b>Tags</b>");

  game.locals["listings"] = {};

  var tagList = $("<div>").appendTo(options);
  tagList.addClass("flexrow flexwrap");
  tagList.css("width", "150px");

  var tags = [];

  function updateTags(){
    var selectedTags = [];
    tagList.children().each(function(){
      if ($(this).hasClass("highlight alttext")) {
        selectedTags.push(tags[$(this).attr("index")]);
      }
    });
    listings.children().each(function(){
      var listWrap = $(this);
      if (listWrap.is(":visible")) {
        var listingData = game.locals["storage"].data.l;
        var listing = $($($(this).children()[1]).children()[0]);
        listing.children().each(function(){
          var listData = listingData[$(this).attr("ind")];
          if (listData) {
            if (selectedTags.length) {
              $(this).hide();
              for (var i in selectedTags) {
                var tag = selectedTags[i];
                if (util.contains(listData.t, tag)) {
                  $(this).show();
                }
              }
            }
            else {
              $(this).show();
            }
          }
        });
      }
    });
  }
  function rebuildTags() {
    tagList.empty();
    for (var i in tags) {
      var button = $("<button>").appendTo(tagList);
      button.css("margin-left", "4px");
      button.css("margin-right", "4px");
      button.append(tags[i]);
      button.attr("index", i);
      button.click(function(){
        if (!$(this).hasClass("highlight alttext")) {
          $(this).addClass("highlight alttext");
        }
        else {
          $(this).removeClass("highlight alttext");
        }
        updateTags();
      });
    }
  }

  var buffer = $("<div>").appendTo(options);
  buffer.addClass("flex");

  var share = $("<button>");//.appendTo(options);
  share.addClass("highlight alttext");
  share.append(genIcon("cloud-upload", "Share My Creations").css("color","white"));
  share.click(function(){
    var frame = layout.page({title: "Share My Creations", blur : 0.5, width: "90%", id: "community-chest"});
    if (layout.mobile) {
      frame.css("width", "95vw");
    }
    var newApp = sync.newApp("ui_shareMarket", null, {});
    newApp.appendTo(frame);
    newApp.css("height", "80vh");
  });

  var rebuild = false;
  for (var i in game.locals["storage"].data.l) {
    var listData = game.locals["storage"].data.l[i];
    for (var tg in listData.t) {
      if (!util.contains(tags, listData.t[tg])) {
        tags.push(listData.t[tg]);
        rebuild = true;
      }
    }
  }
  if (rebuild) {
    rebuildTags();
  }

  var viewWrap = $("<div>").appendTo(div);
  viewWrap.addClass("flexcolumn flex fit-y");

  var viewPort = $("<div>").appendTo(viewWrap);
  viewPort.addClass("flex outline");
  viewPort.css("overflow", "auto");

  var data = obj.data;
  var total = 0;
  for (var i in data.l) {
    total += data.l[i].w;
  }
  var storageBar = $("<div>").appendTo(viewWrap);
  storageBar.addClass('subtitle');
  storageBar.append("<b class='flexmiddle'>Storage Capacity : "+total+"/"+data.i.s+" - "+ Math.ceil(total/data.i.s * 100)+"%</b>");

  var progress = sync.render("ui_progressBar")(obj, app, {percentage : total, max : data.i.s, col : "rgba(190,4,15,1.0)"}).appendTo(storageBar);
  progress.addClass("lrpadding");

  var listings = $("<div>").appendTo(viewPort);
  listings.addClass("flexcolumn fit-x");

  for (var i in categories) {
    function loadCategory(catData, index) {
      var listWrap = $("<div>");
      listWrap.attr("index", index);
      listWrap.attr("f", index);
      listWrap.css("margin-bottom", "1em");
      listWrap.css("background-color", "rgb(235,235,228)");

      var category = $("<div>").appendTo(listWrap);
      category.addClass("outline alttext flexaround");
      category.append("<b>"+catData.n+"</b>");

      /*var listMode = genIcon("th-list").appendTo(category);
      listMode.click(function(){
        listing.empty();
        listing.addClass("flexcolumn");
        listing.removeClass("flexrow");
        var list = sync.render("ui_marketListing")(data, app, {filter : catData.f, market : catData.m, mode : "list", ignoreGame : catData.ignoreGame}).appendTo(listing);
        list.removeClass("outline flexrow flexaround flexmiddle flexwrap");
        list.addClass("flexcolumn");
      });
      var textMode = genIcon("th").appendTo(category);
      textMode.click(function(){
        listing.empty();
        listing.addClass("flexrow");
        listing.removeClass("flexcolumn");
        var list = sync.render("ui_marketListing")(data, app, {filter : catData.f, market : catData.m, ignoreGame : catData.ignoreGame}).appendTo(listing);
        list.removeClass("outline");
      });
      var iconMode = genIcon("th-large").appendTo(category);
      iconMode.click(function(){
        listing.empty();
        listing.addClass("flexrow");
        listing.removeClass("flexcolumn");
        var list = sync.render("ui_marketListing")(data, app, {filter : catData.f, market : catData.m, mode : "large", ignoreGame : catData.ignoreGame}).appendTo(listing);
        list.removeClass("outline");
      });*/

      category.addClass("background");

      var listing = $("<div>").appendTo(listWrap);
      listing.addClass("outline fit-x");
      listing.css("overflow-x", "auto");

      var list = $("<div>").appendTo(listing);
      list.addClass("flexrow");

      for (var ind in game.locals["storage"].data.l) {
        var entry = game.locals["storage"].data.l[ind];
        if (entry && entry.a == index && game.locals["storage"].data.s[entry._uid]) {
          var wrap = $("<div>").appendTo(list);
          wrap.addClass("lrpadding");
          wrap.attr("f", index);
          wrap.attr("ind", ind);
          wrap.attr("_uid", entry._uid);

          var iconDiv = $("<div>");
          iconDiv.addClass("flexcolumn");

          for (var keyy in entry.g) {
            if (entry.g[keyy]) {
              var icon = $("<div>").appendTo(iconDiv);
              icon.addClass("outline");
              icon.css("min-width", "4em");
              if (game.locals["gameList"][entry.g[keyy]]) {
                icon.css("background-image", "url('"+game.locals["gameList"][entry.g[keyy]].info.img.current+"')");
              }
              else {
                icon.css("background-image", "url('/content/lock.png')");
              }
              icon.css("background-size", "contain");
              icon.css("background-repeat", "no-repeat");
              icon.css("background-position", "center");
              icon.css("width", "100%");
              icon.css("height", "2em");
            }
          }
          if (iconDiv.children().length == 0) {
            iconDiv.remove();
          }

          function buildCard(catData, lIndex) {
            var card = sync.render(catData.card)(game.locals["storage"].data.s[entry._uid], app, {
              label : iconDiv,
              viewOnly : true,
              click : function(ev, ui, ent) {
                var wrap = $("<div>");
                wrap.addClass("flexcolumn flex");

                var newApp = sync.newApp(catData.ui).appendTo(wrap);
                if (!scope.editing) {
                  newApp.attr("viewOnly", "true");
                }
                else {
                  newApp.attr("editing", "true");
                }
                newApp.attr("local", "true");

                var buttonWrap = $("<div>").appendTo(wrap);
                buttonWrap.addClass("flexrow");
                if (!scope.editing) {
                  var download = $("<button>").appendTo(buttonWrap);
                  download.addClass("highlight alttext flex flexmiddle");
                  download.append(genIcon("cloud-download", "Download Asset").css("color", "white"));
                  download.click(function(){
                    var listEntry = game.locals["storage"].data.l[lIndex];
                    listEntry.move = true;
                    runCommand("moveAssets", {l : game.locals["storage"].data.l});
                    delete listEntry.move;
                    layout.coverlay("cloud-preview");
                  });


                  var del = $("<button>").appendTo(buttonWrap);
                  del.addClass("flex flexmiddle");
                  del.append(genIcon("Trash", "Delete Asset"));
                  del.click(function(){
                    ui_prompt({
                      target : $(this),
                      inputs : {
                        "Verification" : {placeholder : "Type in Delete to confirm"},
                      },
                      confirm : "Click To Confirm",
                      click : function(ev, inputs, ui){
                        if (inputs["Verification"].val() === "Delete") {
                          var listEntry = game.locals["storage"].data.l[lIndex];
                          listEntry.delete = true;
                          runCommand("moveAssets", {l : game.locals["storage"].data.l});
                          delete listEntry.delete;
                          layout.coverlay("cloud-preview");
                        }
                        else {
                          sendAlert({text : "Please enter the exact word 'Delete'"});
                        }
                      },
                    });
                  });
                }
                else {
                  var updateAsset = $("<button>").appendTo(buttonWrap);
                  updateAsset.addClass("highlight alttext flex flexmiddle");
                  updateAsset.append(genIcon("cloud-upload", "Update Asset").css("color", "white"));
                  updateAsset.click(function(){
                    sendAlert({text : "Updating"});
                    newApp.attr("viewOnly", true);
                    ent.update();
                    $.ajax({
                       url: '/updateAsset',
                       error: function(code) {
                         console.log(code);
                         sendAlert({text : code.responseText});
                         newApp.removeAttr("viewOnly");
                         ent.update();
                       },
                       dataType: 'json',
                       data : {entity : ent.data, game : gameReference},
                       success: function(data) {
                         sendAlert(data);
                         newApp.removeAttr("viewOnly");
                         ent.update();
                         obj.update();
                       },
                       type: 'GET'
                    });
                  });
                }

                ent.addApp(newApp);
                var pop = ui_popOut({
                  target : ui,
                  id : "cloud-preview",
                  maximize : true,
                  minimize : true,
                  dragThickness : "0.5em",
                  style : {width : catData.width, height : catData.height}
                }, wrap);

                pop.resizable();
              }
            });
            card.css("background-color", "white");
            return card;
          };
          buildCard(catData, ind).appendTo(wrap);
        }
      }
      list.removeClass("outline");
      if (list.children().length) {
        var endofList = $("<div class='flexmiddle lrpadding'><i>End of Listing</i></div>").appendTo(list);
        listWrap.appendTo(listings);
      }
    }
    loadCategory(categories[i], i);
  }
  if (scope.editing) {
    options.appendTo(div);
  }
  return div;
});
