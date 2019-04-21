/*sync.render("ui_processUI", function(obj, app, scope) {
  if (!scope.context) {
    scope.context = scope.context || sync.defaultContext();
    if (obj.data) {
      scope.context[obj.data._t] = duplicate(obj.data);
    }
  }
  function build(sData, lastLookup) {
    var newScope = scope;
    var section = $("<div>");
    var returnSection;
    if (scope.markup) {
      section.attr("id", (scope.markup || "")+lastLookup);
      if (sData.display && (!sData.classes || sData.classes.match("flexcontainer"))) {
        if (!sData.style || sData.style.position != "absolute") {
          section.css("background", "rgba(235,235,228,0.05)");
          section.css("padding-top", "12px");
          section.css("padding-left", "4px");
          section.css("padding-right", "4px");
          section.css("padding-bottom", "4px");
          section.css("border", "2px dashed rgba(55,55,55,0.2)");

          returnSection = section;

          if (sData.classes) {
            section.addClass(sData.classes);
          }

          var section = $("<div>").appendTo(section);
        }
      }
    }
    for (var cssIndex in sData.style) {
      section.css(cssIndex, sData.style[cssIndex]);
    }

    if (sData.classes) {
      section.addClass(sData.classes); //
    }
    if (sData.hint) {
      section.attr("title", sync.eval(sData.hint, scope.context));
    }
    if (sData.title) {
      section.attr("title", sData.title);
    }
    if (sData.tabs) {
      var tabList = $("<div>").appendTo(section);
      tabList.addClass(sData.listClass || "flexrow");

      var content = $("<div>").appendTo(section);
      content.addClass(sData.contentClass || "flex flexcolumn");

      for (var k in sData.tabs) {
        var tabData = sData.tabs[k];
        if (tabData && !tabData.cond || sync.eval(tabData.cond, scope.context)) {
          var tab = $("<div>").appendTo(tabList);
          tab.attr((sData.tabKey || "tabKey"), k);
          tab.text(k);
          tab.click(function(){
            tabList.children().removeClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline").addClass(sData.tabClass || "subtitle button spadding smooth");
            $(this).removeClass(sData.tabClass || "subtitle button spadding smooth").addClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline");
            app.attr((sData.tabKey || "tabKey"), $(this).attr((sData.tabKey || "tabKey")));
            content.empty();
            build(sData.tabs[$(this).attr((sData.tabKey || "tabKey"))], lastLookup+"-tab-"+$(this).attr("tabKey")).appendTo(content);
          });
          if (k == (app.attr((sData.tabKey || "tabKey")) || sData.tab)) {
            tab.addClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline");
            tab.click();
          }
          else {
            tab.addClass(sData.tabClass || "subtitle button spadding smooth");
          }
        }
      }
    }
    else {
      if (sData.scrl) {
        section.attr("_lastScrollTop", app.attr("_scrltop_"+sData.scrl));
        section.attr("_lastScrollLeft", app.attr("_scrlleft_"+sData.scrl));
        section.scroll(function(){
          app.attr("_scrltop_"+sData.scrl, $(this).scrollTop());
          app.attr("_scrlleft_"+sData.scrl, $(this).scrollLeft());
        });
      }

      if (sData.datalist) {
        var value = sync.traverse(obj.data, sData.target);
        var applyKey = sData.dataKey || "%dataKey%";
        var applyTarget = sData.dataTarget || "%dataTarget%";
        var newScope = duplicate(scope);
        newScope.viewOnly = scope.viewOnly;
        delete newScope.markup;
        merge(newScope, sData.scope);
        for (var key in value) {
          var dat = value[key];
          if (sData.datalist) {
            newScope.name = key;
            newScope.display = JSON.stringify(sData.datalist);
            newScope.display = newScope.display.replace(new RegExp(applyKey, 'g'), key);
            newScope.display = newScope.display.replace(new RegExp(applyTarget, 'g'), sData.target + "." + key);
            newScope.display = JSON.parse(newScope.display);

            if ((!sData.list || util.contains(sData.list, key)) && (!sData.ignore || !util.contains(sData.ignore, key))) {
              sync.render("ui_processUI")(obj, app, newScope).appendTo(section);
            }
          }
        }
      }
      if (sData.click) {
        if (sData.click instanceof Object) {
          section.contextmenu(function(ev){
            if (sData.click.action) {
              var refObj = obj;
              if (!obj.data._t && getPlayerCharacter(getCookie("UserID")) && getPlayerCharacter(getCookie("UserID")).data) {
                refObj = getPlayerCharacter(getCookie("UserID"));
              }
              if (refObj.data._t == "c" || refObj.data._t == "i") {
                var actionObj = sync.dummyObj();
                actionObj.data = {context : {c : refObj.id()}, options : sData.click.options, action : sData.click.action, actionData : duplicate(game.templates.actions.c[sData.click.action] || {}),  msg : sData.click.msg};

                if (refObj.data._a) {
                  actionObj.actionData = duplicate(obj.data._a[sData.click.action]);
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
              }
            }
            ev.stopPropagation();
            ev.preventDefault();
            return false;
          });
          section.click(function(ev){
            if (sData.click.calc) {
              // apply this effect
              var ctx = sync.defaultContext();
              ctx[obj.data._t] = duplicate(obj.data);
              var changed = false;
              for (var i in sData.click.calc) {
                var calcData = sData.click.calc[i];
                if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
                  var result = sync.eval(calcData.eq, ctx);
                  if (calcData.target.substring(0, Math.min(calcData.target.length, 4)) == "tags") {
                    // apply/remove tag effects
                    if (result) {
                      result = 1;
                      var val = calcData.target.split(".");
                      if (val.length > 0 && val[1]) {
                        val = val[1];
                        // apply tag effects
                        if (game.templates.tags[val]) {
                          var effects = game.templates.tags[val].calc;
                          // resolve effect
                          for (var eid in effects) {
                            if (effects[eid].cond == null || sync.eval(effects[eid].cond, ctx)) {
                              sync.traverse(obj.data, effects[eid].target, sync.eval(effects[eid].eq, ctx));
                              changed = true;
                            }
                          }
                        }
                      }
                    }
                    else {
                      // remove the tag
                      result = 0;
                      var val = calcData.target.split(".");
                      if (val.length > 0 && val[1]) {
                        val = val[1];
                        // apply tag effects
                        if (game.templates.tags[val]) {
                          var effects = game.templates.tags[val].calc;
                          // resolve effect
                          for (var eid in effects) {
                            if (effects[eid].target.match(".modifiers")) {
                              sync.traverse(obj.data, effects[eid].target, "");
                              changed = true;
                            }
                          }
                        }
                      }
                    }
                  }
                  else {
                    var target = sync.traverse(obj.data, calcData.target);
                    if (target instanceof Object) {
                      sync.rawVal(target, result);
                    }
                    else {
                      sync.traverse(obj.data, calcData.target, result);
                    }
                    changed = true;
                  }
                }
              }
              if (changed) {
                obj.sync("updateAsset");
              }
            }
            else if (sData.click.action) {
              var refObj = obj;
              if (!obj.data._t && getPlayerCharacter(getCookie("UserID")) && getPlayerCharacter(getCookie("UserID")).data) {
                refObj = getPlayerCharacter(getCookie("UserID"));
              }

              if (refObj.data._t == "c" || refObj.data._t == "i") {
                var ctx = sync.defaultContext();
                ctx[refObj.data._t] = duplicate(refObj.data);
                var actions = duplicate(game.templates.actions[refObj.data._t]);

                for (var actKey in refObj.data._a) {
                  actions[actKey] = duplicate(refObj.data._a[actKey]);
                }
                var actionData = actions[sData.click.action];
                var addStr = "";
                var str = actionData.eventData.data;
                var final = "";
                var vMatch = variableRegex.exec(str);
                // save localVaribles
                var cmps = /([\/><\!\~\=])/;

                var varTable = duplicate(actionData.eventData.var) || {};

                ctx.eval = ctx.eval || {};
                for (var key in sData.click.options) {
                  varTable[key] = sync.eval(sData.click.options[key], ctx);
                  ctx.eval[key] = varTable[key];
                }

                var pullTable = duplicate(actionData.pull);
                var targets = util.getTargets();
                for (var k in targets) {
                  var tg = getEnt(targets[k]);
                  if (tg && tg.data) {
                    for (var key in pullTable) {
                      var contxt = {c : duplicate(tg.data)};
                      varTable[key] = sync.eval(pullTable[key], contxt);
                      ctx.eval[key] = varTable[key];
                    }
                  }
                }

                var context = sync.context(actionData.eventData.data, ctx);
                for (var key in context.context) {
                  if (varTable[key]) {
                    context.context[key] = duplicate(varTable[key]);
                  }
                }

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
                  }
                  if (!(stack instanceof Object)) {
                    var newStr = vMatch[1]+(vMatch[2] || "");
                    if (context.context[vMatch[2]]) {
                      newStr += "="+sync.val(context.context[vMatch[2]])+";"
                    }
                    else {
                      newStr += vMatch[4].substring(0, stack);
                    }
                    final += newStr;
                    vMatch[0] = (vMatch[1] || "") +(vMatch[2] || "") + (vMatch[3] || "") + vMatch[4].substring(0, stack);
                  }
                  str = str.replace(vMatch[0], "");
                  vMatch = variableRegex.exec(str);
                }
                for (var i in context.context) {
                  if (!final.match(i)) {
                    final += "$"+i+"="+sync.val(context.context[i])+";";
                  }
                }
                final += context.str;
                for (var key in varTable) {
                  varTable[key] = sync.eval(varTable[key], ctx);
                }
                var icon = sync.rawVal(refObj.data.info.img);
                var msg;
                if (sData.click.msg) {
                  msg = sync.eval(sData.click.msg, ctx);
                }
                else {
                  if (actionData.flavors) {
                    var choices = [];
                    for (var i in actionData.flavors) {
                      if (!actionData.flavors[i].cond || sync.eval(actionData.flavors[i].cond, ctx)) {
                        choices.push(duplicate(actionData.flavors[i]));
                      }
                    }
                    var choice = Math.floor(Math.random() * choices.length);
                    icon = actionData.flavors[choice].icon || icon;
                    msg = sync.eval(actionData.flavors[choice].msg, ctx);
                  }
                  else {
                    icon = actionData.eventData.icon || icon;
                    msg = sync.eval(actionData.eventData.msg, ctx);
                  }
                }
                if (sData.click.icon) {
                  icon = sData.click.icon;
                }

                var eventData = {
                  person : sync.rawVal(ctx.c.info.name),
                  icon : icon,
                  flavor : msg,
                  eID : obj.id(),
                  eventData : sync.executeQuery(final, ctx),
                };
                eventData.eventData.ui = actionData.eventData.ui;
                eventData.eventData.var = varTable;

                if (actionData.effects) {
                  var effectData = {};
                  ctx["pool"] = eventData.data.pool;
                  for (var k in targets) {
                    var tg = getEnt(targets[k]);
                    if (tg && tg.data) {
                      effectData[targets[k]] = [];
                      for (var i in actionData.effects) {
                        var calcData = duplicate(actionData.effects[i]);
                        if (calcData.cond == null || sync.eval(calcData.cond, ctx)) {
                          delete calcData.cond;
                          calcData.eq = sync.eval(calcData.eq, ctx);
                          effectData[targets[k]].push(calcData);
                        }
                      }
                    }
                  }
                  eventData.effects = effectData;
                }

                if (sData.click.private) {
                  var priv = {};
                  priv[getCookie("UserID")] = true;
                  eventData.p = priv;
                }
                runCommand("chatEvent", eventData);
                setTimeout(function(){
                  for (var i in actionData.followup) {
                    if (actionData.followup[i].cond == null || sync.eval(actionData.followup[i].cond, ctx)) {
                      var eventData = {
                        person : sync.rawVal(ctx.c.info.name),
                        eID : obj.id(),
                        icon : actionData.followup[i].icon,
                        flavor : sync.eval(actionData.followup[i].msg, ctx),
                        eventData : sync.executeQuery(actionData.followup[i].data, ctx),
                      };
                      eventData.eventData.ui = actionData.followup[i].ui;
                      eventData.eventData.var = varTable;
                      if (sData.click.private) {
                        var priv = {};
                        priv[getCookie("UserID")] = true;
                        eventData.p = priv;
                      }
                      runCommand("chatEvent", eventData);
                    }
                  }
                }, 100);
              }
              ev.stopPropagation();
              ev.preventDefault();
            }
            else if ((obj.data._t == "c") && hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
              if (sData.click.create) {
                if (sData.click.create == "skills" || sData.click.create == "talents" || sData.click.create == "specials") {
                  ui_prompt({
                    target : $(this),
                    inputs : {
                      "Name" : "",
                    },
                    click : function(ev, inputs) {
                      if (inputs["Name"].val()) {
                        var lookupData = sync.traverse(obj.data, sData.click.create);
                        lookupData[inputs["Name"].val().toLowerCase().replace(/ /g,"_")] = sync.newValue(inputs["Name"].val());
                        obj.sync("updateAsset");
                      }
                    }
                  });
                }
                else if (sData.click.create == "inventory") {
                  obj.data.inventory.push(duplicate(game.templates.item));
                  obj.update();
                }
                else if (sData.click.create == "spellbook") {
                  obj.data.spellbook.push(duplicate(game.templates.item));
                  obj.update();
                }
              }
              else if (sData.click.edit && sData.target) {
                var lookupValue = sync.traverse(obj.data, sData.target);
                if (sData.click.edit == "inventory" || lookupValue._t == "i") {
                  var frame = $("<div>");
                  frame.addClass("flex flexcolumn");

                  game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
                  game.locals["editItem"].data = duplicate(lookupValue);

                  merge(game.locals["editItem"].data, duplicate(game.templates.item));

                  var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                  newApp.attr("char-ref", obj.id());
                  newApp.attr("viewOnly", scope.viewOnly);
                  if (lookupValue._s && !hasSecurity(getCookie("UserID"), "Owner", obj.data) && !hasSecurity(getCookie("UserID"), "Rights", lookupValue))  {
                    newApp.attr("viewOnly", true);
                  }
                  newApp.attr("local", "true");

                  game.locals["editItem"].addApp(newApp);

                  if (!scope.viewOnly) {
                    var confirm = $("<button>").appendTo(frame);
                    confirm.addClass("fit-x");
                    confirm.append("Confirm");
                    confirm.click(function(){
                      sync.traverse(obj.data, sData.target, duplicate(game.locals["editItem"].data));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-item");
                    });
                  }
                  var pop = ui_popOut({
                    id : "edit-item",
                    target : app,
                    maximize : true,
                    minimize : true,
                    style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
                  }, frame);
                  pop.resizable();
                }
                else if (sData.click.edit == "spellbook") {
                  var frame = $("<div>");
                  frame.addClass("flex");

                  game.locals["editSpell"] = game.locals["editSpell"] || sync.obj("editSpell");
                  game.locals["editSpell"].data = duplicate(lookupValue);

                  merge(game.locals["editSpell"].data, duplicate(game.templates.item));

                  var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                  newApp.attr("spell", "true");
                  game.locals["editSpell"].addApp(newApp);

                  if (!scope.viewOnly) {
                    var confirm = $("<button>").appendTo(frame);
                    confirm.addClass("fit-x");
                    confirm.append("Confirm");
                    confirm.click(function(){
                      sync.traverse(obj.data, sData.target, duplicate(game.locals["editSpell"].data));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-spell");
                    });
                  }
                  var pop = ui_popOut({
                    target : app,
                    maximize : true,
                    minimize : true,
                    style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
                  }, frame);
                  pop.resizable();
                }
                else if (sData.click.edit == "talents" || sData.click.edit == "specials") {
                  var frame = $("<div>");
                  frame.addClass("flexcolumn flex");

                  var talentData = duplicate(lookupValue);

                  game.locals["editTalent"] = game.locals["editTalent"] || sync.obj("editTalent");
                  game.locals["editTalent"].data = duplicate(game.templates.page);
                  game.locals["editTalent"].data._t = "t";

                  game.locals["editTalent"].data.info.name = sync.newValue("Name", duplicate(talentData.name));
                  game.locals["editTalent"].data.info.img = sync.newValue("Img", null);
                  game.locals["editTalent"].data.info.notes = sync.newValue("Notes", duplicate(talentData.current));

                  var newApp = sync.newApp("ui_editPage").appendTo(frame);
                  newApp.attr("autosave", true);
                  newApp.attr("entry", true);
                  game.locals["editTalent"].addApp(newApp);

                  var confirm = $("<button>").appendTo(frame);
                  confirm.addClass("fit-x");
                  confirm.append("Confirm");
                  confirm.click(function(){
                    if (sync.rawVal(game.locals["editTalent"].data.info.name)) {
                      sync.traverse(obj.data, sData.target+".name", duplicate(game.locals["editTalent"].data.info.name.current));
                      sync.traverse(obj.data, sData.target+".current", duplicate(game.locals["editTalent"].data.info.notes.current));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-talent");
                    }
                    else {
                      sendAlert({text : "Name required"});
                    }
                  });

                  var pop = ui_popOut({
                    target : app,
                    id : "edit-talent",
                    title : "Editing",
                    style : {width : "400px", height : "400px"}
                  }, frame);
                  pop.resizable();
                }
              }
              else if (sData.click.view && sData.target) {
                if (sData.click.view == "talents" || sData.click.view == "specials") {
                  var frame = $("<div>");
                  frame.addClass("flexcolumn flex");

                  var talentData = duplicate(sync.traverse(obj.data, sData.target));

                  var viewTalent = sync.obj("viewTalent");
                  viewTalent.data = duplicate(game.templates.page);
                  viewTalent.data._t = "t";
                  sync.rawVal(viewTalent.data.info.name, duplicate(talentData.name));
                  sync.rawVal(viewTalent.data.info.notes, duplicate(talentData.current));

                  var newApp = sync.newApp("ui_renderPage").appendTo(frame);
                  newApp.attr("viewOnly", true);
                  viewTalent.addApp(newApp);

                  var pop = ui_popOut({
                    target : app,
                    id : "view-talent",
                    title : sync.rawVal(talentData.name),
                    style : {width : "400px", height : "400px"}
                  }, frame);
                  pop.resizable();
                }
              }
              else if (sData.click.delete && (sData.target || sData.click.target) && hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
                sync.traverse(obj.data, (sData.target || sData.click.target), "");
                obj.sync("updateAsset");
              }
            }
          });
        }
        else {
          section.click(function(ev){
            var newApp = sync.newApp(sData.click);
            obj.addApp(newApp);

            var pop = ui_popOut({
              target : $(this),
              minimize : true,
              dragThickness : "0.5em",
              style : {"min-width" : "100px"},
            }, newApp);
            pop.resizable();
            ev.stopPropagation();
            ev.preventDefault();
          });
        }
      }
      if (sData.diceable && sData.diceable.data) {
        section.click(function(ev){
          var context = sync.defaultContext();
          context[obj.data._t] = duplicate(obj.data);
          if (sData.target) {
            context["target"] = duplicate(sync.traverse(obj.data, sData.target));
          }
          var eventData = duplicate(sData.diceable);
          if (!sData.noRoll) {
            eventData.data = sync.eval(eventData.data, context);
          }
          _diceable(ev, $(this), eventData, context);

          ev.stopPropagation();
          ev.preventDefault();
        });
      }
      if (sData.target && (!sData.click || (!sData.click.edit && !sData.click.view))) {
        newScope = duplicate(scope);
        newScope.lookup = (scope.lookup || "") + sData.target;
        newScope.viewOnly = scope.viewOnly;
        merge(newScope, sData.scope);
        if (sData.ui) {
          newScope.target = sync.traverse(obj.data, newScope.lookup);
          if (sData.passContext) {
            newScope.context = duplicate(scope.context);
          }
          var ui = sync.render(sData.ui)(obj, app, newScope);
          if (ui) {
            ui.appendTo(section);
          }
        }
        else if (!sData.datalist) {
          var value = sync.traverse(obj.data, newScope.lookup);
          if (value === false) { // field was not found
            // obviously it belongs here
             value = sync.traverse(obj.data, newScope.lookup, sync.newValue());
          }
          if (value instanceof Object) {
            if ((sData.edit || value.current != null || value.name != null)) {
              var val = $("<text>");
              if (sData.edit) {
                if (value.name || sData.name) {
                  var name = $("<b>").appendTo(section);
                  if ((sData.name || sData.name === "")) {
                    if (sData.link) {
                      name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
                    }
                    else if (sData.icon) {
                      name.addClass("flexmiddle");
                      name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                      name.append(genIcon({icon : sData.icon, raw : true}));
                    }
                    else {
                      name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                    }
                  }
                  else {
                    name.text(value.name + " ");
                  }
                  name.css("white-space", "nowrap");
                }
                var edit = {
                  parent : section,
                  value : value,
                  obj : obj,
                  cmd : sData.cmd || "updateAsset",
                  disabled : scope.viewOnly,
                  style : {"width" : "100%"}
                };
                if (sData.edit instanceof Object) {
                  merge(edit, duplicate(sData.edit), true);
                }
                sData.edit.disabled = scope.viewOnly;
                var input = genInput(edit);
              }
              else {
                var bool = false;
                if (value.min != null && value.min) {
                  val.text(val.text() + value.min + "/");
                  bool = true;
                }
                if (sync.val(value) || sync.val(value) == "0") {
                  val.text(val.text() + sync.val(value));
                  bool = true;
                }
                if (value.max != null) {
                  val.text(val.text() + "/" + value.max);
                  bool = true;
                }
                if (bool) {
                  if (value.name || (sData.name || sData.name === "")) {
                    var name = $("<b>").appendTo(section);

                    if ((sData.name || sData.name === "")) {
                      if (sData.link) {
                        name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
                      }
                      else if (sData.icon) {
                        name.addClass("flexmiddle");
                        name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                        name.append(genIcon({icon : sData.icon, raw : true}));
                      }
                      else {
                        name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                      }
                    }
                    else {
                      name.text(value.name + " ");
                    }
                    name.css("white-space", "nowrap");
                  }
                  val.appendTo(section);
                }
              }
            }
            else {
              var newScope = duplicate(scope);
              newScope.viewOnly = scope.viewOnly;
              merge(newScope, sData.scope);
              for (var key in value) {
                var dat = value[key];
                if (sData.applyUI) {
                  newScope.name = key;
                  if (sData.applyUI instanceof Object) {
                    newScope.display = JSON.stringify(sData.applyUI.display);
                    newScope.display = newScope.display.replace(new RegExp("@applyKey", 'g'), key);
                    newScope.display = newScope.display.replace(new RegExp("@applyTarget", 'g'), sData.target + "." + key);
                    newScope.display = JSON.parse(newScope.display);
                    if (!sData.applyUI.list || util.contains(sData.applyUI.list, key)) {
                      if (sData.applyUI.cond == null || sync.eval(sData.applyUI.cond, scope.context)) {
                        sync.render("ui_processUI")(obj, app, newScope).appendTo(section);
                      }
                    }
                  }
                  else {
                    if (sData.applyUI.cond == null || sync.eval(sData.applyUI.cond, scope.context)) {
                      var ui = sync.render(sData.applyUI)(obj, app, newScope);
                      if (ui) {
                        ui.appendTo(section);
                      }
                    }
                  }
                }
                else {
                  var newSection = $("<div>").appendTo(section);
                  if (sData.scope && sData.scope.classes) {
                    newSection.addClass(sData.scope.classes);
                  }
                  var val = $("<text>");
                  var bool = false;
                  if (dat.min != null && dat.min) {
                    val.text(val.text() + dat.min + "/");
                    bool = true;
                  }
                  if (sync.val(dat) || sync.val(dat) == "0") {
                    val.text(val.text() + sync.val(dat));
                    bool = true;
                  }
                  if (dat.max != null) {
                    val.text(val.text() + "/" + dat.max);
                    bool = true;
                  }
                  if (bool) {
                    if (dat.name || (sData.name || sData.name === "")) {
                      var name = $("<b>").appendTo(newSection);

                      if ((sData.name || sData.name === "")) {
                        if (sData.link) {
                          name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
                        }
                        else if (sData.icon) {
                          name.addClass("flexmiddle");
                          name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                          name.append(genIcon({icon : sData.icon, raw : true}));
                        }
                        else {
                          name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                        }
                      }
                      else if (sData.scope && sData.scope.key) {
                        name.text(key+ " ");
                      }
                      else {
                        name.text(dat.name + " ");
                      }
                    }
                    val.appendTo(newSection);
                  }
                }
              }
            }
          }
          else {
            var val = $("<text>").appendTo(section);
            val.text(sData.name);
          }
        }
      }
      else if (!sData.datalist) {
        if (sData.name || sData.link || sData.icon) {
          var name = $("<text>").appendTo(section);
          if (sData.link) {
            name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
          }
          else if (sData.icon) {
            name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
            name.append(genIcon({icon : sData.icon, raw : true}));
          }
          else {
            name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
          }
        }
        if (sData.ui) {
          var newScope = duplicate(sData.scope || {});
          if (newScope && newScope.viewOnly == null) {
            newScope.viewOnly = scope.viewOnly;
          }
          if (sData.passContext) {
            newScope.context = duplicate(scope.context);
          }
          sync.render(sData.ui)(obj, app, newScope).appendTo(section);
        }
        if (sData.value) {
          var value = $("<text>").appendTo(section);
          value.text(sync.eval(sData.value, scope.context));
        }
      }
      for (var j in sData.display) {
        var limit = 1;
        if (!sData.display[j].cond || sync.eval(sData.display[j].cond, scope.context)) {
          if (sData.display[j].count) { // repeated entries, mostly for dice rolling
            limit = sync.eval(sData.display[j].count, scope.context);
          }
          for (var rpCount=0; rpCount<limit; rpCount++) {
            build(sData.display[j], lastLookup+"-display-"+j).appendTo(section);
          }
        }
      }
      for (var k in sData.apps) {
        var newScope = duplicate(sData.scope || {});
        newScope.viewOnly = scope.viewOnly;
        sync.render(sData.apps[k])(obj, app, newScope).appendTo(section);
      }
    }
    return returnSection || section;
  }

  var buildResult;
  if (scope.display instanceof Object) {
    buildResult = build(scope.display, app.attr("id")+"_0");
  }
  else {
    var parsed = (scope.display || "").replace(new RegExp("href=", 'g'), "linksrc=");
    buildResult = $("<div>").addClass("fit-xy flexcolumn").append($.parseHTML(parsed));
    // parse the result to find stuff

    buildResult.find("loop").each(function(){
      var build = $(this).html();

      $(this).empty();

      var count = $(this).attr("count");
      if (isNaN(count)) {
        count = sync.eval(count, scope.context);
      }

      for (var i=0; i<count; i++) {
        var text = build.replace(new RegExp("%"+($(this).attr("replace") || "index")+"%", 'g'), i);
        text = text.replace(new RegExp("%"+("count")+"%", 'g'), count);
        $(this).append(text);
      }
    });

    buildResult.find("list").each(function(){
      var build = $(this).html();

      $(this).empty();
      if ($(this).attr("target")) {
        var value = sync.traverse(obj.data, $(this).attr("target"));
        if (value === false) {
          value = sync.traverse(obj.data, $(this).attr("target"), {});
        }

        var ignore = {};
        if ($(this).attr("ignore")) {
          var newIgnore = $(this).attr("ignore").split(",");
          for (var key in newIgnore) {
            ignore[newIgnore[key].trim()] = true;
          }
        }

        var list;
        if ($(this).attr("keys")) {
          value = $(this).attr("keys").split(",");
        }
        else {
          list = value;
        }

        for (var key in list) {
          if (!ignore[key]) {
            var text = build.replace(new RegExp("%"+($(this).attr("replace") || "index")+"%", 'g'), key);
            text = text.replace(new RegExp("%"+($(this).attr("replace") || "path")+"%", 'g'), obj.data._t + "." + $(this).attr("target") + "." + key);
            $(this).append(text);
          }
        }
      }
    });

    buildResult.find("bank").each(function(){
      var build = $(this).html();

      $(this).empty();
      if ($(this).attr("target")) {
        var value = sync.traverse(obj.data, $(this).attr("target"));
        if (value === false) {
          value = sync.traverse(obj.data, $(this).attr("target"), {});
        }

        var ignore = {};
        if ($(this).attr("ignore")) {
          var newIgnore = $(this).attr("ignore").split(",");
          for (var key in newIgnore) {
            ignore[newIgnore[key]] = true;
          }
        }

        var list;
        if ($(this).attr("keys")) {
          value = $(this).attr("keys").split(",");
        }
        else {
          list = value;
        }

        for (var key in list) {
          if (!ignore[key]) {
            var text = build.replace(new RegExp("%"+($(this).attr("replace") || "index")+"%", 'g'), key);
            text = text.replace(new RegExp("%"+($(this).attr("replace") || "path")+"%", 'g'), obj.data._t + "." + $(this).attr("target") + "." + key);
            $(this).append(text);
          }
        }
      }
    });

    buildResult.find("popout").each(function(){
      var parsed = $(this).html();

      var runReplace = /traverse{([^}]*)}/i;
      var replaced = runReplace.exec(parsed);
      var loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "traverse[{["+macro+"]}]") ;

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      runReplace = /eval{([^}]*)}/i;
      replaced = runReplace.exec(parsed);
      loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "eval[{["+macro+"]}]");

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      $(this).html(parsed);
      $(this).hide();
    });

    buildResult.find("prompt").each(function(){
      var parsed = $(this).html();

      var runReplace = /traverse{([^}]*)}/i;
      var replaced = runReplace.exec(parsed);
      var loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "traverse[{["+macro+"]}]") ;

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      runReplace = /eval{([^}]*)}/i;
      replaced = runReplace.exec(parsed);
      loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "eval[{["+macro+"]}]");

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      $(this).html(parsed);
      $(this).hide();
    });

    buildResult.find("display").each(function(){
      var parsed = $(this).html();

      var runReplace = /traverse{([^}]*)}/i;
      var replaced = runReplace.exec(parsed);
      var loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "traverse[{["+macro+"]}]") ;

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      runReplace = /eval{([^}]*)}/i;
      replaced = runReplace.exec(parsed);
      loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "eval[{["+macro+"]}]");

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      $(this).html(parsed);
    });

    parsed = buildResult.html();

    var runReplace = /traverse{([^}]*)}/i;
    var replaced = parsed.match(runReplace);
    var loop = 0;
    while (replaced) {
      var macro = replaced[1];
      var retVal = sync.traverse(obj.data, macro);
      if (retVal === false) {
        retVal = "";
      }
      parsed = parsed.replace(replaced[0], retVal);

      replaced = parsed.match(runReplace);
      loop++;
      if (loop > 10000) {
        break;
      }
    }

    runReplace = /eval{([^}]*)}/i;
    replaced = parsed.match(runReplace);
    loop = 0;
    var macroCache = {};

    while (replaced) {
      var macro = replaced[1];
      if (!macroCache[macro]) {
        macroCache[macro] = sync.eval(macro.replace(new RegExp("&amp;", "g"), "&").replace(new RegExp("&gt;", "g"), ">").replace(new RegExp("&lt;", "g"), "<"), scope.context);
      }
      parsed = parsed.replace(replaced[0], macroCache[macro]);

      replaced = parsed.match(runReplace);
      loop++;
      if (loop > 10000) {
        break;
      }
    }

    buildResult.html(parsed);

    var liveTabs = {};

    buildResult.find("tabs").each(function(){
      var tabPrefix = $(this).attr("tab-category") || "";
      var tabSelected = $(this).attr("tab-selected") || "";
      var tabSelectedStyle = $(this).attr("tab-selected-style") || "";

      $(this).find("tab").each(function(){
        $(this).attr("name", $(this).attr("name") || ($(this).text() || "").trim());
        if (!app.attr(tabPrefix) && $(this).attr("primary")) {
          $(this).attr("class", tabSelected || $(this).attr("class") || "highlight alttext outline smooth spadding");
          $(this).attr("style", $(this).attr("style") || tabSelectedStyle);
          liveTabs[tabPrefix] = $(this).attr("name");
        }
        else if ($(this).attr("name") == app.attr(tabPrefix)){
          $(this).attr("class", tabSelected || $(this).attr("class") || "highlight alttext outline smooth spadding");
          $(this).attr("style", $(this).attr("style") || tabSelectedStyle);
          liveTabs[tabPrefix] = $(this).attr("name");
        }
        else {
          $(this).attr("class", $(this).attr("class") || "button bold outline smooth spadding");
          $(this).click(function(){
            app.attr(tabPrefix, $(this).attr("name"));
            obj.update();
          });
        }
      });
    });

    for (var key in liveTabs) {
      if (key) {
        buildResult.find("["+key+"]").each(function(){
          if ($(this).attr(key) != liveTabs[key]) {
            $(this).remove();
          }
        });
      }
    }

    buildResult.find("textarea").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      genInput({
        type : "textarea",
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly,
      }, null, $(this));
    });
    buildResult.find("input").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      var selectData;
      $(this).find("option").each(function(){
        selectData = selectData || [];
        selectData.push($(this).text());
      });

      if ($(this).attr("mod") && !(value instanceof Object)) {
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue(null, value));
      }

      genInput({
        type : $(this).attr("type"),
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        checked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("check")):(null),
        unchecked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("uncheck")):(null),
        raw : ($(this).attr("field") != "name")?($(this).attr("field")):(null),
        mod : $(this).attr("mod"),
        name : ($(this).attr("field") == "name")?(true):(null),
        list : selectData,
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly,
      }, null, $(this));
      if ($(this).attr("isChecked") == true || $(this).attr("isChecked") == "true"){
        $(this).prop("checked", true);
      }
    });

    buildResult.find("datalist").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      var selectData;
      $(this).find("option").each(function(){
        selectData = selectData || [];
        selectData.push($(this).attr("value") || $(this).text());
      });

      var wrap = $("<div>");

      var input = genInput({
        parent : wrap,
        classes : $(this).attr("class"),
        type : $(this).attr("type"),
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        list : selectData,
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly,
      });
      input.attr("style", $(this).attr("style"));
      $(this).replaceWith($(wrap.children()[0]));
    });


    buildResult.find("select").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      var selectData = {};
      $(this).find("option").each(function(){
        selectData[$(this).text()] = $(this).attr("value") || $(this).text();
      });

      genInput({
        select : selectData,
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly,
      }, null, $(this));
    });
    buildResult.find("[cond]").each(function(){
      if ($(this).attr("cond") == 0 || $(this).attr("cond") == "0" || $(this).attr("cond") == "false" || !sync.eval($(this).attr("cond"), scope.context)) {
        $(this).remove();
      }
    });
    buildResult.on('click', '[edit]', function(ev){
      if (!$(this).is("input") && !$(this).is(":focus")) {
        var el = $(this);
        el.keydown(function(e) {
          // trap the return key being pressed
          if (e.keyCode === 13 && !_down[16]) {
            // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
            el.blur();
            // prevent the default behaviour of return key pressed
            return false;
          }
        });
        el.attr('contenteditable','true');
        var tgt = el.attr("edit");

        var val = sync.traverse(obj.data,tgt);

        if (val instanceof Object) {
          el.html(sync.rawVal(val));
        }
        else {
          el.html(val);
        }

        var save = function(){
            el.attr('contenteditable','false');
            if(el.html().trim().replace("\n","")=="")
            {
                el.css("min-width","10px");
                el.css("min-height","10px");
                el.css("border-bottom","1px solid");
            }

            if (val instanceof Object) {
              sync.rawVal(val, el.html().replace("<br>", ""));
            }
            else {
              sync.traverse(obj.data, tgt, el.html().replace("<br>", ""));
            }
            obj.sync("updateAsset")
            //alert("Saved!");
        };
        el.one('blur', save).focus();
      }
    });

    buildResult.find("click").each(function(){
      // prompt
      // pool
      if (!$(this).parent().attr("class") && !$(this).parent().attr("style") && !$(this).parent().is("button")) {
        $(this).parent().addClass("underline link");
      }
      var clickData = $(this);
      $(this).find("setAttr").hide();
      $(this).find("create").hide();
      $(this).find("change").hide();
      $(this).find("chat").hide();
      $(this).find("display").hide();
      $(this).find("delete").hide();
      $(this).find("prompt").hide();
      $(this).find("popout").hide();
      $(this).find("var").hide();
      $(this).find("view").hide();

      $(this).parent().click(function(ev){
        var ctx = sync.defaultContext();
        ctx[obj.data._t] = duplicate(obj.data);

        var saveTable = {};

        $(this).find("var").each(function(){
          $.each( $(this)[0].attributes, function ( index, attribute ) {
            saveTable[attribute.name] = sync.eval(attribute.value, ctx);
            ctx.eval = saveTable;
          });
        });
        ctx.eval = saveTable;

        function execute(){
          var varTable = {};
          $(this).find("var").each(function(){
            $.each( $(this)[0].attributes, function ( index, attribute ) {
              varTable[attribute.name] = sync.eval(attribute.value, ctx);
              ctx.eval = varTable;
            });
          });
    
          ctx.eval = varTable;

          for (var k in saveTable) {
            ctx.eval[k] = saveTable[k];
          }

          clickData.find("create").each(function(){
            if ($(this).attr("type") && $(this).attr("target")) {
              var lookup = $(this).attr("target");
              var type = $(this).attr("type").toLowerCase();
              var lookupData = sync.traverse(obj.data, lookup);
              for (var key in game.templates.elements) {
                if (key.toLowerCase() == type) {
                  type = key;
                }
              }

              if (game.templates.elements && game.templates.elements[type]) {
                if (lookupData && lookupData instanceof Object) {
                  var newObj = duplicate(game.templates.elements[type]);
                  if (Array.isArray(lookupData)) {
                    lookupData.push(newObj);
                    obj.sync("updateAsset");
                  }
                  else {
                    ui_prompt({
                      target : app,
                      inputs : {
                        "Name" : "",
                      },
                      click : function(ev, inputs) {
                        if (inputs["Name"].val()) {
                          newObj._dropKey = inputs["Name"].val().toLowerCase().replace(/ /g,"_");
                          sync.rawVal(newObj.info.name, inputs["Name"].val());
                          lookupData[inputs["Name"].val().toLowerCase().replace(/ /g,"_")] = newObj;
                          obj.sync("updateAsset");
                        }
                      }
                    });
                  }
                }
              }
              else {
                sendAlert({text : "Element not found!"});
              }
            }
          });

          clickData.find("popout").each(function(){
            $(this).hide();
            if ($(this).attr("src")) {
              var src = $("<div>").load("/html/" + $(this).attr("src"), function(response, status, xhr) {
                $(this).find("[close]").each(function(){
                  $(this).attr("close", "sheet-popout-"+$(this).attr("id"));
                });
                var newScope = duplicate(scope);
                var parsed = $(this).html();
                var loop = 0;
                var rg =/\[{\[/;
                while (parsed.match(rg)) {
                  parsed = parsed.replace("\[{\[", "{");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }
                var rg1 = /\]}\]/;
                while (parsed.match(rg1)) {
                  parsed = parsed.replace("\]}\]", "}");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }

                newScope.display = parsed;

                var pop = ui_popOut({
                  id : "sheet-popout-"+$(this).attr("id"),
                  target : $("body"),
                  title : $(this).attr("title"),
                  style : {"width" : $(this).attr("width") || "400px", "height" : $(this).attr("height") || "400px"}
                }, sync.render("ui_processUI")(obj, app, newScope));
                pop.resizable();
              });
            }
            else {
              $(this).find("[close]").each(function(){
                $(this).attr("close", "sheet-popout-"+$(this).attr("id"));
              });
              var newScope = duplicate(scope);

              var parsed = $(this).html();
              var loop = 0;
              var rg =/\[{\[/;
              while (parsed.match(rg)) {
                parsed = parsed.replace("\[{\[", "{");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }
              var rg1 = /\]}\]/;
              while (parsed.match(rg1)) {
                parsed = parsed.replace("\]}\]", "}");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }

              newScope.display = parsed;

              var pop = ui_popOut({
                id : "sheet-popout-"+$(this).attr("id"),
                target : $("body"),
                title : $(this).attr("title"),
                style : {"width" : $(this).attr("width") || "400px", "height" : $(this).attr("height") || "400px"}
              }, sync.render("ui_processUI")(obj, app, newScope));
              pop.resizable();
            }
          });

          clickData.find("change").each(function(){
            $(this).hide();
            var lookupTarget = $(this).attr("target");
            var lookupValue = sync.traverse(obj.data, lookupTarget);

            if (lookupValue._t == "i") {
              var frame = $("<div>");
              frame.addClass("flex flexcolumn");

              game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
              game.locals["editItem"].data = duplicate(lookupValue);

              merge(game.locals["editItem"].data, duplicate(game.templates.item));

              var newApp = sync.newApp("ui_renderItemv2").appendTo(frame);
              newApp.attr("char-ref", obj.id());
              newApp.attr("viewOnly", scope.viewOnly);

              var split = lookupTarget.split(".");

              newApp.attr("path", lookupTarget.replace("."+split[split.length-1], ""));
              newApp.attr("index", split[split.length-1]);

              if (lookupValue._s && !hasSecurity(getCookie("UserID"), "Owner", obj.data) && !hasSecurity(getCookie("UserID"), "Rights", lookupValue))  {
                newApp.attr("viewOnly", true);
              }
              newApp.attr("local", "true");

              game.locals["editItem"].addApp(newApp);

              if (!scope.viewOnly) {
                var confirm = $("<button>").appendTo(frame);
                confirm.addClass("fit-x");
                confirm.append("Confirm");
                confirm.click(function(){
                  sync.traverse(obj.data, lookupTarget, duplicate(game.locals["editItem"].data));
                  obj.sync("updateAsset");
                  layout.coverlay("edit-item");
                });
              }
              var pop = ui_popOut({
                id : "edit-item",
                target : app,
                maximize : true,
                minimize : true,
                style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
              }, frame);
              pop.resizable();
            }
            else {
              var frame = $("<div>");
              frame.addClass("flexcolumn flex");

              var talentData = duplicate(lookupValue);

              game.locals["editTalent"] = game.locals["editTalent"] || sync.obj("editTalent");
              game.locals["editTalent"].data = duplicate(game.templates.page);
              game.locals["editTalent"].data._t = "t";

              game.locals["editTalent"].data.info.name = sync.newValue("Name", duplicate(talentData.name));
              game.locals["editTalent"].data.info.img = sync.newValue("Img", null);
              game.locals["editTalent"].data.info.notes = sync.newValue("Notes", duplicate(talentData.current));

              var newApp = sync.newApp("ui_editPage").appendTo(frame);
              newApp.attr("autosave", true);
              newApp.attr("entry", true);
              game.locals["editTalent"].addApp(newApp);

              var confirm = $("<button>").appendTo(frame);
              confirm.addClass("fit-x");
              confirm.append("Confirm");
              confirm.click(function(){
                if (sync.rawVal(game.locals["editTalent"].data.info.name)) {
                  sync.traverse(obj.data, lookupTarget+".name", duplicate(game.locals["editTalent"].data.info.name.current));
                  sync.traverse(obj.data, lookupTarget+".current", duplicate(game.locals["editTalent"].data.info.notes.current));
                  obj.sync("updateAsset");
                  layout.coverlay("edit-talent");
                }
                else {
                  sendAlert({text : "Name required"});
                }
              });

              var pop = ui_popOut({
                target : app,
                id : "edit-talent",
                style : {width : "400px", height : "400px"}
              }, frame);
              pop.resizable();
            }
          });

          clickData.find("view").each(function(){
            $(this).hide();
            var frame = $("<div>");
            frame.addClass("flexcolumn flex");

            var talentData = duplicate(sync.traverse(obj.data, $(this).attr("target")));

            var viewTalent = sync.obj("viewTalent");
            viewTalent.data = duplicate(game.templates.page);
            viewTalent.data._t = "t";
            sync.rawVal(viewTalent.data.info.name, duplicate(talentData.name));
            sync.rawVal(viewTalent.data.info.notes, duplicate(talentData.current));

            var newApp = sync.newApp("ui_renderPage").appendTo(frame);
            newApp.attr("viewOnly", true);
            viewTalent.addApp(newApp);

            var pop = ui_popOut({
              target : app,
              id : "view-talent",
              title : sync.rawVal(talentData.name),
              style : {width : "400px", height : "400px"}
            }, frame);
            pop.resizable();
          });

          clickData.find("delete").each(function(){
            $(this).hide();
            sync.traverse(obj.data, $(this).attr("target"), "");
            obj.sync("updateAsset");
          });

          var changed = false;
          clickData.find("setAttr").each(function(){
            $(this).hide();

            var calcData = {target : $(this).attr("target"), eq : $(this).attr("value"), cond : $(this).attr("condition")};

            if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
              var result = sync.eval(calcData.eq, ctx);

              var target = sync.traverse(obj.data, calcData.target);
              if (target instanceof Object) {
                sync.rawVal(target, result);
              }
              else {
                sync.traverse(obj.data, calcData.target, result);
              }
              changed = true;
            }
          });
          if (changed) {
            obj.sync("updateAsset");
          }

          clickData.find("chat").each(function(){
            $(this).hide();
            var chatObj = $(this);
            var chatData = {};
            var targets = util.getTargets();

            $.each( $(this)[0].attributes, function ( index, attribute ) {
              if (attribute.name != "classes" && attribute.name != "style") {
                chatData[attribute.name] = sync.eval(attribute.value, ctx);
              }
            });


            $(this).find("pull").each(function(){
              for (var k in targets) {
                var tg = getEnt(targets[k]);
                if (tg && tg.data) {
                  $.each( $(this)[0].attributes, function ( index, attribute ) {
                    ctx.eval[attribute.name] = sync.eval(attribute.value, {c : duplicate(tg.data)});
                  });
                }
              }
            });

            var effectData;

            $(this).find("effect").each(function(){
              $(this).hide();
              effectData = effectData || {};
              var calcData = {target : $(this).attr("target"), eq : $(this).attr("eq"), cond : $(this).attr("cond")};

              for (var k in targets) {
                var tg = getEnt(targets[k]);
                if (tg && tg.data) {
                  effectData[targets[k]] = [];
                  if (calcData.cond == null || sync.eval(calcData.cond, ctx)) {
                    calcData.eq = sync.eval(calcData.eq, ctx);
                    effectData[targets[k]].push(calcData);
                  }
                }
              }
            });

            chatData.person = chatData.person || sync.rawVal(obj.data.info.name);
            chatData.icon = chatData.icon || sync.rawVal(obj.data.info.img);
            chatData.color = chatData.color || game.players.data[getCookie("UserID")].color;
            chatData.eID = obj.id();
            chatData.effects = effectData;

            if ($(this).attr("roll")) {
              delete chatData.eventData;
              chatData.eventData = sync.executeQuery($(this).attr("roll"), ctx);
              chatData.eventData.var = ctx.eval;
              chatData.eventData.ui = $(this).attr("roll-ui");
            }
            else if ($(this).attr("text")) {
              chatData.text = sync.eval(chatData.text, ctx);
            }
            else {
              clickData.find("display").each(function(){
                var parsed = $(this).html();
                var loop = 0;
                var rg =/\[{\[/;
                while (parsed.match(rg)) {
                  parsed = parsed.replace("\[{\[", "{");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }
                var rg1 = /\]}\]/;
                while (parsed.match(rg1)) {
                  parsed = parsed.replace("\]}\]", "}");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }

                var runReplace = /traverse{([^}]*)}/i;
                var replaced = parsed.match(runReplace);
                var loop = 0;
                while (replaced) {
                  var macro = replaced[1];
                  var retVal = sync.traverse(obj.data, macro);
                  if (retVal === false) {
                    retVal = "";
                  }
                  parsed = parsed.replace(replaced[0], retVal);

                  replaced = parsed.match(runReplace);
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }

                runReplace = /eval{([^}]*)}/i;
                replaced = parsed.match(runReplace);
                loop = 0;
                var macroCache = {};
                
                while (replaced) {
                  var macro = replaced[1];
                  if (!macroCache[macro]) {
                    macroCache[macro] = sync.eval(macro.replace(new RegExp("&amp;", "g"), "&").replace(new RegExp("&gt;", "g"), ">").replace(new RegExp("&lt;", "g"), "<"), ctx);
                  }
                  parsed = parsed.replace(replaced[0], macroCache[macro]);

                  replaced = parsed.match(runReplace);
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }
                chatData.display = parsed;
              });
              util.unSelectTargets();
            }

            if ($(this).attr("private") && sync.eval($(this).attr("private"), ctx)) {
              var priv = {};
              priv[getCookie("UserID")] = true;
              chatData.p = priv;
            }

            $(this).find("save").each(function(){
              var tempCtx;
              if (chatData.eventData) {
                tempCtx = duplicate(ctx);
                tempCtx["pool"] = duplicate(chatData.eventData.pool);
              }

              $.each( $(this)[0].attributes, function ( index, attribute ) {
                saveTable[attribute.name] = sync.eval(attribute.value, tempCtx || ctx);
              });
            });

            runCommand("chatEvent", chatData);
          });
        }

        if (clickData.find("prompt").length) {
          if ($("#"+"sheet-popout-"+clickData.find("prompt").attr("id")).length) {
            $("#"+"sheet-popout-"+clickData.find("prompt").attr("id")+"-confirm").click();
          }
          else {
            var content = $("<div>");
            content.addClass("flexcolumn flex");

            clickData.find("prompt").each(function(){
              var parsed = $(this).html();
              var loop = 0;
              var rg =/\[{\[/;
              while (parsed.match(rg)) {
                parsed = parsed.replace("\[{\[", "{");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }
              var rg1 = /\]}\]/;
              while (parsed.match(rg1)) {
                parsed = parsed.replace("\]}\]", "}");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }

              var runReplace = /traverse{([^}]*)}/i;
              var replaced = parsed.match(runReplace);
              var loop = 0;
              while (replaced) {
                var macro = replaced[1];
                var retVal = sync.traverse(obj.data, macro);
                if (retVal === false) {
                  retVal = "";
                }
                parsed = parsed.replace(replaced[0], retVal);

                replaced = parsed.match(runReplace);
                loop++;
                if (loop > 10000) {
                  break;
                }
              }

              runReplace = /eval{([^}]*)}/i;
              replaced = parsed.match(runReplace);
              loop = 0;
              var macroCache = {};

              while (replaced) {
                var macro = replaced[1];
                if (!macroCache[macro]) {
                  macroCache[macro] = sync.eval(macro.replace(new RegExp("&amp;", "g"), "&").replace(new RegExp("&gt;", "g"), ">").replace(new RegExp("&lt;", "g"), "<"), ctx);
                }
                parsed = parsed.replace(replaced[0], macroCache[macro]);

                replaced = parsed.match(runReplace);
                loop++;
                if (loop > 10000) {
                  break;
                }
              }
              content.append(parsed);
            });

            content.find("userselect").each(function(){
              var style = $(this).attr("style");
              var classStyle = $(this).attr("class");
              var varName = $(this).attr("varname");
              var value = sync.eval($(this).attr("value"), ctx);
              var input = genInput({
                select : selectData,
                min : $(this).attr("min"),
                max : $(this).attr("max"),
                step : $(this).attr("step"),
                value : value,
                disabled : scope.viewOnly,
              });
              saveTable[varName] = value;

              input.attr("style", style);
              input.attr("class", classStyle);
              $(this).replaceWith(input);
              input.change(function(){
                saveTable[varName] = $(this).val();
              });
            });
            content.find("userinput").each(function(){
              var selectData;
              var style = $(this).attr("style");
              var classStyle = $(this).attr("class");

              var varName = $(this).attr("varname");
              var value = sync.eval($(this).attr("value"), ctx);
              $(this).find("option").each(function(){
                selectData = selectData || [];
                selectData.push($(this).text());
              });
              var input = genInput({
                type : $(this).attr("type"),
                min : $(this).attr("min"),
                max : $(this).attr("max"),
                step : $(this).attr("step"),
                checked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("check")):(null),
                unchecked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("uncheck")):(null),
                list : selectData,
                value : value,
                disabled : scope.viewOnly,
              });
              saveTable[varName] = value;
              input.attr("style", style);
              input.attr("class", classStyle);
              $(this).replaceWith(input);
              var options = {type : $(this).attr("type"), checked : $(this).attr("check"), unchecked : $(this).attr("uncheck")};
              input.change(function(){
                if (options.type == "checkbox" || options.type == "radio") {
                  if (input.val() == options.checked) {
                    input.prop("checked", true);
                    saveTable[varName] = options.checked;
                  }
                  else {
                    input.prop("checked", false);
                    saveTable[varName] = options.unchecked;
                  }
                }
                else {
                  saveTable[varName] = $(this).val();
                }
              });
              if ($(this).attr("isChecked") == true || $(this).attr("isChecked") == "true"){
                $(this).prop("checked", true);
              }
            });

            var button = $("<button>").appendTo(content);
            button.attr("id", "sheet-popout-"+clickData.find("prompt").attr("id")+"-confirm");
            button.text("Confirm");
            button.click(function(){
              execute();
              layout.coverlay(pop);
            });

            var pop = ui_popOut({
              id : "sheet-popout-"+clickData.find("prompt").attr("id"),
              target : (clickData.find("prompt").attr("align"))?($(this).parent()):($("body")),
              title : clickData.find("prompt").attr("title"),
              align : clickData.find("prompt").attr("align"),
              style : {"width" : clickData.find("prompt").attr("width"), "height" : clickData.find("prompt").attr("height")}
            }, content);
            pop.resizable();
          }
        }
        else {
          execute();
          if ($(this).attr("close")) {
            layout.coverlay($(this).attr("close"));
          }
        }
        ev.stopPropagation();
      });
    });

    buildResult.find("ui").each(function(){
      var newScope = {};
      newScope.viewOnly = scope.viewOnly;

      $.each( $(this)[0].attributes, function ( index, attribute ) {
        if (attribute.name.match("scope-")) {
          newScope[attribute.name.replace("scope-", "")] = attribute.value;
        }
      });
      var result = sync.render($(this).attr("name"))(obj, app, newScope);
      if ($(this).attr("class")) {
        result.attr("class", $(this).attr("class"));
      }
      if ($(this).attr("style")) {
        result.attr("style", $(this).attr("style"));
      }
      $(this).replaceWith(result);
    });

    buildResult.find("list").each(function(){
      var sortTarget = $(this).attr("target");
      var sortableHook = $(this).attr("connect");
      var sortList = [".compendiumContent"];
      if (sortableHook) {
        sortList.push("list."+sortableHook);
        if (!$(this).hasClass(sortableHook)) {
          $(this).addClass(sortableHook);
        }
      }
      var div = $(this);

      $(this).children().each(function(index){
        $(this).attr("index", obj.id());
        $(this).data("item", JSON.stringify(sync.traverse(obj.data, sortTarget+"."+index)));
      });

      $(this).addClass(sortableHook);
      $(this).sortable({
        connectWith : [".dropContent", "."+sortableHook],
        over : function(ev, ui){
          if ($(ui.item).attr("index") != null && $(ui.item).attr("index") != obj.id() && $(ui.item).attr("key") != null) {
            if (!$("#"+app.attr("id")+sortableHook+"-drag-overlay").length) {
              var olay = layout.overlay({
                target : div,
                id : app.attr("id")+sortableHook+"-drag-overlay",
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
          layout.coverlay(app.attr("id")+sortableHook+"-drag-overlay");
        },
        update : function(ev, ui) {
          var newData = [];
          div.children().each(function(){
            newData.push(JSON.parse($(this).data("item")));
          });
          var value = sync.traverse(obj.data, sortTarget, newData);
          obj.sync("updateAsset");
        }
      });
    });

    buildResult.find("bank").each(function(){
      var sortTarget = $(this).attr("target");
      var sortableHook = $(this).attr("connect");
      var sortList = [".compendiumContent"];
      if (sortableHook) {
        sortList.push("bank."+sortableHook);
        if (!$(this).hasClass(sortableHook)) {
          $(this).addClass(sortableHook);
        }
      }
      var div = $(this);

      $(this).children().each(function(index){
        $(this).attr("index", obj.id());
        var list = sync.traverse(obj.data, sortTarget);
        $(this).data("item", JSON.stringify(sync.traverse(obj.data, sortTarget+"."+Object.keys(list)[index])));
        $(this).data("dropKey", sync.traverse(obj.data, sortTarget+"."+Object.keys(list)[index])._dropKey);
      });

      $(this).addClass(sortableHook);
      $(this).sortable({
        connectWith : [".dropContent", "."+sortableHook],
        over : function(ev, ui){
          if ($(ui.item).attr("index") != null && $(ui.item).attr("index") != obj.id() && $(ui.item).attr("key") != null) {
            if (!$("#"+app.attr("id")+sortableHook+"-drag-overlay").length) {
              var olay = layout.overlay({
                target : div,
                id : app.attr("id")+sortableHook+"-drag-overlay",
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
          layout.coverlay(app.attr("id")+sortableHook+"-drag-overlay");
        },
        update : function(ev, ui) {
          var newData = {};
          div.children().each(function(){
            newData[$(this).data("dropKey")] = JSON.parse($(this).data("item"));
          });
          var value = sync.traverse(obj.data, sortTarget, newData);
          obj.sync("updateAsset");
        }
      });
    });

    buildResult.find(".scroll").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
    buildResult.find(".scroll-xy").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
    buildResult.find(".scroll-x").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
    buildResult.find(".scroll-y").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
  }
  return buildResult;
});*/

sync.render("ui_processUI", function(obj, app, scope) {
  if (!scope.context) {
    scope.context = scope.context || sync.defaultContext();
    if (obj.data) {
      scope.context[obj.data._t] = duplicate(obj.data);
    }
  }
  function build(sData, lastLookup) {
    var newScope = scope;
    var section = $("<div>");
    var returnSection;
    if (scope.markup) {
      section.attr("id", (scope.markup || "")+lastLookup);
      if (sData.display && (!sData.classes || sData.classes.match("flexcontainer"))) {
        if (!sData.style || sData.style.position != "absolute") {
          section.css("background", "rgba(235,235,228,0.05)");
          section.css("padding-top", "12px");
          section.css("padding-left", "4px");
          section.css("padding-right", "4px");
          section.css("padding-bottom", "4px");
          section.css("border", "2px dashed rgba(55,55,55,0.2)");

          returnSection = section;

          if (sData.classes) {
            section.addClass(sData.classes);
          }

          var section = $("<div>").appendTo(section);
        }
      }
    }
    for (var cssIndex in sData.style) {
      section.css(cssIndex, sData.style[cssIndex]);
    }

    if (sData.classes) {
      section.addClass(sData.classes); //
    }
    if (sData.hint) {
      section.attr("title", sync.eval(sData.hint, scope.context));
    }
    if (sData.title) {
      section.attr("title", sData.title);
    }
    if (sData.tabs) {
      var tabList = $("<div>").appendTo(section);
      tabList.addClass(sData.listClass || "flexrow");

      var content = $("<div>").appendTo(section);
      content.addClass(sData.contentClass || "flex flexcolumn");

      for (var k in sData.tabs) {
        var tabData = sData.tabs[k];
        if (tabData && !tabData.cond || sync.eval(tabData.cond, scope.context)) {
          var tab = $("<div>").appendTo(tabList);
          tab.attr((sData.tabKey || "tabKey"), k);
          tab.text(k);
          tab.click(function(){
            tabList.children().removeClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline").addClass(sData.tabClass || "subtitle button spadding smooth");
            $(this).removeClass(sData.tabClass || "subtitle button spadding smooth").addClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline");
            app.attr((sData.tabKey || "tabKey"), $(this).attr((sData.tabKey || "tabKey")));
            content.empty();
            build(sData.tabs[$(this).attr((sData.tabKey || "tabKey"))], lastLookup+"-tab-"+$(this).attr("tabKey")).appendTo(content);
          });
          if (k == (app.attr((sData.tabKey || "tabKey")) || sData.tab)) {
            tab.addClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline");
            tab.click();
          }
          else {
            tab.addClass(sData.tabClass || "subtitle button spadding smooth");
          }
        }
      }
    }
    else {
      if (sData.scrl) {
        section.attr("_lastScrollTop", app.attr("_scrltop_"+sData.scrl));
        section.attr("_lastScrollLeft", app.attr("_scrlleft_"+sData.scrl));
        section.scroll(function(){
          app.attr("_scrltop_"+sData.scrl, $(this).scrollTop());
          app.attr("_scrlleft_"+sData.scrl, $(this).scrollLeft());
        });
      }

      if (sData.datalist) {
        var value = sync.traverse(obj.data, sData.target);
        var applyKey = sData.dataKey || "%dataKey%";
        var applyTarget = sData.dataTarget || "%dataTarget%";
        var newScope = duplicate(scope);
        newScope.viewOnly = scope.viewOnly;
        delete newScope.markup;
        merge(newScope, sData.scope);
        for (var key in value) {
          var dat = value[key];
          if (sData.datalist) {
            newScope.name = key;
            newScope.display = JSON.stringify(sData.datalist);
            newScope.display = newScope.display.replace(new RegExp(applyKey, 'g'), key);
            newScope.display = newScope.display.replace(new RegExp(applyTarget, 'g'), sData.target + "." + key);
            newScope.display = JSON.parse(newScope.display);

            if ((!sData.list || util.contains(sData.list, key)) && (!sData.ignore || !util.contains(sData.ignore, key))) {
              sync.render("ui_processUI")(obj, app, newScope).appendTo(section);
            }
          }
        }
      }
      if (sData.click) {
        if (sData.click instanceof Object) {
          section.contextmenu(function(ev){
            if (sData.click.action) {
              var refObj = obj;
              if (!obj.data._t && getPlayerCharacter(getCookie("UserID")) && getPlayerCharacter(getCookie("UserID")).data) {
                refObj = getPlayerCharacter(getCookie("UserID"));
              }
              if (refObj.data._t == "c" || refObj.data._t == "i") {
                var actionObj = sync.dummyObj();
                actionObj.data = {context : {c : refObj.id()}, options : sData.click.options, action : sData.click.action, actionData : duplicate(game.templates.actions.c[sData.click.action] || {}),  msg : sData.click.msg};

                if (refObj.data._a) {
                  actionObj.actionData = duplicate(obj.data._a[sData.click.action]);
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
              }
            }
            ev.stopPropagation();
            ev.preventDefault();
            return false;
          });
          section.click(function(ev){
            if (sData.click.calc) {
              // apply this effect
              var ctx = sync.defaultContext();
              ctx[obj.data._t] = duplicate(obj.data);
              var changed = false;
              for (var i in sData.click.calc) {
                var calcData = sData.click.calc[i];
                if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
                  var result = sync.eval(calcData.eq, ctx);
                  if (calcData.target.substring(0, Math.min(calcData.target.length, 4)) == "tags") {
                    // apply/remove tag effects
                    if (result) {
                      result = 1;
                      var val = calcData.target.split(".");
                      if (val.length > 0 && val[1]) {
                        val = val[1];
                        // apply tag effects
                        if (game.templates.tags[val]) {
                          var effects = game.templates.tags[val].calc;
                          // resolve effect
                          for (var eid in effects) {
                            if (effects[eid].cond == null || sync.eval(effects[eid].cond, ctx)) {
                              sync.traverse(obj.data, effects[eid].target, sync.eval(effects[eid].eq, ctx));
                              changed = true;
                            }
                          }
                        }
                      }
                    }
                    else {
                      // remove the tag
                      result = 0;
                      var val = calcData.target.split(".");
                      if (val.length > 0 && val[1]) {
                        val = val[1];
                        // apply tag effects
                        if (game.templates.tags[val]) {
                          var effects = game.templates.tags[val].calc;
                          // resolve effect
                          for (var eid in effects) {
                            if (effects[eid].target.match(".modifiers")) {
                              sync.traverse(obj.data, effects[eid].target, "");
                              changed = true;
                            }
                          }
                        }
                      }
                    }
                  }
                  else {
                    var target = sync.traverse(obj.data, calcData.target);
                    if (target instanceof Object) {
                      sync.rawVal(target, result);
                    }
                    else {
                      sync.traverse(obj.data, calcData.target, result);
                    }
                    changed = true;
                  }
                }
              }
              if (changed) {
                obj.sync("updateAsset");
              }
            }
            else if (sData.click.action) {
              var refObj = obj;
              if (!obj.data._t && getPlayerCharacter(getCookie("UserID")) && getPlayerCharacter(getCookie("UserID")).data) {
                refObj = getPlayerCharacter(getCookie("UserID"));
              }

              if (refObj.data._t == "c" || refObj.data._t == "i") {
                var ctx = sync.defaultContext();
                ctx[refObj.data._t] = duplicate(refObj.data);
                var actions = duplicate(game.templates.actions[refObj.data._t]);

                for (var actKey in refObj.data._a) {
                  actions[actKey] = duplicate(refObj.data._a[actKey]);
                }
                var actionData = actions[sData.click.action];
                var addStr = "";
                var str = actionData.eventData.data;
                var final = "";
                var vMatch = variableRegex.exec(str);
                // save localVaribles
                var cmps = /([\/><\!\~\=])/;

                var varTable = duplicate(actionData.eventData.var) || {};

                ctx.eval = ctx.eval || {};
                for (var key in sData.click.options) {
                  varTable[key] = sync.eval(sData.click.options[key], ctx);
                  ctx.eval[key] = varTable[key];
                }

                var pullTable = duplicate(actionData.pull);
                var targets = util.getTargets();
                for (var k in targets) {
                  var tg = getEnt(targets[k]);
                  if (tg && tg.data) {
                    for (var key in pullTable) {
                      var contxt = {c : duplicate(tg.data)};
                      varTable[key] = sync.eval(pullTable[key], contxt);
                      ctx.eval[key] = varTable[key];
                    }
                  }
                }

                var context = sync.context(actionData.eventData.data, ctx);
                for (var key in context.context) {
                  if (varTable[key]) {
                    context.context[key] = duplicate(varTable[key]);
                  }
                }

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
                  }
                  if (!(stack instanceof Object)) {
                    var newStr = vMatch[1]+(vMatch[2] || "");
                    if (context.context[vMatch[2]]) {
                      newStr += "="+sync.val(context.context[vMatch[2]])+";"
                    }
                    else {
                      newStr += vMatch[4].substring(0, stack);
                    }
                    final += newStr;
                    vMatch[0] = (vMatch[1] || "") +(vMatch[2] || "") + (vMatch[3] || "") + vMatch[4].substring(0, stack);
                  }
                  str = str.replace(vMatch[0], "");
                  vMatch = variableRegex.exec(str);
                }
                for (var i in context.context) {
                  if (!final.match(i)) {
                    final += "$"+i+"="+sync.val(context.context[i])+";";
                  }
                }
                final += context.str;
                for (var key in varTable) {
                  varTable[key] = sync.eval(varTable[key], ctx);
                }
                var icon = sync.rawVal(refObj.data.info.img);
                var msg;
                if (sData.click.msg) {
                  msg = sync.eval(sData.click.msg, ctx);
                }
                else {
                  if (actionData.flavors) {
                    var choices = [];
                    for (var i in actionData.flavors) {
                      if (!actionData.flavors[i].cond || sync.eval(actionData.flavors[i].cond, ctx)) {
                        choices.push(duplicate(actionData.flavors[i]));
                      }
                    }
                    var choice = Math.floor(Math.random() * choices.length);
                    icon = actionData.flavors[choice].icon || icon;
                    msg = sync.eval(actionData.flavors[choice].msg, ctx);
                  }
                  else {
                    icon = actionData.eventData.icon || icon;
                    msg = sync.eval(actionData.eventData.msg, ctx);
                  }
                }
                if (sData.click.icon) {
                  icon = sData.click.icon;
                }

                var eventData = {
                  person : sync.rawVal(ctx.c.info.name),
                  icon : icon,
                  flavor : msg,
                  eID : obj.id(),
                  eventData : sync.executeQuery(final, ctx),
                };
                eventData.eventData.ui = actionData.eventData.ui;
                eventData.eventData.var = varTable;

                if (actionData.effects) {
                  var effectData = {};
                  ctx["pool"] = eventData.data.pool;
                  for (var k in targets) {
                    var tg = getEnt(targets[k]);
                    if (tg && tg.data) {
                      effectData[targets[k]] = [];
                      for (var i in actionData.effects) {
                        var calcData = duplicate(actionData.effects[i]);
                        if (calcData.cond == null || sync.eval(calcData.cond, ctx)) {
                          delete calcData.cond;
                          calcData.eq = sync.eval(calcData.eq, ctx);
                          effectData[targets[k]].push(calcData);
                        }
                      }
                    }
                  }
                  eventData.effects = effectData;
                }

                if (sData.click.private) {
                  var priv = {};
                  priv[getCookie("UserID")] = true;
                  eventData.p = priv;
                }
                runCommand("chatEvent", eventData);
                setTimeout(function(){
                  for (var i in actionData.followup) {
                    if (actionData.followup[i].cond == null || sync.eval(actionData.followup[i].cond, ctx)) {
                      var eventData = {
                        person : sync.rawVal(ctx.c.info.name),
                        eID : obj.id(),
                        icon : actionData.followup[i].icon,
                        flavor : sync.eval(actionData.followup[i].msg, ctx),
                        eventData : sync.executeQuery(actionData.followup[i].data, ctx),
                      };
                      eventData.eventData.ui = actionData.followup[i].ui;
                      eventData.eventData.var = varTable;
                      if (sData.click.private) {
                        var priv = {};
                        priv[getCookie("UserID")] = true;
                        eventData.p = priv;
                      }
                      runCommand("chatEvent", eventData);
                    }
                  }
                }, 100);
              }
              ev.stopPropagation();
              ev.preventDefault();
            }
            else if ((obj.data._t == "c") && hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
              if (sData.click.create) {
                if (sData.click.create == "skills" || sData.click.create == "talents" || sData.click.create == "specials") {
                  ui_prompt({
                    target : $(this),
                    inputs : {
                      "Name" : "",
                    },
                    click : function(ev, inputs) {
                      if (inputs["Name"].val()) {
                        var lookupData = sync.traverse(obj.data, sData.click.create);
                        lookupData[inputs["Name"].val().toLowerCase().replace(/ /g,"_")] = sync.newValue(inputs["Name"].val());
                        obj.sync("updateAsset");
                      }
                    }
                  });
                }
                else if (sData.click.create == "inventory") {
                  obj.data.inventory.push(duplicate(game.templates.item));
                  obj.update();
                }
                else if (sData.click.create == "spellbook") {
                  obj.data.spellbook.push(duplicate(game.templates.item));
                  obj.update();
                }
              }
              else if (sData.click.edit && sData.target) {
                var lookupValue = sync.traverse(obj.data, sData.target);
                if (sData.click.edit == "inventory" || lookupValue._t == "i") {
                  var frame = $("<div>");
                  frame.addClass("flex flexcolumn");

                  game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
                  game.locals["editItem"].data = duplicate(lookupValue);

                  merge(game.locals["editItem"].data, duplicate(game.templates.item));

                  var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                  newApp.attr("char-ref", obj.id());
                  newApp.attr("viewOnly", scope.viewOnly);
                  if (lookupValue._s && !hasSecurity(getCookie("UserID"), "Owner", obj.data) && !hasSecurity(getCookie("UserID"), "Rights", lookupValue))  {
                    newApp.attr("viewOnly", true);
                  }
                  newApp.attr("local", "true");

                  game.locals["editItem"].addApp(newApp);

                  if (!scope.viewOnly) {
                    var confirm = $("<button>").appendTo(frame);
                    confirm.addClass("fit-x");
                    confirm.append("Confirm");
                    confirm.click(function(){
                      sync.traverse(obj.data, sData.target, duplicate(game.locals["editItem"].data));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-item");
                    });
                  }
                  var pop = ui_popOut({
                    id : "edit-item",
                    target : app,
                    maximize : true,
                    minimize : true,
                    style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
                  }, frame);
                  pop.resizable();
                }
                else if (sData.click.edit == "spellbook") {
                  var frame = $("<div>");
                  frame.addClass("flex");

                  game.locals["editSpell"] = game.locals["editSpell"] || sync.obj("editSpell");
                  game.locals["editSpell"].data = duplicate(lookupValue);

                  merge(game.locals["editSpell"].data, duplicate(game.templates.item));

                  var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                  newApp.attr("spell", "true");
                  game.locals["editSpell"].addApp(newApp);

                  if (!scope.viewOnly) {
                    var confirm = $("<button>").appendTo(frame);
                    confirm.addClass("fit-x");
                    confirm.append("Confirm");
                    confirm.click(function(){
                      sync.traverse(obj.data, sData.target, duplicate(game.locals["editSpell"].data));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-spell");
                    });
                  }
                  var pop = ui_popOut({
                    target : app,
                    maximize : true,
                    minimize : true,
                    style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
                  }, frame);
                  pop.resizable();
                }
                else if (sData.click.edit == "talents" || sData.click.edit == "specials") {
                  var frame = $("<div>");
                  frame.addClass("flexcolumn flex");

                  var talentData = duplicate(lookupValue);

                  game.locals["editTalent"] = game.locals["editTalent"] || sync.obj("editTalent");
                  game.locals["editTalent"].data = duplicate(game.templates.page);
                  game.locals["editTalent"].data._t = "t";

                  game.locals["editTalent"].data.info.name = sync.newValue("Name", duplicate(talentData.name));
                  game.locals["editTalent"].data.info.img = sync.newValue("Img", null);
                  game.locals["editTalent"].data.info.notes = sync.newValue("Notes", duplicate(talentData.current));

                  var newApp = sync.newApp("ui_editPage").appendTo(frame);
                  newApp.attr("autosave", true);
                  newApp.attr("entry", true);
                  game.locals["editTalent"].addApp(newApp);

                  var confirm = $("<button>").appendTo(frame);
                  confirm.addClass("fit-x");
                  confirm.append("Confirm");
                  confirm.click(function(){
                    if (sync.rawVal(game.locals["editTalent"].data.info.name)) {
                      sync.traverse(obj.data, sData.target+".name", duplicate(game.locals["editTalent"].data.info.name.current));
                      sync.traverse(obj.data, sData.target+".current", duplicate(game.locals["editTalent"].data.info.notes.current));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-talent");
                    }
                    else {
                      sendAlert({text : "Name required"});
                    }
                  });

                  var pop = ui_popOut({
                    target : app,
                    id : "edit-talent",
                    title : "Editing",
                    style : {width : "400px", height : "400px"}
                  }, frame);
                  pop.resizable();
                }
              }
              else if (sData.click.view && sData.target) {
                if (sData.click.view == "talents" || sData.click.view == "specials") {
                  var frame = $("<div>");
                  frame.addClass("flexcolumn flex");

                  var talentData = duplicate(sync.traverse(obj.data, sData.target));

                  var viewTalent = sync.obj("viewTalent");
                  viewTalent.data = duplicate(game.templates.page);
                  viewTalent.data._t = "t";
                  sync.rawVal(viewTalent.data.info.name, duplicate(talentData.name));
                  sync.rawVal(viewTalent.data.info.notes, duplicate(talentData.current));

                  var newApp = sync.newApp("ui_renderPage").appendTo(frame);
                  newApp.attr("viewOnly", true);
                  viewTalent.addApp(newApp);

                  var pop = ui_popOut({
                    target : app,
                    id : "view-talent",
                    title : sync.rawVal(talentData.name),
                    style : {width : "400px", height : "400px"}
                  }, frame);
                  pop.resizable();
                }
              }
              else if (sData.click.delete && (sData.target || sData.click.target) && hasSecurity(getCookie("UserID"), "Rights", obj.data)) {
                sync.traverse(obj.data, (sData.target || sData.click.target), "");
                obj.sync("updateAsset");
              }
            }
          });
        }
        else {
          section.click(function(ev){
            var newApp = sync.newApp(sData.click);
            obj.addApp(newApp);

            var pop = ui_popOut({
              target : $(this),
              minimize : true,
              dragThickness : "0.5em",
              style : {"min-width" : "100px"},
            }, newApp);
            pop.resizable();
            ev.stopPropagation();
            ev.preventDefault();
          });
        }
      }
      if (sData.diceable && sData.diceable.data) {
        section.click(function(ev){
          var context = sync.defaultContext();
          context[obj.data._t] = duplicate(obj.data);
          if (sData.target) {
            context["target"] = duplicate(sync.traverse(obj.data, sData.target));
          }
          var eventData = duplicate(sData.diceable);
          if (!sData.noRoll) {
            eventData.data = sync.eval(eventData.data, context);
          }
          _diceable(ev, $(this), eventData, context);

          ev.stopPropagation();
          ev.preventDefault();
        });
      }
      if (sData.target && (!sData.click || (!sData.click.edit && !sData.click.view))) {
        newScope = duplicate(scope);
        newScope.lookup = (scope.lookup || "") + sData.target;
        newScope.viewOnly = scope.viewOnly;
        merge(newScope, sData.scope);
        if (sData.ui) {
          newScope.target = sync.traverse(obj.data, newScope.lookup);
          if (sData.passContext) {
            newScope.context = duplicate(scope.context);
          }
          var ui = sync.render(sData.ui)(obj, app, newScope);
          if (ui) {
            ui.appendTo(section);
          }
        }
        else if (!sData.datalist) {
          var value = sync.traverse(obj.data, newScope.lookup);
          if (value === false) { // field was not found
            // obviously it belongs here
             value = sync.traverse(obj.data, newScope.lookup, sync.newValue());
          }
          if (value instanceof Object) {
            if ((sData.edit || value.current != null || value.name != null)) {
              var val = $("<text>");
              if (sData.edit) {
                if (value.name || sData.name) {
                  var name = $("<b>").appendTo(section);
                  if ((sData.name || sData.name === "")) {
                    if (sData.link) {
                      name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
                    }
                    else if (sData.icon) {
                      name.addClass("flexmiddle");
                      name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                      name.append(genIcon({icon : sData.icon, raw : true}));
                    }
                    else {
                      name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                    }
                  }
                  else {
                    name.text(value.name + " ");
                  }
                  name.css("white-space", "nowrap");
                }
                var edit = {
                  parent : section,
                  value : value,
                  obj : obj,
                  cmd : sData.cmd || "updateAsset",
                  disabled : scope.viewOnly,
                  style : {"width" : "100%"}
                };
                if (sData.edit instanceof Object) {
                  merge(edit, duplicate(sData.edit), true);
                }
                sData.edit.disabled = scope.viewOnly;
                var input = genInput(edit);
              }
              else {
                var bool = false;
                if (value.min != null && value.min) {
                  val.text(val.text() + value.min + "/");
                  bool = true;
                }
                if (sync.val(value) || sync.val(value) == "0") {
                  val.text(val.text() + sync.val(value));
                  bool = true;
                }
                if (value.max != null) {
                  val.text(val.text() + "/" + value.max);
                  bool = true;
                }
                if (bool) {
                  if (value.name || (sData.name || sData.name === "")) {
                    var name = $("<b>").appendTo(section);

                    if ((sData.name || sData.name === "")) {
                      if (sData.link) {
                        name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
                      }
                      else if (sData.icon) {
                        name.addClass("flexmiddle");
                        name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                        name.append(genIcon({icon : sData.icon, raw : true}));
                      }
                      else {
                        name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                      }
                    }
                    else {
                      name.text(value.name + " ");
                    }
                    name.css("white-space", "nowrap");
                  }
                  val.appendTo(section);
                }
              }
            }
            else {
              var newScope = duplicate(scope);
              newScope.viewOnly = scope.viewOnly;
              merge(newScope, sData.scope);
              for (var key in value) {
                var dat = value[key];
                if (sData.applyUI) {
                  newScope.name = key;
                  if (sData.applyUI instanceof Object) {
                    newScope.display = JSON.stringify(sData.applyUI.display);
                    newScope.display = newScope.display.replace(new RegExp("@applyKey", 'g'), key);
                    newScope.display = newScope.display.replace(new RegExp("@applyTarget", 'g'), sData.target + "." + key);
                    newScope.display = JSON.parse(newScope.display);
                    if (!sData.applyUI.list || util.contains(sData.applyUI.list, key)) {
                      if (sData.applyUI.cond == null || sync.eval(sData.applyUI.cond, scope.context)) {
                        sync.render("ui_processUI")(obj, app, newScope).appendTo(section);
                      }
                    }
                  }
                  else {
                    if (sData.applyUI.cond == null || sync.eval(sData.applyUI.cond, scope.context)) {
                      var ui = sync.render(sData.applyUI)(obj, app, newScope);
                      if (ui) {
                        ui.appendTo(section);
                      }
                    }
                  }
                }
                else {
                  var newSection = $("<div>").appendTo(section);
                  if (sData.scope && sData.scope.classes) {
                    newSection.addClass(sData.scope.classes);
                  }
                  var val = $("<text>");
                  var bool = false;
                  if (dat.min != null && dat.min) {
                    val.text(val.text() + dat.min + "/");
                    bool = true;
                  }
                  if (sync.val(dat) || sync.val(dat) == "0") {
                    val.text(val.text() + sync.val(dat));
                    bool = true;
                  }
                  if (dat.max != null) {
                    val.text(val.text() + "/" + dat.max);
                    bool = true;
                  }
                  if (bool) {
                    if (dat.name || (sData.name || sData.name === "")) {
                      var name = $("<b>").appendTo(newSection);

                      if ((sData.name || sData.name === "")) {
                        if (sData.link) {
                          name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
                        }
                        else if (sData.icon) {
                          name.addClass("flexmiddle");
                          name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                          name.append(genIcon({icon : sData.icon, raw : true}));
                        }
                        else {
                          name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
                        }
                      }
                      else if (sData.scope && sData.scope.key) {
                        name.text(key+ " ");
                      }
                      else {
                        name.text(dat.name + " ");
                      }
                    }
                    val.appendTo(newSection);
                  }
                }
              }
            }
          }
          else {
            var val = $("<text>").appendTo(section);
            val.text(sData.name);
          }
        }
      }
      else if (!sData.datalist) {
        if (sData.name || sData.link || sData.icon) {
          var name = $("<text>").appendTo(section);
          if (sData.link) {
            name = genIcon(sData.link, sync.eval((sData.name === "")?("''"):(sData.name), scope.context)).appendTo(section);
          }
          else if (sData.icon) {
            name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
            name.append(genIcon({icon : sData.icon, raw : true}));
          }
          else {
            name.text(sync.eval((sData.name === "")?("''"):(sData.name), scope.context));
          }
        }
        if (sData.ui) {
          var newScope = duplicate(sData.scope || {});
          if (newScope && newScope.viewOnly == null) {
            newScope.viewOnly = scope.viewOnly;
          }
          if (sData.passContext) {
            newScope.context = duplicate(scope.context);
          }
          sync.render(sData.ui)(obj, app, newScope).appendTo(section);
        }
        if (sData.value) {
          var value = $("<text>").appendTo(section);
          value.text(sync.eval(sData.value, scope.context));
        }
      }
      for (var j in sData.display) {
        var limit = 1;
        if (!sData.display[j].cond || sync.eval(sData.display[j].cond, scope.context)) {
          if (sData.display[j].count) { // repeated entries, mostly for dice rolling
            limit = sync.eval(sData.display[j].count, scope.context);
          }
          for (var rpCount=0; rpCount<limit; rpCount++) {
            build(sData.display[j], lastLookup+"-display-"+j).appendTo(section);
          }
        }
      }
      for (var k in sData.apps) {
        var newScope = duplicate(sData.scope || {});
        newScope.viewOnly = scope.viewOnly;
        sync.render(sData.apps[k])(obj, app, newScope).appendTo(section);
      }
    }
    return returnSection || section;
  }

  var buildResult;
  if (scope.display instanceof Object) {
    buildResult = build(scope.display, app.attr("id")+"_0");
  }
  else {
    var parsed = (scope.display || "").replace(new RegExp("href=", 'g'), "linksrc=");
    buildResult = $("<div>").addClass("fit-xy flexcolumn").append($.parseHTML(parsed));
    // parse the result to find stuff

    buildResult.find("loop").each(function(){
      var build = $(this).html();

      $(this).empty();

      var count = $(this).attr("count");
      if (isNaN(count)) {
        count = sync.eval(count, scope.context);
      }

      for (var i=0; i<count; i++) {
        var text = build.replace(new RegExp("%"+($(this).attr("replace") || "index")+"%", 'g'), i);
        text = text.replace(new RegExp("%"+("count")+"%", 'g'), count);
        $(this).append(text);
      }
    });

    buildResult.find("list").each(function(){
      var build = $(this).html();

      $(this).empty();
      if ($(this).attr("target")) {
        var value = sync.traverse(obj.data, $(this).attr("target"));
        if (value === false) {
          value = sync.traverse(obj.data, $(this).attr("target"), {});
        }

        var ignore = {};
        if ($(this).attr("ignore")) {
          var newIgnore = $(this).attr("ignore").split(",");
          for (var key in newIgnore) {
            ignore[newIgnore[key].trim()] = true;
          }
        }

        var list;
        if ($(this).attr("keys")) {
          value = $(this).attr("keys").split(",");
        }
        else {
          list = value;
        }

        for (var key in list) {
          if (!ignore[key]) {
            var text = build.replace(new RegExp("%"+($(this).attr("replace") || "index")+"%", 'g'), key);
            text = text.replace(new RegExp("%"+($(this).attr("replace") || "path")+"%", 'g'), obj.data._t + "." + $(this).attr("target") + "." + key);
            $(this).append(text);
          }
        }
      }
    });

    buildResult.find("bank").each(function(){
      var build = $(this).html();

      $(this).empty();
      if ($(this).attr("target")) {
        var value = sync.traverse(obj.data, $(this).attr("target"));
        if (value === false) {
          value = sync.traverse(obj.data, $(this).attr("target"), {});
        }

        var ignore = {};
        if ($(this).attr("ignore")) {
          var newIgnore = $(this).attr("ignore").split(",");
          for (var key in newIgnore) {
            ignore[newIgnore[key]] = true;
          }
        }

        var list;
        if ($(this).attr("keys")) {
          value = $(this).attr("keys").split(",");
        }
        else {
          list = value;
        }

        for (var key in list) {
          if (!ignore[key]) {
            var text = build.replace(new RegExp("%"+($(this).attr("replace") || "index")+"%", 'g'), key);
            text = text.replace(new RegExp("%"+($(this).attr("replace") || "path")+"%", 'g'), obj.data._t + "." + $(this).attr("target") + "." + key);
            $(this).append(text);
          }
        }
      }
    });

    buildResult.find("popout").each(function(){
      var parsed = $(this).html();

      var runReplace = /traverse{([^}]*)}/i;
      var replaced = runReplace.exec(parsed);
      var loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "traverse[{["+macro+"]}]") ;

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      runReplace = /eval{([^}]*)}/i;
      replaced = runReplace.exec(parsed);
      loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "eval[{["+macro+"]}]");

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      $(this).html(parsed);
      $(this).hide();
    });

    buildResult.find("prompt").each(function(){
      var parsed = $(this).html();

      var runReplace = /traverse{([^}]*)}/i;
      var replaced = runReplace.exec(parsed);
      var loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "traverse[{["+macro+"]}]") ;

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      runReplace = /eval{([^}]*)}/i;
      replaced = runReplace.exec(parsed);
      loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "eval[{["+macro+"]}]");

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      $(this).html(parsed);
      $(this).hide();
    });

    buildResult.find("display").each(function(){
      var parsed = $(this).html();

      var runReplace = /traverse{([^}]*)}/i;
      var replaced = runReplace.exec(parsed);
      var loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "traverse[{["+macro+"]}]") ;

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      runReplace = /eval{([^}]*)}/i;
      replaced = runReplace.exec(parsed);
      loop = 0;
      while (replaced) {
        var macro = replaced[1];
        parsed = parsed.replace(replaced[0], "eval[{["+macro+"]}]");

        replaced = runReplace.exec(parsed);
        loop++;
        if (loop > 10000) {
          break;
        }
      }

      $(this).html(parsed);
    });

    parsed = buildResult.html();

    var runReplace = /traverse{([^}]*)}/i;
    var replaced = parsed.match(runReplace);
    var loop = 0;
    while (replaced) {
      var macro = replaced[1];
      var retVal = sync.traverse(obj.data, macro);
      if (retVal === false) {
        retVal = "";
      }
      parsed = parsed.replace(replaced[0], retVal);

      replaced = parsed.match(runReplace);
      loop++;
      if (loop > 10000) {
        break;
      }
    }

    runReplace = /eval{([^}]*)}/i;
    replaced = parsed.match(runReplace);
    loop = 0;
    var macroCache = {};

    while (replaced) {
      var macro = replaced[1];
      if (!macroCache[macro]) {
        macroCache[macro] = sync.eval(macro.replace(new RegExp("&amp;", "g"), "&").replace(new RegExp("&gt;", "g"), ">").replace(new RegExp("&lt;", "g"), "<"), scope.context);
      }
      parsed = parsed.replace(replaced[0], macroCache[macro]);

      replaced = parsed.match(runReplace);
      loop++;
      if (loop > 10000) {
        break;
      }
    }

    buildResult.html(parsed);

    var liveTabs = {};

    buildResult.find("tabs").each(function(){
      var tabPrefix = $(this).attr("tab-category") || "";
      var tabSelected = $(this).attr("tab-selected") || "";
      var tabSelectedStyle = $(this).attr("tab-selected-style") || "";

      $(this).find("tab").each(function(){
        $(this).attr("name", $(this).attr("name") || ($(this).text() || "").trim());
        if (!app.attr(tabPrefix) && $(this).attr("primary")) {
          $(this).attr("class", tabSelected || $(this).attr("class") || "highlight alttext outline smooth spadding");
          $(this).attr("style", $(this).attr("style") || tabSelectedStyle);
          liveTabs[tabPrefix] = $(this).attr("name");
        }
        else if ($(this).attr("name") == app.attr(tabPrefix)){
          $(this).attr("class", tabSelected || $(this).attr("class") || "highlight alttext outline smooth spadding");
          $(this).attr("style", $(this).attr("style") || tabSelectedStyle);
          liveTabs[tabPrefix] = $(this).attr("name");
        }
        else {
          $(this).attr("class", $(this).attr("class") || "button bold outline smooth spadding");
          $(this).click(function(){
            app.attr(tabPrefix, $(this).attr("name"));
            obj.update();
          });
        }
      });
    });

    for (var key in liveTabs) {
      if (key) {
        buildResult.find("["+key+"]").each(function(){
          if ($(this).attr(key) != liveTabs[key]) {
            $(this).remove();
          }
        });
      }
    }

    buildResult.find("textarea").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      genInput({
        type : "textarea",
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly,
      }, null, $(this));
    });
    buildResult.find("input").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      var selectData;
      $(this).find("option").each(function(){
        selectData = selectData || [];
        selectData.push($(this).text());
      });

      if ($(this).attr("mod") && !(value instanceof Object)) {
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue(null, value));
      }

      genInput({
        type : $(this).attr("type"),
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        checked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("check")):(null),
        unchecked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("uncheck")):(null),
        raw : ($(this).attr("field") != "name")?($(this).attr("field")):(null),
        mod : $(this).attr("mod"),
        name : ($(this).attr("field") == "name")?(true):(null),
        list : selectData,
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly || !!$(this).attr("disabled"),
      }, null, $(this));
      if ($(this).attr("isChecked") == true || $(this).attr("isChecked") == "true"){
        $(this).prop("checked", true);
      }
    });

    buildResult.find("datalist").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      var selectData;
      $(this).find("option").each(function(){
        selectData = selectData || [];
        selectData.push($(this).attr("value") || $(this).text());
      });

      var wrap = $("<div>");

      var input = genInput({
        parent : wrap,
        classes : $(this).attr("class"),
        type : $(this).attr("type"),
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        list : selectData,
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly,
      });
      input.attr("style", $(this).attr("style"));
      $(this).replaceWith($(wrap.children()[0]));
    });


    buildResult.find("select").each(function(){
      var value = sync.traverse(obj.data, $(this).attr("target"));
      if (value === false) { // field was not found
        // obviously it belongs here
        value = sync.traverse(obj.data, $(this).attr("target"), sync.newValue());
      }

      var selectData = {};
      $(this).find("option").each(function(){
        selectData[$(this).text()] = $(this).attr("value") || $(this).text();
      });

      genInput({
        select : selectData,
        min : $(this).attr("min"),
        max : $(this).attr("max"),
        step : $(this).attr("step"),
        value : value,
        obj : obj,
        cmd : "updateAsset",
        disabled : scope.viewOnly,
      }, null, $(this));
    });
    buildResult.find("[cond]").each(function(){
      if ($(this).attr("cond") == 0 || $(this).attr("cond") == "0" || $(this).attr("cond") == "false" || !sync.eval($(this).attr("cond"), scope.context)) {
        $(this).remove();
      }
    });
    buildResult.on('click', '[edit]', function(ev){
      if (!$(this).is("input") && !$(this).is(":focus")) {
        var el = $(this);
        el.keydown(function(e) {
          // trap the return key being pressed
          if (e.keyCode === 13 && !_down[16]) {
            // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
            el.blur();
            // prevent the default behaviour of return key pressed
            return false;
          }
        });
        el.attr('contenteditable','true');
        var tgt = el.attr("edit");

        var val = sync.traverse(obj.data,tgt);

        if (val instanceof Object) {
          el.html(sync.rawVal(val));
        }
        else {
          el.html(val);
        }

        var save = function(){
            el.attr('contenteditable','false');
            if(el.html().trim().replace("\n","")=="")
            {
                el.css("min-width","10px");
                el.css("min-height","10px");
                el.css("border-bottom","1px solid");
            }

            if (val instanceof Object) {
              sync.rawVal(val, el.html().replace("<br>", ""));
            }
            else {
              sync.traverse(obj.data, tgt, el.html().replace("<br>", ""));
            }
            obj.sync("updateAsset")
            //alert("Saved!");
        };
        el.one('blur', save).focus();
      }
    });

    buildResult.find("click").each(function(){
      // prompt
      // pool
      if (!$(this).parent().attr("class") && !$(this).parent().attr("style") && !$(this).parent().is("button")) {
        $(this).parent().addClass("underline link");
      }
      var clickData = $(this);
      $(this).find("setAttr").hide();
      $(this).find("create").hide();
      $(this).find("change").hide();
      $(this).find("chat").hide();
      $(this).find("display").hide();
      $(this).find("delete").hide();
      $(this).find("prompt").hide();
      $(this).find("popout").hide();
      $(this).find("var").hide();
      $(this).find("view").hide();

      $(this).parent().click(function(ev){
        var ctx = sync.defaultContext();
        ctx[obj.data._t] = duplicate(obj.data);

        var saveTable = {};

        function execute(){
          clickData.find("create").each(function(){
            if ($(this).attr("type") && $(this).attr("target")) {
              var lookup = $(this).attr("target");
              var type = $(this).attr("type").toLowerCase();
              var lookupData = sync.traverse(obj.data, lookup);
              for (var key in game.templates.elements) {
                if (key.toLowerCase() == type) {
                  type = key;
                }
              }

              if (game.templates.elements && game.templates.elements[type]) {
                if (lookupData && lookupData instanceof Object) {
                  var newObj = duplicate(game.templates.elements[type]);
                  if (Array.isArray(lookupData)) {
                    lookupData.push(newObj);
                    obj.sync("updateAsset");
                  }
                  else {
                    ui_prompt({
                      target : app,
                      inputs : {
                        "Name" : "",
                      },
                      click : function(ev, inputs) {
                        if (inputs["Name"].val()) {
                          newObj._dropKey = inputs["Name"].val().toLowerCase().replace(/ /g,"_");
                          sync.rawVal(newObj.info.name, inputs["Name"].val());
                          lookupData[inputs["Name"].val().toLowerCase().replace(/ /g,"_")] = newObj;
                          obj.sync("updateAsset");
                        }
                      }
                    });
                  }
                }
              }
              else {
                sendAlert({text : "Element not found!"});
              }
            }
          });

          clickData.find("popout").each(function(){
            $(this).hide();
            if ($(this).attr("src")) {
              var src = $("<div>").load("/html/" + $(this).attr("src"), function(response, status, xhr) {
                $(this).find("[close]").each(function(){
                  $(this).attr("close", "sheet-popout-"+$(this).attr("id"));
                });
                var newScope = duplicate(scope);
                var parsed = $(this).html();
                var loop = 0;
                var rg =/\[{\[/;
                while (parsed.match(rg)) {
                  parsed = parsed.replace("\[{\[", "{");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }
                var rg1 = /\]}\]/;
                while (parsed.match(rg1)) {
                  parsed = parsed.replace("\]}\]", "}");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }

                newScope.display = parsed;

                var pop = ui_popOut({
                  id : "sheet-popout-"+$(this).attr("id"),
                  target : $("body"),
                  title : $(this).attr("title"),
                  style : {"width" : $(this).attr("width") || "400px", "height" : $(this).attr("height") || "400px"}
                }, sync.render("ui_processUI")(obj, app, newScope));
                pop.resizable();
              });
            }
            else {
              $(this).find("[close]").each(function(){
                $(this).attr("close", "sheet-popout-"+$(this).attr("id"));
              });
              var newScope = duplicate(scope);

              var parsed = $(this).html();
              var loop = 0;
              var rg =/\[{\[/;
              while (parsed.match(rg)) {
                parsed = parsed.replace("\[{\[", "{");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }
              var rg1 = /\]}\]/;
              while (parsed.match(rg1)) {
                parsed = parsed.replace("\]}\]", "}");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }

              newScope.display = parsed;

              var pop = ui_popOut({
                id : "sheet-popout-"+$(this).attr("id"),
                target : $("body"),
                title : $(this).attr("title"),
                style : {"width" : $(this).attr("width") || "400px", "height" : $(this).attr("height") || "400px"}
              }, sync.render("ui_processUI")(obj, app, newScope));
              pop.resizable();
            }
          });

          clickData.find("change").each(function(){
            $(this).hide();
            var lookupTarget = $(this).attr("target");
            var lookupValue = sync.traverse(obj.data, lookupTarget);

            if (lookupValue._t == "i") {
              var frame = $("<div>");
              frame.addClass("flex flexcolumn");

              game.locals["editItem"] = game.locals["editItem"] || sync.obj("editItem");
              game.locals["editItem"].data = duplicate(lookupValue);

              merge(game.locals["editItem"].data, duplicate(game.templates.item));

              var newApp = sync.newApp("ui_renderItemv2").appendTo(frame);
              newApp.attr("char-ref", obj.id());
              newApp.attr("viewOnly", scope.viewOnly);

              var split = lookupTarget.split(".");

              newApp.attr("path", lookupTarget.replace("."+split[split.length-1], ""));
              newApp.attr("index", split[split.length-1]);

              if (lookupValue._s && !hasSecurity(getCookie("UserID"), "Owner", obj.data) && !hasSecurity(getCookie("UserID"), "Rights", lookupValue))  {
                newApp.attr("viewOnly", true);
              }
              newApp.attr("local", "true");

              game.locals["editItem"].addApp(newApp);

              if (!scope.viewOnly) {
                var confirm = $("<button>").appendTo(frame);
                confirm.addClass("fit-x");
                confirm.append("Confirm");
                confirm.click(function(){
                  sync.traverse(obj.data, lookupTarget, duplicate(game.locals["editItem"].data));
                  obj.sync("updateAsset");
                  layout.coverlay("edit-item");
                });
              }
              var pop = ui_popOut({
                id : "edit-item",
                target : app,
                maximize : true,
                minimize : true,
                style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
              }, frame);
              pop.resizable();
            }
            else {
              var frame = $("<div>");
              frame.addClass("flexcolumn flex");

              var talentData = duplicate(lookupValue);

              game.locals["editTalent"] = game.locals["editTalent"] || sync.obj("editTalent");
              game.locals["editTalent"].data = duplicate(game.templates.page);
              game.locals["editTalent"].data._t = "t";

              game.locals["editTalent"].data.info.name = sync.newValue("Name", duplicate(talentData.name));
              game.locals["editTalent"].data.info.img = sync.newValue("Img", null);
              game.locals["editTalent"].data.info.notes = sync.newValue("Notes", duplicate(talentData.current));

              var newApp = sync.newApp("ui_editPage").appendTo(frame);
              newApp.attr("autosave", true);
              newApp.attr("entry", true);
              game.locals["editTalent"].addApp(newApp);

              var confirm = $("<button>").appendTo(frame);
              confirm.addClass("fit-x");
              confirm.append("Confirm");
              confirm.click(function(){
                if (sync.rawVal(game.locals["editTalent"].data.info.name)) {
                  sync.traverse(obj.data, lookupTarget+".name", duplicate(game.locals["editTalent"].data.info.name.current));
                  sync.traverse(obj.data, lookupTarget+".current", duplicate(game.locals["editTalent"].data.info.notes.current));
                  obj.sync("updateAsset");
                  layout.coverlay("edit-talent");
                }
                else {
                  sendAlert({text : "Name required"});
                }
              });

              var pop = ui_popOut({
                target : app,
                id : "edit-talent",
                style : {width : "400px", height : "400px"}
              }, frame);
              pop.resizable();
            }
          });

          clickData.find("view").each(function(){
            $(this).hide();
            var frame = $("<div>");
            frame.addClass("flexcolumn flex");

            var talentData = duplicate(sync.traverse(obj.data, $(this).attr("target")));

            var viewTalent = sync.obj("viewTalent");
            viewTalent.data = duplicate(game.templates.page);
            viewTalent.data._t = "t";
            sync.rawVal(viewTalent.data.info.name, duplicate(talentData.name));
            sync.rawVal(viewTalent.data.info.notes, duplicate(talentData.current));

            var newApp = sync.newApp("ui_renderPage").appendTo(frame);
            newApp.attr("viewOnly", true);
            viewTalent.addApp(newApp);

            var pop = ui_popOut({
              target : app,
              id : "view-talent",
              title : sync.rawVal(talentData.name),
              style : {width : "400px", height : "400px"}
            }, frame);
            pop.resizable();
          });

          clickData.find("delete").each(function(){
            $(this).hide();
            sync.traverse(obj.data, $(this).attr("target"), "");
            obj.sync("updateAsset");
          });

          var changed = false;
          clickData.find("setAttr").each(function(){
            $(this).hide();

            var calcData = {target : $(this).attr("target"), eq : $(this).attr("value"), cond : $(this).attr("condition")};

            if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
              var result = sync.eval(calcData.eq, ctx);

              var target = sync.traverse(obj.data, calcData.target);
              if (target instanceof Object) {
                sync.rawVal(target, result);
              }
              else {
                sync.traverse(obj.data, calcData.target, result);
              }
              changed = true;
            }
          });
          if (changed) {
            obj.sync("updateAsset");
          }

          clickData.find("chat").each(function(){
            $(this).hide();
            var chatObj = $(this);
            var chatData = {};
            var targets = util.getTargets();
            var varTable = duplicate(saveTable);
            $(this).find("var").each(function(){
              $.each( $(this)[0].attributes, function ( index, attribute ) {
                varTable[attribute.name] = sync.eval(attribute.value, ctx);
              });
            });
            $(this).find("pull").each(function(){
              for (var k in targets) {
                var tg = getEnt(targets[k]);
                if (tg && tg.data) {
                  $.each( $(this)[0].attributes, function ( index, attribute ) {
                    varTable[attribute.name] = sync.eval(attribute.value, {c : duplicate(tg.data)});
                  });
                }
              }
            });

            ctx.eval = varTable;
            $.each( $(this)[0].attributes, function ( index, attribute ) {
              if (attribute.name != "classes" && attribute.name != "style") {
                chatData[attribute.name] = sync.eval(attribute.value, ctx);
              }
            });

            var effectData;

            $(this).find("effect").each(function(){
              $(this).hide();
              effectData = effectData || {};
              var calcData = {target : $(this).attr("target"), eq : $(this).attr("eq"), cond : $(this).attr("cond")};

              for (var k in targets) {
                var tg = getEnt(targets[k]);
                if (tg && tg.data) {
                  effectData[targets[k]] = [];
                  if (calcData.cond == null || sync.eval(calcData.cond, ctx)) {
                    calcData.eq = sync.eval(calcData.eq, ctx);
                    effectData[targets[k]].push(calcData);
                  }
                }
              }
            });

            chatData.person = chatData.person || sync.rawVal(obj.data.info.name);
            chatData.icon = chatData.icon || sync.rawVal(obj.data.info.img);
            chatData.color = chatData.color || game.players.data[getCookie("UserID")].color;
            chatData.eID = obj.id();
            chatData.effects = effectData;

            if ($(this).attr("roll")) {
              delete chatData.eventData;
              chatData.eventData = sync.executeQuery($(this).attr("roll"), ctx);
              chatData.eventData.var = varTable;
              chatData.eventData.ui = $(this).attr("roll-ui");
            }
            else if ($(this).attr("text")) {
              chatData.text = sync.eval(chatData.text, ctx);
            }
            else {
              clickData.find("display").each(function(){
                var parsed = $(this).html();
                var loop = 0;
                var rg =/\[{\[/;
                while (parsed.match(rg)) {
                  parsed = parsed.replace("\[{\[", "{");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }
                var rg1 = /\]}\]/;
                while (parsed.match(rg1)) {
                  parsed = parsed.replace("\]}\]", "}");
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }

                var runReplace = /traverse{([^}]*)}/i;
                var replaced = parsed.match(runReplace);
                var loop = 0;
                while (replaced) {
                  var macro = replaced[1];
                  var retVal = sync.traverse(obj.data, macro);
                  if (retVal === false) {
                    retVal = "";
                  }
                  parsed = parsed.replace(replaced[0], retVal);

                  replaced = parsed.match(runReplace);
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }

                runReplace = /eval{([^}]*)}/i;
                replaced = parsed.match(runReplace);
                loop = 0;
                var macroCache = {};

                while (replaced) {
                  var macro = replaced[1];
                  if (!macroCache[macro]) {
                    macroCache[macro] = sync.eval(macro.replace(new RegExp("&amp;", "g"), "&").replace(new RegExp("&gt;", "g"), ">").replace(new RegExp("&lt;", "g"), "<"), ctx);
                  }
                  parsed = parsed.replace(replaced[0], macroCache[macro]);

                  replaced = parsed.match(runReplace);
                  loop++;
                  if (loop > 10000) {
                    break;
                  }
                }
                chatData.display = parsed;
              });
              util.unSelectTargets();
            }

            if ($(this).attr("private") && sync.eval($(this).attr("private"), ctx)) {
              var priv = {};
              priv[getCookie("UserID")] = true;
              chatData.p = priv;
            }

            $(this).find("save").each(function(){
              var tempCtx;
              if (chatData.eventData) {
                tempCtx = duplicate(ctx);
                tempCtx["pool"] = duplicate(chatData.eventData.pool);
              }

              $.each( $(this)[0].attributes, function ( index, attribute ) {
                saveTable[attribute.name] = sync.eval(attribute.value, tempCtx || ctx);
              });
            });

            runCommand("chatEvent", chatData);
          });
        }

        if (clickData.find("prompt").length) {
          if ($("#"+"sheet-popout-"+clickData.find("prompt").attr("id")).length) {
            $("#"+"sheet-popout-"+clickData.find("prompt").attr("id")+"-confirm").click();
          }
          else {
            var targets = util.getTargets();
            var varTable = duplicate(saveTable);
            $(this).find("var").each(function(){
              $.each( $(this)[0].attributes, function ( index, attribute ) {
                varTable[attribute.name] = sync.eval(attribute.value, ctx);
              });
            });
            $(this).find("pull").each(function(){
              for (var k in targets) {
                var tg = getEnt(targets[k]);
                if (tg && tg.data) {
                  $.each( $(this)[0].attributes, function ( index, attribute ) {
                    varTable[attribute.name] = sync.eval(attribute.value, {c : duplicate(tg.data)});
                  });
                }
              }
            });

            ctx.eval = varTable;

            var content = $("<div>");
            content.addClass("flexcolumn flex");

            clickData.find("prompt").each(function(){
              var parsed = $(this).html();
              var loop = 0;
              var rg =/\[{\[/;
              while (parsed.match(rg)) {
                parsed = parsed.replace("\[{\[", "{");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }
              var rg1 = /\]}\]/;
              while (parsed.match(rg1)) {
                parsed = parsed.replace("\]}\]", "}");
                loop++;
                if (loop > 10000) {
                  break;
                }
              }

              var runReplace = /traverse{([^}]*)}/i;
              var replaced = parsed.match(runReplace);
              var loop = 0;
              while (replaced) {
                var macro = replaced[1];
                var retVal = sync.traverse(obj.data, macro);
                if (retVal === false) {
                  retVal = "";
                }
                parsed = parsed.replace(replaced[0], retVal);

                replaced = parsed.match(runReplace);
                loop++;
                if (loop > 10000) {
                  break;
                }
              }

              runReplace = /eval{([^}]*)}/i;
              replaced = parsed.match(runReplace);
              loop = 0;
              var macroCache = {};

              while (replaced) {
                var macro = replaced[1];
                if (!macroCache[macro]) {
                  macroCache[macro] = sync.eval(macro.replace(new RegExp("&amp;", "g"), "&").replace(new RegExp("&gt;", "g"), ">").replace(new RegExp("&lt;", "g"), "<"), ctx);
                }
                parsed = parsed.replace(replaced[0], macroCache[macro]);

                replaced = parsed.match(runReplace);
                loop++;
                if (loop > 10000) {
                  break;
                }
              }
              content.append(parsed);
              content.find("var").each(function(){
                $.each( $(this)[0].attributes, function ( index, attribute ) {
                  saveTable[attribute.name] = sync.eval(attribute.value, ctx);
                });
              });
              content.find("pull").each(function(){
                for (var k in targets) {
                  var tg = getEnt(targets[k]);
                  if (tg && tg.data) {
                    $.each( $(this)[0].attributes, function ( index, attribute ) {
                      saveTable[attribute.name] = sync.eval(attribute.value, {c : duplicate(tg.data)});
                    });
                  }
                }
              });
            });

            content.find("userselect").each(function(){
              var style = $(this).attr("style");
              var classStyle = $(this).attr("class");
              var varName = $(this).attr("varname");
              var value = sync.eval($(this).attr("value"), ctx);
              var input = genInput({
                select : selectData,
                min : $(this).attr("min"),
                max : $(this).attr("max"),
                step : $(this).attr("step"),
                value : value,
                disabled : scope.viewOnly,
              });
              saveTable[varName] = value;

              input.attr("style", style);
              input.attr("class", classStyle);
              $(this).replaceWith(input);
              input.change(function(){
                saveTable[varName] = $(this).val();
              });
            });
            content.find("userinput").each(function(){
              var selectData;
              var style = $(this).attr("style");
              var classStyle = $(this).attr("class");

              var varName = $(this).attr("varname");
              var value = sync.eval($(this).attr("value"), ctx);
              $(this).find("option").each(function(){
                selectData = selectData || [];
                selectData.push($(this).text());
              });
              var input = genInput({
                type : $(this).attr("type"),
                min : $(this).attr("min"),
                max : $(this).attr("max"),
                step : $(this).attr("step"),
                checked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("check")):(null),
                unchecked : ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio")?($(this).attr("uncheck")):(null),
                list : selectData,
                value : value,
                disabled : scope.viewOnly,
              });
              saveTable[varName] = value;
              input.attr("style", style);
              input.attr("class", classStyle);
              $(this).replaceWith(input);
              var options = {type : $(this).attr("type"), checked : $(this).attr("check"), unchecked : $(this).attr("uncheck")};
              input.change(function(){
                if (options.type == "checkbox" || options.type == "radio") {
                  if (input.val() == options.checked) {
                    input.prop("checked", true);
                    saveTable[varName] = options.checked;
                  }
                  else {
                    input.prop("checked", false);
                    saveTable[varName] = options.unchecked;
                  }
                }
                else {
                  saveTable[varName] = $(this).val();
                }
              });
              if ($(this).attr("isChecked") == true || $(this).attr("isChecked") == "true"){
                $(this).prop("checked", true);
              }
            });

            var button = $("<button>").appendTo(content);
            button.attr("id", "sheet-popout-"+clickData.find("prompt").attr("id")+"-confirm");
            button.text("Confirm");
            button.click(function(){
              execute();
              layout.coverlay(pop);
            });

            var pop = ui_popOut({
              id : "sheet-popout-"+clickData.find("prompt").attr("id"),
              target : (clickData.find("prompt").attr("align"))?($(this).parent()):($("body")),
              title : clickData.find("prompt").attr("title"),
              align : clickData.find("prompt").attr("align"),
              style : {"width" : clickData.find("prompt").attr("width"), "height" : clickData.find("prompt").attr("height")}
            }, content);
            pop.resizable();
          }
        }
        else {
          execute();
          if ($(this).attr("close")) {
            layout.coverlay($(this).attr("close"));
          }
        }
        ev.stopPropagation();
      });
    });

    buildResult.find("ui").each(function(){
      var newScope = {};
      newScope.viewOnly = scope.viewOnly;

      $.each( $(this)[0].attributes, function ( index, attribute ) {
        if (attribute.name.match("scope-")) {
          newScope[attribute.name.replace("scope-", "")] = attribute.value;
        }
      });
      var result = sync.render($(this).attr("name"))(obj, app, newScope);
      if ($(this).attr("class")) {
        result.attr("class", $(this).attr("class"));
      }
      if ($(this).attr("style")) {
        result.attr("style", $(this).attr("style"));
      }
      $(this).replaceWith(result);
    });

    buildResult.find("list").each(function(){
      var sortTarget = $(this).attr("target");
      var sortableHook = $(this).attr("connect");
      var sortList = [".compendiumContent"];
      if (sortableHook) {
        sortList.push("list."+sortableHook);
        if (!$(this).hasClass(sortableHook)) {
          $(this).addClass(sortableHook);
        }
      }
      var div = $(this);

      $(this).children().each(function(index){
        $(this).attr("index", obj.id());
        $(this).data("item", JSON.stringify(sync.traverse(obj.data, sortTarget+"."+index)));
      });

      $(this).addClass(sortableHook);
      $(this).sortable({
        connectWith : [".dropContent", "."+sortableHook],
        over : function(ev, ui){
          if ($(ui.item).attr("index") != null && $(ui.item).attr("index") != obj.id() && $(ui.item).attr("key") != null) {
            if (!$("#"+app.attr("id")+sortableHook+"-drag-overlay").length) {
              var olay = layout.overlay({
                target : div,
                id : app.attr("id")+sortableHook+"-drag-overlay",
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
          layout.coverlay(app.attr("id")+sortableHook+"-drag-overlay");
        },
        update : function(ev, ui) {
          var newData = [];
          div.children().each(function(){
            newData.push(JSON.parse($(this).data("item")));
          });
          var value = sync.traverse(obj.data, sortTarget, newData);
          obj.sync("updateAsset");
        }
      });
    });

    buildResult.find("bank").each(function(){
      var sortTarget = $(this).attr("target");
      var sortableHook = $(this).attr("connect");
      var sortList = [".compendiumContent"];
      if (sortableHook) {
        sortList.push("bank."+sortableHook);
        if (!$(this).hasClass(sortableHook)) {
          $(this).addClass(sortableHook);
        }
      }
      var div = $(this);

      $(this).children().each(function(index){
        $(this).attr("index", obj.id());
        var list = sync.traverse(obj.data, sortTarget);
        $(this).data("item", JSON.stringify(sync.traverse(obj.data, sortTarget+"."+Object.keys(list)[index])));
        $(this).data("dropKey", sync.traverse(obj.data, sortTarget+"."+Object.keys(list)[index])._dropKey);
      });

      $(this).addClass(sortableHook);
      $(this).sortable({
        connectWith : [".dropContent", "."+sortableHook],
        over : function(ev, ui){
          if ($(ui.item).attr("index") != null && $(ui.item).attr("index") != obj.id() && $(ui.item).attr("key") != null) {
            if (!$("#"+app.attr("id")+sortableHook+"-drag-overlay").length) {
              var olay = layout.overlay({
                target : div,
                id : app.attr("id")+sortableHook+"-drag-overlay",
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
          layout.coverlay(app.attr("id")+sortableHook+"-drag-overlay");
        },
        update : function(ev, ui) {
          var newData = {};
          div.children().each(function(){
            newData[$(this).data("dropKey")] = JSON.parse($(this).data("item"));
          });
          var value = sync.traverse(obj.data, sortTarget, newData);
          obj.sync("updateAsset");
        }
      });
    });

    buildResult.find(".scroll").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
    buildResult.find(".scroll-xy").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
    buildResult.find(".scroll-x").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
    buildResult.find(".scroll-y").each(function(){
      $(this).attr("_lastScrollTop-", app.attr("_lastScrollTop-"+"idplaceholder"));
      $(this).attr("_lastScrollLeft-", app.attr("_lastScrollLeft-"+"idplaceholder"));
      $(this).scroll(function(){
        app.attr("_lastScrollTop-"+"idplaceholder", $(this).scrollTop());
        app.attr("_lastScrollLeft-"+"idplaceholder", $(this).scrollLeft());
      });
    });
  }
  return buildResult;
});

