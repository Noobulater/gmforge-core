sync.render("ui_tab", function(obj, app, scope){
  var div = $("<b>");
  var fallbackName = "Unnamed Tab";
  if (obj && obj.data && obj.data.info) {
    fallbackName = sync.rawVal(obj.data.info.name);
  }
  div.text((app.attr("tabName") || fallbackName));
  if (app.attr("endTime") && (Number(app.attr("endTime")) - Date.now()) > -5000) {
    function check() {
      if (app.attr("endTime") && (Number(app.attr("endTime")) - Date.now()) > -5000) {
        div.text((app.attr("tabName") || fallbackName) + " - " + String(Math.max(0, Number(app.attr("endTime")) - Date.now())/1000*60).formatTime());
        setTimeout(check, 10);
      }
      else {
        div.text((app.attr("tabName") || fallbackName));
      }
    }
    setTimeout(check(), 10);
  }

  return div;
});

sync.render("ui_displayTabs", function(obj, app, scope) {
  if (!obj) {
    game.state.addApp(app);
    return $("<div>");
  }

  game.locals["tabAttrs-"+app.attr("id")] = game.locals["tabAttrs-"+app.attr("id")] || sync.obj();
  game.locals["tabAttrs-"+app.attr("id")].data = game.locals["tabAttrs-"+app.attr("id")].data || {};

  var noTab;

  if (app.attr("tab") == null && obj.data.tabs && obj.data.tabs.length) {
    setTimeout(function(){
      for (var key in obj.data.tabs) {
        var tabData = obj.data.tabs[key];
        if (tabData && (!tabData._s || hasSecurity(getCookie("UserID"), "Visible", tabData))) {
          app.attr("tab", key);
          noTab = key;
          break;
        }
      }
      obj.update();
    }, 10);
    return $("<div>");
  }

  var del = [];
  for (var key in obj.data.tabs) {
    var tabData = obj.data.tabs[key];
    if (!tabData || (tabData.index && tabData.index != "config" && (!getEnt(tabData.index) || !(getEnt(tabData.index).data)))) {
      del.push(key);
    }
  }
  del = del.reverse();
  for (var i in del) {
    obj.data.tabs.splice(del[i],1);
  }

  var data = obj.data;
  var resourcePath = app.attr("resourcePath");
  app.removeAttr("resourcePath");

  var displayApp = $("#"+app.attr("target"));
  displayApp.addClass("white");
  displayApp.attr("currentTab", app.attr("tab"));
  displayApp.attr("displayApp", true);

  var tabData = data.tabs[app.attr("tab")];
  var filterStr = "";
  if (tabData && tabData.data && tabData.data.options) {
    for (var key in tabData.data.options.effects) {
      if (key == "hue-rotate") {
        filterStr = filterStr + " " + key + "("+tabData.data.options.effects[key]+"deg)";
      }
      else {
        filterStr = filterStr + " " + key + "("+tabData.data.options.effects[key]+"%)";
      }
    }
  }
  displayApp.css("filter", filterStr);
  displayApp.css("transition", "");

  var boardTabs = $("<div>");
  boardTabs.addClass("flexrow flexwrap dropContent");
  boardTabs.css("font-size", "1.2em");
  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    boardTabs.sortable({
      over : function(ev, ui){
        if ($(ui.item).attr("index")) {
          if (!$("#"+app.attr("id")+"-drag-overlay").length) {
            var olay = layout.overlay({
              target : app,
              id : app.attr("id")+"-drag-overlay",
              style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
            });
            olay.addClass("flexcolumn flexmiddle alttext");
            olay.css("font-size", "2em");
            olay.css("pointer-events", "none");
            olay.append("<b>Drop to Add Tab</b>");
          }
        }
      },
      out : function(ev, ui) {
        layout.coverlay(app.attr("id")+"-drag-overlay");
      },
      update : function(ev, ui) {
        if (!$(ui.item).attr("tabKey")) {
          if ($(ui.item).attr("index")) {
            if ($(ui.item).attr("src")) {
              if ($(ui.item).attr("src") == "state") {
                game.state.update(); // refresh the list
              }
              else if ($(ui.item).attr("src") == "players") {
                game.players.update(); // refresh the list
              }
              else {
                getEnt($(ui.item).attr("src")).update(); // refresh the list
              }
            }
            else {
              game.entities.update(); // refresh the list
            }

            game.state.data.tabs = game.state.data.tabs || [];
            var charObj = getEnt($(ui.item).attr("index"));
            var useTab = true;
            for (var i in game.state.data.tabs) {
              if (game.state.data.tabs[i].index == charObj.id()) {
                useTab = false;
                break;
              }
            }

            if (useTab) {
              $(ui.item).attr("default", true);
              var found = false;
              var finalOrder = [];
              boardTabs.children().each(function(){
                if (!$(this).attr("default") && $(this).attr("tabKey")){
                  finalOrder.push(game.state.data.tabs[$(this).attr("tabKey")]);
                }
                else if ($(this).attr("default") && !found) {
                  found = true;
                  if (charObj.data._t == "b") {
                    finalOrder.push({index : charObj.id(), ui : "ui_board"});
                  }
                  else if (charObj.data._t == "c") {
                    finalOrder.push({index : charObj.id(), ui : "ui_characterSheet"});
                  }
                  else if (charObj.data._t == "p") {
                    finalOrder.push({index : charObj.id(), ui : "ui_renderPage"});
                  }
                }
              });
              game.state.data.tabs = finalOrder;
              obj.sync("updateState");
            }
            else {
              sendAlert({text : "Entity already in use"});
              $(ui.item).remove();
            }
          }
        }
        else {
          var finalOrder = [];
          boardTabs.children().each(function(){
            if (!$(this).attr("default")){
              finalOrder.push(game.state.data.tabs[$(this).attr("tabKey")]);
            }
          });
          game.state.data.tabs = finalOrder;
          obj.sync("updateState");
        }
      }
    });
    boardTabs.mouseout(function(){
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });
  }

  boardTabs.css("margin-left", "1em");
  if (layout.mobile) {
    boardTabs.addClass("subtitle");
  }

  for (var key in data.tabs) {
    var tabData = data.tabs[key];
    if (tabData && (!tabData._s || hasSecurity(getCookie("UserID"), "Visible", tabData) || app.attr("forced"))) {
      var index = tabData.index;
      var tabWrapper = $("<div>").appendTo(boardTabs);
      tabWrapper.addClass("outline flexmiddle tab");
      tabWrapper.attr("tabKey", key);
      tabWrapper.css("padding", "2px");
      tabWrapper.css("min-width", "100px");
      tabWrapper.css("position", "relative");
      if (!tabData._s || tabData._s.default == 1) {
        tabWrapper.addClass("button");
      }
      else {
        tabWrapper.addClass("inactive");
      }

      if (app.attr("preview") != "true" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
        tabWrapper.attr("title", "Right click for more options");

        tabWrapper.contextmenu(function(){
          var tabIndex = $(this).attr("tabKey");

          var actionList = [];

          actionList.push({
            name : "Force Players to Tab",
            click : function(){
              runCommand("forceTab", {index : tabIndex});
            }
          });

          actionList.push({
            name : "Override Name",
            click : function(ev, ui){
              ui_prompt({
                target : ui,
                inputs : {
                  "Tab Name" : {placeholder : "Empty for default"}
                },
                click : function(ev, inputs) {
                  if (inputs["Tab Name"].val()) {
                    obj.data.tabs[tabIndex].name = inputs["Tab Name"].val();
                  }
                  else {
                    delete obj.data.tabs[tabIndex].name;
                  }
                  obj.sync("updateState");
                  layout.coverlay("tab-options");
                }
              });
            }
          });

          actionList.push({
            name : "Tab Access",
            submenu : [
              {
                name : "GM Only",
                click : function(){
                  obj.data.tabs[tabIndex]._s = obj.data.tabs[tabIndex]._s || {};
                  obj.data.tabs[tabIndex]._s["default"] = "@:gm()";
                  obj.sync("updateState");
                }
              },
              {
                name : "Everybody",
                click : function(){
                  delete obj.data.tabs[tabIndex]._s;
                  obj.sync("updateState");
                }
              },
              {
                name : "Advanced...",
                click  : function(ev, ui){
                  var content = $("<div>");
                  content.addClass("flexcolumn");

                  var tabData = data.tabs[tabIndex];

                  var securityContent = $("<div>").appendTo(content);
                  function buildSecurity() {
                    var secTbl = {};
                    secTbl[getCookie("UserID")] = 1;
                    secTbl = obj.data.tabs[tabIndex]._s || secTbl;
                    var sec = sync.render("ui_rights")(obj, app, {
                      security : secTbl,
                      change : function(ev, ui, userID, newSecurity){
                        obj.data.tabs[tabIndex]._s = obj.data.tabs[tabIndex]._s || secTbl;
                        if (userID == "default" && newSecurity === "") {
                          obj.data.tabs[tabIndex]._s[userID] = "1";
                        }
                        else {
                          obj.data.tabs[tabIndex]._s[userID] = newSecurity;
                        }
                        obj.sync("updateState");
                        securityContent.empty();
                        buildSecurity().appendTo(securityContent);
                      }
                    });
                    return sec;
                  }
                  buildSecurity().appendTo(securityContent);

                  ui_popOut({
                    target : ui,
                    prompt : true,
                    title : "Set Access",
                    id : "tab-options",
                  }, content);
                }
              }
            ]
          });

          actionList.push({
            name : "Countdown",
            submenu : [
              {
                name : "Clear Timer",
                click : function(){
                  delete obj.data.tabs[tabIndex].end;
                  obj.sync("updateState");
                }
              },
              {
                name : "5 minutes",
                click : function(){
                  obj.data.tabs[tabIndex].end = Date.now() + 5 * 60 * 1000;
                  obj.sync("updateState");
                }
              },
              {
                name : "1 minute",
                click : function(){
                  obj.data.tabs[tabIndex].end = Date.now() + 60 * 1000;
                  obj.sync("updateState");
                }
              },
              {
                name : "30 seconds",
                click : function(){
                  obj.data.tabs[tabIndex].end = Date.now() + 30 * 1000;
                  obj.sync("updateState");
                }
              },
              {
                name : "Custom",
                click : function(ev, ui) {
                  ui_prompt({
                    target : ui,
                    inputs : {
                      "Duration" : {placeholder : "Seconds"}
                    },
                    click : function(ev, inputs) {
                      if (!isNaN(inputs["Duration"].val())) {
                        obj.data.tabs[tabIndex].end = Date.now() + Number(inputs["Duration"].val()) * 1000;
                      }
                      else {
                        delete obj.data.tabs[tabIndex].end;
                      }
                      obj.sync("updateState");
                    }
                  });
                }
              }
            ]
          });
          ui_dropMenu($(this), actionList, {id: "tab-actions", align : "bottom"});
          return false;
        });
      }

      if (index != null) {
        if (index == "config") {
          var tab = $("<b>").appendTo(tabWrapper);
          tab.addClass("flex flexmiddle");

          var name = sync.newApp("ui_tab");
          name.attr("tabName", tabData.name);
          name.attr("endTime", tabData.end);
          name.css("outline", "none");

          game.state.addApp(name);

          tab.append(name);
          if (app.attr("preview") != "true" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
            var stop = genIcon("remove").appendTo(tabWrapper);
            stop.addClass("lrpadding");
            stop.attr("index", key);
            stop.click(function(){
              data.tabs = data.tabs || [];
              if (app.attr("tab") == $(this).attr("key")) {
                if (displayApp.attr("entIndex") && displayApp.attr("entIndex") != "config") {
                  var oldEnt = getEnt(displayApp.attr("entIndex"));
                  if (oldEnt) {
                    $("#board-layer-controls-"+oldEnt.id()).hide();
                    oldEnt.removeApp(displayApp);
                  }
                }
                else if (displayApp.attr("entIndex") == "config") {
                  displayApp.removeAttr("resourcePath");
                  displayApp.removeAttr("tabKey");
                  game.config.removeApp(displayApp);
                }
                else {
                  displayApp.removeAttr("tabKey");
                  game.state.removeApp(displayApp);
                }
                displayApp.removeAttr("entIndex");
              }
              data.tabs.splice($(this).attr("index"), 1);
              obj.sync("updateState");
            });
          }
          tab.hover(function(){
            $(this).parent().addClass("hover2");
          },
          function(){
            $(this).parent().removeClass("hover2");
          });

          if (app.attr("tab") == key) {
            for (var attr in game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0]) {
              displayApp.attr(attr, game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0][attr]);
            }
            game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0] = {};
            tabWrapper.addClass("highlight alttext");
            tabWrapper.removeClass("button");
            if (displayApp.attr("entIndex") && displayApp.attr("entIndex") != "config") {
              var oldEnt = getEnt(displayApp.attr("entIndex"));;
              if (oldEnt) {
                if (oldEnt.data && oldEnt.data._t == "b") {
                  $("#board-layer-controls-"+oldEnt.id()).hide();
                  runCommand("updateBoardCursor", {id : oldEnt.id(), data : {x : 0, y : 0, v : true}});
                }
                oldEnt.removeApp(displayApp);
              }
              displayApp.removeAttr("entIndex");
            }
            else if (displayApp.attr("entIndex") == "config") {
              //displayApp.removeAttr("entIndex");
              //displayApp.removeAttr("resourcePath");
              //game.config.removeApp(displayApp);
            }
            else {
              displayApp.removeAttr("tabKey");
              game.state.removeApp(displayApp);
            }
            displayApp.attr("tabKey", key);
            displayApp.attr("entIndex", tabData.index);
            displayApp.attr("resourcePath", resourcePath);
            displayApp.attr("ui-name", tabData.ui);
            game.config.addApp(displayApp);

            tabWrapper.click(function(){$(this).contextmenu();});
          }
          else {
            tabWrapper.css("color", "#333");
            tabWrapper.css("text-shadow", "0 0 1em white");
            tab.attr("tab", key)
            tab.attr("entIndex", index);
            tab.click(function(){
              function changeTab(newTab) {
                displayApp.removeAttr("background");
                displayApp.removeAttr("ignore");
                displayApp.removeAttr("printing");

                game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0] = {};
                if (document.getElementById(app.attr("target"))) {
                  var attributes = document.getElementById(app.attr("target")).attributes;
                  for (var j=0; j<attributes.length; j++) {
                    var attrib = attributes[j];
                    if (attrib.specified == true && (attrib.name == "scrolltop" || attrib.name == "scrollleft" || attrib.name == "zoom" || attrib.name == "viewonly")) {
                      game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0][attrib.name] = attrib.value;
                    }
                  }
                }
                displayApp.removeAttr("scrolLLeft");
                displayApp.removeAttr("scrollTop");
                displayApp.removeAttr("zoom");
                app.attr("tab", newTab);
                obj.update();
                layout.coverlay($(".piece-quick-edit"));
              }

              var newTab = $(this).attr("tab");
              var oldEnt = getEnt(displayApp.attr("entIndex"));
              if (oldEnt) {
                $("#board-layer-controls-"+oldEnt.id()).hide();
              }
              if (displayApp.attr("background") == "true") {
                var content = $("<div>");
                content.addClass("flexcolumn");

                var optimizer = $("<button>").appendTo(content);
                optimizer.addClass("highlight alttext hover2");
                optimizer.attr("title", "Condenses the map size down to the smallest it can be, attempts to merge 'tiled' pieces for added performance and removes duplicate tiles.");
                optimizer.append("With Optimizer");
                optimizer.click(function(){
                  if (boardApi.saveChanges(oldEnt)) {
                    displayApp.removeAttr("background");
                    displayApp.removeAttr("ignore");
                    displayApp.removeAttr("local");

                    layout.coverlay("save-changes");
                    changeTab(newTab);
                  }
                });

                var noOptimizer = $("<button>").appendTo(content);
                noOptimizer.addClass("background alttext hover2");
                noOptimizer.append("Without Optimizer");
                noOptimizer.click(function(){
                  if (boardApi.saveChanges(oldEnt, true)) {
                    displayApp.removeAttr("background");
                    displayApp.removeAttr("ignore");
                    displayApp.removeAttr("local");

                    layout.coverlay("save-changes");
                    changeTab(newTab);
                  }
                });

                var discard = $("<button>").appendTo(content);
                discard.addClass("subtitle hover2");
                discard.css("margin", "1em");
                discard.append("Discard Changes");
                discard.click(function(){
                  if (boardApi.saveChanges(oldEnt, "discard")) {
                    displayApp.removeAttr("background");
                    displayApp.removeAttr("ignore");
                    displayApp.removeAttr("local");

                    layout.coverlay("save-changes");
                    changeTab(newTab);
                  }
                });

                var pop = ui_popOut({
                  target : displayApp,
                  id : "save-changes",
                  title : "Save Changes...",
                }, content);
              }
              else {
                changeTab(newTab);
              }
            });
          }
          if (noTab != null && noTab == key) {
            tab.click();
          }
        }
        else {
          var ent = getEnt(index);
          if (ent) {
            var tab = $("<b>").appendTo(tabWrapper);
            tab.addClass("flex flexmiddle");

            var name = sync.newApp("ui_tab");
            name.attr("tabName", tabData.name);
            name.attr("endTime", tabData.end);
            name.css("outline", "none");

            ent.addApp(name);

            tab.append(name);
            if (app.attr("preview") != "true" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
              var stop = genIcon("remove").appendTo(tabWrapper);
              stop.addClass("lrpadding");
              stop.attr("index", key);
              stop.click(function(){
                data.tabs = data.tabs || [];
                if (app.attr("tab") == $(this).attr("index")) {
                  if (displayApp.attr("entIndex") && displayApp.attr("entIndex") != "config") {
                    var oldEnt = getEnt(displayApp.attr("entIndex"));
                    if (oldEnt) {
                      $("#board-layer-controls-"+oldEnt.id()).hide();
                      oldEnt.removeApp(displayApp);
                    }
                  }
                  else if (displayApp.attr("entIndex") == "config") {
                    displayApp.removeAttr("resourcePath");
                    game.config.removeApp(displayApp);
                  }
                  else {
                    displayApp.removeAttr("tabKey");
                    game.state.removeApp(displayApp);
                  }
                  displayApp.removeAttr("entIndex");
                }
                data.tabs.splice($(this).attr("index"), 1);
                obj.sync("updateState");
              });
            }
            tab.hover(function(){
              $(this).parent().addClass("hover2");
            },
            function(){
              $(this).parent().removeClass("hover2");
            });
            if (app.attr("tab") == key) {
              for (var attr in game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0]) {
                displayApp.attr(attr, game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0][attr]);
              }
              game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0] = {};
              tabWrapper.addClass("highlight alttext");
              tabWrapper.removeClass("button");
              tabWrapper.click(function(){$(this).contextmenu();});

              if (displayApp.attr("entIndex") != index) {
                if (displayApp.attr("entIndex") && displayApp.attr("entIndex") != "config") {
                  var oldEnt = getEnt(displayApp.attr("entIndex"));
                  if (oldEnt) {
                    if (oldEnt.data && oldEnt.data._t == "b") {
                      $("#board-layer-controls-"+oldEnt.id()).hide();
                      runCommand("updateBoardCursor", {id : oldEnt.id(), data : {x : 0, y : 0, v : true}});
                    }
                    oldEnt.removeApp(displayApp);
                  }
                  displayApp.removeAttr("entIndex");
                }
                else if (displayApp.attr("entIndex") == "config") {
                  game.config.removeApp(displayApp);
                  displayApp.attr("entIndex", index);
                }
                else {
                  game.state.removeApp(displayApp);
                  displayApp.attr("entIndex", index);
                }
                var newEnt = getEnt(index);
                displayApp.attr("entIndex", index);
                displayApp.attr("ui-name", tabData.ui);
                newEnt.addApp(displayApp);
              }
            }
            else {
              tabWrapper.css("color", "#333");
              tabWrapper.css("text-shadow", "0 0 1em white");
              tab.attr("tab", key)
              tab.attr("entIndex", index);
              tab.click(function(){
                function changeTab(newTab) {
                  displayApp.removeAttr("background");
                  displayApp.removeAttr("ignore");
                  displayApp.removeAttr("printing");

                  game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0] = {};
                  if (document.getElementById(app.attr("target"))) {
                    var attributes = document.getElementById(app.attr("target")).attributes;
                    for (var j=0; j<attributes.length; j++) {
                      var attrib = attributes[j];
                      if (attrib.specified == true && (attrib.name == "scrolltop" || attrib.name == "scrollleft" || attrib.name == "zoom" || attrib.name == "viewonly")) {
                        game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0][attrib.name] = attrib.value;
                      }
                    }
                  }
                  displayApp.removeAttr("scrolLLeft");
                  displayApp.removeAttr("scrollTop");
                  displayApp.removeAttr("zoom");
                  app.attr("tab", newTab);
                  obj.update();
                  layout.coverlay($(".piece-quick-edit"));
                }

                var newTab = $(this).attr("tab");
                var oldEnt = getEnt(displayApp.attr("entIndex"));
                if (oldEnt) {
                  $("#board-layer-controls-"+oldEnt.id()).hide();
                }
                if (displayApp.attr("background") == "true") {
                  var content = $("<div>");
                  content.addClass("flexcolumn");

                  var optimizer = $("<button>").appendTo(content);
                  optimizer.addClass("highlight alttext hover2");
                  optimizer.attr("title", "Condenses the map size down to the smallest it can be, attempts to merge 'tiled' pieces for added performance and removes duplicate tiles.");
                  optimizer.append("With Optimizer");
                  optimizer.click(function(){
                    if (boardApi.saveChanges(oldEnt)) {
                      displayApp.removeAttr("background");
                      displayApp.removeAttr("ignore");
                      displayApp.removeAttr("local");

                      layout.coverlay("save-changes");
                      changeTab(newTab);
                    }
                  });

                  var noOptimizer = $("<button>").appendTo(content);
                  noOptimizer.addClass("background alttext hover2");
                  noOptimizer.append("Without Optimizer");
                  noOptimizer.click(function(){
                    if (boardApi.saveChanges(oldEnt, true)) {
                      displayApp.removeAttr("background");
                      displayApp.removeAttr("ignore");
                      displayApp.removeAttr("local");

                      layout.coverlay("save-changes");
                      changeTab(newTab);
                    }
                  });

                  var discard = $("<button>").appendTo(content);
                  discard.addClass("subtitle hover2");
                  discard.css("margin", "1em");
                  discard.append("Discard Changes");
                  discard.click(function(){
                    if (boardApi.saveChanges(oldEnt, "discard")) {
                      displayApp.removeAttr("background");
                      displayApp.removeAttr("ignore");
                      displayApp.removeAttr("local");

                      layout.coverlay("save-changes");
                      changeTab(newTab);
                    }
                  });

                  var pop = ui_popOut({
                    target : displayApp,
                    id : "save-changes",
                    title : "Save Changes...",
                  }, content);
                }
                else {
                  changeTab(newTab);
                }
              });
            }
          }
          else {
            tabWrapper.remove();
          }
        }
      }
      else {
        var tab = $("<b>").appendTo(tabWrapper);
        tab.addClass("flex flexmiddle");

        var name = sync.newApp("ui_tab");
        name.attr("tabName", tabData.name);
        name.attr("endTime", tabData.end);
        name.css("outline", "none");

        game.state.addApp(name);

        tab.append(name);
        if (app.attr("preview") != "true" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
          var stop = genIcon("remove").appendTo(tabWrapper);
          stop.addClass("lrpadding");
          stop.attr("index", key);
          stop.click(function(){
            data.tabs = data.tabs || [];
            if (app.attr("tab") == key) {
              if (displayApp.attr("entIndex") && displayApp.attr("entIndex") != "config") {
                var oldEnt = getEnt(displayApp.attr("entIndex"));
                if (oldEnt) {
                  $("#board-layer-controls-"+oldEnt.id()).hide();
                  oldEnt.removeApp(displayApp);
                }
              }
              else {
                displayApp.removeAttr("tabKey");
                game.state.removeApp(displayApp);
              }
              displayApp.removeAttr("entIndex");
            }
            data.tabs.splice($(this).attr("index"), 1);
            obj.sync("updateState");
          });
        }
        tab.hover(function(){
          $(this).parent().addClass("hover2");
        },
        function(){
          $(this).parent().removeClass("hover2");
        });

        if (app.attr("tab") == key) {
          for (var attr in game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0]) {
            displayApp.attr(attr, game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0][attr]);
          }
          game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0] = {};
          tabWrapper.addClass("highlight alttext");
          tabWrapper.removeClass("button");
          if (displayApp.attr("entIndex") && displayApp.attr("entIndex") != "config") {
            var oldEnt = getEnt(displayApp.attr("entIndex"));
            if (oldEnt) {
              if (oldEnt.data && oldEnt.data._t == "b") {
                $("#board-layer-controls-"+oldEnt.id()).hide();
                runCommand("updateBoardCursor", {id : oldEnt.id(), data : {x : 0, y : 0, v : true}});
              }
              oldEnt.removeApp(displayApp);
            }
            displayApp.removeAttr("entIndex");
          }
          else if (displayApp.attr("entIndex") == "config") {
            game.config.removeApp(displayApp);
          }
          displayApp.removeAttr("entIndex");
          displayApp.attr("ui-name", tabData.ui || "ui_display");
          displayApp.attr("tabKey", app.attr("tab"));
          game.state.addApp(displayApp);

          tabWrapper.click(function(){$(this).contextmenu();});
        }
        else {
          tabWrapper.css("color", "#333");
          tabWrapper.css("text-shadow", "0 0 1em white");
          tab.attr("tab", key)
          tab.attr("entIndex", index);
          tab.click(function(){
            function changeTab(newTab) {
              displayApp.removeAttr("background");
              displayApp.removeAttr("ignore");
              displayApp.removeAttr("printing");

              game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0] = {};
              if (document.getElementById(app.attr("target"))) {
                var attributes = document.getElementById(app.attr("target")).attributes;
                for (var j=0; j<attributes.length; j++) {
                  var attrib = attributes[j];
                  if (attrib.specified == true && (attrib.name == "scrolltop" || attrib.name == "scrollleft" || attrib.name == "zoom" || attrib.name == "viewonly")) {
                    game.locals["tabAttrs-"+app.attr("id")].data[app.attr("tab") || 0][attrib.name] = attrib.value;
                  }
                }
              }
              displayApp.removeAttr("scrolLLeft");
              displayApp.removeAttr("scrollTop");
              displayApp.removeAttr("zoom");
              app.attr("tab", newTab);
              displayApp.attr("tabKey", newTab);
              obj.update();
              layout.coverlay($(".piece-quick-edit"));
            }

            var newTab = $(this).attr("tab");
            var oldEnt = getEnt(displayApp.attr("entIndex"));
            if (oldEnt) {
              $("#board-layer-controls-"+oldEnt.id()).hide();
            }
            if (displayApp.attr("background") == "true") {
              var content = $("<div>");
              content.addClass("flexcolumn");

              var optimizer = $("<button>").appendTo(content);
              optimizer.addClass("highlight alttext hover2");
              optimizer.attr("title", "Condenses the map size down to the smallest it can be, attempts to merge 'tiled' pieces for added performance and removes duplicate tiles.");
              optimizer.append("With Optimizer");
              optimizer.click(function(){
                if (boardApi.saveChanges(oldEnt)) {
                  displayApp.removeAttr("background");
                  displayApp.removeAttr("ignore");
                  displayApp.removeAttr("local");

                  layout.coverlay("save-changes");
                  changeTab(newTab);
                }
              });

              var noOptimizer = $("<button>").appendTo(content);
              noOptimizer.addClass("background alttext hover2");
              noOptimizer.append("Without Optimizer");
              noOptimizer.click(function(){
                if (boardApi.saveChanges(oldEnt, true)) {
                  displayApp.removeAttr("background");
                  displayApp.removeAttr("ignore");
                  displayApp.removeAttr("local");

                  layout.coverlay("save-changes");
                  changeTab(newTab);
                }
              });

              var discard = $("<button>").appendTo(content);
              discard.addClass("subtitle hover2");
              discard.css("margin", "1em");
              discard.append("Discard Changes");
              discard.click(function(){
                if (boardApi.saveChanges(oldEnt, "discard")) {
                  displayApp.removeAttr("background");
                  displayApp.removeAttr("ignore");
                  displayApp.removeAttr("local");

                  layout.coverlay("save-changes");
                  changeTab(newTab);
                }
              });

              var pop = ui_popOut({
                target : displayApp,
                id : "save-changes",
                title : "Save Changes...",
              }, content);
            }
            else {
              changeTab(newTab);
            }
          });
        }

        if (noTab != null && noTab == key) {
          tab.click();
        }
      }
    }
  }

  if (app.attr("preview") != "true" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var tabWrap = $("<div>").appendTo(boardTabs);
    tabWrap.addClass("flexmiddle lrpadding alttext");

    var newTab = genIcon("plus").appendTo(tabWrap);
    newTab.attr("title", "Add a new tab");
    newTab.click(function(){
      var actionList = [];

      actionList.push({
        name : "Slideshow",
        icon : "picture",
        click : function(ev, ui) {
          game.state.data.tabs.push({name : "Slideshow", data : {}});
          game.state.sync("updateState");
        }
      });

      actionList.push({
        name : "Map",
        icon : "globe",
        click : function(ev, ui) {
          var ignore = {};
          for (var i in game.state.data.tabs) {
            ignore[game.state.data.tabs[i].index] = true;
          }
          var content = sync.render("ui_assetPicker")(obj, app, {
            ignore : ignore,
            filter : "b",
            select : function(ev, ui, ent, options, entities){
              game.state.data.tabs = game.state.data.tabs || [];
              game.state.data.tabs.push({ui : "ui_board", index : ent.id()});
              game.state.sync("updateState");
              options.data.ignore = options.data.ignore || {};
              options.data.ignore[ent.id()] = true;
              return true;
            }
          });
          var pop = ui_popOut({
            target : $("body"),
            id : "add-asset",
            title : "Add Asset",
            style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
          }, content);
          pop.resizable();
        }
      });

      actionList.push({
        name : "Resource Page",
        icon : "book",
        click : function(ev, ui) {
          game.state.data.tabs = game.state.data.tabs || [];
          game.config.data.resources = game.config.data.resources || [];
          game.config.sync("updateConfig");
          game.state.data.tabs.push({name : "Resource Page", ui : "ui_resourcePage", index : "config"});
          game.state.sync("updateState");
        }
      });

      actionList.push({
        name : "Asset",
        icon : "user",
        click : function(ev, ui) {
          var ignore = {};
          for (var i in game.state.data.tabs) {
            ignore[game.state.data.tabs[i].index] = true;
          }
          var content = sync.render("ui_assetPicker")(obj, app, {
            ignore : ignore,
            select : function(ev, ui, ent, options, entities){
              game.state.data.tabs = game.state.data.tabs || [];
              game.state.data.tabs.push({ui : assetTypes[ent.data._t].handout, index : ent.id()});
              game.state.sync("updateState");
              layout.coverlay("add-asset");
            }
          });
          var pop = ui_popOut({
            target : $("body"),
            prompt : true,
            id : "add-asset",
            title : "Add Asset",
            style : {"width" : assetTypes["assetPicker"].width, "height" : assetTypes["assetPicker"].height}
          }, content);
          pop.resizable();
        }
      });

      ui_dropMenu($(this), actionList, {id : "new-tab", align : "bottom"});
    });
  }

  app.removeAttr("forced");

  return boardTabs;
});

sync.render("ui_primaryView", function(obj, app, scope) {
  app.addClass("flex flexcolumn displayApp white");
  app.attr("id", "primary-display");
  app.attr("ui-name", "ui_display");

  return $("<div>");
});


sync.render("ui_displayManager", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexbetween foreground alttext");

  var tabAppWrap = $("<div>").appendTo(optionsBar);
  var tabApp = sync.newApp("ui_displayTabs");
  tabApp.appendTo(tabAppWrap);

  var displayApp = sync.newApp("ui_display").appendTo(div);
  displayApp.addClass("flex flexcolumn displayApp white");
  displayApp.attr("preview", app.attr("preview"));
  tabApp.attr("target", displayApp.attr("id"));
  tabApp.attr("preview", app.attr("preview"));
  tabApp.attr("tab", app.attr("tab"));
  game.state.addApp(tabApp);

  return div;
});

sync.render("ui_display", function(obj, app, scope){
  if (!obj) {
    obj = game.state;
    game.state.addApp(app);
    return $("<div>");
  }
  scope = scope || {viewOnly : app.attr("viewOnly"), local : app.attr("local") == "true", tabKey : app.attr("tabKey") || 0};
  var div = $("<div>");
  div.addClass("flex flexcolumn");
  div.css("pointer-events", "auto");
  div.css("position", "relative");

  if (obj.data.tabs[scope.tabKey]) {
    obj.data.tabs[scope.tabKey].data = obj.data.tabs[scope.tabKey].data || {};
    var data = obj.data.tabs[scope.tabKey].data;

    if (!layout.mobile && hasSecurity(getCookie("UserID"), "Assistant Master")) {
      div.on("dragover", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!$("#"+app.attr("id")+"-drag-overlay").length) {
          var olay = layout.overlay({
            target : app,
            id : app.attr("id")+"-drag-overlay",
            style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
          });
          olay.addClass("flexcolumn flexmiddle alttext");
          olay.css("font-size", "2em");
          olay.append("<b>Drop to Load</b>");
        }
      });
      div.on('drop', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var dt = ev.originalEvent.dataTransfer;
        if (dt.getData("Text")) {
          var txt = dt.getData("Text");
          var actionList = [
            {
              name : "CONFIRM CHANGE",
              click : function(ev, ui) {
                ui_processLink(txt, function(link, newLink) {
                  obj.data.tabs[scope.tabKey].data = obj.data.tabs[scope.tabKey].data || {};
                  obj.data.tabs[scope.tabKey].data.media = txt;

                  game.locals["imgHistory"] = game.locals["imgHistory"] || sync.obj();
                  game.locals["imgHistory"].data = game.locals["imgHistory"].data || []
                  var imgHistory = game.locals["imgHistory"].data;

                  if (!util.contains(imgHistory, newLink)) {
                    imgHistory.push(txt);
                    game.locals["imgHistory"].update();
                  }

                  obj.sync("updateState");
                });
              }
            },
          ]
          var menu = ui_dropMenu($(this), actionList, {"id" : "confirm"});
          menu.css("left", ev.pageX - menu.width()/2);
          menu.css("top", ev.pageY - 10);
        }
        layout.coverlay(app.attr("id")+"-drag-overlay");
      });

      div.on("dragleave", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        layout.coverlay(app.attr("id")+"-drag-overlay");
      });
      div.mouseout(function(){
        layout.coverlay(app.attr("id")+"-drag-overlay");
      });
    }
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var newOptionsBar = $("<div>");
      if (!app.attr("hidemenu")) {
        newOptionsBar.appendTo(div);
      }
      newOptionsBar.addClass("flexrow flexmiddle padding");
      newOptionsBar.css("position", "absolute");
      newOptionsBar.css("left", "100px");
      newOptionsBar.css("bottom", "100px");
      newOptionsBar.css("transition", "opacity 0.5s");
      newOptionsBar.css("opacity", "0.25");
      newOptionsBar.hover(function(){
        newOptionsBar.css("opacity", "1.0");
      },
      function(){
        newOptionsBar.css("opacity", "0.25");
      });
      newOptionsBar.mousedown(function(ev){
        ev.stopPropagation();
      });
      newOptionsBar.mouseup(function(ev){
        ev.stopPropagation();
      });
      newOptionsBar.click(function(ev){
        ev.stopPropagation();
      });

      var option = $("<div>").appendTo(newOptionsBar);
      option.addClass("alttext background hover2 spadding");
      option.css("font-size", "1.2em");
      option.text("Edit Display");
      option.click(function(){
        var div = $("<div>");
        var titleInput = genInput({
          //parent: div,
          placeholder: "Enter Title",
          style: {"display": "block"},
          value: data.title,
        });

        var media = genInput({
          //parent: div,
          placeholder: "Media URL",
          value: data.media,
          style: {"display": "block"},
          paste: true,
        });

        var filterWrap = genIcon("refresh", "Reset Filters");
        filterWrap.addClass("flex flexmiddle");
        filterWrap.click(function(){
          brightness.val(100);
          contrast.val(100);
          gray.val(0);
          hue.val(0);
          invert.val(0);
          sepia.val(0);
        });

        var brightness = genInput({
          type : "range",
          value : 100,
          min : 50,
          max : 150,
        });

        var contrast = genInput({
          type : "range",
          value : 100,
          min : 50,
          max : 100,
        });

        var gray = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 100,
        });

        var hue = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 360,
        });

        var invert = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 100,
        });

        var sepia = genInput({
          type : "range",
          value : 0,
          min : 0,
          max : 100,
        });

        brightness.val(100);
        contrast.val(100);
        gray.val(0);
        hue.val(0);
        invert.val(0);
        sepia.val(0);

        if (data && data.options && data.options.filter) {
          var filters = data.options.filter;
          brightness.val(parseInt(filters["brightness"]) || 100);
          contrast.val(parseInt(filters["contrast"]) || 100);
          gray.val(parseInt(filters["grayscale"]) || 0);
          hue.val(parseInt(filters["hue-rotate"]) || 0);
          invert.val(parseInt(filters["invert"]) || 0);
          sepia.val(parseInt(filters["sepia"]) || 0);
        }

        var controls = ui_controlForm({
          inputs : {
            "Filters" : filterWrap,
            "Brightness" : brightness,
            "Grayscale" : gray,
            "Hue Shift" : hue,
            "Inverted" : invert,
            "Sepia" : sepia,
          },
          click : function(ev, inputs) {
            data.options = data.options || {};
            data.options.filter = {};
            if (brightness.val() != 100) {
              data.options.filter["brightness"] = brightness.val();
            }
            if (contrast.val() != 100) {
              data.options.filter["contrast"] = contrast.val();
            }
            if (gray.val() != 0) {
              data.options.filter["grayscale"] = gray.val();
            }
            if (hue.val() != 0) {
              data.options.filter["hue-rotate"] = hue.val();
            }
            if (invert.val() != 0) {
              data.options.filter["invert"] = invert.val();
            }
            if (sepia.val() != 0) {
              data.options.filter["sepia"] = sepia.val();
            }
            if (!scope.local) {
              ui_processLink(media.val(),function(link, newLink) {
                obj.data.tabs[scope.tabKey].data = obj.data.tabs[scope.tabKey].data || {};
                obj.data.tabs[scope.tabKey].data.media = newLink;
                obj.data.tabs[scope.tabKey].data.options = data.options;
                obj.sync("updateState");
              });
            }
            else {
              obj.update();
            }
          }
        }).appendTo(div);

        var popout = ui_popOut({
          target : $(this),
          id : "displayControls",
          align : "top"
        }, div);
      });

      game.locals["imgHistory"] = game.locals["imgHistory"] || sync.obj();
      game.locals["imgHistory"].data = game.locals["imgHistory"].data || [];

      var content = sync.newApp("ui_imgHistory").appendTo(newOptionsBar);
      content.attr("count", 6);
      content.css("outline", "none");
      game.locals["imgHistory"].addApp(content);
    }

    if (!data || !data.media) {
      div.css("background-image", "url('/content/quickstart.png')");
      div.css("background-repeat", "no-repeat");
      div.css("background-position", "center");
      div.css("webkit-box-shadow", "inset 0em 0em 1em black");
    }

    var container = $("<div>").appendTo(div);
    container.addClass("flex flexcolumn flexmiddle dropContent");
    container.sortable({
      handle : ".tab",
      over : function(ev, ui){
        if ($(ui.item).attr("index")) {
          if (!$("#"+app.attr("id")+"-drag-overlay").length) {
            var olay = layout.overlay({
              target : app,
              id : app.attr("id")+"-drag-overlay",
              style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
            });
            olay.addClass("flexcolumn flexmiddle alttext");
            olay.css("font-size", "2em");
            olay.css("pointer-events", "none");
            olay.append("<b>Drop to Display</b>");
          }
        }
      },
      out : function(ev, ui) {
        layout.coverlay(app.attr("id")+"-drag-overlay");
      },
      update : function(ev, ui) {
        container.empty();
        if ($(ui.item).attr("src")) {
          if ($(ui.item).attr("src") == "state") {
            game.state.update(); // refresh the list
          }
          else if ($(ui.item).attr("src") == "players") {
            game.players.update(); // refresh the list
          }
          else {
            game.entities.data[$(ui.item).attr("src")].update(); // refresh the list
          }
        }
        else {
          game.entities.update(); // refresh the list
        }
        // create a piece if there is an entity reference
        var ent = game.entities.data[$(ui.item).attr("index")];
        if (ent && hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
          if (ent.data._t == "p") {
            obj.data.tabs[scope.tabKey].data = obj.data.tabs[scope.tabKey].data || {};
            obj.data.tabs[scope.tabKey].data.media = ent.id();
            obj.sync("updateState");
          }
          else {
            ui_processLink((sync.val(ent.data.info.img) || "/content/icons/blankchar.png"), function(link, newLink) {
              obj.data.tabs[scope.tabKey].data = obj.data.tabs[scope.tabKey].data || {};
              obj.data.tabs[scope.tabKey].data.media = newLink;

              game.locals["imgHistory"] = game.locals["imgHistory"] || sync.obj();
              game.locals["imgHistory"].data = game.locals["imgHistory"].data || []
              var imgHistory = game.locals["imgHistory"].data;

              if (!util.contains(imgHistory, newLink)) {
                imgHistory.push(newLink);
                game.locals["imgHistory"].update();
              }

              obj.sync("updateState");
            });
          }
        }
        layout.coverlay(app.attr("id")+"-drag-overlay");
      }
    });
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      container.css("cursor", "pointer");
      container.click(function(){
        if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
          var content = sync.render("ui_filePicker")(obj, app, {
            value : data.media,
            allowExternal : true,
            change : function(ev, ui, val){
            ui_processLink(val, function(link, newLink) {
              obj.data.tabs[scope.tabKey].data = obj.data.tabs[scope.tabKey].data || {};
              obj.data.tabs[scope.tabKey].data.media = newLink;

              game.locals["imgHistory"] = game.locals["imgHistory"] || sync.obj();
              game.locals["imgHistory"].data = game.locals["imgHistory"].data || []
              var imgHistory = game.locals["imgHistory"].data;

              if (!util.contains(imgHistory, newLink)) {
                imgHistory.push(newLink);
                game.locals["imgHistory"].update();
              }

              obj.sync("updateState");
              layout.coverlay("narrative-picker")
            });
          }});

          var pop = ui_popOut({
            id : "narrative-picker",
            prompt : true,
            target : $(this),
            style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
          }, content);
          pop.resizable();
        }
      });
      container.contextmenu(function(ev){
        var actionList = [];

        if (app.attr("hidemenu")) {
          actionList.push({
            name : "Show Menu",
            click : function(){
              app.removeAttr("hidemenu");
              obj.update();
            },
          });
        }
        else {
          actionList.push({
            name : "Hide Menu",
            click : function(){
              app.attr("hidemenu", true);
              obj.update();
            },
          });
        }

        actionList.push({
          name : "Recent Displays",
          click : function(){
            if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
              game.locals["imgHistory"] = game.locals["imgHistory"] || sync.obj();
              game.locals["imgHistory"].data = game.locals["imgHistory"].data || []
              var imgHistory = game.locals["imgHistory"].data;
              if (imgHistory.length) {
                var content = sync.newApp("ui_imgHistory");
                game.locals["imgHistory"].addApp(content);
                var pop = ui_popOut({
                  target : container,
                  title : "Recent",
                  id : "img-history",
                }, content);
                pop.resizable();
              }
              else {
                container.click();
              }
              ev.preventDefault();
              ev.stopPropagation();
            }
          }
        });

        actionList.push({
          name : "Force Players to Tab",
          click : function(){
            runCommand("forceTab", {index : scope.tabKey});
          }
        })

        ui_dropMenu($(this), actionList, {"id" : "display-context", align : "center"});
        return false;
      });
    }

    container.bind("paste", function(e) {
      // access the clipboard using the api
      // firefox won;t call this if ctrl shift + v
      if (!e.originalEvent.clipboardData.getData('text')) {
        sendAlert({text : "Image Link must be a URL"});
        return;
      }
      if (!_down["16"] && hasSecurity(getCookie("UserID"), "Assistant Master")) {
        ui_processLink(e.originalEvent.clipboardData.getData('text'),function(link, newLink) {
          obj.data.tabs[scope.tabKey].data = obj.data.tabs[scope.tabKey].data || {};
          obj.data.tabs[scope.tabKey].data.media = newLink;
          obj.sync("updateState");
        });
      }
      else if (hasSecurity(getCookie("UserID"), "Trusted Player")) {
        if (getCookie("disableReactions") != "true") {
          ui_processLink(e.originalEvent.clipboardData.getData('text'),function(link, newLink) {
            runCommand("reaction", newLink);
          });
        }
      }
    });

    if (data && data.media) {
      if (isNaN(data.media)) {
        var media = ui_processMedia(data.media, {parent : container, disabled : true});
        if (!media.is("img")) {
          media.attr("loop", true);

          // media captures all keyboard inputs without permission
          function play(media, delay) { // firefox has to start on the next frame
            setTimeout(function() {
              media.play();
            }, delay);
          }
          play(media[0], 10);
        }
        else {
          div.css("background-image", "url('"+ media.attr("src") +"')");
          div.css("background-size", "contain");
          div.css("background-repeat", "no-repeat");
          div.css("background-position", "center");
          div.css("webkit-box-shadow", "inset 0em 0em 1em black");
          media.remove();
        }
      }
      else {
        var ent = game.entities.data[data.media];
        var newApp = sync.newApp("ui_renderPage");
        newApp.attr("viewOnly", true);
        newApp.addClass("fit-x");
        newApp.css("text-align", "left");
        container.append(newApp);
        ent.addApp(newApp);
      }
    }
    if (data && data.text && data.credits && data.preface) {
      setTimeout(function() {
        var img = false;
        if (!container.children().length) {
          img = true;
        }

        var finalWrapper = $("<div>").appendTo(container);
        finalWrapper.css("position", "absolute");
        finalWrapper.css("width", container.outerWidth());
        finalWrapper.css("height", container.outerHeight());

        var creditsWrapper = $("<div>").appendTo(finalWrapper);
        creditsWrapper.css("width", container.outerWidth());
        creditsWrapper.css("height", container.outerHeight());
        creditsWrapper.css("overflow", "hidden");
        creditsWrapper.css("position", "relative");
        creditsWrapper.css("background-color", "none");
        if (img) {
          creditsWrapper.css("background-image", "url('"+ data.media +"')");
        }
        creditsWrapper.css("background-size", "cover");
        creditsWrapper.css("background-repeat", "no-repeat");
        creditsWrapper.css("background-position", "center");

        var preface = $("<div>").appendTo(creditsWrapper);
        preface.addClass("flexcolumn flexmiddle");
        preface.css("position", "absolute");
        preface.css("width", "100%");
        preface.css("height", "100%");
        preface.css("font-family", "StarJedi");
        preface.css("font-weight", "bold");
        preface.css("color", "white");

        var title = $("<div>").appendTo(preface);
        title.css("color", "rgb(75, 213, 238)");
        title.css("font-size", "2em");
        var split = data.preface.split("\n");
        var str = "";
        for (var i=0; i<split.length; i++) {
          str = str + (split[i] || "").trim() + "<br>";
        }
        title.append(str);

        setTimeout(function() {
          title.animate({
            opacity : 0,
          }, 1000, function(){
            preface.empty();
            var title = $("<div>").appendTo(preface);
            title.css("font-family", "StarJedi");
            title.css("font-weight", "bold");
            title.css("text-align", "center");
            title.css("color", "rgba(99, 207, 99, 1.0)");
            title.css("transform", "scale(2)");
            title.css("font-size", "6em");
            title.css("transition", "transform 7s");
            var split = data.credits.split("\n");
            var str = "";
            for (var i=0; i<split.length; i++) {
              str = str + (split[i] || "").trim() + "<br>";
            }
            title.append(str);

            setTimeout(function(){title.css("transform", "scale(0)");},100);
            setTimeout(function(){
              title.animate({
                opacity : 0,
              }, 2000, "linear", function() {
                var creditsDiv = $("<div>").appendTo(creditsWrapper);
                creditsDiv.addClass("flexcolumn flexmiddle");
                creditsDiv.css("overflow", "hidden");
                creditsDiv.css("color", "white");
                creditsDiv.css("width", "100%");
                creditsDiv.css("height", creditsWrapper.outerHeight());
                creditsDiv.css("position", "relative");
                creditsDiv.css("-webkit-transform", "perspective(300px) rotateX(25deg)");
                creditsDiv.css("transform", "perspective(300px) rotateX(25deg)");

                var para = $("<div>").appendTo(creditsDiv);
                para.css("position", "absolute");
                para.css("width", "50%");
                para.css("overflow-y", "visible");
                para.css("font-weight", "bold");

                var split = data.text.split("\n");

                var text = $("<h3>").appendTo(para);
                text.addClass("flexmiddle");
                text.css("font-family", "StarJedi");
                text.text((split[0] || "").trim());

                var text = $("<h4>").appendTo(para);
                text.addClass("flexmiddle");
                text.css("font-family", "StarJedi");
                text.text((split[1] || "").trim());

                var text = $("<p>").appendTo(para);
                var str = "";
                for (var i=2; i<split.length; i++) {

                  str = str + (split[i] || "").trim() + "<br>";
                }
                text.append(str);
                para.css("top", "80%");
                para.animate({
                  top : "-"+para.outerHeight()+"px",
                }, Math.max(Math.max(para.outerHeight()-creditsDiv.outerHeight(), 0)/18 * 1000 + creditsDiv.outerHeight()/18 * 500, 20000), "linear", function() {
                  layout.coverlay(creditsWrapper, 2000);
                });
              });
            },4000);
          });
        },5000);
      },100);
    }

    if (data && data.options) {
      var filterStr = "";
      for (var key in data.options.filter) {
        if (key == "hue-rotate") {
          filterStr = filterStr + " " + key + "("+data.options.filter[key]+"deg)";
        }
        else {
          filterStr = filterStr + " " + key + "("+data.options.filter[key]+"%)";
        }
      }
      div.addClass("white effect-container effect-container-"+scope.tabKey);
      if (data.options.effects) {
        var filterStr = "";
        for (var key in data.options.effects) {
          if (key == "hue-rotate") {
            filterStr = filterStr + " " + key + "("+data.options.effects[key]+"deg)";
          }
          else {
            filterStr = filterStr + " " + key + "("+data.options.effects[key]+"%)";
          }
        }
      }

      div.css("background-color", "rgb(255,255,255)");
      div.css("-webkit-filter", filterStr);
      div.css("filter", filterStr);
    }

    if (data && data.title) {
      var title = $("<div>").appendTo(div);
      title.addClass("flexmiddle");
      title.addClass("outline");
      title.css("background-color", "white");
      title.css("font-size", "2em");
      title.append(data.title);
    }

    function check(timer, timeIndex) {
      if (timer) {
        var timeData = data.timers[timeIndex];
        if ((timeData.endTime - dateCorrected()) > 0) {
          timer.text(String(Math.floor((timeData.endTime-dateCorrected(-500))/1000)).formatTime());
          setTimeout(function() {check(timer, timeIndex);}, 50);
          return true;
        }
        else {
          if (timeData.endTime - dateCorrected() > -1500) {
            timer.text("0".formatTime());
            setTimeout(function() {check(timer, timeIndex);}, 1000);
            return true;
          }
          else {
            timer.parent().remove();
            return true;
          }
        }
      }
    }

    var timerDiv = $("<div>").appendTo(div);
    timerDiv.addClass("flexmiddle");
    if (data) {
      for (var index in data.timers) {
        var timerData = data.timers[index];
        if (timerData.endTime - dateCorrected() > -1500) {
          var timer = $("<div>").appendTo(timerDiv);
          timer.addClass("outline");
          timer.css("display", "inline");
          timer.css("background-color", "white");

          var optionsBar = $("<div>").appendTo(timer);
          optionsBar.addClass("flexmiddle");

          var deleteButton = genIcon("trash").appendTo(optionsBar);
          deleteButton.attr("index", index);
          deleteButton.click(function() {
            runCommand("destroyDisplayCountdown", {index : $(this).attr("index")})
          });

          if (timerData.label) {
            optionsBar.append("<b>"+ timerData.label +"</b>");
          }

          var label = $("<b>").appendTo(timer);
          label.css("font-size", "2em");
          if (!check(label, index)) {
            timer.remove();
          };
        }
      }
    }

    /*var paintOverlay = $("<canvas>");

    if (game.locals["drawing"] && game.locals["drawing"].data.target == app.attr("id")) {


      container.mousedown(function(ev){
        var x = (ev.offsetX);
        var y = (ev.offsetY);
        paintOverlay.attr("start-x", x);
        paintOverlay.attr("start-y", y);
      });
      container.mousemove(function(ev){
        var x = (ev.offsetX);
        var y = (ev.offsetY);
        updateCursorCheck({id : obj.id(), data : {x : x / zoom, y : y / zoom, v : (app.attr("hideCursor") == "true")}});

        var cX = Number(paintOverlay.attr("start-x"))
        var cY = Number(paintOverlay.attr("start-y"));
        paintOverlay.clearCanvas();
        paintOverlay.drawLine({
          strokeStyle: game.locals["drawing"].data.c,
          strokeWidth: 3,
          x1: cX, y1: cY,
          x2: x, y2: y,
        });
      });
      container.mouseup(function(ev){
        var cX = Number(paintOverlay.attr("start-x"));
        var cY = Number(paintOverlay.attr("start-y"));
        var x = (ev.offsetX);
        var y = (ev.offsetY);
        paintOverlay.removeAttr("start-x");
        paintOverlay.removeAttr("start-y");
        // save some shit i think

        if (!scope.local) {
          runCommand("boardAddStroke", {id : obj.id(), data : {
              c : game.locals["drawing"].data.c, w : 3,
              x1 : cX, y1 : cY,
              x2 : x, y2 : y,
            }
          });
        }
        else {
          data.strokes = data.strokes || [];
          data.strokes.push({
            c : game.locals["drawing"].data.c, w : 3,
            x1 : cX, y1 : cY,
            x2 : x, y2 : y,
            u : getCookie("UserID")
          });
          obj.update();
        }
      });
    }

    if (data.strokes && $("#board-"+obj.id()+"-stroke-limit").length) {
      $("#board-"+obj.id()+"-stroke-limit").text(data.strokes.length+"/"+game.config.data.decorLimit);

        paintOverlay.appendTo(container);
        paintOverlay.css("pointer-events", "none");
        paintOverlay.css("position", "absolute");
        paintOverlay.attr("width", container.w * zoom);
        paintOverlay.attr("height", container.h * zoom);

        for (var key in data.strokes) {
          var p = data.strokes[key];
          paintOverlay.drawLine({
            strokeStyle: p.c,
            strokeWidth: p.w  * zoom,
            x1 : p.x1 * zoom, y1 : p.y1 * zoom,
            x2 : p.x2 * zoom, y2 : p.y2 * zoom,
          });
        }
    }*/
  }

  return div;
});

sync.render("ui_imgHistory", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("flexrow flexwrap flexbetween");

  var imgHistory = obj.data;

  var count = app.attr("count") || imgHistory.length;

  for (var i=imgHistory.length-1; i>=Math.max((imgHistory.length)-count, 0); i--) {
    var media = ui_processMedia(imgHistory[i]);
    media.addClass("hover2");
    media.appendTo(div);
    media.attr("srcMedia", imgHistory[i]);
    media.attr("height", "50px");
    media.click(function(){
      util.slideshow($(this).attr("srcMedia"));
    });
    media.bind("error", function(){
      media.remove();
    });
    if (media.is("img")) {
      media.contextmenu(function(ev){
        assetTypes["img"].contextmenu(ev, $(this), $(this).attr("srcMedia"));
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      });
    }
  }

  return div;
});
