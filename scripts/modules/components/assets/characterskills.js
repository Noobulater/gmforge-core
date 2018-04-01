sync.render("ui_skillDiceLookup", function(obj, app, scope) {
  var data = obj.data;
  var value = sync.traverse(data, scope.lookup);

  if (sync.val(value)) {
    for (var i in obj.data.skills) {
      if (obj.data.skills[i] && obj.data.skills[i].name.toLowerCase() == sync.val(value).toLowerCase()) {
        return sync.render("ui_skillDice")(obj, app, {skill : i});
      }
    }
  }
  return $("<div>");
});

sync.render("ui_skillDice", function(obj, app, scope) {
  var data = obj.data;

  var diceWrapper = $("<div>");
  diceWrapper.addClass("flexbetween hover2");
  diceWrapper.css("cursor", "pointer");

  var stat;
  if (scope.stat) {
    stat = data.stats[scope.stat];
  }

  var skill = data.skills[scope.skill];

  var ctx = sync.defaultContext();
  ctx["skill"] = skill;

  if (!stat) {
    var skillRegex = /\(([^(]+[^)]+)\)/;
    var statRes = skillRegex.exec(skill.name);
    if (statRes) {
      var statName = (statRes[1].charAt(0).toUpperCase() + statRes[1].substring(1, statRes[1].length).toLowerCase());
      stat = data.stats[statName];
    }
  }
  ctx["stat"] = duplicate(stat);
  ctx["statKey"] = statName;
  ctx["c"] = duplicate(obj.data);

  var query = sync.executeQuery(game.templates.display.sheet.skills.roll, ctx, true);

  for (var index in query.equations) {
    sync.render("ui_dice")(query.equations[index], app, {width : "10px", height : "10px"}).appendTo(diceWrapper);
  }

  diceWrapper.attr("name", skill.name);
  diceWrapper.click(function(ev){
    var skillName = $(this).attr("name");
    var eventData = {
      msg : "@me.name+' used "+skillName+"'",
      ui : game.templates.display.sheet.skills.evUI,
      data : game.templates.display.sheet.skills.roll
    };
    _diceable(ev, $(this), eventData, ctx);
  });
  return diceWrapper;
});

sync.render("ui_characterTraits", function(obj, app, scope) {
  var data = obj.data;
  var div = $("<div>");
  var info = data.info;
  ////////////////
  //// Traits ////
  ////////////////

  var title = $("<b class='flexmiddle'>Traits</b>").appendTo(div);
  if (!scope.viewOnly) {
    var icon = genIcon("plus").appendTo(title);
    icon.addClass("create");
    icon.click(function() {
      data.traits.push(sync.newValue());
      obj.sync("updateAsset");
    });
  }

  var traitList = $("<div>").appendTo(div);
  traitList.addClass("flexwrap fit-x");
  traitList.css("background-color", "white");
  for (var index in data.traits) {
    var row = $("<div>").appendTo(traitList);
    row.addClass("outline flexbetween");
    row.css("width", "50%");

    if (!scope.viewOnly) {
      var up = genIcon("arrow-up").appendTo(row);
      up.addClass("subtitle");
      up.attr("ref", index);
      up.click(function() {
        var temp = data.traits[Math.max(parseInt($(this).attr("ref"))-1, 0)];
        data.traits[Math.max(parseInt($(this).attr("ref"))-1, 0)] = data.traits[$(this).attr("ref")];
        data.traits[$(this).attr("ref")] = temp;
        obj.sync("updateAsset");
      });
    }

    var infoPlate = $("<div>").appendTo(row);
    infoPlate.addClass("flexaround");

    var infoInput = genInput({
      classes : "line",
      parent: infoPlate,
      style: {"width": "100%", "font-size": "0.8em"},
      placeholder: "Trait Name",
      value: data.traits[index].name,
      disabled: scope.viewOnly,
      index : index
    });
    infoInput.change(function(){
      data.traits[$(this).attr("index")].name = $(this).val();
      obj.sync("updateAsset");
    });

    if (!scope.viewOnly) {
      var icon = genIcon("remove").css("color", "red").appendTo(row);
      icon.css("text-align", "center");
      icon.attr("i-ref", index);
      icon.click(function() {
        data.traits.splice(parseInt($(this).attr("i-ref")), 1);
        obj.sync("updateAsset");
      });
    }
  }
  return div;
});

var _skillCache = {};

sync.render("ui_characterSkills", function(obj, app, scope){
  var data = obj.data;
  var div = $("<div>");

  scope = scope || {viewOnly: (app.attr("viewOnly") == "true"), minimized : (app.attr("minimized") == "true")};
  if (!scope.noTitle) {
    if (!scope.minimized) {
      var title = $("<h1 style='text-align: center;'>Skills </h1>").appendTo(div);
      if (!scope.viewOnly) {
        var icon = genIcon("plus").appendTo(title);
        icon.addClass("create");
        icon.click(function() {
          ui_prompt({
            target : $(this),
            inputs : {
              "Skill Key" : {placeholder : "Enter a short unique key to reference this skill"}
            },
            click : function(ev, inputs) {
              if (inputs["Skill Key"].val()) {
                data.skills[inputs["Skill Key"].val()] = sync.newValue("");
                obj.sync("updateAsset");
              }
            }
          });
        });
      }
    }
    else {
      var title = $("<b>Skills</b>").appendTo(div);
      title.addClass("fit-x flexmiddle");
      title.css("font-size", "1em");
    }
  }

  var skillList = $("<div>").appendTo(div);
  skillList.addClass("flexcolumn");

  var keys = Object.keys(data.skills);
  keys.sort(function(a,b){
    var name1 = data.skills[a].name;
    var name2 = data.skills[b].name;
    if (name1 > name2) {
      return 1;
    }
    else if (name1 < name2) {
      return -1;
    }
    return 0;
  });

  for (var ind in keys) {
    var index = keys[ind];
    if (!game.templates.display.sheet.skills.applyUI) {
      skillList.addClass("outline smooth white");
      var row = $("<div>").appendTo(skillList);
      row.addClass("flexrow outlinebottom flexbetween subtitle hover2");
      row.attr("index", index);
      if (scope.minimized) {
        row.addClass("lrpadding");
        row.append("<b>"+data.skills[index].name+"</b>");

        var skillRegex = /\((.+)\)/;
        var statRes = skillRegex.exec(data.skills[index].name);
        if (statRes) {
          if (!game.templates.display.sheet.skills.ui) {
            var context = sync.defaultContext();
            context["skill"] = data.skills[index];

            context["c"] = obj.data;

            if (data.stats[statRes[1]]) {
              context["stat"] = data.stats[statRes[1]];
              context["statKey"] = statRes[1];
            }
            var bonusVal = "0";
            bonusVal = sync.eval(game.templates.display.sheet.skills.display || "M{skill}", context);

            var bonus = $("<b>").appendTo(row);
            bonus.addClass("lrpadding");
            if (bonusVal <= 0) {
              if (game.templates.display.sheet.skills.inverted) {
                bonus.text(String(bonusVal).replace("-", "+"));
              }
              else {
                bonus.text(bonusVal);
              }
            }
            else {
              if (game.templates.display.sheet.skills.inverted) {
                bonus.text("-"+bonusVal);
              }
              else {
                bonus.text("+"+bonusVal);
              }
            }
            row.addClass("hover2");
            row.attr("stat", statRes[1]);
            row.attr("val", game.templates.display.sheet.skills.roll);
            row.attr("name", data.skills[index].name);
            row.attr("index", index);
            row.click(function(ev){
              var context = {};
              context["skill"] = $(this).attr("index");
              context["c"] = obj.id();

              if (data.stats[$(this).attr("stat")]) {
                context["stat"] = $(this).attr("stat");
              }

              var actionObj = sync.dummyObj();

              var options = duplicate(game.templates.display.sheet.skills.options);
              var ctx = sync.defaultContext();
              ctx["skill"] = data.skills[$(this).attr("index")];
              ctx["c"] = obj.data;

              if (data.stats[$(this).attr("stat")]) {
                ctx["stat"] = data.stats[$(this).attr("stat")];
                ctx["statKey"] = $(this).attr("stat");
              }
              for (var i in options) {
                options[i] = sync.eval(options[i], ctx);
              }

              actionObj.data = {
                context : context,
                options : options,
                action : game.templates.display.sheet.skills.action,
                msg : sync.eval(game.templates.display.sheet.skills.msg, ctx)
              };

              if (obj.data._a) {
                actionObj.actionData = duplicate(obj.data._a[game.templates.display.sheet.skills.action]);
              }

              game.locals["actionsList"] = game.locals["actionsList"] || {};
              game.locals["actionsList"][app.attr("id")+"-"+obj.data._t] = actionObj;

              var actionApp = sync.newApp("ui_renderAction");
              actionObj.addApp(actionApp);

              var pop = ui_popOut({
                target : $(this),
                minimize : true,
                prompt : true,
                dragThickness : "0.5em",
                title : "Action"
              }, actionApp);
              pop.resizable();
            });
          }
          else {
            var statName = statRes[1].charAt(0).toUpperCase() + statRes[1].substring(1, statRes[1].length).toLowerCase();
            var diceWrapper = sync.render("ui_skillDice")(obj, app, {stat : statName, skill : index});
            diceWrapper.appendTo(row);
          }
        }
      }
      else {
        var key = $("<text>").appendTo(row);
        key.addClass("subtitle lrpadding flexmiddle");
        key.attr("title", "@c.skills."+index);
        key.append("@");
        if (hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
          key.attr("index", index);
          key.click(function(){
            var oldIndex = $(this).attr("index");
            var pop = ui_prompt({
              target : $(this),
              inputs : {"Change Key" : {placeholder : "Assign a new key"}},
              click : function(ev, inputs) {
                var newKey = inputs["Change Key"].val();
                if (newKey) {
                  if (!obj.data.skills[newKey] && obj.data.skills[oldIndex]) {
                    obj.data.skills[newKey] = obj.data.skills[oldIndex];
                    delete obj.data.skills[oldIndex];
                    obj.sync("updateAsset");
                  }
                  else {
                    sendAlert({text : "Another entry exists with this key"});
                  }
                }
                else {
                  sendAlert({text : "Enter valid key"});
                }
              }
            });
          });
        }

        var skillCont = $("<div>").appendTo(row);
        skillCont.css("width", "40%");
        skillCont.css("display", "inline-block");

        var infoInput = genInput({
          classes : "line",
          parent: skillCont,
          placeholder: "Skill Name",
          value: data.skills[index].name,
          disabled : scope.viewOnly,
          style : {"width" : "100%", "color" : "#333"},
          index : index,
        });
        infoInput.change(function(){
          var index = $(this).attr("index");
          data.skills[index].name = $(this).val();
          obj.sync("updateAsset");
        });

        var skillRegex = /\((.+)\)/;
        var statRes = skillRegex.exec(data.skills[index].name);
        var statBonus;

        if (statRes) {
          var advances = $("<div>").appendTo(row);
          advances.addClass("flexaround flex");

          var checkWrapper = $("<div>").appendTo(advances);
          checkWrapper.css("width", "auto");
          checkWrapper.addClass("flexmiddle");

          var check = genInput({
            parent : checkWrapper,
            type : "checkbox",
            index : index,
            disabled : scope.viewOnly
          });
          if (sync.rawVal(data.skills[index]) > 0) {
            check.prop("checked", true);
          }
          checkWrapper.append(game.templates.display.sheet.skills.check);
          check.css("margin", "0");
          check.change(function() {
            if ($(this).prop("checked") == true) {
              sync.rawVal(data.skills[$(this).attr("index")], 1);
            }
            else {
              sync.rawVal(data.skills[$(this).attr("index")], "");
              if (game.templates.display.sheet.skills.check == null){
                sync.removeModifier(data.skills[$(this).attr("index")], "rank");
              }
            }
            obj.sync("updateAsset");
          });

          var statName = statRes[1].charAt(0).toUpperCase() + statRes[1].substring(1, statRes[1].length).toLowerCase();
          if (!game.templates.display.sheet.skills.ranks) {
            var bonusEntry = genInput({
              parent : advances,
              type : "number",
              value : sync.modifier(data.skills[index], "rank"),
              placeholder : "Ranks",
              index : index,
              disabled : scope.viewOnly,
              style : {"width": "55px", color : "#333"}
            });
            bonusEntry.change(function(){
              sync.modifier(data.skills[$(this).attr("index")], "rank", parseInt($(this).val()));
              obj.sync("updateAsset");
            });
          }
          else {
            if (game.templates.display.sheet.skills.ui) {
              advances.css("width", "");

              var statName = statRes[1].charAt(0).toUpperCase() + statRes[1].substring(1, statRes[1].length).toLowerCase();
              var diceWrapper = sync.render("ui_skillDice")(obj, app, {stat : statName, skill : index});
              diceWrapper.appendTo(row);
            }
            if (game.templates.display.sheet.skills.check){
              advances = $("<div>").appendTo(row);
              advances.addClass("flexmiddle");
              if (!game.templates.display.sheet.skills.ui) {
                advances.css("width", "25%");
              }
            }
            else {
              advances.removeClass("flexaround");
              advances.addClass("flexmiddle");
            }
            for (var i in game.templates.display.sheet.skills.ranks) {
              var advancement = genInput({
                parent: advances,
                class: "advancement",
                type: "checkbox",
                index: index,
                level : i,
                rank: game.templates.display.sheet.skills.ranks[i],
                disabled: scope.viewOnly,
                style : {"width" : "12px", "height" : "12px", "margin" : "0"},
              });

              if (sync.modifier(data.skills[index], "rank") > 0 && game.templates.display.sheet.skills.ranks[i] <= sync.modifier(data.skills[index], "rank")) {
                advancement.prop("checked", true);
              }
              if (!scope.viewOnly) {
                advancement.change(function() {
                  if ($(this).prop("checked")) {
                    if (game.templates.display.sheet.skills.check == null){
                      sync.rawVal(data.skills[$(this).attr("index")], 1);
                    }
                    sync.modifier(data.skills[$(this).attr("index")], "rank", parseInt($(this).attr("rank")));
                    obj.sync("updateAsset");
                  }
                  else {
                    var val = Math.max(parseInt($(this).attr("level"))-1,-1);
                    if (val < 0) {
                      sync.removeModifier(data.skills[$(this).attr("index")], "rank");
                    }
                    else {
                      sync.modifier(data.skills[$(this).attr("index")], "rank", parseInt($(this).attr("rank")));
                    }
                    obj.sync("updateAsset");
                  }
                });
              }
            }
          }
          if (!game.templates.display.sheet.skills.ui) {
            var context = sync.defaultContext();
            context["skill"] = data.skills[index];
            context["c"] = obj.data;

            if (data.stats[statRes[1]]) {
              context["stat"] = data.stats[statRes[1]];
              context["statKey"] = statRes[1];
            }
            var bonusVal = sync.eval(game.templates.display.sheet.skills.display || "M@skill", context);

            var bonus = $("<button>").appendTo(advances);
            if (bonusVal <= 0) {
              if (game.templates.display.sheet.skills.inverted) {
                bonus.text(String(bonusVal).replace("-", "+"));
              }
              else {
                bonus.text(bonusVal);
              }
            }
            else {
              if (game.templates.display.sheet.skills.inverted) {
                bonus.text("-"+bonusVal);
              }
              else {
                bonus.text("+"+bonusVal);
              }
            }
            bonus.addClass("flexmiddle hover2 lrpadding");
            bonus.css("color", "#333");
            bonus.css("cursor", "pointer");
            bonus.attr("stat", statRes[1]);
            bonus.attr("val", game.templates.display.sheet.skills.roll);
            bonus.attr("name", data.skills[index].name);
            bonus.attr("index", index);
            bonus.css("min-width", "40px");
            bonus.click(function(ev){
              var context = {};
              context["skill"] = $(this).attr("index");
              context["c"] = obj.id();

              if (data.stats[$(this).attr("stat")]) {
                context["stat"] = $(this).attr("stat");
              }

              var actionObj = sync.dummyObj();

              var options = duplicate(game.templates.display.sheet.skills.options);
              var ctx = sync.defaultContext();;
              ctx["skill"] = data.skills[$(this).attr("index")];
              ctx["c"] = obj.data;

              if (data.stats[$(this).attr("stat")]) {
                ctx["stat"] = data.stats[$(this).attr("stat")];
                ctx["statKey"] = $(this).attr("stat");
              }
              for (var i in options) {
                options[i] = sync.eval(options[i], ctx);
              }

              actionObj.data = {context : context, options : options, action : game.templates.display.sheet.skills.action, actionData : duplicate(game.templates.actions.c[game.templates.display.sheet.skills.action]), msg : sync.eval(game.templates.display.sheet.skills.msg, ctx)};

              if (obj.data._a) {
                actionObj.actionData = duplicate(obj.data._a[game.templates.display.sheet.skills.action]);
              }

              game.locals["actionsList"] = game.locals["actionsList"] || {};
              game.locals["actionsList"][app.attr("id")+"-"+obj.data._t] = actionObj;

              var actionApp = sync.newApp("ui_renderAction");
              actionObj.addApp(actionApp);

              var pop = ui_popOut({
                target : $(this),
                minimize : true,
                prompt : true,
                dragThickness : "0.5em",
                title : "Action"
              }, actionApp);
              pop.resizable();
            });
          }

          var iconWrap = $("<div>").appendTo(row);
          iconWrap.addClass("flexmiddle lrpadding");

          var icon = genIcon("list-alt", "Mods").appendTo(iconWrap);
          icon.css("text-align", "center");
          icon.attr("index", index);
          icon.attr("statBonus", statBonus);
          icon.attr("title", "Modifiers");
          icon.click(function() {
            var content = sync.newApp("ui_modifiers");
            content.attr("viewOnly", scope.viewOnly);
            content.attr("lookup", "skills."+$(this).attr("index"));
            content.attr("modsOnly", "true");
            content.attr("total", statBonus);
            obj.addApp(content);

            ui_popOut({
              target : $(this),
              align : "top",
              id : "skill-modifiers"
            }, content);
          });
        }
        else {
          infoInput.css("font-size", "1.4em");
          infoInput.css("font-weight", "bold");

          infoInput.css("text-align", "center");
          infoInput.attr("placeholder", "<Skill Name> (<Stat>)");
          skillCont.addClass("fit-x");
          skillCont.css("width", "");
          if (scope.viewOnly) {
            row.removeClass("flexbetween");
          }
          skillCont.addClass("flexmiddle");
        }

        if (!scope.viewOnly) {
          var icon = genIcon("remove").appendTo(row);
          icon.addClass("destroy");
          icon.css("text-align", "center");
          icon.attr("index", index);
          icon.click(function() {
            delete data.skills[$(this).attr("index")];
            obj.sync("updateAsset");
          });
        }
      }
    }
    else {
      var context = sync.defaultContext();
      context["skill"] = data.skills[index];
      context["skillKey"] = index;
      context["c"] = obj.data;

      var statBonus;
      var statRes;
      if (!_skillCache[data.skills[index].name]) {
        var skillRegex = /\((.+)\)/;
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


      var display = JSON.stringify(game.templates.display.sheet.skills.applyUI.display);
      display = display.replace(new RegExp("@skillKey", 'g'), index);
      display = display.replace(new RegExp("@skillTarget", 'g'), "skills." + index);
      if (statRes && statRes[1]) {
        display = display.replace(new RegExp("@statKey", 'g'), statRes[1]);
      }
      else {
        display = display.replace(new RegExp("@statKey", 'g'), "");
      }
      display = JSON.parse(display);

      var ui = sync.render("ui_processUI")(obj, app, {display : display, context : context, viewOnly : scope.viewOnly}).appendTo(skillList);
    }
  }

  return div;
});
