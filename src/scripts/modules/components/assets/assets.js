var assetTypes = {
  "filePicker" : {
    width : "600px",
    height : "600px"
  },
  "assetPicker" : {
    width : "400px",
    height : "400px"
  },
  "audio" : {
    files : [
      "mp3",
      "wav",
      "ogg",
    ],
  },
  "video" : {
    files : [
      "mp4",
      "ogg",
      "webm",
    ],
  },
  "img" : {
    files : [
      "png",
      "jpg",
      "jpeg",
      "bmp",
      "ico",
      "apng",
      "gif"
    ],
    preview : function(ev, plate, src){
      var overlay = layout.overlay({
        target : $("body"),
          style : {
            "background-color" : "rgba(0,0,0,0.8)",
            "cursor" : "pointer",
            "pointer-events" : "auto"
          },
        }
      );
      overlay.addClass("flexmiddle lpadding");
      var max = util.getMaxZ(".ui-popout");
      overlay.css("z-index", max+1);

      var imgContainer = $("<div>").appendTo(overlay);
      imgContainer.css("background-image", "url('"+ src +"')");
      imgContainer.css("background-size", "contain");
      imgContainer.css("background-repeat", "no-repeat");
      imgContainer.css("background-position", "center");
      imgContainer.css("width", "70%");
      imgContainer.css("height", "70%");

      overlay.click(function() {
        layout.coverlay($(this), 500);
      });
    },
    contextmenu : function(ev, plate, src){
      var actionsList = [
        {
          name : "View Image",
          click : function(ev, ui) {
            // save aspect ratio

            var overlay = layout.overlay({
              target : $("body"),
                style : {
                  "background-color" : "rgba(0,0,0,0.8)",
                  "cursor" : "pointer",
                  "pointer-events" : "auto"
                },
              }
            );
            overlay.addClass("flexmiddle lpadding");
            var max = util.getMaxZ(".ui-popout");
            overlay.css("z-index", max+1);

            var imgContainer = $("<div>").appendTo(overlay);
            imgContainer.css("background-image", "url('"+ src +"')");
            imgContainer.css("background-size", "contain");
            imgContainer.css("background-repeat", "no-repeat");
            imgContainer.css("background-position", "center");
            imgContainer.css("width", "70%");
            imgContainer.css("height", "70%");

            overlay.click(function() {
              layout.coverlay($(this), 500);
            });

            imgContainer.click(function() {
              var applied = false;
              $(".application[ui-name='ui_display']").each(function(){
                if (!applied && $(this).attr("tabKey") != null) {
                  util.slideshow(src);
                  ev.stopPropagation();
                  ev.preventDefault();
                }
              });
              layout.coverlay($(this), 500);
            });
          }
        }
      ];
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        actionsList.push({
          name : "Slideshow Image",
          click : function(ev, ui) {
            util.slideshow(src);
          }
        });
      }
      actionsList.push({
        name : "Share Image",
        click : function(ev, ui) {
          runCommand("reaction", src);
        }
      });
      actionsList.push({
        name : "Copy Image",
        click : function(ev, ui) {
          var input = genInput({
            parent : ui,
            id : "copy-url",
            value : src,
          });
          input.focus();
          input.get(0).setSelectionRange(0, input.val().length);

          document.execCommand("copy");
          input.remove();
          sendAlert({text : "Image Copied!"});
        }
      });
      return ui_dropMenu(plate, actionsList, {id : "image-menu"});
    }
  },
  "c" : {
    n : "Actors",
    i : "user",
    ui : "ui_characterSheet",
    width : "750px",
    height : "800px",
    edit : function(ent, target, align, title, prompt) {
      var content = sync.newApp(assetTypes["c"].ui);
      content.attr("from", "ui_characterSummary");
      content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
      ent.addApp(content);

      var popout = ui_popOut({
        title : title || sync.rawVal(ent.data.info.name),
        target : target,
        align : align,
        minimize : true,
        maximize : true,
        dragThickness : "0.5em",
        resizable : true,
        style : {width : assetTypes["c"].width, height : assetTypes["c"].height},
      }, content);
      popout.resizable();
      return popout;
    },
    preview : function(ent, target, align, title, prompt, ui) {
      if (layout.mobile) {
        $("#viewPort").children().each(function(){
          $(this).hide();
        });
        $("#preview-app").show();
        $("#preview-app").empty();
        var content = sync.newApp(ui || assetTypes["c"].ui).appendTo($("#preview-app"));
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);
      }
      else {
        var content = sync.newApp(assetTypes["c"].ui);
        content.attr("from", "ui_characterSummary");
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);

        var popout = ui_popOut({
          title : title || sync.rawVal(ent.data.info.name),
          target : target,
          align : align,
          prompt : prompt,
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {width : assetTypes["c"].width, height : assetTypes["c"].height},
        }, content);
        popout.resizable();
        return popout;
      }
    },
    summary : function(ent, target, align, title, prompt, ui) {
      if (!game.templates.display.sheet.summary) {
        return assetTypes["c"].preview(ent, target, align, title, prompt, ui);
      }
      else if (layout.mobile) {
        $("#viewPort").children().each(function(){
          $(this).hide();
        });
        $("#preview-app").show();
        $("#preview-app").empty();
        var content = sync.newApp(ui || assetTypes["c"].ui).appendTo($("#preview-app"));
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);
        return null;
      }
      else {
        var content = sync.newApp("ui_characterSummary");
        content.attr("from", "ui_characterSheet");
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);

        var popout = ui_popOut({
          title : title || sync.rawVal(ent.data.info.name),
          target : target,
          align : align,
          prompt : prompt,
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
        }, content);
        popout.resizable();
        return popout;
      }
    }
  },
  "b" : {
    n : "Maps",
    i : "globe",
    ui : "ui_board",
    width : "60vw",
    height : "60vh",
    edit : function(ent, target, align, title, prompt) {
      var content = sync.newApp(assetTypes["b"].ui);
      content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
      ent.addApp(content);

      var popout = ui_popOut({
        title : title || sync.rawVal(ent.data.info.name),
        target : target,
        align : align,
        prompt : prompt,
        minimize : true,
        maximize : true,
        dragThickness : "0.5em",
        resizable : true,
        style : {width : assetTypes["b"].width, height : assetTypes["b"].height},
      }, content);
      popout.resizable();
      return popout;
    },
    preview : function(ent, target, align, title, prompt) {
      if (layout.mobile) {
        $("#viewPort").children().each(function(){
          $(this).hide();
        });
        $("#preview-app").show();
        $("#preview-app").empty();
        var content = sync.newApp(assetTypes["b"].ui).appendTo($("#preview-app"));
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);
      }
      else {
        var content = sync.newApp(assetTypes["b"].ui);
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);

        var popout = ui_popOut({
          title : title || sync.rawVal(ent.data.info.name),
          target : target,
          align : align,
          prompt : prompt,
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {width : assetTypes["b"].width, height : assetTypes["b"].height},
        }, content);
        popout.resizable();
        return popout;
      }
    }
  },
  "i" : {
    n : "Items/Spells",
    i : "briefcase",
    ui : "ui_renderItem",
    width : "600px",
    height : "400px",
    edit : function(ent, target, align, title, prompt) {
      var content = sync.newApp(assetTypes["i"].ui);
      content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
      ent.addApp(content);

      var popout = ui_popOut({
        title : title || sync.rawVal(ent.data.info.name),
        target : target,
        align : align,
        prompt : prompt,
        minimize : true,
        maximize : true,
        dragThickness : "0.5em",
        resizable : true,
        style : {width : assetTypes["i"].width, height : assetTypes["i"].height},
      }, content);
      popout.resizable();
      return popout;
    },
    preview : function(ent, target, align, title, prompt) {
      if (layout.mobile) {
        $("#viewPort").children().each(function(){
          $(this).hide();
        });
        $("#preview-app").show();
        $("#preview-app").empty();
        var content = sync.newApp(assetTypes["i"].ui).appendTo($("#preview-app"));
        content.attr("from", "ui_characterSummary");
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);
      }
      else {
        var content = sync.newApp(assetTypes["i"].ui);
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);

        var popout = ui_popOut({
          title : title || sync.rawVal(ent.data.info.name),
          target : target,
          align : align,
          prompt : prompt,
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {width : assetTypes["i"].width, height : assetTypes["i"].height},
        }, content);
        popout.resizable();
        return popout;
      }
    }
  },
  "p" : {
    n : "Resources",
    i : "file",
    ui : "ui_editPage",
    handout : "ui_renderPage",
    width : "600px",
    height : "800px",
    edit : function(ent, target, align, title, prompt) {
      var content = sync.newApp("ui_editPage");
      ent.addApp(content);
      var popout = ui_popOut({
        title : title || sync.rawVal(ent.data.info.name),
        target : target,
        align : align,
        prompt : prompt,
        minimize : true,
        maximize : true,
        dragThickness : "0.5em",
        resizable : true,
        style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
      }, content);
      popout.resizable();
      return popout;
    },
    preview : function(ent, target, align, title, prompt) {
      if (layout.mobile) {
        $("#viewPort").children().each(function(){
          $(this).hide();
        });
        $("#preview-app").show();
        $("#preview-app").empty();
        var content = sync.newApp(assetTypes["p"].ui).appendTo($("#preview-app"));
        content.attr("from", "ui_renderPage");
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);
      }
      else {
        var content = sync.newApp("ui_renderPage");
        content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
        ent.addApp(content);
        var popout = ui_popOut({
          title : title || sync.rawVal(ent.data.info.name),
          target : target,
          align : align,
          prompt : prompt,
          minimize : true,
          maximize : true,
          dragThickness : "0.5em",
          resizable : true,
          style : {width : assetTypes["p"].width, height : assetTypes["p"].height},
        }, content);
        popout.resizable();
        return popout;
      }
    }
  },
  contextmenu : function(ev, plate, ent, app, scope){
    var type = ent.data._t;

    var actionList = scope.contextmenu || [];

    if (ent.data._t == "b" && hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var tabs = game.state.data.tabs;
      var active;
      for (var i in tabs) {
        if (ent.id() == tabs[i].index) {
          active = i;
          break;
        }
      }
      var submenu;
      if (active) {
        submenu = [{
          name : "Switch to Tab",
          click : function(){
            if (app.attr("targetApp") && $("#"+app.attr("targetApp")).length) {
              $("#"+app.attr("targetApp")).removeAttr("scrollLeft");
              $("#"+app.attr("targetApp")).removeAttr("scrollTop");
              $("#"+app.attr("targetApp")).removeAttr("zoom");
            }
            for (var i in game.state._apps) {
              if ($("#"+game.state._apps[i]).length) {
                $("#"+game.state._apps[i]).attr("tab", active);
              }
            }
            game.state.update();
          }
        },
        {
          name : "Force Players to Tab",
          click : function() {
            runCommand("forceTab", {index : active});
          }
        }];
      }
      else {
        submenu = [
          {
            name : "Players",
            click : function(){
              game.state.data.tabs = game.state.data.tabs || [];
              var useTab = true;
              for (var i in game.state.data.tabs) {
                if (game.state.data.tabs[i].index == ent.id()) {
                  useTab = false;
                  break;
                }
              }

              if (useTab) {
                game.state.data.tabs.push({index : ent.id(), ui : "ui_board"});
                game.state.sync("updateState");
              }
              else {
                sendAlert({text : "Map already in use"});
              }
            }
          },
          {
            name : "GM Only",
            click : function(){
              game.state.data.tabs = game.state.data.tabs || [];
              var useTab = true;
              for (var i in game.state.data.tabs) {
                if (game.state.data.tabs[i].index == ent.id()) {
                  useTab = false;
                  break;
                }
              }

              if (useTab) {
                game.state.data.tabs.push({index : ent.id(), ui : "ui_board", _s : {"default" : "@:gm()"}});
              }
              else {
                sendAlert({text : "Map already in use"});
              }
              if (app.attr("targetApp") && $("#"+app.attr("targetApp")).length) {
                $("#"+app.attr("targetApp")).removeAttr("scrollLeft");
                $("#"+app.attr("targetApp")).removeAttr("scrollTop");
                $("#"+app.attr("targetApp")).removeAttr("zoom");
              }
              for (var i in game.state._apps) {
                if ($("#"+game.state._apps[i]).length) {
                  $("#"+game.state._apps[i]).attr("tab", game.state.data.tabs.length-1);
                }
              }
              game.state.sync("updateState");
              setTimeout(function(){
                runCommand("forceTab", {index : game.state.data.tabs.length-1});
              }, 1000);
            }
          },
          {
            name : "Force Players to Tab",
            click : function(){
              game.state.data.tabs = game.state.data.tabs || [];
              var useTab = true;
              for (var i in game.state.data.tabs) {
                if (game.state.data.tabs[i].index == ent.id()) {
                  useTab = false;
                  break;
                }
              }

              if (useTab) {
                game.state.data.tabs.push({index : ent.id(), ui : "ui_board"});
              }
              else {
                sendAlert({text : "Map already in use"});
              }
              if (app.attr("targetApp") && $("#"+app.attr("targetApp")).length) {
                $("#"+app.attr("targetApp")).removeAttr("scrollLeft");
                $("#"+app.attr("targetApp")).removeAttr("scrollTop");
                $("#"+app.attr("targetApp")).removeAttr("zoom");
              }
              for (var i in game.state._apps) {
                if ($("#"+game.state._apps[i]).length) {
                  $("#"+game.state._apps[i]).attr("tab", game.state.data.tabs.length-1);
                }
              }
              game.state.sync("updateState");
              setTimeout(function(){
                runCommand("forceTab", {index : game.state.data.tabs.length-1});
              }, 1000);
            }
          }
        ];
      }
      actionList.push({
        name : "Use Map",
        submenu : submenu,
        click : function(){
          game.state.data.tabs = game.state.data.tabs || [];
          var useTab = true;
          for (var i in game.state.data.tabs) {
            if (game.state.data.tabs[i].index == ent.id()) {
              useTab = false;
              break;
            }
          }

          if (useTab) {
            game.state.data.tabs.push({index : ent.id(), ui : "ui_board"});
            game.state.sync("updateState");
          }
          else {
            sendAlert({text : "Map already in use"});
          }
        }
      });
    }

    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var handouts = [
        {
          name : "All Players",
          click : function(ev, ui) {
            var p = {};
            for (var uid in game.players.data) {
              if (uid != getCookie("UserID")) {
                p[uid] = true;
              }
            }
            runCommand("handout", {id : ent.id(), name : "Handout", ui : assetTypes[ent.data._t].handout || assetTypes[ent.data._t].ui, players : p});
            sendAlert({text : "Sent"});
          }
        },
      ];
      if (Object.keys(game.players.data).length > 1) {
        for (var uid in game.players.data) {
          if (uid != getCookie("UserID")) {
            handouts.push({
              name : game.players.data[uid].displayName,
              attr : {"UserID" : uid},
              click : function(ev, ui) {
                var p = {};
                p[ui.attr("UserID")] = true;
                runCommand("handout", {id : ent.id(), name : "Handout", ui : assetTypes[ent.data._t].handout || assetTypes[ent.data._t].ui, players : p});
                sendAlert({text : "Sent"});
              }
            });
          }
        }
        actionList.push({
          name : "Handout to ...",
          submenu : handouts
        });
      }
    }

    if (hasSecurity(getCookie("UserID"), "Visible", ent.data)) {
      if (hasSecurity(getCookie("UserID"), "Rights", ent.data)) {
        if (ent.data._t == "c") {
          var commands = [];
          for (var key in _actions) {
            if (!_actions[key].condition || _actions[key].condition(ent)) {
              commands.push(
                {name : _actions[key].name || key,
                  attr : {key : key},
                  click : function(ev, ui){
                    if (_actions[ui.attr("key")].click) {
                      _actions[ui.attr("key")].click(ev, plate, ent, app, scope);
                    }
                  }
                }
              );
            }
          }
          if (commands.length) {
            if (ent.data._t == "c") {
              actionList.push({name : "Combat", icon : "fire", submenu : commands});
            }
            else {
              actionList.push({name : "Use", submenu : commands});
            }
          }
        }

        actionList.push({
          name : "Edit",
          icon : "edit",
          click : function(ev, ui){
            var content = sync.newApp(assetTypes[ent.data._t].ui);
            content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
            var popout = ui_popOut({
              title : sync.rawVal(ent.data.info.name),
              target : ui,
              minimize : true,
              maximize : true,
              dragThickness : "0.5em",
              resizable : true,
              style : {width : assetTypes[ent.data._t].width, height : assetTypes[ent.data._t].height},
            }, content);
            popout.css("padding", "0px");
            popout.addClass("floating-app");

            ent.addApp(content);
          }
        });

        actionList.push({
          name : "Tags",
          icon : "tag",
          click : function(ev, ui){
            var content = sync.newApp("ui_tags");
            content.attr("viewOnly", scope.viewOnly);
            ent.addApp(content);

            var frame = ui_popOut({
              target : ui,
              title : "Tags",
              style : {"max-width" : "300px"},
              id : app.attr("id")+"-tag-list"
            }, content);
          }
        });
        if (ent.data._c == getCookie("UserID")) {
          actionList.push({
            name : "Duplicate",
            icon : "duplicate",
            click : function(ev, ui){
              if (ent.data._t == "c") {
                createCharacter(duplicate(ent.data), true);
              }
              else if (ent.data._t == "b") {
                runCommand("createBoard", ent.data);
              }
              else if (ent.data._t == "p") {
                runCommand("createPage", ent.data);
              }
              sendAlert({text : "Duplicated"});
            }
          });
        }
      }
      else {
        actionList.push({
          name : "View",
          click : function(ev, ui){
            var content = sync.newApp(assetTypes[ent.data._t].ui);
            content.attr("viewOnly", !hasSecurity(getCookie("UserID"), "Rights", ent.data));
            var popout = ui_popOut({
              title : sync.rawVal(ent.data.info.name),
              target : ui,
              align : "bottom",
              minimize : true,
              maximize : true,
              dragThickness : "0.5em",
              resizable : true,
              style : {width : assetTypes[ent.data._t].width, height : assetTypes[ent.data._t].height},
            }, content);
            popout.css("padding", "0px");
            popout.addClass("floating-app");

            ent.addApp(content);
          }
        });
      }
    }
    var cloud = [];
    if (hasSecurity(getCookie("UserID"), "Owner", ent.data)) {
      if (isNaN(ent.id()) && ent.id().match("_") && ent.data && ent.data._t != "pk") {
        // cloud asset
        if (ent.data._c == getCookie("UserID")) {
          cloud.push({
            name : "Activate",
            click : function(){
              if (game.locals["storage"]) {
                for (var i in game.locals["storage"].data.l) {
                  var listEntry = game.locals["storage"].data.l[i];
                  if (ent.data._c == getCookie("UserID") && listEntry._uid == ent.id().split("_")[1]) {
                    listEntry.move = true;
                    runCommand("moveAssets", {l : game.locals["storage"].data.l});
                    delete listEntry.move;
                    break;
                  }
                }
              }
              else {
                sendAlert({text : "Asset Storage hasn't loaded yet"});
              }
            }
          });
        }
      }
      else if (!isNaN(ent.id())) {
        actionList.push({
          name : "Access",
          icon : "lock",
          click : function(ev, ui){
            var content = sync.newApp("ui_rights");
            content.attr("last_rights", "indv");
            ent.addApp(content);

            var frame = ui_popOut({
              prompt : true,
              target : ui,
              id : "ui-rights-dialog",
            }, content);
          }
        });

        if (ent.data._t == "c") {
          if (!plate.hasClass("card-selected")) {
            actionList.push({
              name : "Target",
              icon : "screenshot",
              click : function(ev, ui) {
                plate.addClass("card-selected");
                util.target(plate.attr("index"));
              }
            });
          }
          else {
            actionList.push({
              name : "Lose Target",
              icon : "screenshot",
              click : function(ev, ui) {
                plate.removeClass("card-selected");
                util.untarget(plate.attr("index"));
              }
            });
          }
        }
        if (ent.data._c == getCookie("UserID")) {
          if (ent.data._uid) {
            cloud.push({
              name : "Store",
              click : function(){
                runCommand("storeAsset", {id : ent.id(), del : true});
                if (!scope.local) {
                  obj.sync("updateConfig");
                }
                else {
                  obj.update();
                }
              }
            });
            if (!ent.data._sync) {
              cloud.push({
                name : "Synchronize",
                click : function() {
                  runCommand("updateSync", {id : ent.id(), data : true});
                  sendAlert({text : "Synchronizing"});
                }
              });
            }
            else {
              cloud.push({
                name : "De-Synchronize",
                click : function() {
                  runCommand("updateSync", {id : ent.id(), data : false});
                  sendAlert({text : "De-Synchronizing"});
                }
              });
            }
          }
          else {
            cloud.push({
              name : "Move into Storage",
            });
          }
        }
        /*actionList.push({
          name : "Delete",
          submenu : [
            {
              name : "CONFIRM",
              icon : "trash",
              click : function(ev, ui){
                runCommand("deleteAsset", {id : ent.id()});
                delete game.entities.data[ent.id()].data;
                game.state.update();
                game.config.update();
              }
            }
          ]
        });*/
      }
    }
    if (cloud.length) {
      //actionList.push({name : "Asset Storage", submenu : cloud});
    }
    if (util.getTargets(true).length) {
      actionList.push({
        name : "De-select targets",
        click : function(ev, ui) {
          $(".card-selected").each(function(){
            util.untarget($(this).attr("index"));
            $(this).removeClass("card-selected");
          });
        }
      });
    }
    var menu = ui_dropMenu(plate, actionList, {id : "ent-context"});
    return menu;
  }
}

// Active Asset
// Store Asset
// Delete
// Privledges


sync.render("ui_assetList", function(entities, app, scope) {
  scope = scope || {};
  var obj = game.locals[app.attr("clickid")];
  var data = obj.data;

  var listedWrap = $("<div>");
  listedWrap.addClass("flexcolumn fit-y");

  if (!layout.mobile) {
    listedWrap.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!$("#"+app.attr("id")+"-drag-overlay").length) {
        var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("z-index", util.getMaxZ(".ui-popout")+1);
        olay.css("font-size", "2em");
        olay.append("<b>Drop to Create</b>");
      }
    });
    listedWrap.on('drop', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer;
      var ent = JSON.parse(dt.getData("OBJ"));

      game.locals["newAssetList"] = game.locals["newAssetList"] || [];
      var lastKeys = Object.keys(game.entities.data);
      game.entities.listen["newAsset"] = function(rObj, newObj, target) {
        var change = true;
        for (var key in game.entities.data) {
          if (!util.contains(lastKeys, key)) {
            game.locals["newAssetList"].push(key);
            change = false;
          }
        }
        return change;
      }

      if (ent._t == "a") {
        if (!game.config.data.offline) {
          runCommand("createAdventure", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }
      else if (ent._t == "b") {
        if (!game.config.data.offline) {
          runCommand("createBoard", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }
      else if (ent._t == "c") {
        createCharacter(ent, true, null, true);
        game.entities.update();
      }
      else if (ent._t == "i") {
        if (!game.config.data.offline) {
          runCommand("createItem", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }
      else if (ent._t == "p") {
        if (!game.config.data.offline) {
          runCommand("createPage", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }
      else if (ent._t == "v") {
        if (!game.config.data.offline) {
          runCommand("createVehicle", ent);
        }
        else {
          game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
          game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
          game.entities.data["tempObj"+game.config.data.offline++].data = ent;
          game.entities.update();
        }
      }
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });

    listedWrap.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });
  }
  if (!app.attr("hideCategory")) {
    var categories = obj.data.categories || ["c", "b", "p"];

    var assetType = $("<div>").appendTo(listedWrap);
    assetType.addClass("foreground subtitle");

    var buttonWrap = $("<div>").appendTo(assetType);
    buttonWrap.addClass("flexrow flexwrap");

    for (var i in categories) {
      if (!layout.mobile || categories[i] == "c") {
        var button = $("<button>").appendTo(buttonWrap);
        if (categories[i] == obj.data.category) {
          button.addClass("highlight alttext");
        }
        button.attr("type", categories[i]);
        button.append(assetTypes[categories[i]].n);
        button.click(function(){
          game.locals["newAssetList"] = [];
          obj.data.category = $(this).attr("type");
          sync.updateApp(app, game.entities);
        });
      }
    }
  }
  if (!app.attr("hideCreate") || !app.attr("hideSearch")) {
    var searchWrap = $("<div>").appendTo(listedWrap);
    searchWrap.addClass("foreground flexmiddle flexwrap alttext fit-x spadding");

    if (!app.attr("hideSearch")) {
      var search = $("<div>").appendTo(searchWrap);
      search.addClass("flexrow flex flexmiddle");

      var searchIcon = genIcon("search").appendTo(search);
      searchIcon.addClass("lrpadding");
      searchIcon.attr("title", "Search");

      var searchInput = genInput({
        classes : "subtitle",
        parent : search,
        placeholder : "Search Terms",
        style : {color : "#333", "width" : "100%"}
      });
      searchInput.keyup(function(ev){
        var str = ($(this).val() || "").toLowerCase();
        entList.children().each(function(){
          if ($(this).attr("index") && str) {
            var ent = getEnt($(this).attr("index"));
            if (ent) {
              var name = (sync.rawVal(ent.data.info.name) || "").toLowerCase();
              var hide = false;
              for (var tag in ent.data.tags) {
                if (tag.match(String(str))) {
                  hide = true;
                  break;
                }
              }
              if (name.match(String(str))) {
                hide = true;
              }
              if (!hide) {
                $(this).hide();
              }
              else {
                $(this).show();
              }
            }
          }
          else {
            $(this).fadeIn();
          }
        });
      });
    }

    if (!app.attr("hideCreate")) {
      var wrap = $("<div>").appendTo(searchWrap);
      wrap.addClass("flexrow flexwrap flex flexaround subtitle");
      if (obj.data.category == "a") {
        $("<b class='highlight outline lrpadding smooth' style='color:white;'>Beta</b>").appendTo(wrap);

        var button = genIcon("book", "New Adventure");
        button.attr("title", "Create a new Adventure");
        button.appendTo(wrap);
        button.click(function() {
          app.removeAttr("hideAssets");
          game.locals["newAssetList"] = game.locals["newAssetList"] || [];
          var lastKeys = Object.keys(game.entities.data);
          game.entities.listen["newAsset"] = function(rObj, newObj, target) {
            var change = true;
            for (var key in game.entities.data) {
              if (!util.contains(lastKeys, key)) {
                game.locals["newAssetList"].push(key);
                change = false;
              }
            }
            return change;
          }
          if (!game.config.data.offline) {
            runCommand("createAdventure", {data : {}});
          }
          else {
            game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
            game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
            game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.adventure);
            game.entities.update();
          }
          sendAlert({text : "Created Adventure"});
        });
      }
      else if (obj.data.category == "b") {
        var button = genIcon("globe", "New Map").appendTo(wrap);
        button.addClass("lrpadding");
        button.attr("title", "Creates a New Map");
        button.click(function(){
          app.removeAttr("hideAssets");
          game.locals["newAssetList"] = game.locals["newAssetList"] || [];
          var lastKeys = Object.keys(game.entities.data);
          game.entities.listen["newAsset"] = function(rObj, newObj, target) {
            var change = true;
            for (var key in game.entities.data) {
              if (!util.contains(lastKeys, key)) {
                game.locals["newAssetList"].push(key);
                change = false;
              }
            }
            return change;
          }
          if (!game.config.data.offline) {
            runCommand("createBoard", {});
          }
          else {
            game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
            game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;

            var board = {"_t" : "b"};
            board.info = {name : sync.newValue(null, "[No Name]")};
            board.sheets = [];
            board.layers = [{
              n : "Background Layer",
              t : [],
              p : [],
              d : [],
            },
            {
              n : "Player Layer",
              t : [], //tiles
              p : [], //pieces
              d : [], //drawing
            },
            {
              n : "Trap Layer",
              t : [], //tiles
              p : [], //pieces
              d : [], //drawing
            },
            {
              n : "GM Layer",
              _s : {},
              t : [], //tiles
              p : [], //pieces
              d : [], //drawing
            }];

            board.w = 1600;
            board.h = 1600;
            board.gridX = 0;
            board.gridY = 0;
            board.gridW = 64;
            board.gridH = 64;
            board.gc = "rgba(0,0,0,0.25)";
            board.vZ = 100;

            board.options = {};
            game.entities.data["tempObj"+game.config.data.offline++].data = board;
            game.entities.update();
          }
          sendAlert({text : "Created Map"});
        });
      }
      else if (obj.data.category == "c") {
        var createChar = genIcon("user", "New Character").appendTo(wrap);
        createChar.attr("title", "Create Character");
        createChar.click(function(){
          createCharacter(duplicate(game.templates.character), null, null, true, true);
          sendAlert({text : "Created Character"});
          app.removeAttr("hideAssets");
          game.entities.update();
        });
      }
      else if (obj.data.category == "i") {
        var button = genIcon("briefcase", "New Item/Spell");
        button.attr("title", "Create a new Item/Spell");
        button.appendTo(wrap);
        button.click(function() {
          app.removeAttr("hideAssets");
          game.locals["newAssetList"] = game.locals["newAssetList"] || [];
          var lastKeys = Object.keys(game.entities.data);
          game.entities.listen["newAsset"] = function(rObj, newObj, target) {
            var change = true;
            for (var key in game.entities.data) {
              if (!util.contains(lastKeys, key)) {
                game.locals["newAssetList"].push(key);
                change = false;
              }
            }
            return change;
          }
          if (!game.config.data.offline) {
            runCommand("createItem", {});
          }
          else {
            game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
            game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
            game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.item);
            game.entities.update();
          }
          sendAlert({text : "Created Item"});
        });
      }
      else if (obj.data.category == "p") {
        var button = genIcon("duplicate", "New Page");
        button.attr("title", "Create a new Page");
        button.appendTo(wrap);
        button.click(function() {
          game.locals["newAssetList"] = game.locals["newAssetList"] || [];
          var lastKeys = Object.keys(game.entities.data);
          game.entities.listen["newAsset"] = function(rObj, newObj, target) {
            var change = true;
            for (var key in game.entities.data) {
              if (!util.contains(lastKeys, key)) {
                game.locals["newAssetList"].push(key);
                change = false;
              }
            }
            return change;
          }
          app.removeAttr("hideAssets");
          if (!game.config.data.offline) {
            runCommand("createPage", {data : {}});
          }
          else {
            game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
            game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
            game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.page);
            game.entities.update();
          }
          sendAlert({text : "Created Page"});
        });
      }
      else if (obj.data.category == "v") {
        $("<b class='highlight outline lrpadding smooth' style='color:white;'>Beta</b>").appendTo(wrap);

        var createVehicle = genIcon("plane", "New Vehicle").appendTo(wrap);
        createVehicle.attr("title", "Create a Blank Vehicle");
        createVehicle.click(function(){
          game.locals["newAssetList"] = game.locals["newAssetList"] || [];
          var lastKeys = Object.keys(game.entities.data);
          game.entities.listen["newAsset"] = function(rObj, newObj, target) {
            var change = true;
            for (var key in game.entities.data) {
              if (!util.contains(lastKeys, key)) {
                game.locals["newAssetList"].push(key);
                change = false;
              }
            }
            return change;
          }
          app.removeAttr("hideAssets");
          if (!game.config.data.offline) {
            runCommand("createVehicle", {data : {}});
          }
          else {
            game.entities.data["tempObj"+game.config.data.offline] = sync.obj("");
            game.entities.data["tempObj"+game.config.data.offline]._lid = "tempObj"+game.config.data.offline;
            game.entities.data["tempObj"+game.config.data.offline++].data = duplicate(game.templates.vehicle);
            game.entities.update();
          }
          sendAlert({text : "Created Vehicle"});
        });
      }
    }
  }

  var entArray = obj.data.list;
  if (!entArray) {
    entArray = [];
    for (var i in game.entities.data) {
      entArray.push(i);
    }
  }

  if (!app.attr("dontSort")) {
    entArray.sort(function(obj1, obj2){
      if (game.locals["newAssetList"]) {
        if (util.contains(game.locals["newAssetList"], obj1) && !util.contains(game.locals["newAssetList"], obj2)) {
          return -1;
        }
        else if (util.contains(game.locals["newAssetList"], obj1) && util.contains(game.locals["newAssetList"], obj2)) {
          var obj1 = getEnt(obj1);
          var obj2 = getEnt(obj2);
          return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
        }
        else if (!util.contains(game.locals["newAssetList"], obj1) && util.contains(game.locals["newAssetList"], obj2)) {
          return 1;
        }
      }
      var obj1 = getEnt(obj1);
      var obj2 = getEnt(obj2);
      return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
    });
  }

  var listedChars = $("<div>").appendTo(listedWrap);
  listedChars.addClass("flexcolumn flex outline");
  listedChars.attr("_lastScrollTop", app.attr("_lastScrollTop_chars"));
  listedChars.css("overflow-y", "auto");
  listedChars.css("position", "relative");
  listedChars.scroll(function(){
    app.attr("_lastScrollTop_chars", $(this).scrollTop());
  });

  var listWrap = $("<div>").appendTo(listedChars);
  listWrap.addClass("flexcolumn fit-x");
  listWrap.css("position", "absolute");

  var entList = sync.render("ui_entList")(obj, app, {
    filter : obj.data.category,
    rights : obj.data.rights,
    list : entArray,
    app : true,
    ignore : obj.data.ignore,
    draw : function(ui, charObj) {
      ui.addClass("outlinebottom");
      if (scope.category == "i") {
        ui.attr("draggable", true);
        ui.on("dragstart", function(ev){
          var dt = ev.originalEvent.dataTransfer;
          dt.setData("OBJ", JSON.stringify(charObj.data));
        });
      }
      if (game.locals["newAssetList"] && util.contains(game.locals["newAssetList"], charObj.id())) {
        var button = $("<div>").appendTo(ui);
        button.addClass("subtitle flexmiddle");

        var newLabel = $("<text>").appendTo(button);
        newLabel.addClass("highlight smooth alttext flexmiddle lrpadding");
        newLabel.text("New");
      }
      if (obj.data.draw) {
        obj.data.draw(ui, charObj, obj);
      }
    },
    click : function(ev, ui, charObj) {
      if (obj.data.select && (obj.data.select(ev, ui, charObj, obj, entities))) {
        sync.updateApp(app, entities);
      }
    },
  }).appendTo(listWrap);

  return listedWrap;
});


sync.render("ui_assetPicker", function(obj, app, scope) {
  scope = scope || {};

  var ent = sync.obj();
  ent.data = {
    category : scope.category || scope.filter || "c",
    categories : scope.categories,
    ignore : scope.ignore,
    filter : scope.filter,
    rights : scope.rights,
    list : scope.list,
    select : scope.select
  };

  game.locals["assetPicker"] = ent;
  if (true || ent.data.list || scope.sessionOnly) {
    var newApp = sync.newApp("ui_assetList");
    newApp.attr("clickid", "assetPicker");
    if (ent.data.category) {
      newApp.attr("category", ent.data.category);
    }
    if (ent.data.filter) {
      newApp.attr("filter", ent.data.filter);
      newApp.attr("hideCategory", true);
    }
    if (ent.data.rights) {
      newApp.attr("Rights", ent.data.rights);
    }
    if (scope.hideCreate) {
      newApp.attr("hideCreate", scope.hideCreate);
    }
    if (scope.hideSearch) {
      newApp.attr("hideSearch", scope.hideSearch);
    }
    if (scope.hideCategory) {
      newApp.attr("hideCategory", scope.hideCategory);
    }
    game.entities.addApp(newApp);

    return newApp;
  }
  else {
    var navBar = genNavBar("background alttext subtitle", "flex", "4px");
    navBar.addClass("flexcolumn flex");
    /*if (game.locals["storage"] && game.locals["storage"].data) {
      for (var i in game.locals["storage"].data.l) {
        var sEnt = game.locals["storage"].data.s[game.locals["storage"].data.l[i]._uid];
        if (sEnt instanceof Object) {
          navBar.generateTab("Asset Storage", "cloud-download", function(parent){
            ent.data.list = [];
            if (game.locals["storage"]) {
              for (var i in game.locals["storage"].data.l) {
                var sEnt = game.locals["storage"].data.s[game.locals["storage"].data.l[i]._uid];
                if (sEnt instanceof Object) {
                  ent.data.list.push(getCookie("UserID")+"_"+game.locals["storage"].data.l[i]._uid);
                }
              }
            }

            var newApp = sync.newApp("ui_assetList").appendTo(parent);
            newApp.attr("clickid", "assetPicker");
            newApp.attr("hideCreate", true);
            if (ent.data.category) {
              newApp.attr("category", ent.data.category);
            }
            if (ent.data.filter) {
              newApp.attr("filter", ent.data.filter);
              newApp.attr("hideCategory", true);
            }
            if (ent.data.rights) {
              newApp.attr("Rights", ent.data.rights);
            }
            game.entities.addApp(newApp);
          });
          break;
        }
      }
    }*/
    navBar.generateTab("Live", "cog", function(parent){
      delete ent.data.list;

      var newApp = sync.newApp("ui_assetList").appendTo(parent);
      newApp.attr("clickid", "assetPicker");
      if (ent.data.category) {
        newApp.attr("category", ent.data.category || "c");
      }
      if (scope.hideCreate) {
        newApp.attr("hideCreate", scope.hideCreate);
      }
      if (ent.data.filter) {
        newApp.attr("filter", ent.data.filter);
        newApp.attr("hideCategory", true);
      }
      if (ent.data.rights) {
        newApp.attr("Rights", ent.data.rights);
      }
      game.entities.addApp(newApp);
    });
    if (game.state.data.combat) {
      navBar.generateTab("Combat", "fire", function(parent){
        ent.data.list = Object.keys(game.state.data.combat.engaged);
        var newApp = sync.newApp("ui_assetList").appendTo(parent);
        newApp.attr("clickid", "assetPicker");
        newApp.attr("hideCategory", true);
        newApp.attr("hideCreate", true);
        newApp.attr("noSort", true);
        if (ent.data.rights) {
          newApp.attr("Rights", ent.data.rights);
        }

        game.entities.addApp(newApp);
      });
    }
    for (var i in game.players.data) {
      if (game.players.data[i].entity) {
        navBar.generateTab("Players", "user", function(parent){
          ent.data.list = [];
          for (var i in game.players.data) {
            if (game.players.data[i].entity) {
              ent.data.list.push(game.players.data[i].entity);
            }
          }
          var newApp = sync.newApp("ui_assetList").appendTo(parent);
          newApp.attr("clickid", "assetPicker");
          newApp.attr("hideCategory", true);
          newApp.attr("hideCreate", true);
          newApp.attr("noSort", true);
          if (ent.data.rights) {
            newApp.attr("Rights", ent.data.rights);
          }

          game.entities.addApp(newApp);
        });
        break;
      }
    }
    navBar.selectTab("Live");
  }

  return navBar;
});
