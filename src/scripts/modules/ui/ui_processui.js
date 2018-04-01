sync.render("ui_processUI", function(obj, app, scope) {
  if (!scope.context) {
    scope.context = scope.context || sync.defaultContext();
    scope.context[obj.data._t] = duplicate(obj.data);
  }
  function build(sData, lastLookup) {
    var newScope = scope;
    var section = $("<div>");
    var returnSection;
    if (scope.markup) {
      section.attr("id", (scope.markup || "")+lastLookup);
      if (sData.display && (!sData.classes || sData.classes.match("flexcontainer"))) {
        section.css("background", "rgba(235,235,228,0.05)");
        section.css("padding-top", "24px");
        section.css("padding-left", "8px");
        section.css("padding-right", "8px");
        section.css("padding-bottom", "8px");
        section.css("border", "2px dashed rgba(55,55,55,0.2)");
        returnSection = section;

        if (sData.classes) {
          section.addClass(sData.classes);
        }

        var section = $("<div>").appendTo(section);
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
          tab.attr("tabKey", k);
          tab.text(k);
          tab.click(function(){
            tabList.children().removeClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline").addClass(sData.tabClass || "subtitle button spadding smooth");
            $(this).removeClass(sData.tabClass || "subtitle button spadding smooth").addClass(sData.selectClass || "highlight alttext subtitle spadding smooth outline");
            app.attr("tabKey", $(this).attr("tabKey"));
            content.empty();
            build(sData.tabs[$(this).attr("tabKey")], lastLookup+"-tab-"+$(this).attr("tabKey")).appendTo(content);
          });
          if (k == (app.attr("tabKey") || sData.tab)) {
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

      if (sData.click) {
        if (sData.click instanceof Object) {
          section.contextmenu(function(ev){
            if (sData.click.action) {
              var actionObj = sync.dummyObj();
              actionObj.data = {context : {c : obj.id()}, options : sData.click.options, action : sData.click.action, actionData : duplicate(game.templates.actions.c[sData.click.action] || {}),  msg : sData.click.msg};

              if (obj.data._a) {
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
            ev.stopPropagation();
            ev.preventDefault();
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
              var ctx = sync.defaultContext();
              ctx[obj.data._t] = duplicate(obj.data);

              var actions = duplicate(game.templates.actions[obj.data._t]);

              for (var actKey in obj.data._a) {
                actions[actKey] = duplicate(obj.data._a);
              }
              var actionData = actions[sData.click.action];
              var options = duplicate(sData.click.options);

              for (var i in options) {
                options[i] = sync.eval(options[i], ctx);
              }

              var final = util.injectContext(actionData.eventData.data, ctx, options);

              var eventData = {
                f : sync.rawVal(obj.data.info.name),
                icon : sData.click.icon,
                msg : sync.eval(sData.click.msg || actionData.eventData.msg, ctx),
                ui : sData.click.ui || actionData.eventData.ui,
                data : sync.executeQuery(final, ctx)
              };
              eventData.color = game.players.data[getCookie("UserID")].color;

              if (actionData.targeting) {
                var targets = util.getTargets();
                if (targets.length) {
                  var targetData = {};
                  ctx["pool"] = eventData.data.pool;
                  ctx["roll"] = eventData.data.equations[0].ctx.roll || eventData.data.pool.total;
                  ctx["total"] = eventData.data.pool.total;

                  for (var tID in targets) {
                   var index = targets[tID];
                   var ent = getEnt(index);
                   if (index != -1 && ent && hasSecurity(getCookie("UserID"), "Visible", obj.data)) {
                     ctx["tgt"] = duplicate(obj.data);
                     if (itemData) {
                       ctx["tgt_i"] = duplicate(itemData);
                     }
                     if (spellData) {
                       ctx["tgt_s"] = duplicate(spellData);
                     }
                     if (sync.eval(actionData.targeting.cond || "1", ctx)) {
                       targetData[index] = [];
                       for (var i in actionData.targeting.calc) {
                         var calcData = duplicate(actionData.targeting.calc[i]);
                         if (!calcData.cond || sync.eval(calcData.cond, ctx)) {
                           delete calcData.cond;
                           calcData.eq = sync.eval(calcData.eq, ctx);
                           if (calcData.target.substring(0, Math.min(calcData.target.length, 4)) == "tags") {
                             // apply/remove tag effects
                             if (calcData.eq) {
                               calcData.eq = 1;
                               var val = calcData.target.split(".");
                               if (val.length > 0 && val[1]) {
                                 val = val[1];
                                 // apply tag effects
                                 if (game.templates.tags[val]) {
                                   var effects = game.templates.tags[val].calc;
                                   // resolve effect
                                   for (var eid in effects) {
                                     if (!effects[eid].cond || sync.eval(effects[eid].cond, ctx)) {
                                       targetData[index].push({target : effects[eid].target, eq : sync.eval(effects[eid].eq, ctx), hide : true});
                                     }
                                   }
                                 }
                               }
                             }
                             else {
                               // remove the tag
                               calcData.eq = 0;
                               var val = calcData.target.split(".");
                               if (val.length > 0 && val[1]) {
                                 val = val[1];
                                 // apply tag effects
                                 if (game.templates.tags[val]) {
                                   var effects = game.templates.tags[val].calc;
                                   // resolve effect
                                   for (var eid in effects) {
                                     if (effects[eid].target.match(".modifiers")) {
                                       targetData[index].push({target : effects[eid].target, eq : ""});
                                     }
                                   }
                                 }
                               }
                             }
                           }
                           targetData[index].push(calcData);
                         }
                       }
                     }
                   }
                 }
                }
                eventData.targets = targetData;
              }

              runCommand("diceCheck", eventData);

             /*var eventData = {
               f : sync.rawVal(ent.data.info.name),
               icon : data.icon,
               msg : sync.eval(data.msg || flavorText.val(), ctx),
               ui : actionData.eventData.ui,
               data : sync.executeQuery(final, ctx)
             };*/

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
                        if (lookupData[inputs["Name"].val().toLowerCase()]) {
                          lookupData[inputs["Name"].val().toLowerCase()] = sync.newValue(inputs["Name"].val());
                        }
                        else {
                          lookupData[inputs["Name"].val().toLowerCase().replace(" ", "_").substring(0,Math.min(inputs["Name"].val().length, 5))] = sync.newValue(inputs["Name"].val());
                        }
                        obj.sync("updateAsset");
                      }
                    }
                  });
                }
                else if (sData.click.create == "inventory") {
                  /*var frame = $("<div>");
                  frame.addClass("flex flexcolumn");

                  game.locals["createItem"] = game.locals["createItem"] || sync.obj("createItem");
                  game.locals["createItem"].data = {};
                  merge(game.locals["createItem"].data, duplicate(game.templates.item));

                  var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                  newApp.attr("char-ref", obj.id());
                  game.locals["createItem"].addApp(newApp);

                  var buttonWrap = $("<div>").appendTo(frame);
                  buttonWrap.addClass("flexrow");

                  var confirm = $("<button>").appendTo(buttonWrap);
                  confirm.addClass("flex");
                  confirm.append("Create");
                  confirm.click(function(){
                    obj.data.inventory.push(duplicate(game.locals["createItem"].data));
                    obj.sync("updateAsset");
                  });

                  var confirm = $("<button>").appendTo(buttonWrap);
                  confirm.addClass("flex");
                  confirm.append("Create and Close");
                  confirm.click(function(){
                    obj.data.inventory.push(duplicate(game.locals["createItem"].data));
                    obj.sync("updateAsset");
                    layout.coverlay("create-item");
                  });
                  var pop = ui_popOut({
                    target : $(this),
                    align : "top",
                    id : "create-item",
                    maximize : true,
                    minimize : true,
                    style : {"width" : assetTypes["i"].width, height : assetTypes["i"].height}
                  }, frame);
                  pop.resizable();*/
                  obj.data.inventory.push(duplicate(game.templates.item));
                  obj.update();
                }
                else if (sData.click.create == "spellbook") {
                  /*var frame = $("<div>");
                  frame.addClass("flex flexcolumn");

                  game.locals["createSpell"] = game.locals["createSpell"] || sync.obj("createSpell");
                  game.locals["createSpell"].data = {};
                  merge(game.locals["createSpell"].data, duplicate(game.templates.item));

                  var newApp = sync.newApp("ui_renderItem").appendTo(frame);
                  newApp.attr("spell", "true");
                  newApp.attr("info", true);
                  newApp.attr("weapon", true);

                  game.locals["createSpell"].addApp(newApp);

                  var buttonWrap = $("<div>").appendTo(frame);
                  buttonWrap.addClass("flexrow");

                  var confirm = $("<button>").appendTo(buttonWrap);
                  confirm.addClass("flex");
                  confirm.append("Create");
                  confirm.click(function(){
                    obj.data.spellbook.push(duplicate(game.locals["createSpell"].data));
                    obj.sync("updateAsset");
                  });

                  var confirm = $("<button>").appendTo(buttonWrap);
                  confirm.addClass("flex");
                  confirm.append("Create and Close");
                  confirm.click(function(){
                    obj.data.spellbook.push(duplicate(game.locals["createSpell"].data));
                    obj.sync("updateAsset");
                    layout.coverlay("create-spell");
                  });
                  var pop = ui_popOut({
                    target : $(this),
                    id : "create-spell",
                    align : "top",
                    maximize : true,
                    minimize : true,
                    style : {"width" : "500px", height : "350px"}
                  }, frame);
                  pop.resizable();*/

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
                    target : $(this),
                    align : "top",
                    id : "edit-item",
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
                    target : $(this),
                    align : "top",
                    maximize : true,
                    minimize : true,
                    style : {"width" : assetTypes["i"].width, "height" : assetTypes["i"].height}
                  }, frame);
                  pop.resizable();
                }
                else if (sData.click.edit == "talents") {
                  var frame = layout.page({title : "Edit Talent", width : "75%", blur : 0.5, id : "edit-talent"});

                  game.locals["editTalent"] = game.locals["editTalent"] || sync.obj("editTalent");
                  game.locals["editTalent"].data = duplicate(lookupValue);

                  var newApp = sync.newApp("ui_renderTalent").appendTo(frame);
                  game.locals["editTalent"].addApp(newApp);

                  var confirm = $("<button>").appendTo(frame);
                  confirm.addClass("fit-x");
                  confirm.append("Confirm");
                  confirm.click(function(){
                    if (game.locals["editTalent"].data.name) {
                      sync.traverse(obj.data, sData.target, duplicate(game.locals["editTalent"].data));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-talent");
                    }
                    else {
                      sendAlert({text : "Name required"});
                    }
                  });
                }
                else if (sData.click.edit == "specials") {
                  var frame = layout.page({title : "Edit Special Rule", width : "75%", blur : 0.5, id : "edit-special"});

                  game.locals["editSpecial"] = game.locals["editSpecial"] || sync.obj("editSpecial");
                  game.locals["editSpecial"].data = duplicate(lookupValue);

                  var newApp = sync.newApp("ui_renderTalent").appendTo(frame);
                  newApp.attr("lookup", "specials");
                  game.locals["editSpecial"].addApp(newApp);

                  var confirm = $("<button>").appendTo(frame);
                  confirm.addClass("fit-x");
                  confirm.append("Confirm");
                  confirm.click(function(){
                    if (game.locals["editSpecial"].data.name) {
                      sync.traverse(obj.data, sData.target, duplicate(game.locals["editSpecial"].data));
                      obj.sync("updateAsset");
                      layout.coverlay("edit-special");
                    }
                    else {
                      sendAlert({text : "Name required"});
                    }
                  });
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
      if (sData.target && (!sData.click || !sData.click.edit)) {
        newScope = duplicate(scope);
        newScope.lookup = (scope.lookup || "") + sData.target;
        newScope.viewOnly = scope.viewOnly;
        merge(newScope, sData.scope);
        if (sData.ui) {
          newScope.target = sync.traverse(obj.data, newScope.lookup);
          var ui = sync.render(sData.ui)(obj, app, newScope);
          if (ui) {
            ui.appendTo(section);
          }
        }
        else {
          var value = sync.traverse(obj.data, newScope.lookup);
          if (value === false) { // field was not found
            // obviously it belongs here
             value = sync.traverse(obj.data, newScope.lookup, sync.newValue());
          }
          if (value instanceof Object) {
            if ((sData.edit || value.current != null)) {
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
                      sync.render("ui_processUI")(obj, app, newScope).appendTo(section);
                    }
                  }
                  else {
                    var ui = sync.render(sData.applyUI)(obj, app, newScope);
                    if (ui) {
                      ui.appendTo(section);
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
      else {
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
          var newScope = duplicate(sData.scope);
          if (newScope && newScope.viewOnly == null) {
            newScope.viewOnly = scope.viewOnly;
          }
          sync.render(sData.ui)(obj, app, newScope || {}).appendTo(section);
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
  return build(scope.display, app.attr("id")+"_0");
});
