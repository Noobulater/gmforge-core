sync.render("_logs", function(obj, app, scope) {
  var div = $("<div>");
  div.addClass("fit-xy flexcolumn");

  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexbetween alttext");
  optionsBar.css("font-size", "1.2em");
  optionsBar.css("padding", "3px");

  if (app.attr("freeScroll") == "true") {
    optionsBar.addClass("highlight");
  }
  else {
    optionsBar.addClass("foreground");
  }
  var filters = {
    "Events" : true,
    "Game" : true,
    "Players" : true,
    "Actors" : true,
  };
  var wrap = $("<div>").appendTo(optionsBar);
  wrap.addClass("flex");

  var more = genIcon("plus")//.appendTo(optionsBar);
  more.addClass("lrmargin");
  more.click(function(){
    var chatApp = sync.newApp("_logs").appendTo(app.parent);
    chatApp.addClass("flex");
    chatApp.css("overflow-x", "none");
    chatApp.css("overflow-y", "none");

    game.logs.addApp(chatApp);
  });

  var more = genIcon("cog").appendTo(optionsBar);
  more.addClass("lrmargin");
  more.click(function(){
    var content = $("<div>");
    content.addClass("flexcolumn");

    for (var name in filters) {
      var checkDiv = $("<div>").appendTo(content);
      checkDiv.addClass("flexrow flexbetween");

      var checkDiv = $("<div>").appendTo(checkDiv);
      checkDiv.addClass("bold subtitle flexmiddle");

      var checkbox = genInput({
        parent : checkDiv,
        type : "checkbox",
        index : name,
        style : {"margin" : "0"}
      });
      checkDiv.append(name);
      if (app.attr("show-"+name) != "false") {
        checkbox.prop("checked", true);
      }
      checkbox.change(function(){
        if ($(this).prop("checked")) {
          app.removeAttr("show-"+$(this).attr("index"));
        }
        else {
          app.attr("show-"+$(this).attr("index"), "false");
        }
        obj.update();
      });
    }

    var time = genIcon("time", "Time Stamps");
    time.attr("title", "Toggle Time Stamps");
    time.appendTo(content);
    time.click(function(){
      app.attr("timeStamps", !Boolean(app.attr("timeStamps") == "true"));
      obj.update();
    });

    var del = genIcon("trash", "Destroy Channel");
    del.attr("title", "Destroy channel");
    del.appendTo(content);
    del.addClass("destroy");
    del.click(function(){
      app.remove();
      obj.update();
      layout.coverlay("channel-options");
    });


    ui_popOut({
      target : $(this),
      title : "Filters",
      id : "channel-options",
    }, content)
  });

  var more = genIcon("trash").appendTo(optionsBar);
  more.addClass("lrmargin");
  more.click(function(){
    ui_prompt({
      target : $(this),
      confirm : "Empty Event log",
      click : function(){
        runCommand("emptyEventLog");
      }
    });
  });

  var chatListed = $("<div>").appendTo(div);
  chatListed.addClass("flex");
  chatListed.css("overflow-x", "none");
  chatListed.css("overflow-y", "scroll");
  chatListed.attr("_lastScrollTop", app.attr("_lastScrollTop"));
  if (app.attr("freeScroll") != "true") {
    setTimeout(function(){chatListed.attr("_lastScrollTop", Number(chatListed[0].scrollHeight) + 100); chatListed.scrollTop(Number(chatListed[0].scrollHeight) + 100); app.removeAttr("freeScroll"); }, 10);
  }

  var chatPlate = $("<div>").appendTo(chatListed);

  chatListed.scroll(function() {
    if (app.is(":visible")) {
      app.attr("_lastScrollTop", $(this).scrollTop());
      if (Math.round($(this).scrollTop() + $(this).outerHeight()) < $(this)[0].scrollHeight) {
        app.attr("freeScroll", "true");
      }
      else {
        app.removeAttr("freeScroll");
        optionsBar.removeClass("highlight");
        optionsBar.addClass("foreground");
      }
      app.attr("_lastScrollLeft", $(this).scrollLeft());
      $(this).attr("_lastScrollTop", $(this).scrollTop());
    }
  });

  function build(list, events, app) {
    var start = 0;
    if (layout.mobile) {
      start = Math.max(events.length-25,0);
    }
    for (var index=start; index<events.length; index++) {
      var chatData = events[index];
      if (chatData.p && !chatData.p[getCookie("UserID")] && !hasSecurity(getCookie("UserID"), "Visible", {_s : chatData.p})) {
        continue;
      }

      var postType = {};

      var chatContainer = $("<div>");
      chatContainer.addClass("fit-x spadding");
      chatContainer.attr("index", index);
      chatContainer.attr("id", "log-"+index);
      chatContainer.css("position", "relative");

      if (hasSecurity(getCookie("UserID"), "Game Master")) {
        chatContainer.contextmenu(function(ev){
          var index = $(this).attr("index");
          var actionsList = [
            {
              name : "Remove Event",
              click : function(){
                runCommand("emptyLogEvent", index);
              }
            }
          ];

          ui_dropMenu($(this), actionsList, {id : "empty-log-event"});
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        });
      }

      var headerPlate = $("<div>").appendTo(chatContainer);
      headerPlate.addClass("flexrow");
      if (Boolean(app.attr("timeStamps") == "true") && chatData.timeStamp) {
        headerPlate.append(genIcon({raw : true, icon : "time"}).addClass("dull").attr("title", new Date(chatData.timeStamp)));
      }
      var icon;
      if (chatData.f || chatData.href) {
        var icon = $("<div>").appendTo(headerPlate);
        icon.addClass("flexcolumn flexmiddle white outline spadding");
        icon.css("background-image", "url('"+(chatData.href || "/content/icons/blankchar.png")+"')");
        icon.css("background-size", "contain");
        icon.css("background-repeat", "no-repeat");
        icon.css("background-position", "center");
        if (chatData.f) {
          icon.css("width", "3em");
          icon.css("height", "3em");
          icon.addClass("round");
        }
        else {
          icon.addClass("smooth");
          icon.css("width", "4em");
          icon.css("height", "1.4em");
        }
      }

      var namePlate = $("<div>").appendTo(headerPlate);
      namePlate.addClass("flexcolumn");
      namePlate.css("text-align", "left");

      var repeated = false;
      if (chatData.user && index != 0 && chatData.user == events[index-1].user && chatData.f == events[index-1].f && (chatData.href == events[index-1].href)) {
        namePlate.hide();
        if (icon) {
          icon.hide();
        }
        repeated = true;
      }

      var name = $("<text>").appendTo(namePlate);
      name.text(chatData.f || chatData.user);

      var contentPlate = $("<div>").appendTo(chatContainer);
      contentPlate.addClass("bold");
      contentPlate.text(chatData.text);
      contentPlate.css("overflow-wrap", "break-word");

      if (chatData.eID) {
        postType["Events"] = true;
      }
      chatData.text = chatData.text || "";
      if (chatData.f) {
        namePlate.addClass("padding");
        name.css("-webkit-text-stroke-width", "1px");

        if (chatData.f != chatData.user) {
          var pName = $("<text>").appendTo(namePlate);
          pName.addClass("alttext lrpadding smooth outline bold");
          pName.css("background", (chatData.color || "linear-gradient(to top, #222, #333)"));
          pName.addClass("subtitle");
          pName.text(chatData.user);
        }
        else {
          namePlate.addClass("flexmiddle");
        }
        if (chatData.text.match("/me") && chatData.text.match("/me").index == 0) {
          headerPlate.css("background-color", "rgb(255,232,204)");

          contentPlate.appendTo(headerPlate);
          if (chatData.f == chatData.user) {
            contentPlate.addClass("flexmiddle");
          }
          contentPlate.css("font-style", "italic");
          contentPlate.addClass("lpadding");
          contentPlate.text(contentPlate.text().replace("/me", ""));
        }
        else {
          contentPlate.addClass("outline smooth");
          contentPlate.css("border-radius", "8px");
          chatContainer.css("margin-bottom", "1em");

          if (chatData.text.match("/w") && chatData.text.match("/w").index == 0) {
            headerPlate.append("<i class='subtitle flex flexmiddle spadding'>whispered to you</i>");
            contentPlate.css("background-color", "rgba(66,108,66,0.2)");
            contentPlate.css("font-style", "italic");
            contentPlate.css("font-size", "0.9em");
            contentPlate.text(contentPlate.text().replace("/w", ""));
          }

          if (chatData.evID) {
            contentPlate.addClass("padding");
            contentPlate.text("");
            function hasAccess(eventID) {
              var ev = game.events.data[eventID];
              if (ev && hasSecurity(getCookie("UserID"), "Visible", ev.data)){
                return true;
              }
              return false;
            }
            if (hasAccess(chatData.evID)) {
              if (hasSecurity(getCookie("UserID"), "Trusted Player")) {
                chatContainer.attr("evID", chatData.evID);
                chatContainer.addClass("hover2");
                chatContainer.attr("draggable", true);
                chatContainer.on("dragstart", function(ev){
                  _dragTransfer = {roll : $(this).attr("evID")};
                });
                chatContainer.on("drop", function(ev){
                  _dragTransfer = null;
                });
                chatContainer.click(function(){
                  var evID = $(this).attr("evID");
                  var actionList = util.buildActions(evID);
                  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
                    actionList.push({
                      name : "Edit",
                      icon : "edit",
                      click : function(ev, ui) {
                        var content = $("<div>");
                        content.addClass("flexcolumn flex");

                        var dummyObj = sync.obj();
                        dummyObj.data = {pool : duplicate(game.events.data[evID].data.data.pool)};

                        var newApp = sync.newApp("ui_JSON").appendTo(content);
                        newApp.attr("lookup", "pool");
                        newApp.attr("hideConfirm", true);
                        newApp.attr("width", "200px");
                        newApp.attr("height", "200px");
                        dummyObj.addApp(newApp);

                        var confirm = $("<button>").appendTo(content);
                        confirm.append("Change Result");
                        confirm.click(function(){
                          game.events.data[evID].data.data.pool = dummyObj.data.pool;
                          if (layout.offline) {
                            game.events.data[evID].update();
                            game.logs.update();
                          }
                          else {
                            game.events.data[evID].sync("updateEvent");
                          }
                          layout.coverlay("edit-results");
                        });
                        var pop = ui_popOut({
                          id : "edit-results",
                          target : ui,
                        }, content);
                      }
                    });
                  }
                  if (util.getTargets(true).length) {
                    actionList.push({
                      name : "De-select targets",
                      click : function(ev, ui) {
                        util.unSelectTargets();
                      }
                    });
                  }

                  var pop = ui_dropMenu($(this), actionList, {id : "dice-action", align : "bottom"});
                });
              }
              var label = $("<i class='flex flexmiddle bold subtitle'>"+chatData.text+"</i>").appendTo(headerPlate);
              if (!repeated) {
                label.addClass("lpadding");
              }
              var display;
              if (game.templates.display.ui && game.templates.display.ui[chatData.ui || game.templates.dice.ui]) {
                display = game.templates.display.ui[chatData.ui || game.templates.dice.ui];
              }
              else {
                display = null;
              }
              var diceRes = sync.render("ui_newDiceResults")(game.events.data[chatData.evID], app, {display : display});
              diceRes.appendTo(contentPlate);

              if (game.events.data[chatData.evID].data && game.events.data[chatData.evID].data.data.pool && game.events.data[chatData.evID].data.data.pool.discarded) {
                var discarded = genIcon("", String(game.events.data[chatData.evID].data.data.pool.discarded).substring(0,10)).appendTo(chatContainer);
                discarded.addClass("subtitle lrpadding lrmargin bold");
                discarded.attr("title", "Discarded Roll(s)");
                discarded.css("position", "absolute");
                discarded.css("right", "0");
                discarded.css("bottom", "0");
              }
            }
            postType["Events"] = true;
          }
          else {
            contentPlate.addClass("lpadding");
          }
          if (chatData.text.match("/y") && chatData.text.match("/y").index == 0) {
            contentPlate.removeClass("lpadding");
            contentPlate.addClass("padding");

            var yell = $("<b>").appendTo(headerPlate);
            yell.addClass("spadding flexmiddle flex");
            yell.css("-webkit-text-stroke-width", "1px");
            yell.css("font-size", "1.6em");
            yell.text("Yelled Out!")

            contentPlate.css("-webkit-text-stroke-width", "1px");
            contentPlate.css("font-style", "italic");
            contentPlate.css("font-size", "1.4em");
            contentPlate.css("background-color", "rgba(255,138,0,0.2)");
            contentPlate.text(contentPlate.text().replace("/y", ""));
          }
        }
        postType["Actors"] = true;
      }
      else if (chatData.user) {
        namePlate.addClass("bold lrpadding");
        namePlate.css("color", (chatData.color));

        if (chatData.text.match("/me") && chatData.text.match("/me").index == 0) {
          contentPlate.css("font-style", "italic");
          contentPlate.addClass("lpadding");
          contentPlate.text(contentPlate.text().replace("/me", ""));
        }
        else if (chatData.text.match("/w") && chatData.text.match("/w").index == 0) {
          headerPlate.append("<i class='subtitle flex flexmiddle spadding'>whispered to you</i>");

          contentPlate.css("background-color", "rgba(66,108,66,0.2)");
          contentPlate.css("font-style", "italic");
          contentPlate.css("font-size", "0.9em");
          contentPlate.text(contentPlate.text().replace("/w", ""));
        }
        else if (chatData.text.match("/y") && chatData.text.match("/y").index == 0) {
          var yell = $("<b>").appendTo(headerPlate);
          yell.addClass("spadding flexmiddle flex");
          yell.css("-webkit-text-stroke-width", "1px");
          yell.css("font-size", "1.6em");
          yell.text("Yelled Out!")

          contentPlate.css("-webkit-text-stroke-width", "1px");
          contentPlate.css("font-style", "italic");
          contentPlate.css("font-size", "1.4em");
          contentPlate.css("background-color", "rgba(255,138,0,0.2)");
          contentPlate.text(contentPlate.text().replace("/y", ""));
        }

        if (chatData.evID) {
          contentPlate.addClass("smooth padding");
          chatContainer.css("margin-bottom", "1em");
          function hasAccess(eventID) {
            var ev = game.events.data[eventID];
            if (ev && hasSecurity(getCookie("UserID"), "Visible", ev.data)){
              return true;
            }
            return false;
          }
          if (hasAccess(chatData.evID)) {
            if (hasSecurity(getCookie("UserID"), "Trusted Player")) {
              chatContainer.attr("evID", chatData.evID);
              chatContainer.addClass("hover2");
              chatContainer.attr("draggable", true);
              chatContainer.on("dragstart", function(ev){
                _dragTransfer = {roll : $(this).attr("evID")};
              });
              chatContainer.on("drop", function(ev){
                _dragTransfer = null;
              });
              chatContainer.click(function(){
                var evID = $(this).attr("evID");
                var actionList = util.buildActions(evID);
                if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
                  actionList.push({
                    name : "Edit",
                    icon : "edit",
                    submenu : [
                      {
                        name : "Results",
                        click : function(ev, ui) {
                          var content = $("<div>");
                          content.addClass("flexcolumn flex");

                          var dummyObj = sync.obj();
                          dummyObj.data = {pool : duplicate(game.events.data[evID].data.data.pool)};

                          var newApp = sync.newApp("ui_JSON").appendTo(content);
                          newApp.attr("lookup", "pool");
                          newApp.attr("hideConfirm", true);
                          newApp.attr("width", "200px");
                          newApp.attr("height", "200px");
                          dummyObj.addApp(newApp);

                          var confirm = $("<button>").appendTo(content);
                          confirm.append("Change Result");
                          confirm.click(function(){
                            game.events.data[evID].data.data.pool = dummyObj.data.pool;
                            if (layout.offline) {
                              game.events.data[evID].update();
                              game.logs.update();
                            }
                            else {
                              game.events.data[evID].sync("updateEvent");
                            }
                            layout.coverlay("edit-results");
                          });
                          var pop = ui_popOut({
                            id : "edit-results",
                            target : ui,
                          }, content);
                        }
                      }
                    ]
                  });
                }
                if (util.getTargets(true).length) {
                  actionList.push({
                    name : "De-select targets",
                    click : function(ev, ui) {
                      util.unSelectTargets();
                    }
                  });
                }

                var pop = ui_dropMenu($(this), actionList, {id : "dice-action", align : "bottom"});
              });
            }
            contentPlate.text("");
            var label = $("<i class='flex flexmiddle spadding bold subtitle'>"+chatData.text+"</i>").appendTo(headerPlate);
            chatContainer.attr("index", index);
            var display;
            if (game.templates.display.ui && game.templates.display.ui[chatData.ui || game.templates.dice.ui]) {
              display = game.templates.display.ui[chatData.ui || game.templates.dice.ui];
            }
            else {
              display = null;
            }
            var diceRes = sync.render("ui_newDiceResults")(game.events.data[chatData.evID], app, {display : display});
            diceRes.appendTo(contentPlate);

            if (game.events.data[chatData.evID].data && game.events.data[chatData.evID].data.data.pool && game.events.data[chatData.evID].data.data.pool.discarded) {
              var discarded = genIcon("", String(game.events.data[chatData.evID].data.data.pool.discarded).substring(0,10)).appendTo(chatContainer);
              discarded.addClass("subtitle lrpadding lrmargin bold");
              discarded.attr("title", "Discarded Roll(s)");
              discarded.css("position", "absolute");
              discarded.css("right", "0");
              discarded.css("bottom", "0");
            }
          }
          postType["Events"] = true;
        }
        else {
          contentPlate.addClass("spadding subtitle");
          contentPlate.css("padding-left", "1em");
        }

        postType["Players"] = true;
      }
      else {
        contentPlate.addClass("flexmiddle subtitle lpadding");
        contentPlate.removeClass("bold");

        chatContainer.css("background", chatData.color);

        postType["Game"] = true;
      }

      if (chatData.user && index <= events.length-2 && chatData.user == events[index+1].user && chatData.f == events[index+1].f) {
        chatContainer.css("margin-bottom", "0");
      }

      if (chatData.media) {
        var mediaContainer = $("<div>").appendTo(contentPlate);
        mediaContainer.addClass("flexcolumn flexmiddle");
        mediaContainer.css("overflow-wrap", "break-word");
        mediaContainer.attr("srcImg", chatData.media);

        var mediaLink = $("<a>").appendTo(mediaContainer);
        mediaLink.addClass("flexcolumn flexmiddle");
        mediaLink.css("max-width", "100%");
        mediaLink.attr("href", chatData.media);
        mediaLink.attr("target", "_");
        mediaLink.attr("title", chatData.media);
        mediaLink.css("overflow-wrap", "break-word");
        mediaLink.css("word-break", "break-all");
        var str = chatData.media;
        if (str.length > 30) {
          str = str.substring(0, 30) + "...";
        }
        mediaLink.append(str);
        mediaLink.click(function(ev){
          ev.stopPropagation();
        });
        //mediaLink.css("word-break", "break-all");
        if (util.matchYoutube(chatData.media)) {
          var media = $("<img>");
          media.appendTo(mediaContainer);
          media.css("width", "auto");
          media.css("max-width", "100%");
          media.css("height", "100px");
          media.css("pointer-events", "none");
          media.attr("src", "/cdn/youtube.ico");
          if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
            mediaContainer.css("cursor", "pointer");
            mediaContainer.click(function(ev){
              util.shareYoutube($(this).attr("srcImg"));
            });
          }
        }
        else {
          var media = ui_processMedia(chatData.media);
          media.appendTo(mediaContainer);
          media.css("width", "auto");
          media.css("max-width", "100%");
          media.css("height", "100px");
          media.css("pointer-events", "none");

          if (media.is("img")) {
            mediaContainer.css("cursor", "pointer");
            mediaContainer.click(function(ev){
              assetTypes["img"].preview(ev, $(this), $(this).attr("srcImg"));
            });
            mediaContainer.contextmenu(function(ev){
              assetTypes["img"].contextmenu(ev, $(this), $(this).attr("srcImg"));
              ev.stopPropagation();
              ev.preventDefault();
              return false;
            });
          }
          else {
            media[0].play();
          }
        }
        postType["Players"] = true;
      }
      if (chatData.style) {
        for (var i in chatData.style) {
          chatContainer.css(i, chatData.style[i]);
        }
      }
      var shouldPost = true;
      if (chatData.p) {
        chatContainer.addClass("inactive");
      }
      if (chatData.p && (!chatData.p[getCookie("UserID")] && !hasSecurity(getCookie("UserID"), "Visible", {_s : chatData.p}))) {
        shouldPost = false;
      }
      for (var key in postType) {
        if (app.attr("show-"+key) == "false") {
          shouldPost = false;
          break;
        }
      }
      if (shouldPost) {
        chatContainer.appendTo(list);
      }
    }
  }
  build(chatPlate, obj.data.events, app);

  return div;
});

var _whisperTargets = {};

sync.render("ui_textBox", function(obj, app, scope){
  var data;
  if (obj) {
    data = obj.data;
  }
  var div = $("<div>");
  div.addClass("fit-xy white");
  div.css("display", "flex");
  div.css("flex-flow", "column");

  if (!layout.mobile) {
    div.on("dragover", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!_dragTransfer && !$("#"+app.attr("id")+"-drag-overlay").length) {
        var olay = layout.overlay({
          target : app,
          id : app.attr("id")+"-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.append("<b>Drop to Share</b>");
      }
    });
    div.on('drop', function(ev, ui){
      ev.preventDefault();
      ev.stopPropagation();
      var dt = ev.originalEvent.dataTransfer||$(ui.draggable).data("dt");
      if (dt.getData("Text") && dt.getData("Text").trim()) {
        var flavor;
        var icon;
        if (chatType.text() == "IC") {
          icon = newApp.attr("src");
          var ent = getPlayerCharacter(getCookie("UserID"))
          if (!icon && ent && ent.data) {
            icon = sync.rawVal(ent.data.info.img);
          }
          if (newApp.attr("ICText")) {
            flavor = newApp.attr("ICText");
          }
          else {
            flavor = sync.eval("@me.cName", sync.defaultContext());
          }
        }
        util.chatEvent(dt.getData("Text"), flavor, _whisperTargets, input, icon, flavor);
      }
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });

    div.on("dragleave", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      layout.coverlay(app.attr("id")+"-drag-overlay");
    });
  }

  var header = $("<div>").appendTo(div);

  var chatList = $("<div>").appendTo(div);
  chatList.addClass("flexcolumn flex");

  if (game.logs) {
    /*if (isChrome()) {
      var chatApp = sync.newApp("_logs").appendTo(chatList);
      chatApp.addClass("flex");
      chatApp.css("overflow-x", "none");
      chatApp.css("overflow-y", "none");
      chatApp.attr("show-Players", "false");
      chatApp.attr("show-Events", "false");

      game.logs.addApp(chatApp);
    }*/

    var chatApp = sync.newApp("_logs").appendTo(chatList);
    chatApp.addClass("flex noSelected");
    chatApp.css("overflow-x", "none");
    chatApp.css("overflow-y", "none");
    //chatApp.attr("show-Game", "false");
    setTimeout(function(){game.logs.addApp(chatApp);}, 10);
  }
  var outlinebottom = $("<div>").appendTo(div);
  outlinebottom.addClass("outlinebottom");

  var textInput = $("<div>").appendTo(div);
  textInput.addClass("flexcolumn padding white");

  var imperson = $("<div>").appendTo(textInput);
  imperson.addClass("flexrow fit-x");

  var chatType = $("<button>").appendTo(imperson);
  chatType.addClass("subtitle mpadding chatType");
  chatType.attr("title", "Out of Character");
  chatType.text("OOC");

  var newApp = sync.newApp("_imperson").appendTo(imperson);
  newApp.addClass("white");
  newApp.attr("ICText", "No Character");
  newApp.attr("src", "/content/icons/blankchar.png");
  game.players.addApp(newApp);

  chatType.click(function(){
    if (chatType.text() == "OOC") {
      chatType.addClass("highlight alttext");
      chatType.attr("title", "In Character");
      chatType.text("IC");
    }
    else {
      chatType.removeClass("highlight alttext");
      chatType.attr("title", "Out of Character");
      chatType.text("OOC");
    }
  });

  var input = $("<textarea>").appendTo(textInput);
  input.addClass("smooth");
  input.attr("placeholder", "Enter Chat Text Here");
  input.css("height", "60px");
  input.css("overflow-x", "hidden");
  input.keypress(function (ev) {
    if (ev.which == 13 && !_down["16"]) {
      var flavor;
      var icon;
      if (chatType.text() == "IC") {
        icon = newApp.attr("src");
        var ent = getPlayerCharacter(getCookie("UserID"))
        if (!icon && ent && ent.data) {
          icon = sync.rawVal(ent.data.info.img);
        }
        if (newApp.attr("ICText")) {
          flavor = newApp.attr("ICText");
        }
        else {
          flavor = sync.eval("@me.cName", sync.defaultContext());
        }
      }
      util.chatEvent(input.val(), flavor, _whisperTargets, input, icon, flavor);
      var text = $(this);
      setTimeout(function(){text.val("");}, 10);
      ev.stopPropagation();
      ev.preventDefault();
    }
  });
  input.keyup(function (ev) {
    if (ev.which == 38) {
      if (_lastChat.length) {
        if (_lastIndex == null) {
          _lastIndex = _lastChat.length;
        }
        _lastIndex--;
        if (_lastChat[_lastIndex] && _lastIndex >= 0) {
          $(this).val(_lastChat[_lastIndex]);
        }
        else {
          _lastIndex = null;
          $(this).val("");
        }
      }
    }
    else if (ev.which == 40) {
      if (_lastIndex != null) {
        _lastIndex = (_lastIndex || 0) + 1;
        if (_lastChat[_lastIndex]) {
          $(this).val(_lastChat[_lastIndex]);
        }
        else {
          _lastIndex = null;
          $(this).val("");
        }
      }
    }
  });

  var wrap = $("<div>").appendTo(textInput);
  wrap.addClass("smooth spadding flexrow flexaround");

  if (game.templates.dice.defaults && game.templates.dice.defaults.length) {
    var diceWrap = $("<div>").appendTo(wrap);
    diceWrap.addClass("flexrow flexwrap");

    for (var i in game.templates.dice.defaults) {
      var index = game.templates.dice.defaults[i];
      var diceData = game.templates.dice.pool[index];

      var dice = $("<button>").appendTo(diceWrap);
      dice.addClass("flexmiddle subtitle bold lrmargin outline smooth");
      dice.attr("index", index);
      dice.attr("title", "Rolls "+diceData.value);
      dice.css("display", "flex");
      dice.css("background", "none");
      dice.css("background-color", "#333");
      dice.css("color", "white");
      dice.css("border-radius", "4px");

      var label = $("<div>").appendTo(dice);
      label.css("text-align", "center");
      label.css("pointer-events", "none");
      label.text(index.substring(0,Math.min(index.length, 4)));

      dice.append(label);

      for (var key in diceData.display) {
        dice.css(key, diceData.display[key]);
      }

      dice.click(function() {
        snd_diceRoll.play();
        var diceArray = game.templates.dice.pool;
        if (diceArray[$(this).attr("index")]) {
          var equation = "1["+$(this).attr("index")+"]";

          var icon;
          var ic;
          if (chatType.text() == "IC") {
            icon = newApp.attr("src");
            var ent = getPlayerCharacter(getCookie("UserID"))
            if (!icon && ent && ent.data) {
              icon = sync.rawVal(ent.data.info.img);
            }
            ic = newApp.attr("ICText");
          }

          util.processEvent("/r " + equation, "rolled", icon, ic);
        }
      });
    }
  }

  var extendedDice = $("<a>Dice Pool</a>").appendTo(wrap);
  extendedDice.addClass("subtitle lrmargin flexmiddle");
  extendedDice.click(function() {
    var content = $("<div>");
    content.addClass("flex flexcolumn padding");

    game.locals["diceRoll"] = game.locals["diceRoll"] || sync.obj();
    game.locals["diceRoll"].data = game.locals["diceRoll"].data || {};

    var extraDice = sync.newApp("ui_dicePooler").appendTo(content);
    game.locals["diceRoll"].addApp(extraDice);

    var confirmWrap = $("<div>").appendTo(content);
    confirmWrap.addClass("flexrow");

    var checkWrap = $("<div>").appendTo(confirmWrap);
    checkWrap.addClass("flexcolumn lrmargin");

    var check = $("<div>").appendTo(checkWrap);
    check.addClass("flexmiddle");

    var close = genInput({
      parent : check,
      type : "checkbox",
      style : {"margin-top" : "0"},
    });
    close.prop("checked", true);
    check.append("<b class='subtitle lrpadding'>Close after rolling</b>");

    var check = $("<div>").appendTo(checkWrap);
    check.addClass("flexmiddle");

    var show = genInput({
      parent : check,
      type : "checkbox",
      style : {"margin-top" : "0"},
    });
    show.prop("checked", false);
    show.change(function(){
      if (show.prop("checked") == true) {
        extraDice.attr("show", "true");
      }
      else {
        extraDice.attr("show", "false");
      }
      game.locals["diceRoll"].update();
    });
    check.append("<b class='subtitle lrpadding'>Show all dice types</b>");

    var button = $("<button>").appendTo(confirmWrap);
    button.addClass("flex");
    button.append("Roll");
    button.click(function(){
      snd_diceRoll.play();
      var context = sync.defaultContext();

      var equation = "";
      for (var i in game.locals["diceRoll"].data.dice) {
        equation += game.locals["diceRoll"].data.dice[i]+"["+i+"]+";
      }
      equation = equation.substring(0, equation.length-1);

      var icon;
      var ic;
      if (chatType.text() == "IC") {
        icon = newApp.attr("src");
        var ent = getPlayerCharacter(getCookie("UserID"))
        if (!icon && ent && ent.data) {
          icon = sync.rawVal(ent.data.info.img);
        }
        ic = newApp.attr("ICText");
      }

      util.processEvent("/r " + equation, "rolled", icon, ic);
      if (close.prop("checked") == true) {
        layout.coverlay("dice-popout-"+extraDice.attr("id"), 500);
      }
    });


    var button = $("<button>").appendTo(confirmWrap);
    button.addClass("subtitle background alttext");
    button.append("Private");
    button.click(function(){
      snd_diceRoll.play();
      var context = sync.defaultContext();

      var equation = "";
      for (var i in game.locals["diceRoll"].data.dice) {
        equation += game.locals["diceRoll"].data.dice[i]+"["+i+"]+";
      }
      equation = equation.substring(0, equation.length-1);

      var icon;
      var ic;
      if (chatType.text() == "IC") {
        icon = newApp.attr("src");
        var ent = getPlayerCharacter(getCookie("UserID"))
        if (!icon && ent && ent.data) {
          icon = sync.rawVal(ent.data.info.img);
        }
        ic = newApp.attr("ICText");
      }
      var priv = {};
      priv[getCookie("UserID")] = true;
      util.processEvent("/r " + equation, "rolled", icon, ic, priv);
      if (close.prop("checked") == true) {
        layout.coverlay("dice-popout-"+extraDice.attr("id"), 500);
      }
    });


    var popout = ui_popOut({
      target : $(this),
      title : "Dice Roller",
      align : "top",
      prompt : true,
      id : "dice-popout-"+extraDice.attr("id"),
      style : {"width": "300px"},
    }, content).addClass("prompt");
    popout.resizable();
  });

  var send = $("<button>").appendTo(wrap);
  send.addClass("subtitle");
  send.text("Send");
  send.click(function(ev){
    var flavor;
    var icon;
    if (chatType.text() == "IC") {
      icon = newApp.attr("src");
      var ent = getPlayerCharacter(getCookie("UserID"))
      if (!icon && ent && ent.data) {
        icon = sync.rawVal(ent.data.info.img);
      }
      if (newApp.attr("ICText")) {
        flavor = newApp.attr("ICText");
      }
      else {
        flavor = sync.eval("@me.cName", sync.defaultContext());
      }
    }
    util.chatEvent(input.val(), flavor, _whisperTargets, input, icon, flavor);
    input.val("");
  });

  return div;
});

sync.render("_imperson", function(obj, app, scope){
  var div = $("<div>");
  div.addClass("flexrow flexbetween");

  var charData = getPlayerCharacter(getCookie("UserID"));
  var charName = getPlayerCharacterName(getCookie("UserID"));

  var iconDiv = $("<div>").appendTo(div);
  iconDiv.addClass("flexrow flexmiddle");

  var icon = $("<div>").appendTo(iconDiv);
  icon.addClass("flexcolumn flexmiddle white round outline hover lrmargin");
  icon.css("background-size", "contain");
  icon.css("background-repeat", "no-repeat");
  icon.css("background-position", "center");
  icon.css("width", "25px");
  icon.css("height", "25px");
  icon.css("margin-left", "4px");
  icon.css("margin-right", "4px");
  icon.css("cursor", "pointer");
  icon.attr("UserID", getCookie("UserID"));
  if (app.attr("src")) {
    icon.css("background-image", "url('"+(app.attr("src"))+"')");
  }
  icon.click(function(){
    var parent = $(this);
    var imgList = sync.render("ui_filePicker")(obj, app, {
      filter : "img",
      value : app.attr("src"),
      change : function(ev, ui, value){
        app.attr("src", value);
        parent.css("background-image", "url('"+value+"')");
        layout.coverlay("icons-picker");
      }
    });

    var pop = ui_popOut({
      target : $(this),
      prompt : true,
      id : "icons-picker",
      align : "top",
      style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
    }, imgList);
    pop.resizable();
  });
  icon.contextmenu(function(){
    app.removeAttr("src");
    $(this).css("background-image", "none");
    return false;
  });

  var name = "No Character";
  var refresh;
  if (charData && charData.data) {
    name = sync.rawVal(charData.data.info.name);

    refresh = genIcon("refresh");
    refresh.addClass("subtitle flexmiddle lrpadding");
    refresh.click(function(){
      input.val(name);
      input.change();
      app.attr("ICText", name);
      app.attr("src", sync.rawVal(charData.data.info.img) || "/content/icons/blankchar.png");
      icon.css("background-image", "url('"+(sync.rawVal(charData.data.info.img) || "/content/icons/blankchar.png")+"')");
    });

    /*var actions = $("<button>").appendTo(div);
    actions.addClass("highlight subtitle alttext");
    actions.text("Actions");
    actions.click(function(){
      var actionObj = sync.dummyObj();
      actionObj.data = {context : {c : charData.id()}};

      game.locals["actions"] = game.locals["actions"] || {};
      game.locals["actions"].push(actionObj);

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
    });*/
  }

  if (layout.mobile) {
    var button = $("<button>").appendTo(iconDiv);
    button.append("<b>" + (app.attr("ICText") || name) + "</b>");
    button.click(function(){
      var uID = $(this).attr("UserID");
      var content = $("<div>");

      var list = [];
      for (var i in game.entities.data) {
        if (game.entities.data[i].data._t == "c") {
          list.push(i);
        }
      }
      list.sort(function(obj1, obj2){
        var obj1 = getEnt(obj1);
        var obj2 = getEnt(obj2);
        return (sync.rawVal(obj1.data.info.name) || "").toLowerCase().localeCompare((sync.rawVal(obj2.data.info.name) || "").toLowerCase());
      });

      var entList = sync.render("ui_entList")(obj, app, {
        list : list,
        filter : "c",
        rights : "Visible",
        click : function(ev, ui, ent) {
          button.empty();
          button.append("<b>"+sync.rawVal(ent.data.info.name)+"</b>");
          runCommand("selectPlayerEntity", {id : ent.id(), userID : uID});
          sendAlert({text : "Impersonating Character : " + sync.rawVal(ent.data.info.name)});
          $(".chatType").text("IC");
          $(".chatType").addClass("highlight alttext");
          $(".chatType").attr("title", "In Character");
          app.attr("ICText", sync.rawVal(ent.data.info.name));
          app.attr("src", sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png");
          icon.css("background-image", "url('"+(sync.rawVal(ent.data.info.img) || "/content/icons/blankchar.png")+"')");
          layout.coverlay("select-entity");
        }
      });
      entList.appendTo(content);
      entList.addClass("outline smooth");
      entList.css("max-height", "40vh");
      entList.css("overflow", "auto");

      ui_popOut({
        target : $(this),
        id : "select-entity",
        align : "top",
      }, content);
    });
  }
  else {
    var dataList = $("<datalist>").appendTo(div);
    dataList.attr("id", "chat-data-list");

    var input = genInput({
      parent : iconDiv,
      type : "list",
      list : "chat-data-list",
    });
    input.val(app.attr("ICText") || name);
    input.addClass("subtitle middle");
    input.change(function(){
      app.attr("ICText", $(this).val());
      $(".chatType").text("IC");
      $(".chatType").addClass("highlight alttext");
      $(".chatType").attr("title", "In Character");
      layout.coverlay("select-entity");
    });

    input.focus(function(ev){
      if (charData && charData.data && _down["16"]) {
        var content = sync.newApp("ui_characterSummary");
        charData.addApp(content);
        var popOut = ui_popOut({
          target: $(this),
          id: "char-summary-"+charData.id(),
        }, content);
      }
      else {
        $(this).val("");
        var list = [];
        for (var i in game.entities.data) {
          var ent = game.entities.data[i];
          if (ent && ent.data && game.entities.data[i].data._t == "c" && hasSecurity(getCookie("UserID"), "Rights", ent.data) && !util.contains(list, String(ent.data.info.name.current || ""))) {
            list.push(String(ent.data.info.name.current || ""));
          }
        }
        list.sort(function(obj1, obj2){
          return String(obj1 || "").toLowerCase().localeCompare(String(obj2 || "").toLowerCase());
        });
        dataList.empty();
        for (var i in list) {
          var option = $("<option>").appendTo(dataList);
          option.attr("value", list[i]);
        }
      }
      input.contextmenu(function(ev){
        input.val(util.nameBank[Math.floor(util.nameBank.length * Math.random())]);
        input.change();
        $(".chatType").text("IC");
        $(".chatType").addClass("highlight alttext");
        $(".chatType").attr("title", "In Character");
        ev.stopPropagation();
        return false;
      });
      ev.stopPropagation();
      ev.preventDefault();
      return false;
    });
    input.blur(function(){
      input.val(app.attr("ICText") || name);
    });
  }

  if (refresh) {
    refresh.appendTo(iconDiv);
  }

  var commsChat = genIcon("facetime-video", "Voice/Video").appendTo(div);
  commsChat.addClass("subtitle bold flexmiddle");
  commsChat.attr("title", "Voice/Video Chat");
  commsChat.click(function(){
    if (!comms.ready) {
      initializeCamera();
    }
    else {
      //$("#web-cam-"+playerID).show();
      comms.shutdown();
    }
  });

  return div;
});
