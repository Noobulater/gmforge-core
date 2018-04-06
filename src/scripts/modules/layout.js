var layout = {};

layout.overlay = function(options) {
  var overlay = $("<div>").appendTo($("body"));

  if ($("#"+options.id)) {
    $("#"+options.id).remove();
  }

  for (var index in options) {
    if (index == "style") {
      for (var cssIndex in options[index]) {
        overlay.css(cssIndex, options[index][cssIndex]);
      }
    }
    else if (index != "target") {
      overlay.attr(index, options[index]);
    }
  }

  if (options.target) {
    var offsets = options.target.offset();
    var width = options.target.outerWidth();
    var height = options.target.outerHeight();

    overlay.css("width", width);
    overlay.css("height", height);

    var max = util.getMaxZ(options.target);
    overlay.css("z-index", max+1);

    overlay.css("position", "absolute");
    overlay.css("top", offsets.top);
    overlay.css("left", offsets.left);
    overlay.css("bottom", offsets.bottom);
    overlay.css("right", offsets.right);
  }

  overlay.css("font-size", "2em");

  return overlay;
}

layout.coverlay = function(id, fadeOut) {
  function recurse(elem, fadeOut) {
    elem.css("pointer-events", "none");
    elem.children().each(function() {
      recurse($(this));
    });
    if (elem.attr("_children")) {
      $("[id="+elem.attr("_children")+"]").each(function(){
        recurse($(this));
      });
      if (fadeOut) {
        $("[id="+elem.attr("_children")+"]").fadeTo(fadeOut, 0);
        setTimeout(function(){
          $("[id="+elem.attr("_children")+"]").each(function(){
            $(this).remove();
          });
        }, fadeOut);
      }
      else {
        $("[id="+elem.attr("_children")+"]").each(function(){
          $(this).remove();
        });
      }
    }
  }

  var overlay;
  if (id instanceof Object) {
    overlay = id;
  }
  else {
    overlay = $("#"+id);
  }
  if (fadeOut) {
    recurse(overlay, fadeOut);
    overlay.fadeOut(fadeOut, 0);
    setTimeout(function(){overlay.remove()}, fadeOut);
  }
  else {
    recurse(overlay);
    overlay.remove();
  }
}

layout.dropout = function(target, options) {
  var overlay = $("<div>").appendTo($("body"));
  overlay.css("background-color", "rgba(0,0,0,0.5)");
  overlay.css("border", "1px black solid");
  if (options) {
    if ($("#"+options.id)) {
      $("#"+options.id).remove();
    }
    for (var index in options) {
      if (index == "style") {
        for (var cssIndex in options[index]) {
          overlay.css(cssIndex, options[index][cssIndex]);
        }
      }
      else {
        overlay.attr(index, options[index]);
      }
    }
  }

  if (target) {
    var offsets = target.offset();

    overlay.css("z-index", Number(target.css("z-index"))+1);
    overlay.css("position", "absolute");

    overlay.css("top", offsets.top+1);
    overlay.css("left", offsets.left+2);
    overlay.css("bottom", offsets.bottom);
    overlay.css("right", offsets.right);
  }

  return overlay;
}

layout.page = function(options, content) {
  var frame = $("<div>").appendTo("body");
  frame.addClass("viewPort");
  //frame.css("z-index", 59);
  if (options) {
    if ($("#"+options.id)) {
      $("#"+options.id).remove();
      frame.attr("id", options.id);
    }
    for (var cssIndex in options.style) {
      frame.css(cssIndex, options.style[cssIndex]);
    }
  }

  frame.css("position", "absolute");
  frame.css("top", "0");
  frame.css("left", "0");
  frame.css("right", "0");
  frame.css("bottom", "0");
  frame.css("pointer-events", "none");
  frame.css("background-color", "rgba(0,0,0,0)");
  frame.addClass("flexmiddle");

  var div = $("<div>").appendTo(frame);
  div.addClass("popup ui-popout");
  div.css("width", options.width || "30%");
  div.css("margin", "auto");
  div.css("pointer-events", "auto");
  div.css("max-height", "90vh");
  div.css("max-width", "80vw");
  div.css("z-index", 100);

  if (!options.hideclose) {
    var removeWrapper = $("<b>").appendTo(div);
    removeWrapper.css("position", "absolute");
    removeWrapper.css("top", "0");
    removeWrapper.css("right", "0");
    removeWrapper.css("width", "auto");
    removeWrapper.css("pointer-events", "none");

    var removeIcon = genIcon("remove").appendTo(removeWrapper);
    removeIcon.css("text-shadow", "0px 0px 4px white");
    removeIcon.css("pointer-events", "auto");
    removeIcon.click(function(ev) {
      if (options.close) {
        options.close(ev, div);
      }
      ev.stopPropagation();
      ev.preventDefault();
      layout.coverlay(frame, 500);
      return false;
    });
  }

  if (options) {
    if (options.title) {
      div.append("<div style='text-align:center;'><text style='font-size:2em; -webkit-text-stroke-width: 2px;'>"+options.title+"</text></div>");
    }
    if (options.prompt) {
      div.append("<div style='text-align:center; margin-bottom: 1em;'><b>"+options.prompt+"</b></div>");
    }
    if (options.blur) {
      frame.css("background-color", "rgba(0,0,0,"+options.blur+")");
      frame.css("pointer-events", "auto");
      frame.hide();
      frame.fadeIn();
    }
    if (options.align) {
      if (options.align.match("right")) {
        div.css("margin-left", "auto");
        div.css("margin-right", "1%");
      }
      else if (options.align.match("left")) {
        div.css("margin-right", "auto");
        div.css("margin-left", "1%");
      }
      if (options.align.match("top")) {
        div.css("margin-top", "1%");
        div.css("margin-bottom", "auto");
      }
      else if (options.align.match("bottom")) {
        div.css("margin-top", "auto");
        div.css("margin-bottom", "1%");
      }
    }
  }
  if (content) {
    content.appendTo(div);
  }
  setTimeout(function(){
    $(frame.find("input")[0]).focus();
  },0);
  return div;
}

layout.newData = function(){
  var dataContainer = $("<div>");
  dataContainer.addClass("layout-row-data flexcolumn");
  dataContainer.css("min-width", "200px");
  dataContainer.css("height", "100%");
  return dataContainer;
}

layout.newRow = function(createData) {
  var table = $("<div>");
  table.addClass("layout-table flexrow fit-x");
  table.css("min-height", "100px");

  if (createData) {
    var item = layout.newData().appendTo(table);
  }

  return table;
}

layout.hideControls = function() {
  $(".overlay-table-control").each(function() {
    layout.coverlay($(this).attr("id"), 2.0);
  });
}

layout.removeControls = function() {
  $(".overlay-table-control").each(function() {
    $(this).remove();
  });
}

layout.save = function(saveName) {
  function search(obj, array) {
    var result = array || [];
    obj.children().each(function() {
      if ($(this).hasClass("layout-row-data") || $(this).hasClass("layout-table") || $(this).hasClass("layout-list")) {
        var res = {
          w: Math.round(($(this).width()/obj.width())*100),
          h: Math.round(($(this).height()/obj.height())*100),
          class: $(this).attr("class"),
          a: []
        }
        if ($(this).hasClass("layout-list")) {
          //res.w = "100";
          console.log(res.w);
        }
        $(this).children().each(function() {
          if ($(this).hasClass("application")) {
            res.app = $(this).attr("ui-name");
          }
        });
        search($(this), res.a);
        if (res.a.length == 0) {
          delete res.a;
        }
        result.push(res);
      }
      else if (!$(this).hasClass("application")){
        obj.children().each(function() {
          result = search($(this), array);
        });
      }
    });
    return result;
  }
  var table = search($("#viewPort"), table);
  if (saveName && saveName.valid()) {
    setCookie("table_save-" + (saveName), JSON.stringify(table), 900000000);
  }
  else {
    setCookie("table_save", JSON.stringify(table));
  }
}

layout.load = function() {
  $("#viewPort").empty();
  $(".layoutHide").remove();
  function build(array, focus) {
    for (var index in array) {
      var data = array[index];
      if (data.class.match("layout-table")) {
        var table = layout.newRow().appendTo(focus);
        table.css("height", (data.h || 100) + "%");
        build(data.a, table);
      }
      else if (data.class.match("layout-row-data") || data.class.match("layout-list")) {
        var td = layout.newData().appendTo(focus);
        if (data.class.match("layout-list")) {
          td.removeClass("layout-row-data");
          td.addClass("layout-list");
          td.css("width", (data.w || 100) + "%");
        }
        else {
          td.css("width", (data.w || 100) + "%");
        }
        build(data.a, td);
        if (data.app) {
          var newApp = sync.newApp(data.app);
          newApp.css("flex", "1"); // firefox specific fix
          newApp.appendTo(td);
          // render it all
          newApp.append(sync.render(data.app)(null, newApp));
        }
      }
    }
  }
  //var layoutStorage = localStorage.getItem("layouts")
  if (getCookie("table_save") && getCookie("table_save").trim() && getCookie("table_save") != "none") {
    build(JSON.parse(getCookie("table_save")), $("#viewPort"));
  }
  else {
    setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table","a":[{"w":100,"h":100,"class":"layout-row-data","app":"ui_primaryView"}]}]', 90000000);
    layout.load();
  }
}

layout.showControls = function() {
  var counter = 1;
  $(".layout-table").each(function() {
    var rowOverlay = layout.overlay({target: $(this), id: "overlay-table-control"+counter});
    rowOverlay.addClass("overlay-table-control");
    rowOverlay.css("position", "fixed");
    rowOverlay.css("overflow", "hidden");
    rowOverlay.css("background-color", "rgba(0,"+counter * 8+",0,0.5)");
    $(this).attr("id", "layout-row-"+counter);
    rowOverlay.attr("target", "layout-row-"+counter);

    var container = $("<div>").appendTo(rowOverlay);
    container.addClass("fit-xy flexrow");
    container.css("position", "relative");
    container.css("color", "#ff8a42");
    if (counter == 1) {
      var icon = genIcon("plus").appendTo(container);
      icon.css("position", "absolute");
      icon.css("top", "10%");
      icon.css("color", "white");
      icon.attr("target", rowOverlay.attr("target"));
      icon.attr("title", "New Row");
      icon.click(function() {
        var target = $("#"+$(this).attr("target"));
        var td = layout.newRow();
        td.append(layout.newData());
        target.after(td);

        layout.rebuildControls();
      });
    }

    var icon = genIcon("plus").appendTo(container);
    icon.css("position", "absolute");
    icon.css("bottom", "10%");
    icon.css("color", "white");
    icon.attr("target", rowOverlay.attr("target"));
    icon.attr("title", "New Row");
    icon.click(function() {
      var target = $("#"+$(this).attr("target"));
      var td = layout.newRow();
      td.append(layout.newData());
      target.after(td);

      layout.rebuildControls();
    });

    var counterID = "overlay-table-control"+counter+"-v";

    counter = counter + 1;

    $(this).children().each(function() {
      var subCountID = "overlay-table-control"+counter+"-h";

      var overlay = layout.newData().appendTo(container);
      overlay.addClass("flexrow flexmiddle hardoutline focus");
      overlay.css("border", "1px solid #ff8a42");
      overlay.css("position", "relative");
      overlay.css("pointer-events", "none");
      overlay.css("flex", $(this).css("flex"));
      overlay.css("width", $(this).width());
      if (!$(this).hasClass("layout-row-data")) {return}
      overlay.attr("id", "overlay-table-control"+counter);
      $(this).attr("id", "layout-data-"+counter);
      overlay.attr("target", "layout-data-"+counter);

      var ctrls = $("<div>").appendTo(overlay);
      ctrls.addClass("flexcolumn flexmiddle alttext");
      ctrls.css("pointer-events", "none");
      ctrls.css("width", "80%");
      ctrls.css("height", "80%");
      ctrls.css("color", "#ff8a42");
    /*var icon = genIcon("plus").appendTo(ctrls);
      icon.css("pointer-events", "auto");
      icon.attr("target", overlay.attr("target"));
      icon.click(function() {
        var target = $("#"+$(this).attr("target"));
        var td = layout.newRow();
        td.append(layout.newData());
        target.parent().before(td);

        layout.rebuildControls();
      });*/

      var middle = $("<div>").appendTo(ctrls);
      middle.addClass("flexrow flexaround fit-x");
      middle.css("pointer-events", "none");

      var icon = genIcon("plus").appendTo(middle);
      icon.css("pointer-events", "auto");
      icon.attr("target", overlay.attr("target"));
      icon.click(function() {
        var target = $("#"+$(this).attr("target"));
        var td = layout.newData();
        target.parent().prepend(td);

        layout.rebuildControls();
      });
      var isViewPort = ($(this).parent().parent().attr("id") == "viewPort");
      if ((isViewPort && ($("#viewPort").children().length > 1 || ($(this).parent().children().length > 1))) || (!isViewPort)) {
        var icon = genIcon("remove").appendTo(middle);
        icon.addClass("destroy");
        icon.css("pointer-events", "auto");
        icon.attr("target", overlay.attr("target"));
        icon.click(function() {
          var target = $("#"+$(this).attr("target"));
          if (target.parent().children().length > 1) {
            target.remove();
          }
          else if (target.parent().children().length == 1) {
            if (target.parent().parent().children().length <= 1 && target.parent().parent().attr("id") != "viewPort") {
              target.parent().parent().remove();
            }
            else {
              target.parent().remove();
            }
          }
          layout.rebuildControls();
        });
      }

      var icon = genIcon("th", "APP").appendTo(middle);
      icon.css("pointer-events", "auto");
      icon.attr("target", overlay.attr("target"));
      icon.click(function() {
        //TODO :  FIX THIS SHIT MAKE IT BETTEER HAVE TREE
        var buildList = [];
        //options
        var target = $("#"+$(this).attr("target"));
        function recurse(data, source) {
          for (var index in data) {
            if (index == "_ui") {
              for (var ind in data[index]) {
                data[index][ind].click = function(ev, self) {
                  target.empty();
                  var app = sync.newApp(self.attr("ui-name")).appendTo(target);
                  sync.render(self.attr("ui-name"))(null, app).appendTo(app);
                  layout.coverlay("layout-control-popup");
                }
                source.push(data[index][ind]);
              }
            }
            else {
              var addObj = {name : index, submenu : []};
              recurse(data[index], addObj.submenu);
              source.push(addObj);
            }
          }
        }

        recurse(game.components, buildList);
        var dropMenu = ui_dropMenu($(this),
          buildList,
          {
            id: "layout-control-popup",
            style: {
            "background-color": "rgb(255, 255, 255)",
          }
        });
      });

      var icon = genIcon("plus").appendTo(middle);
      icon.css("pointer-events", "auto");
      icon.attr("target", overlay.attr("target"));
      icon.click(function() {
        var target = $("#"+$(this).attr("target"));
        var td = layout.newData();
        target.after(td);

        layout.rebuildControls();
      });

      if (isViewPort && (($(this).parent().children().length > 1))) {
        var icon = genIcon("plus").appendTo(ctrls);
        icon.addClass("create");
        icon.css("pointer-events", "auto");
        icon.attr("target", overlay.attr("target"));
        icon.click(function() {
          var target = $("#"+$(this).attr("target"));
          var td = layout.newRow();
          td.append(layout.newData().addClass("fit-x"));

          target.removeClass("layout-row-data");
          target.addClass("layout-list");
          target.empty();
          target.append(td);

          layout.rebuildControls();
        });
      }
      console.log($(this).css("flex"));
      if ($(this).css("flex") == "1 1 0%") {
        var isfilling = $("<b class='subtitle dull'>Filling Empty Space</b>").appendTo(ctrls);
      }
      var icon = genIcon({raw : true, icon : "resize-horizontal"});
      icon.appendTo(overlay);
      icon.addClass("flexmiddle ui-resizeable ui-resizeable-handle ui-resizable-e");
      icon.css("color", "white");
      icon.css("pointer-events", "auto");
      icon.attr("id", subCountID);

      var total = $(this).parent().width();
      $(this).parent().children().each(function() {
        total = total - $(this).width();
      });
      total = total + $(this).width();
      //if ($(this).parent().children().length > 1) {

      //}
      overlay.resizable({
        ghost : true,
        minHeight : 100,
        minWidth : 100,
        maxWidth : total,
        handles : {
          'e': "#"+subCountID,
        },
        stop : function(ev, ui) {
          var target = $("#"+$(ui.element).attr("target"));

          var total = target.parent().width();
          target.parent().children().each(function() {
            total = total - $(this).width();
          });
          total = total + target.width();

          target.css("flex", "");
          if (ui.size.width >= total) {
            target.css("flex", "1");
          }
          else {
            target.css("width", Math.floor((Math.min(ui.size.width, total)/target.parent().width())*100)+"%");
          }

          for (var key in _syncList) {
            _syncList[key].update();
          }

          layout.rebuildControls();
        }
      });
      counter = counter + 1;
    });

    var icon = genIcon({raw : true, icon : "resize-vertical"});
    icon.appendTo(rowOverlay);
    icon.addClass("flexmiddle ui-resizeable ui-resizeable-handle ui-resizable-s");
    icon.css("color", "white");
    icon.css("pointer-events", "auto");
    icon.css("font-size", "2em");
    icon.attr("id", counterID);

    var total = $(this).parent().height();
    $(this).parent().children().each(function() {
      total = total - $(this).height();
    });
    total = total + $(this).height();

    rowOverlay.resizable({
      ghost : true,
      minHeight : 100,
      maxHeight : total,
      minWidth : 100,
      maxWidth : $(this).parent().width(),
      handles : {
        's': "#"+counterID,
      },
      stop : function(ev, ui) {
        var target = $("#"+$(ui.element).attr("target"));

        var total = target.parent().height();
        target.parent().children().each(function() {
          total = total - $(this).height();
        });
        total = total + target.height();

        target.css("flex", "");
        if (ui.size.height >= total) {
          target.css("flex", "1");
        }
        else {
          target.css("height", Math.floor((Math.min(ui.size.height, total)/target.parent().height())*100)+"%");
        }

        for (var key in _syncList) {
          _syncList[key].update();
        }
        layout.rebuildControls();
      }
    });
  });
}

layout.rebuildControls = function() {
  layout.removeControls();
  layout.showControls();
}

layout.anchorInit = function() {
  $(".main-dock").remove();
  $("#bottombar").show();
  $("#bottombar").empty();

  var layoutControls = $("<div>").appendTo($("#bottombar"));
  layoutControls.addClass("flexrow flexmiddle dull");

  var reactions = genIcon("menu-hamburger").appendTo(layoutControls);
  reactions.addClass("lrpadding");
  reactions.css("font-size", "2.0em");
  reactions.click(function(){
    openSplash(true);
  });

  var layoutCtrls = $("<div>").appendTo(layoutControls);
  layoutCtrls.addClass("flexcolumn");

  var layoutCtrl = $("<div>").appendTo(layoutCtrls);
  layoutCtrl.addClass("flexrow fit-x");

  var cmbt = $("<div>").appendTo(layoutCtrls);
  cmbt.attr("id", "navControls");

  var reactions = genIcon("cog").appendTo(layoutCtrl);//$("<div>").appendTo($("#bottombar"));
  reactions.attr("title", "Options");
  reactions.click(function(){
    if ($("#game-options-popout").length) {
      layout.coverlay("game-options-popout");
      return;
    }

    var content = $("<div>");
    content.addClass("flexcolumn padding");

    var community = genIcon("user", "Community", true).appendTo(content);
    community.attr("href", "https://www.reddit.com/r/gamemasterapp");
    community.attr("target", "_blank");

    var feedback = genIcon("info-sign", "Feedback", true).appendTo(content);

    var news = genIcon("bullhorn", "News", true).appendTo(content);

    var wiki = genIcon("book", "Wiki", true).appendTo(content);
    wiki.attr("href", "http://wiki.gmforge.io");
    wiki.attr("target", "_blank");

    var hotkeyCtrl = $("<div>").appendTo(content);
    hotkeyCtrl.addClass("spadding");

    var hotkeyCtrl = $("<div>").appendTo(content);
    hotkeyCtrl.addClass("flexcolumn");

    var hotKeys = genIcon("link", "Show HotKey List", true).appendTo(hotkeyCtrl);
    hotKeys.attr("title", "Show HotKey List");
    hotKeys.click(function(){
      toggleHotKeysDisplay();
    });

    var floatingApp = genIcon("plus", "Temporary App", true).appendTo(content);
    floatingApp.attr("title", "Temporary App");
    floatingApp.click(function() {
      var buildList = [];
      //options
      function recurse(data, source) {
        for (var index in data) {
          if (index == "_ui") {
            for (var ind in data[index]) {
              data[index][ind].click = function(ev, self) {
                var content = sync.newApp(self.attr("ui-name"), null, {});

                var popout = ui_popOut({
                  title : self.attr("ui-name"),
                  target : floatingApp,
                  align : "bottom",
                  minimize : true,
                  maximize : true,
                  dragThickness : "0.5em",
                  resizable : true,
                  style : {"max-width" : "none"},
                }, content);
                popout.css("padding", "0px");
                popout.addClass("floating-app");
              }
              source.push(data[index][ind]);
            }
          }
          else {
            var addObj = {name : index, submenu : []};
            recurse(data[index], addObj.submenu);
            source.push(addObj);
          }
        }
      }

      recurse(game.components, buildList);
      var dropMenu = ui_dropMenu($(this), buildList, {id: "layout-control-popup"}).css("z-index", "100000000000");
    });

    var gameOptCtrl = $("<div>").appendTo(content);
    gameOptCtrl.addClass("flexcolumn");

    var label = genIcon("log-in", "Game Invite", true).appendTo(gameOptCtrl);
    label.css("pointer-events", "auto");
    label.click(function(){
      var input = genInput({
        parent : $(this),
        id : "copy-url",
        value : window.location.href,
      });

      if (game.config.data.password) {
        input.val(encodeURI(input.val()+"?password="+game.config.data.password));
      }
      if (getCookie("ExternalIP")) {
        input.val(getCookie("ExternalIP")+":"+getCookie("PublicPort")+"/join");
      }
      input.focus();
      input.get(0).setSelectionRange(0, input.val().length);

      document.execCommand("copy");
      input.remove();
      sendAlert({text : "Invitation Copied!"});
    });



    var gameOptions = genIcon("wrench", "Game Options", true).appendTo(gameOptCtrl);
    gameOptions.attr("title", "Game Options");
    gameOptions.click(function() {
      if (getCookie("UserID") == game.owner) {
        var frame = layout.page({title: "Game Configuration", prompt : "Change information on how this server", blur: 0.5, id : "gameOptions", width : "50%"});

        var newApp = sync.newApp("ui_gameCtrl", game.config);
        newApp.appendTo(frame);
      }
      else if (hasSecurity(getCookie("UserID"), "Trusted Player")){
        var frame = layout.page({title: "Assistant Master", prompt : "what do you want to do", blur: 0.5, id: "save-as-session-prompt"});

        var buttonDiv = $("<div>").appendTo(frame);
        buttonDiv.addClass("flexaround");

        var yes = $("<button>").appendTo(buttonDiv);
        yes.append("Give me Anytime Access to this Game");
        yes.click(function(){
          runCommand("grantAccess");
          layout.coverlay("save-as-session-prompt");
        });

        var no = $("<button>").appendTo(buttonDiv);
        no.append("Continue to Game Controls");
        no.click(function(){
          var frame = layout.page({title: "Game Configuration", prompt : "Change information on how this server", blur: 0.5, id : "gameOptions", width : "50%"});

          var newApp = sync.newApp("ui_gameCtrl", game.config);
          newApp.appendTo(frame);
          layout.coverlay("save-as-session-prompt");
        });
      }
      layout.coverlay("game-options-popout");
    });

    var reactionsCtrl = $("<div>").appendTo(content);
    reactionsCtrl.addClass("flexcolumn");

    var reactions = genIcon("comment", "Reactions Enabled", true);
    if (getCookie("disableReactions") == "true") {
      reactions = genIcon("comment", "Reactions Disabled", true);
      reactions.css("color", "rgb(170, 130, 130)");
    }
    reactions.appendTo(reactionsCtrl);
    reactions.click(function() {
      if (getCookie("disableReactions") == "true") {
        setCookie("disableReactions", "");
      }
      else {
        setCookie("disableReactions", "true");
      }
      layout.coverlay("game-options-popout");
    });

    var alertsCtrl = $("<div>").appendTo(content);
    alertsCtrl.addClass("flexcolumn");

    var alerts = genIcon("bell", "Alerts Enabled", true);
    if (getCookie("disableAlerts") == "true") {
      alerts = genIcon("bell", "Alerts Disabled", true);
      alerts.css("color", "rgb(170, 130, 130)");
    }
    alerts.appendTo(alertsCtrl);
    alerts.click(function() {
      if (getCookie("disableAlerts") == "true") {
        setCookie("disableAlerts", "");
      }
      else {
        setCookie("disableAlerts", "true");
      }
      layout.coverlay("game-options-popout");
    });

    var alerts = genIcon("film", "Media Enabled", true);
    if (mediaPlayer.disabled) {
      alerts = genIcon("film", "Media Disabled", true);
      alerts.css("color", "rgb(170, 130, 130)");
    }
    alerts.appendTo(alertsCtrl);
    alerts.click(function() {
      if (mediaPlayer.disabled) {
        delete mediaPlayer.disabled;
      }
      else {
        mediaPlayer.disabled = true
      }
      layout.coverlay("game-options-popout");
    });

    var popout = ui_popOut({
      target : $(this),
      id : "game-options-popout",
      align : "top",
    }, content);
    popout.removeClass("boxshadow");
    var max = util.getMaxZ(".ui-popout");
    popout.css("z-index", max+1);
  });


  var layoutControls = genIcon("th-large").appendTo(layoutCtrl);
  layoutControls.addClass("lrpadding");
  layoutControls.attr("title", "Change screen layout");
  layoutControls.click(function(){
    var cookies = getCookies();
    var choices = [];
    for (var key in cookies) {
      if (key.match("table_save-") && getCookie(key.trim()) && getCookie(key.trim()) != "") {
        choices.push({
          name : key.replace("table_save-", ""),
          attr : {key : key},
          submenu : [
            {
              name : "DELETE",
              click : function(){
                setCookie($(this).attr("key").trim(), "", 10);
                layout.coverlay("add-hot-app");
                $(this).parent().remove();
                ev.stopPropagation();
                ev.preventDefault();
              }
            }
          ],
          click : function(ev, ui){
            setCookie("table_save", getCookie(ui.attr("key").trim()));

            layout.load();
            layout.coverlay("add-hot-app");
          }
        });
      }
    }

    var layouts = [
      {
        name : "Map Only",
        icon : "globe",
        click : function(){
          setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table","a":[{"w":100,"h":100,"class":"layout-row-data","app":"ui_displayManager"}]}]');

          layout.load();
        }
      },
      {
        name : "Tabletop Layout",
        icon : "th-large",
        click : function(){
          setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table","a":[{"w":77,"h":100,"class":"layout-row-data","app":"ui_displayManager"},{"w":23,"h":100,"class":"layout-row-data","app":"ui_textBox"}]}]');

          layout.load();
        }
      },
      {
        name : "World Editor",
        icon : "globe",
        click : function(){
          setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table flexrow fit-x","a":[{"w":77,"h":100,"class":"layout-row-data flexcolumn","app":"ui_displayManager"},{"w":23,"h":100,"class":"flexcolumn layout-list","a":[{"w":100,"h":75,"class":"layout-table flexrow fit-x","a":[{"w":100,"h":100,"class":"layout-row-data flexcolumn","app":"ui_boardListener"}]},{"w":100,"h":25,"class":"layout-table flexrow fit-x","a":[{"w":100,"h":100,"class":"layout-row-data flexcolumn fit-x","app":"ui_assetManager"}]}]}]}]', 90000000);
          layout.load();
        }
      },
    ];

    var layouts = [
      {
        name : "Default Layouts",
        submenu : layouts,
      },
      {
        name : "Custom Layouts",
        submenu : choices,
      },
      {
        name : "Save Layout",
        click : function(){
          var frame = layout.page({title: "Save Layout", blur: 0.5, id : "saveLayout"});

          var newName = genInput({
            parent: frame,
            placeholder: "Enter New Layout Name",
            style: {"width": "100%"},
          });

          var button = $("<button>").appendTo(frame);
          button.css("width", "100%");
          button.attr("counter-ref", $(this).attr("counter-ref"));
          button.text("Submit");
          button.click(function() {
            layout.save(newName.val());
            layout.coverlay(frame.parent(), 500);
            layout.hideControls();
          });

          frame.append(button);
        }
      },
      {
        name : "Save Default",
        click : function(){
          layout.save();
        }
      },
      {
        name : "Toggle Layout Controls",
        click : function(){
          if ($(".overlay-table-control").length == 0) {
            layout.showControls();
          }
          else {
            layout.hideControls();
          }
        }
      },
    ];

    var actionList = [
      {
        name : "Layouts",
        submenu : layouts
      },
    ];


    util.insert(actionList, 0, {
      name : "Exit Anchor Mode",
      click : function(){
        setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table","a":[{"w":100,"h":100,"class":"layout-row-data","app":"ui_primaryView"}]}]', 9000000000000);
        layout.init();
      }
    });

    ui_dropMenu($(this), actionList, {id : "layout-list", align : "top", style : {"z-index" : "10000000000000000000"}});
  });

  if (hasSecurity(getCookie("UserID"), "Assistant Master") && !game.config.data.offline && Object.keys(game.players.data).length > 1) {
    var label = genIcon("log-in").appendTo(layoutCtrl);
    label.css("margin-right", "4px");
    label.attr("title", "Copies an invite to clipboard");
    label.click(function(){
      var input = genInput({
        parent : $(this),
        id : "copy-url",
        value : window.location.href.split("?password")[0],
      });

      if (game.config.data.password) {
        input.val(encodeURI(input.val()+"?password="+game.config.data.password));
      }

      input.focus();
      input.get(0).setSelectionRange(0, input.val().length);

      document.execCommand("copy");
      input.remove();
      sendAlert({text : "Invitation Copied!"});
    });
  }

  var commsChat = genIcon("facetime-video").appendTo(layoutCtrl);
  commsChat.addClass("lrpadding");
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

  if (getCookie("UserID") && getCookie("UserID") != "Sandboxer") {
    var media = genIcon("folder-open").appendTo(layoutCtrl);
    media.addClass("lrpadding create");
    media.attr("title", "Cloud file manager");
    media.click(function() {
      if ($("#cloud-files").length) {
        if ($("#cloud-files").is(":visible")) {
          $("#cloud-files").hide();
        }
        else {
          $("#cloud-files").show();
        }
      }
      else {
        var newApp = sync.newApp("ui_fileBrowser", null, {cloud : true});

        var popOut = ui_popOut({
          target : $(this),
          align : "top",
          title : "Cloud Files",
          id : "cloud-files",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
          style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
        }, newApp);
        popOut.resizable();
      }
    });
  }

  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var media = genIcon("film").appendTo(layoutCtrl);
    media.addClass("lrpadding create");
    media.attr("title", "Media Player");
    media.click(function() {
      if ($("#media-player").length) {
        if ($("#media-player").is(":visible")) {
          $("#media-player").hide();
        }
        else {
          $("#media-player").show();
          var max = util.getMaxZ(".ui-popout");
          $("#media-player").css("z-index", max+1);
        }
      }
      else {
        var newApp = sync.newApp("ui_media", true);

        var popOut = ui_popOut({
          target : $(this),
          align : "right",
          title : "Youtube Player",
          id : "media-player",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
          style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
        }, newApp);
        popOut.resizable();
      }
    });

    var media = genIcon("music").appendTo(layoutCtrl);
    media.addClass("lrpadding create");
    media.attr("title", "Audio Player");
    media.click(function() {
      if ($("#audio-player").length) {
        if ($("#audio-player").is(":visible")) {
          $("#audio-player").hide();
        }
        else {
          $("#audio-player").show();
        }
      }
      else {
        var newApp = sync.newApp("ui_audioPlayer");
        game.config.addApp(newApp);
        var popOut = ui_popOut({
          target : $(this),
          align : "top",
          title : "Audio Player",
          id : "audio-player",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
          style : {"width" : "400px", "height" : "400px"}
        }, newApp);
        popOut.resizable();
      }
    });
  }

  if (getCookie("UserID") && getCookie("UserID") != "Sandboxer" && game.templates.initiative && game.templates.initiative.query) {
    var text = "Setup Combat";
    if (!hasSecurity(getCookie("UserID"), "Assistant Master")) {
      text = "Show Combat";
    }
    var setupcombat = genIcon("resize-small", text).appendTo($("#navControls"));
    setupcombat.addClass("bold");
    setupcombat.click(function(){
      if ($("#quick-combat").length == 0) {
        var charList = sync.newApp("ui_combatControls");
        charList.addClass("white");
        game.state.addApp(charList);
        var pop = ui_popOut({
          align : "top-left",
          target : $("#bottombar"),
          id : "quick-combat",
          title : "Combat",
          minimize : true,
          maximize : true,
          close : function(){
            pop.hide();
          },
          style : {"width" : "400px", "height" : "300px"}
        }, charList);
        pop.resizable();
      }
      else if ($("#quick-combat").is(":visible")) {
        $("#quick-combat").hide();
      }
      else {
        $("#quick-combat").show();
        var max = util.getMaxZ(".ui-popout");
        $("#quick-combat").css("z-index", max+1);
      }
    });
  }

  if (!game.config.data.restricted) {
    var button = genIcon("camera");//.appendTo($("#navControls"));
    button.addClass("lrpadding create");
    button.click(function(){
      var content = $("<div>");
      content.addClass("flexcolumn");

      var rows = $("<div>").appendTo(content);
      rows.addClass("flexrow");

      var boardWrap = $("<div>").appendTo(rows);
      boardWrap.append("<b>Boards</b>");

      var boardList = $("<div>").appendTo(boardWrap);
      var dummyObj = sync.dummyObj();
      var entList = sync.render("ui_entList")(dummyObj, content, {
        filter : "b",
        draw : function(ui, ent) {
          var optionsBar = $("<div>").appendTo(ui);
          optionsBar.addClass("background alttext outline");

          var zoom = genIcon("zoom-in", "100% zoom").appendTo(optionsBar);
          zoom.click(function(ev){
            if (ui.hasClass("highlight2")) {
              ui.removeClass("highlight2");
            }
            else {
              ui.addClass("highlight2");
            }
            var reg = /(.*)session\/([^\?]*)/i;
            var sessionURL = window.location.href.match(reg);
            var redirectWindow = window.open(sessionURL[1]+'printing?sessionURL='+sessionURL[2]+"&eID="+ent.id()+"&zoom=100", '_blank');
            redirectWindow.location;
            ev.preventDefault();
            ev.stopPropagation();
          });
          var zoom = genIcon("picture", "Without Grid").appendTo(optionsBar);
          zoom.click(function(ev){
            if (ui.hasClass("highlight2")) {
              ui.removeClass("highlight2");
            }
            else {
              ui.addClass("highlight2");
            }
            var reg = /(.*)session\/([^\?]*)/i;
            var sessionURL = window.location.href.match(reg);
            var redirectWindow = window.open(sessionURL[1]+'printing?sessionURL='+sessionURL[2]+"&eID="+ent.id()+"&nogrid=1", '_blank');
            redirectWindow.location;
            ev.preventDefault();
            ev.stopPropagation();
          });

          var zoom = genIcon("search", "100% Zoom Without Grid").appendTo(optionsBar);
          zoom.click(function(ev){
            if (ui.hasClass("highlight2")) {
              ui.removeClass("highlight2");
            }
            else {
              ui.addClass("highlight2");
            }
            var reg = /(.*)session\/([^\?]*)/i;
            var sessionURL = window.location.href.match(reg);
            var redirectWindow = window.open(sessionURL[1]+'printing?sessionURL='+sessionURL[2]+"&eID="+ent.id()+"&zoom=100&nogrid=1", '_blank');
            redirectWindow.location;
            ev.preventDefault();
            ev.stopPropagation();
          });
        },
        click : function(ev, ui, ent){
          if (ui.hasClass("highlight2")) {
            ui.removeClass("highlight2");
          }
          else {
            ui.addClass("highlight2");
          }
          var reg = /(.*)session\/([^\?]*)/i;
          var sessionURL = window.location.href.match(reg);
          var redirectWindow = window.open(sessionURL[1]+'printing?sessionURL='+sessionURL[2]+"&eID="+ent.id(), '_blank');
          redirectWindow.location;
        }
      });
      entList.appendTo(boardList);

      /*var charWrap = $("<div>").appendTo(rows);
      charWrap.append("<b>Characters</b>");

      var charList = $("<div>").appendTo(charWrap);
      var dummyObj = sync.dummyObj();
      var entList = sync.render("ui_entList")(dummyObj, content, {
        filter : "c",
        draw : function(plate, ent) {
          plate.removeClass("flexcolumn");
          plate.addClass("flexrow");
          genInput({parent : plate, type : "checkbox"});
          genInput({parent : plate, type : "checkbox"});
        },
        click : function(ev, ui, ent){
          if (ui.hasClass("highlight2")) {
            ui.removeClass("highlight2");
          }
          else {
            ui.addClass("highlight2");
          }
        }
      });
      entList.appendTo(charList);

      var pageWrap = $("<div>").appendTo(rows);
      pageWrap.append("<b>Pages</b>");

      var pageList = $("<div>").appendTo(pageWrap);
      var dummyObj = sync.dummyObj();
      var entList = sync.render("ui_entList")(dummyObj, content, {
        filter : "p",
        click : function(ev, ui, ent){
          if (ui.hasClass("highlight2")) {
            ui.removeClass("highlight2");
          }
          else {
            ui.addClass("highlight2");
          }
        }
      });
      entList.appendTo(pageList);

      var vehWrap = $("<div>").appendTo(rows);
      vehWrap.append("<b>Vehicles</b>");

      var vehList = $("<div>").appendTo(vehWrap);
      var dummyObj = sync.dummyObj();
      var entList = sync.render("ui_entList")(dummyObj, content, {
        filter : "v",
        click : function(ev, ui, ent){
          if (ui.hasClass("highlight2")) {
            ui.removeClass("highlight2");
          }
          else {
            ui.addClass("highlight2");
          }
        }
      });
      entList.appendTo(vehList);*/

      var popOut = ui_popOut({
        target : $(this),
        id : "printing-selection",
      }, content);
    });
  }
  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var button = genIcon("calendar").appendTo(layoutCtrl);
    button.addClass("lrpadding create");
    button.attr("title", "Calendar");
    button.click(function(){
      if ($("#calendar").length) {
        if ($("#calendar").is(":visible")) {
          $("#calendar").hide();
        }
        else {
          $("#calendar").show();
        }
      }
      else {
        var content = sync.newApp("ui_calendar");
        game.state.addApp(content)

        var popOut = ui_popOut({
          target : $(this),
          id : "calendar",
          align : "top",
          minimze : true,
          title : " ",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
          style : {"width" : Math.min(820, $(window).width())+"px", "height" : "650px"}
        }, content);
        popOut.resizable();
      }
    });

    var button = genIcon("sunglasses").appendTo(layoutCtrl);
    button.addClass("lrpadding create");
    button.attr("title", "Special Effects");
    button.click(function(){
      if ($("#special-effects").length) {
        if ($("#special-effects").is(":visible")) {
          $("#special-effects").hide();
        }
        else {
          $("#special-effects").show();
          var max = util.getMaxZ(".ui-popout");
          $("#special-effects").css("z-index", max+1);
        }
      }
      else {
        var content = $("<div>");
        content.addClass("alttext flexcolumn foreground");
        for (var i in util.effects) {
          var effect = $("<button>").appendTo(content);
          effect.addClass("background");
          effect.text(i);
          effect.click(function(){
            var effect = $(this).text();
            $(".displayApp").each(function(){
              runCommand("effect", {effect : effect, tab : $(this).attr("currentTab") || 0});
            });
          });
        }

        var popOut = ui_popOut({
          target : $(this),
          id : "special-effects",
          align : "top",
          minimze : true,
          title : "SFX",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
        }, content);
        popOut.resizable();
      }
    });
  }

  var app = sync.newApp("ui_setting").appendTo(layoutCtrl);
  app.addClass("lrmargin");
  app.css("height", "auto");
  app.css("width", "auto");
  game.state.addApp(app);

  var media = genIcon("user", "Actors").appendTo(layoutCtrl);
  media.addClass("lrpadding alttext");
  media.attr("title", "Asset Manager");
  media.click(function() {
    var newApp = sync.newApp("ui_assetManager", null, {});
    if ($("#asset-manager").length) {
      if ($("#asset-manager").is(":visible")) {
        $("#asset-manager").hide();
      }
      else {
        $("#asset-manager").show();
      }
    }
    else {
      var pop = ui_popOut({
        target : $(this),
        align : "top",
        title : "Asset Manager",
        id : "asset-manager",
        minimze : true,
        close : function(ev, ui) {
          pop.hide();
          return false;
        },
        style : {"width" : "400px", "height" : "600px"}
      }, newApp);
      pop.resizable();
    }
  });

  // fill the height
  function resize() {
    var height = $("#navbar").outerHeight();
    if ($("#bottombar").length) {
      height = height + $("#bottombar").outerHeight();
    }
    $("#viewPort").css("height", $(window).height() - height);
  }
  resize();
  resizeHooks["layout"] = function() {
    resize();
  }

  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var cardWrap = $("<div>").appendTo($("#bottombar"));
    cardWrap.addClass("flexrow flexmiddle");

    var newApp = sync.newApp("ui_deck").appendTo(cardWrap);
    newApp.addClass("flexmiddle lrpadding");
    newApp.removeClass("application");
    newApp.css("overflow", "hidden");
    newApp.css("height", $("#bottombar").height());
    game.state.addApp(newApp);
  }

  var app = sync.newApp("ui_players");
  app.appendTo($("#bottombar"));
  app.css("height", "auto");
  app.css("width", "auto");
  app.attr("size", "50");
  app.css("overflow-y", "hidden");
  app.css("pointer-events", "none");
  game.players.addApp(app);

  var cardWrap = $("<div>").appendTo($("#bottombar"));
  cardWrap.addClass("flexrow flexmiddle");

  var newApp = sync.newApp("ui_hand").appendTo(cardWrap);
  newApp.attr("UserID", getCookie("UserID"));
  newApp.css("overflow-y", "hidden");
  newApp.css("height", $("#bottombar").height());
  newApp.css("margin-top", "4px");
  newApp.css("max-width", "30vw");
  game.state.addApp(newApp);
  if (!game.config.data.restricted || game.user.membership) {
    var outline = $("<div>").appendTo($("#bottombar"));

    var app = sync.newApp("ui_hotApps", null, {});
    app.appendTo(outline);
    app.addClass("flexmiddle spadding");
    app.css("height", "auto");
    app.css("width", "auto");
    app.css("overflow-y", "hidden");
    app.css("padding-top", "4px");
    app.css("padding-right", "4px");
    $("#bottombar").bind("paste", function(e) {
      // access the clipboard using the api
      // firefox won't call this if ctrl shift + v
      if (hasSecurity(getCookie("UserID"), "Trusted Player")) {
        if (getCookie("disableReactions") != "true") {
          ui_processLink(e.originalEvent.clipboardData.getData('text'), function(link, newLink, exists){
            runCommand("reaction", newLink);
          });
        }
      }
    });
  }
}

var mediaPlayer = mediaPlayer || {iframe : null, width : '400', height : '200'};

function media_init() {
  if (mediaPlayer.disabled) {
    return false;
  }
  mediaPlayer.iframe = null;
  var contentCC = $("<div>");
  contentCC.bind("paste", function(e) {
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      var reg = /([v][=])([\S]*)/;
      var ex = reg.exec(e.originalEvent.clipboardData.getData('text'));
      if (ex) {
        runCommand("media", {cmd : "update", data : {video : ex[2]}});
      }
    }
  });

  contentCC.on("dragover", function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
      if (!$("#media-drag-overlay").length) {
        var olay = layout.overlay({
          target : contentCC,
          id : "media-drag-overlay",
          style : {"background-color" : "rgba(0,0,0,0.5)", "pointer-events" : "none"}
        });
        olay.addClass("flexcolumn flexmiddle alttext");
        olay.css("font-size", "2em");
        olay.append("<b>Drop to Load Video</b>");
      }
    }
  });
  contentCC.on('drop', function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    var dt = ev.originalEvent.dataTransfer;
    if (dt.getData("Text")) {
      if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
        var reg = /([v][=])([\S]*)/;
        var ex = reg.exec(dt.getData("Text"));
        if (ex) {
          runCommand("media", {cmd : "update", data : {video : ex[2]}});
        }
      }
    }
    layout.coverlay("media-drag-overlay");
  });

  contentCC.on("dragleave", function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    layout.coverlay("media-drag-overlay");
  });

  var content = $("<div>").appendTo(contentCC);
  content.attr("id", "media");

  var frame = ui_popOut({
    id : "dragMedia",
    noCss : true,
    close : function(){
      runCommand("media", {cmd : "watching", video : ""});
    },
    style : {"position": "fixed", "min-width": "", "min-height": "", "z-index" : "2000", "background-color" : "white"}
  }, contentCC).removeClass("ui-popout").addClass("smooth");


  var seekingWrap = $("<div>").appendTo(contentCC);
  seekingWrap.addClass("flexrow flexbetween");

  var seeking = genInput({
    parent : seekingWrap,
    type: "range",
    min : 0,
    max : 0, // update this with
    style : {"padding" : "0px"}
  }).addClass("fit-x");
  // So messy, but hey it works
  seeking.hover(function(){
    mediaPlayer.manual = true;
  },
  function() {
    mediaPlayer.manual = false;
    mediaPlayer.update();
  });
  seeking.click(function() {
    mediaPlayer.manual = true;
    setTimeout(function(){mediaPlayer.manual = false;},10);
  });
  seeking.change(function() {
    if (mediaPlayer.iframe) {
      runCommand("media", {cmd : "update", data : {video : mediaPlayer.video, list : mediaPlayer.list, time : parseInt($(this).val())/100}});
      $(this).attr("disabled", "disabled");
    }
  });

  seekingWrap.append($("<div id='mediaControls' class='flexaround' style='font-size: 2em;'></div>"));

  var seekingLabel = $("<div>").appendTo($("#mediaControls"));
  seekingLabel.css("font-size", "12px");
  seekingLabel.addClass("flexmiddle lrmargin");
  seekingLabel.text("0:00/0:00");

  var div = $("<div>").appendTo($("#mediaControls"));
  div.addClass("flexmiddle");
  div.css("pointer-events", "auto");

  var volumeIcon = genIcon({icon : "volume-up", raw : true});
  volumeIcon.addClass("hover2 subtitle");
  volumeIcon.appendTo(div);
  volumeIcon.click(function(){
    var volumeContent = $("<div>");
    var volume = genInput({
      parent : volumeContent,
      type: "range",
      min : 0,
      value : 100,
      max : 400,
      style : {"padding": "0", "pointer-events" : "auto", "width" : "100px"},
    });

    volume.val(parseInt((getCookie("volume") || 100)));
    mediaPlayer.volume = parseInt((getCookie("volume") || 100));
    volume.change(function() {
      mediaPlayer.setVolume(Math.ceil($(this).val()/4));
      setCookie("volume", Math.ceil($(this).val()/4));
      mediaPlayer.volume = Math.ceil($(this).val()/4);
      if ($(this).val() == 0) {
        volumeIcon.changeIcon("volume-off");
      }
      else if ($(this).val() < 50) {
        volumeIcon.changeIcon("volume-down");
      }
      else {
        volumeIcon.changeIcon("volume-up");
      }
      $("#media-volume-label").text(" " + $(this).val() + "%");
    });

    ui_popOut({
      target : $(this),
      align : "top",
    }, volumeContent);
  });

  var value = $("<div class='flexmiddle'><b id='media-volume-label' style='font-size: 14px;'> "+(getCookie("volume") || 100)+"%</b></div>");
  value.addClass("hover2");
  value.click(function(){
    volumeIcon.click();
  });
  value.appendTo(div);

  var userCountDiv = $("<div>").appendTo(("#mediaControls"));
  userCountDiv.addClass("flexmiddle lrmargin");

  var userCount = genIcon({icon : "user", raw : true}).appendTo(userCountDiv);
  userCount.css("font-size", "12px");

  var userLabel = $("<div>").appendTo(userCountDiv);
  userLabel.attr("id", "mediausercount");
  userLabel.css("font-size", "12px");
  userLabel.addClass("flexmiddle");
  userLabel.text("x1");

  //var nextIcon = genIcon("forward").appendTo($("#mediaControls"));
  // states
  // 0 NO VIDEO
  // 1 LOADING
  // 2 READY
  // 3 PLAYING
  // 4 OUT OF SYNC
  function onYouTubeIframeAPIReady() {

  }

  function onPlayerReady(event) {
    mediaPlayer.play(); // prime the video for playing
    mediaPlayer.update();
    mediaPlayer.volume = mediaPlayer.volume || parseInt((getCookie("volume") || 100));
    mediaPlayer.setVolume(Math.ceil((mediaPlayer.volume)/4));
    mediaPlayer.update();
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  mediaPlayer.think = function() {
    if (mediaPlayer.iframe.getCurrentTime() < mediaPlayer.iframe.getDuration() && mediaPlayer.iframe.getPlayerState() == YT.PlayerState.PLAYING) {
      mediaPlayer.update(true);
      setTimeout(mediaPlayer.think, 100);
    }
  }

  function onPlayerStateChange(event) {
    if (!mediaPlayer.executing) {
      if (event.data == YT.PlayerState.PLAYING) {
        // changed state to playing, better execute it
        mediaPlayer.executing = {cmd : "waiting"};
        mediaPlayer.pause(); // counter the last action
      }
      else if (event.data == YT.PlayerState.PAUSED) {
        runCommand("media", {cmd : "update", data : {video : mediaPlayer.video, list : mediaPlayer.list, time : mediaPlayer.iframe.getCurrentTime()}});
      }
    }
    else if (mediaPlayer.executing.cmd == "play") {
      if (event.data == YT.PlayerState.PLAYING) {
        mediaPlayer.think();
        delete mediaPlayer.executing;
      }
      else {
        mediaPlayer.play(); // get this shit playing
      }
    }
    else if (mediaPlayer.executing.cmd == "update") {
      if (event.data == YT.PlayerState.PLAYING) {
        mediaPlayer.pause(); // get this shit paused
      }
      else if (event.data == YT.PlayerState.PAUSED) {
        // all ready
        if (mediaPlayer.executing.time != null) {
          mediaPlayer.iframe.seekTo(mediaPlayer.executing.time || 0);
        }
        delete mediaPlayer.executing;
        //once it is all complete send ack
        runCommand("media", {cmd : "update-ack", data : {state : 2}});
      }
      else {
        mediaPlayer.play(); // get this shit playing to start buffering
      }
    }
    else if (mediaPlayer.executing.cmd == "waiting") {
      if (event.data == YT.PlayerState.PAUSED) {
        runCommand("media", {cmd : "play"});
        delete mediaPlayer.executing;
      }
      else {
        mediaPlayer.executing = {cmd : "waiting"};
        mediaPlayer.pause(); // counter the last action
      }
    }
    mediaPlayer.lastState = event.data;
  }

  mediaPlayer.update = function(update) {
    if (mediaPlayer.iframe != null) {
      seeking.attr("max", mediaPlayer.iframe.getDuration() * 100);

      if (!mediaPlayer.manual || update) {
        seeking.val(Math.floor(mediaPlayer.iframe.getCurrentTime() * 100));
      }
      seekingLabel.empty();
      seekingLabel.text(String(mediaPlayer.iframe.getCurrentTime()).formatTime(1)+"/"+String(mediaPlayer.iframe.getDuration()).formatTime(1));
    }
  }

  mediaPlayer.setVolume = function(amt) {
    if (mediaPlayer.iframe && mediaPlayer.iframe.setVolume) {
      return mediaPlayer.iframe.setVolume(amt);
    }
  }

  mediaPlayer.play = function(time) {
    if (mediaPlayer.iframe && mediaPlayer.iframe.playVideo) {
      return mediaPlayer.iframe.playVideo();
    }
  }

  mediaPlayer.pause = function(time) {
    if (mediaPlayer.iframe && mediaPlayer.iframe.pauseVideo) {
      return mediaPlayer.iframe.pauseVideo();
    }
  }

  mediaPlayer.isPlaying = function(time) {
    if (mediaPlayer.iframe) {
      return mediaPlayer.getState() == 3;
    }
    return false;
  }

  mediaPlayer.getState = function() {
    if (mediaPlayer.iframe) {
      var state = mediaPlayer.iframe.getPlayerState();
      if (state == YT.PlayerState.PLAYING) {
        return 3;
      }
      else if (state == YT.PlayerState.PAUSED) {
        return 2;
      }
      return 1;
    }
    return 0;
  }
  var _watching = {};
  mediaPlayer.command = function(data) {
    if (mediaPlayer.disabled) {
      return false;
    }
    if (data.cmd == "watching") {
      // live count of who's watching what
      if (data.userID) {
        if (data.video) {
          _watching[data.userID] = data.video;
        }
        else {
          delete _watching[data.userID];
        }
      }
      var count = 0;
      for (var key in _watching) {
        if (_watching[key] == mediaPlayer.video) {
          count = count + 1;
        }
      }
      $("#mediausercount").text("x"+count);
      return;
    }
    if (data.cmd == "play") {
      // if the server is sending this command we are OK to play the video
      mediaPlayer.executing = data;
      mediaPlayer.play();
    }
    else if (data.cmd == "update") {
      if (!mediaPlayer.iframe) {
        console.log(data.data.list);
        mediaPlayer.iframe = new YT.Player('media', {
          width: mediaPlayer.width,
          height: mediaPlayer.height,
          videoId: data.data.video,
          playerVars: {controls: 0, disablekb: 1, fs: 0, showinfo: 0, iv_load_policy: 3, rel: 0, start : (data.data.time || 0)},
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
        $("#dragMedia").css("left", $(window).outerWidth()/2 - $("#dragMedia").outerWidth()/2);
        $("#dragMedia").css("top", $(window).outerHeight() - $("#dragMedia").outerHeight());
      }
      else {
        if (data.data.video != mediaPlayer.video) {
          mediaPlayer.iframe.cueVideoById({videoId : data.data.video, startSeconds : (data.data.time || 0)});
        }
        else if (data.data.time != null && mediaPlayer.iframe.getCurrentTime() != (data.data.time || 0)) {
          mediaPlayer.iframe.seekTo(data.data.time || 0);
        }
        seeking.removeAttr("disabled");
        setTimeout(function() {mediaPlayer.update(true);}, 100);
      }
      mediaPlayer.video = data.data.video;
      //mediaPlayer.list = data.data.list;
      //mediaPlayer.index = data.data.index;
      mediaPlayer.executing = data;

      mediaPlayer.play();
    }
    runCommand("media", {cmd : "watching", video : mediaPlayer.video});
  }
}


layout.init = function() {
  /*var community = genIcon("cloud-download").appendTo(layoutCtrl);
  community.addClass("lrpadding create");
  community.attr("title", "Community Chest");
  community.click(function() {
    var frame = layout.page({title: "Community Chest", prompt : "This is currently under construction, but feel free to use what assets are available", blur : 0.5, width: "90%", id: "community-chest"});
    if (layout.mobile) {
      frame.css("width", "95vw");
    }
    var beta = $("<b>");
    beta.addClass("lrpadding outline smooth highlight");
    beta.css("color", "white");
    beta.css("position", "absolute");
    beta.css("font-size", "1.5em");
    beta.css("left", "1em");
    beta.css("top", "1em");
    beta.append("Beta");

    frame.prepend(beta);

    var newApp = sync.newApp("ui_newMarket", null, {});
    newApp.appendTo(frame);
    newApp.css("height", "80vh");
  });*/
  $("#bottombar").hide();
  setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table","a":[{"w":100,"h":100,"class":"layout-row-data","app":"ui_primaryView"}]}]', 9000000000000);
  layout.load();


  layout.right();
  layout.top();
  layout.players();
  layout.bottom();

  //if (!hasSecurity(getCookie("UserID"), "Game Master")) {
    var pointWrap = $("<div>")//.appendTo(layoutCtrl);
    pointWrap.addClass("flexrow subtitle flexmiddle alttext");
    var img = $("<img>").appendTo(pointWrap);
    img.attr("src", "/content/d20small.png");
    img.attr("height", "15");
    img.attr("width", "15");
    pointWrap.append("<b class='link flexmiddle lrmargin'>Tip your GM!</b>");

    pointWrap.click(function(){
      var frame = layout.page({
        title : "Your GM Works Hard!",
        prompt : "Send them a little somethin' somethin' for their trouble",
        id : "tip-gm-menu",
        width : "800px",
        blur : 0.6,
      });

      var content = $("<div>").appendTo(frame);
      content.addClass("flexrow padding");
      content.css("min-height", "300px");
      content.css("font-size", "1.2em");

      var description = $("<div>").appendTo(content);
      description.addClass("lmargin flexcolumn");
      description.css("width", "200px");
      description.append("<b class='fit-x flexrow'>Gift Note</b>");

      var textarea = $("<textarea>").appendTo(description);
      textarea.attr("placeholder", "Whisper sweet nothings into their ear... or perhaps sneak some anonymous feedback their way...");
      textarea.addClass("flex subtitle");
      textarea.attr("maxlength", "255");

      description.append("<b class='fit-x flexrow'>Signature</b>");

      var input = genInput({
        parent : description,
        placeholder : "Leave blank for Anonymous",
        classes : "fit-x subtitle",
      });
      input.attr("maxlength", 55);

      var img = $("<div>").appendTo(content);
      img.addClass("flexcolumn flex lmargin");
      img.load("/tabs/pointshop.html");
    });
  //}
}


layout.right = function() {
  var rightContentWrap = $("<div>");
  rightContentWrap.addClass("flexcolumn flex");
  rightContentWrap.css("position", "relative");

  var rightContent = $("<div>").appendTo(rightContentWrap);
  rightContent.addClass("flexcolumn fit-x alttext");
  rightContent.css("position", "relative");

  var configOptions = $("<div>").appendTo(rightContent);
  configOptions.addClass("flexrow outlinebottom dragcontrol");

  var div = $("<div>").appendTo(configOptions);
  div.addClass("flex");

  configOptions.append("<a href='https://discord.gg/usy4ByN' target='_' title='Join the Discord Channel'><img width=16 height=16 src='/content/Discord-Logo-White.png'></img></a>");

  if (game.owner == getCookie("UserID") && !getCookie("PublicPort")) {
    var label = genIcon("cloud-download").appendTo(configOptions);
    label.attr("title", "Community Forge");
    label.click(function(){
      openSplash(true);
      $("#community-forge").click();
    });
  }

  var label = genIcon("log-in").appendTo(configOptions);
  label.addClass("lrpadding");
  label.attr("title", "Copies an invite to clipboard");
  label.click(function(){
    var input = genInput({
      parent : $(this),
      id : "copy-url",
      value : window.location.href.split("?password")[0],
    });

    if (game.config.data.password) {
      input.val(encodeURI(input.val()+"?password="+game.config.data.password));
    }
    if (getCookie("ExternalIP")) {
      input.val(getCookie("ExternalIP")+":"+getCookie("PublicPort")+"/join");
    }
    input.focus();
    input.get(0).setSelectionRange(0, input.val().length);

    document.execCommand("copy");
    input.remove();
    sendAlert({text : "Invitation Copied!"});
  });

  var gameOptions = genIcon("cog").appendTo(configOptions);
  gameOptions.addClass("lrpadding");
  gameOptions.attr("title", "Options");
  gameOptions.click(function(){
    $("#cloud-files").hide();
    $("#asset-manager").hide();
    $("#media-player").hide();
    $("#music-player").hide();
    $("#quick-combat").hide();
    $("#quick-help").hide();
    $("#quick-chat").hide();
    if ($("#game-options").length) {
      $("#game-options").toggle();
      return;
    }
    else {
      var content = $("<div>").appendTo(menuContent);
      content.attr("id", "game-options");
      content.addClass("flexcolumn padding");

      var hotkeyCtrl = $("<div>").appendTo(content);
      hotkeyCtrl.addClass("spadding");

      var hotkeyCtrl = $("<div>").appendTo(content);
      hotkeyCtrl.addClass("flexcolumn");

      var hotKeys = genIcon("link", "Show HotKey List", true).appendTo(hotkeyCtrl);
      hotKeys.attr("title", "Show HotKey List");
      hotKeys.click(function(){
        toggleHotKeysDisplay();
      });

      var floatingApp = genIcon("plus", "Temporary App", true).appendTo(content);
      floatingApp.attr("title", "Temporary App");
      floatingApp.click(function() {
        var buildList = [];
        //options
        function recurse(data, source) {
          for (var index in data) {
            if (index == "_ui") {
              for (var ind in data[index]) {
                data[index][ind].click = function(ev, self) {
                  var content = sync.newApp(self.attr("ui-name"), null, {});

                  var popout = ui_popOut({
                    title : self.attr("ui-name"),
                    target : floatingApp,
                    align : "bottom",
                    minimize : true,
                    maximize : true,
                    dragThickness : "0.5em",
                    resizable : true,
                    style : {"max-width" : "none"},
                  }, content);
                  popout.css("padding", "0px");
                  popout.addClass("floating-app");
                }
                source.push(data[index][ind]);
              }
            }
            else {
              var addObj = {name : index, submenu : []};
              recurse(data[index], addObj.submenu);
              source.push(addObj);
            }
          }
        }

        recurse(game.components, buildList);
        var dropMenu = ui_dropMenu($(this), buildList, {id: "layout-control-popup"}).css("z-index", "100000000000");
      });

      var gameOptCtrl = $("<div>").appendTo(content);
      gameOptCtrl.addClass("flexcolumn");

      var label = genIcon("log-in", "Internal Network Game Invite", true).appendTo(gameOptCtrl);
      label.css("pointer-events", "auto");
      label.click(function(){
        var input = genInput({
          parent : $(this),
          id : "copy-url",
          value : window.location.href,
        });

        if (game.config.data.password) {
          input.val(encodeURI(input.val()+"?password="+game.config.data.password));
        }
        if (getCookie("InternalIP")) {
          input.val(getCookie("InternalIP")+":30000/join");
        }
        input.focus();
        input.get(0).setSelectionRange(0, input.val().length);

        document.execCommand("copy");
        input.remove();
        sendAlert({text : "Invitation Copied!"});
      });

      var label = genIcon("log-in", "Game Invite", true).appendTo(gameOptCtrl);
      label.css("pointer-events", "auto");
      label.click(function(){
        var input = genInput({
          parent : $(this),
          id : "copy-url",
          value : window.location.href,
        });

        if (game.config.data.password) {
          input.val(encodeURI(input.val()+"?password="+game.config.data.password));
        }
        if (getCookie("ExternalIP")) {
          input.val(getCookie("ExternalIP")+":"+getCookie("PublicPort")+"/join");
        }
        input.focus();
        input.get(0).setSelectionRange(0, input.val().length);

        document.execCommand("copy");
        input.remove();
        sendAlert({text : "Invitation Copied!"});
      });

      var gameOptions = genIcon("wrench", "Game Options", true).appendTo(gameOptCtrl);
      gameOptions.attr("title", "Game Options");
      gameOptions.click(function() {
        if (getCookie("UserID") == game.owner) {
          var frame = layout.page({title: "Game Configuration", prompt : "Change information on how this server", blur: 0.5, id : "gameOptions", width : "50%"});

          var newApp = sync.newApp("ui_gameCtrl", game.config);
          newApp.appendTo(frame);
        }
        else if (hasSecurity(getCookie("UserID"), "Trusted Player")){
          var frame = layout.page({title: "Assistant Master", prompt : "what do you want to do", blur: 0.5, id: "save-as-session-prompt"});

          var buttonDiv = $("<div>").appendTo(frame);
          buttonDiv.addClass("flexaround");

          var yes = $("<button>").appendTo(buttonDiv);
          yes.append("Give me Anytime Access to this Game");
          yes.click(function(){
            runCommand("grantAccess");
            layout.coverlay("save-as-session-prompt");
          });

          var no = $("<button>").appendTo(buttonDiv);
          no.append("Continue to Game Controls");
          no.click(function(){
            var frame = layout.page({title: "Game Configuration", prompt : "Change information on how this server", blur: 0.5, id : "gameOptions", width : "50%"});

            var newApp = sync.newApp("ui_gameCtrl", game.config);
            newApp.appendTo(frame);
            layout.coverlay("save-as-session-prompt");
          });
        }
        layout.coverlay("game-options");
        gameOptions.click();
      });

      var reactionsCtrl = $("<div>").appendTo(content);
      reactionsCtrl.addClass("flexcolumn");

      var reactions = genIcon("comment", "Reactions Enabled", true);
      if (getCookie("disableReactions") == "true") {
        reactions = genIcon("comment", "Reactions Disabled", true);
        reactions.css("color", "rgb(170, 130, 130)");
      }
      reactions.appendTo(reactionsCtrl);
      reactions.click(function() {
        if (getCookie("disableReactions") == "true") {
          setCookie("disableReactions", "");
        }
        else {
          setCookie("disableReactions", "true");
        }
        layout.coverlay("game-options");
        gameOptions.click();
      });

      var alertsCtrl = $("<div>").appendTo(content);
      alertsCtrl.addClass("flexcolumn");

      var alerts = genIcon("bell", "Alerts Enabled", true);
      if (getCookie("disableAlerts") == "true") {
        alerts = genIcon("bell", "Alerts Disabled", true);
        alerts.css("color", "rgb(170, 130, 130)");
      }
      alerts.appendTo(alertsCtrl);
      alerts.click(function() {
        if (getCookie("disableAlerts") == "true") {
          setCookie("disableAlerts", "");
        }
        else {
          setCookie("disableAlerts", "true");
        }
        layout.coverlay("game-options");
        gameOptions.click();
      });

      var alerts = genIcon("film", "Media Enabled", true);
      if (mediaPlayer.disabled) {
        alerts = genIcon("film", "Media Disabled", true);
        alerts.css("color", "rgb(170, 130, 130)");
      }
      alerts.appendTo(alertsCtrl);
      alerts.click(function() {
        if (mediaPlayer.disabled) {
          delete mediaPlayer.disabled;
        }
        else {
          mediaPlayer.disabled = true
        }
        layout.coverlay("game-options");
        gameOptions.click();
      });

      var anchor = genIcon("th-large", "Toggle Anchor Mode", true)//.appendTo(alertsCtrl);
      anchor.click(function(){
        if (!$(".main-dock").length) {
          setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table","a":[{"w":100,"h":100,"class":"layout-row-data","app":"ui_primaryView"}]}]', 9000000000000);
          layout.init();
        }
        else {
          setCookie("table_save", '[{"w":100,"h":100,"class":"layout-table","a":[{"w":77,"h":100,"class":"layout-row-data","app":"ui_displayManager"},{"w":23,"h":100,"class":"layout-row-data","app":"ui_textBox"}]}]');
          layout.anchorInit();
          layout.load();
        }
      });

      content.append("<div class='padding'></div>");
      content.append("<b>Mods and Extensions</b>");

      var app = sync.newApp("ui_hotApps", null, {vertical : "true"});
      app.appendTo(content);
      app.addClass("fit-x");
      app.removeClass("application");
      app.attr("vertical", "true");
      app.css("width", "auto");
      app.css("overflow-y", "hidden");
    }
  });

  var splash = genIcon("menu-hamburger").appendTo(configOptions);
  splash.css("padding-right", "4px");
  splash.attr("title", "Main Menu");
  splash.click(function(){
    openSplash(true);
  });

  var menuContent = $("<div>").appendTo(rightContentWrap);
  menuContent.addClass("flexcolumn flex white");

  var mediaOptions = $("<div>").appendTo(rightContent);
  mediaOptions.addClass("flexrow flex flexbetween spadding");
  mediaOptions.css("font-size", "1.4em");

  var media = genIcon("comment").appendTo(mediaOptions);
  media.addClass("lrpadding create");
  media.attr("title", "Event Log");
  media.css("font-size", "1.4em");
  media.click(function() {
    $("#asset-manager").hide();
    $("#media-player").hide();
    $("#audio-player").hide();
    $("#game-options").hide();
    $("#quick-combat").hide();
    $("#quick-help").hide();
    $("#cloud-files").hide();
    if ($("#quick-chat").length) {
      $("#quick-chat").show();
    }
    else {
      var newApp = sync.newApp("ui_textBox", null, {}).appendTo(menuContent);
      newApp.attr("id", "quick-chat");
      /*var popOut = ui_popOut({
        target : right,
        align : "right",
        title : "Cloud Files",
        id : "cloud-files",
        close : function(ev, ui) {
          popOut.hide();
          return false;
        },
        style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
      }, newApp);
      popOut.resizable();*/
    }
  });

  if (getCookie("UserID") && getCookie("UserID") != "Sandboxer") {
    var media = genIcon("folder-open").appendTo(mediaOptions);
    media.addClass("lrpadding create");
    media.attr("title", "Resource Manager");
    media.css("font-size", "1.4em");
    media.click(function() {
      $("#asset-manager").hide();
      $("#media-player").hide();
      $("#audio-player").hide();
      $("#game-options").hide();
      $("#quick-combat").hide();
      $("#quick-help").hide();
      $("#quick-chat").hide();
      if ($("#cloud-files").length) {
        $("#cloud-files").show();
      }
      else {
        var newApp = sync.newApp("ui_fileBrowser", null, {cloud : true}).appendTo(menuContent);
        newApp.attr("id", "cloud-files");
        /*var popOut = ui_popOut({
          target : right,
          align : "right",
          title : "Cloud Files",
          id : "cloud-files",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
          style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
        }, newApp);
        popOut.resizable();*/
      }
    });
  }

  var media = genIcon("globe").appendTo(mediaOptions);
  media.addClass("create lrpadding");
  media.attr("title", "Asset Manager");
  media.css("font-size", "1.4em");
  media.click(function() {
    $("#cloud-files").hide();
    $("#media-player").hide();
    $("#audio-player").hide();
    $("#game-options").hide();
    $("#quick-combat").hide();
    $("#quick-help").hide();
    $("#quick-chat").hide();
    if ($("#asset-manager").length) {
      $("#asset-manager").show();
    }
    else {
      var newApp = sync.newApp("ui_assetManager").appendTo(menuContent);
      newApp.attr("id", "asset-manager");
      game.entities.addApp(newApp);
      /*var pop = ui_popOut({
        target : right,
        align : "right",
        title : "Asset Manager",
        id : "asset-manager",
        minimze : true,
        close : function(ev, ui) {
          pop.hide();
          return false;
        },
        style : {"width" : "400px", "height" : "600px"}
      }, newApp);
      pop.resizable();*/
    }
  });

  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var media = genIcon("film").appendTo(mediaOptions);
    media.addClass("lrpadding create");
    media.attr("title", "Media Player");
    media.css("font-size", "1.4em");
    media.click(function() {
      $("#cloud-files").hide();
      $("#asset-manager").hide();
      $("#audio-player").hide();
      $("#game-options").hide();
      $("#quick-combat").hide();
      $("#quick-help").hide();
      $("#quick-chat").hide();
      if ($("#media-player").length) {
        $("#media-player").show();
      }
      else {
        var newApp = sync.newApp("ui_media", true).appendTo(menuContent);
        newApp.attr("id", "media-player");
        /*
        var popOut = ui_popOut({
          target : right,
          align : "right",
          title : "Youtube Player",
          id : "media-player",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
          style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
        }, newApp);
        popOut.resizable();*/
      }
    });

    var media = genIcon("music").appendTo(mediaOptions);
    media.addClass("lrpadding create");
    media.attr("title", "Audio Player");
    media.css("font-size", "1.4em");
    media.click(function() {
      $("#cloud-files").hide();
      $("#asset-manager").hide();
      $("#media-player").hide();
      $("#game-options").hide();
      $("#quick-combat").hide();
      $("#quick-help").hide();
      $("#quick-chat").hide();
      if ($("#audio-player").length) {
        $("#audio-player").show();
      }
      else {
        var newApp = sync.newApp("ui_audioPlayer").appendTo(menuContent);
        newApp.attr("id", "audio-player");
        game.config.addApp(newApp);
        /*var popOut = ui_popOut({
          target : right,
          align : "right",
          title : "Audio Player",
          id : "audio-player",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
          style : {"width" : "400px", "height" : "400px"}
        }, newApp);
        popOut.resizable();*/
      }
    });
  }
  var media = genIcon("fire").appendTo(mediaOptions);
  media.addClass("lrpadding create");
  media.attr("title", "Combat Controls");
  media.attr("id", "combat-button");
  media.css("font-size", "1.4em");
  media.click(function() {
    $("#cloud-files").hide();
    $("#asset-manager").hide();
    $("#media-player").hide();
    $("#game-options").hide();
    $("#audio-player").hide();
    $("#quick-help").hide();
    $("#quick-chat").hide();
    if ($("#quick-combat").length) {
      $("#quick-combat").show();
    }
    else {
      var newApp = sync.newApp("ui_combatControls").appendTo(menuContent);
      newApp.attr("id", "quick-combat");
      game.state.addApp(newApp);
      /*var popOut = ui_popOut({
        target : right,
        align : "right",
        title : "Audio Player",
        id : "audio-player",
        close : function(ev, ui) {
          popOut.hide();
          return false;
        },
        style : {"width" : "400px", "height" : "400px"}
      }, newApp);
      popOut.resizable();*/
    }
  });

  var media = genIcon("question-sign").appendTo(mediaOptions);
  media.addClass("lrpadding create");
  media.attr("title", "Quick Help!");
  media.attr("id", "help-button");
  media.css("font-size", "1.4em");
  media.click(function() {
    $("#cloud-files").hide();
    $("#asset-manager").hide();
    $("#media-player").hide();
    $("#game-options").hide();
    $("#audio-player").hide();
    $("#quick-combat").hide();
    $("#quick-chat").hide();
    if ($("#quick-help").length) {
      $("#quick-help").show();
    }
    else {
      var newApp = sync.newApp("ui_renderHelp", null, {}).appendTo(menuContent);
      newApp.attr("id", "quick-help");
      newApp.css("overflow", "hidden");
      /*var popOut = ui_popOut({
        target : right,
        align : "right",
        title : "Audio Player",
        id : "audio-player",
        close : function(ev, ui) {
          popOut.hide();
          return false;
        },
        style : {"width" : "400px", "height" : "400px"}
      }, newApp);
      popOut.resizable();*/
    }
  });
  media.click();

  var right = ui_popOut({
    target : $("body"),
    align : "top-right",
    noCss : true,
    allowDock : true,
    hideclose : true,
    style : {"width" : assetTypes["assetPicker"].width, "height" : $(window).height() - 125, "transition" : "opacity 0.5s"}
  }, rightContentWrap).addClass("foreground").attr("fadeHide", "true").attr("docked-z", util.getMinZ(".ui-popout"));
  right.css("top", "50px");
  right.resizable();
  right.attr("id", "main-menu");
}

layout.top = function(){
  var topContent = $("<div>");
  topContent.addClass("flexrow flex alttext");

  var pin = genIcon("pushpin").appendTo(topContent);
  pin.addClass("spadding alttext smooth highlight");
  pin.attr("title", "Lock this menu down");
  pin.click(function(){
    if (top.attr("locked")) {
      top.removeAttr("locked");
      pin.removeClass("highlight");
    }
    else {
      pin.addClass("highlight");
      top.attr("locked", true);
    }
  });

  var buttons = $("<div>").appendTo(topContent);
  buttons.addClass("lrpadding flexmiddle lrmargin");

  var button = genIcon("calendar").appendTo(buttons);
  button.addClass("lrmargin");
  button.attr("title", "Calendar");
  button.click(function(){
    if ($("#calendar").length) {
      if ($("#calendar").is(":visible")) {
        $("#calendar").hide();
      }
      else {
        $("#calendar").show();
        var max = util.getMaxZ(".ui-popout");
        $("#calendar").css("z-index", max+1);
      }
    }
    else {
      var content = sync.newApp("ui_calendar");
      game.state.addApp(content)

      var popOut = ui_popOut({
        target : $(this),
        id : "calendar",
        align : "bottom",
        minimze : true,
        title : "World Calendar",
        close : function(ev, ui) {
          popOut.hide();
          return false;
        },
        style : {"width" : Math.min(820, $(window).width())+"px", "height" : "650px"}
      }, content);
      popOut.resizable();
    }
  });

  if (hasSecurity(getCookie("UserID"), "Assistant Master") && !game.config.data.offline) {
    var button = genIcon("sunglasses").appendTo(buttons);
    button.addClass("lrmargin");
    button.attr("title", "Special Effects");
    button.click(function(){
      if ($("#special-effects").length) {
        if ($("#special-effects").is(":visible")) {
          $("#special-effects").hide();
        }
        else {
          $("#special-effects").show();
          var max = util.getMaxZ(".ui-popout");
          $("#special-effects").css("z-index", max+1);
        }
      }
      else {
        var specialEffects = $("<div>");
        specialEffects.addClass("alttext flexcolumn");
        for (var i in util.effects) {
          var effect = $("<div>").appendTo(specialEffects);
          effect.addClass("background flexmiddle hover2 outlinebottom lrpadding");
          effect.text(i);
          effect.click(function(){
            var effect = $(this).text();
            $(".displayApp").each(function(){
              runCommand("effect", {effect : effect, tab : $(this).attr("currentTab")});
            });
          });
        }

        var popOut = ui_popOut({
          target : $(this),
          id : "special-effects",
          align : "bottom",
          minimze : true,
          prompt : true,
          title : "SFX",
          close : function(ev, ui) {
            popOut.hide();
            return false;
          },
        }, specialEffects);
        popOut.resizable();
      }
    });
  }


  var app = sync.newApp("ui_setting").appendTo(topContent);
  app.addClass("flexmiddle");
  app.removeClass("application");
  app.css("height", "auto");
  app.css("width", "100px");
  app.attr("supressHover", true);
  app.attr("size", "30");
  app.attr("alignpop", "bottom");


  var newApp = sync.newApp("ui_displayTabs").appendTo(topContent);
  newApp.attr("target", "primary-display");

  setTimeout(function(){
    game.state.addApp(app);
    game.state.addApp(newApp);
  }, 100);


  var top = ui_popOut({
    target : $("body"),
    align : "top",
    noCss : true,
    hideclose : true,
    pin: false,
    style : {"width" : "100vw", "max-width" : "100vw", "transition" : "opacity 0.5s"}
  }, topContent).attr("docked", "top").addClass("foreground").attr("fadeHide", "true").attr("docked-z", util.getMinZ(".ui-popout"));
  top.attr("locked", true);
  top.draggable("disable");
  top.addClass("main-dock");
}

layout.players = function(){
  var bottomContent = $("<div>");
  bottomContent.addClass("flexrow flex flexmiddle dragcontrol");
  bottomContent.css("position", "relative");

  //bottom right
  var app = sync.newApp("ui_players").appendTo(bottomContent);
  app.addClass("flexmiddle");
  app.attr("height", "50px");
  app.css("min-height", "60px");
  app.css("overflow-y", "hidden");
  app.css("pointer-events", "none");
  game.players.addApp(app);

  var bottom = ui_popOut({
    target : $("body"),
    align : "bottom-right",
    noCss : true,
    allowDock : true,
    hideclose : true,
    style : {"transition" : "opacity 0.5s", "min-height" : "70px", "min-width" : "200px", "box-shadow" : "none"}
  }, bottomContent).attr("fadeHide", "true").attr("docked-z", util.getMinZ(".ui-popout")).attr("locked", "true").attr("docked", "bottom");
  bottom.addClass("main-dock");
}

layout.bottom = function(){
  var bottomContent = $("<div>");
  bottomContent.addClass("flexrow flex alttext");
  bottomContent.css("position", "relative");

  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    var cardWrap = $("<div>").appendTo(bottomContent);
    cardWrap.addClass("flexrow flexmiddle");

    var newApp = sync.newApp("ui_deck").appendTo(cardWrap);
    newApp.addClass("flexmiddle lrmargin");
    newApp.removeClass("application");
    newApp.css("overflow", "hidden");
    game.state.addApp(newApp);
  }

  var cardWrap = $("<div>").appendTo(bottomContent);
  cardWrap.addClass("flexcolumn lrmargin");

  var rolls = sync.newApp("ui_hotRolls");
  rolls.appendTo(cardWrap);
  game.players.addApp(rolls);

  var cardWrap = $("<div>").appendTo(bottomContent);
  cardWrap.addClass("flexrow");
  cardWrap.css("height", "6.0em");

  var newApp = sync.newApp("ui_hand").appendTo(cardWrap);
  newApp.attr("UserID", getCookie("UserID"));
  newApp.css("overflow", "hidden");
  newApp.css("margin-top", "4px");
  game.state.addApp(newApp);

  bottomContent.bind("paste", function(e) {
    // access the clipboard using the api
    // firefox won't call this if ctrl shift + v
    if (hasSecurity(getCookie("UserID"), "Trusted Player")) {
      if (getCookie("disableReactions") != "true") {
        ui_processLink(e.originalEvent.clipboardData.getData('text'), function(link, newLink, exists){
          runCommand("reaction", newLink);
        });
      }
    }
  });


  var bottom = ui_popOut({
    target : $("body"),
    align : "bottom-left",
    noCss : true,
    hideclose : true,
    style : {"max-width" : "60vw", "transition" : "opacity 0.5s"}
  }, bottomContent).attr("docked", "bottom").addClass("background").attr("fadeHide", "true").attr("docked-z", util.getMinZ(".ui-popout")).attr("locked", true);

  bottom.draggable("disable");
  bottom.addClass("main-dock");
}
