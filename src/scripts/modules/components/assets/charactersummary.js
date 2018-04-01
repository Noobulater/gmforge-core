sync.render("ui_characterSummary", function(obj, app, scope){
  if (!obj) {
    return $("<div>");
  }
  var data = obj.data;
  var info = data.info;
  scope = scope || {
    viewOnly: (app.attr("viewOnly") == "true"),
    displayMode : parseInt(app.attr("displayMode") || 0),
    markup : app.attr("markup") == "true",
    minimized : app.attr("minimized") == "true",
    noOutline : app.attr("noOutline") == "true",
    hide : app.attr("hide") == "true",
  };
  // don't edit cloud entities
  if (obj.id() && isNaN(obj.id()) && obj.id().match("_") && !(game.config && game.config.data.offline)) {
    scope.viewOnly = true;
    scope.local = true;
  }

  var sheet = scope.sheet || game.templates.display.sheet;

  var div = $("<div>");
  if (!scope.noOutline) {
    div.addClass("outline");
  }
  div.mousemove(function(){
    if (_down["17"]) {
      div.css("cursor", "pointer");
    }
    else {
      div.css("cursor", "");
    }
  });
  div.click(function(ev){
    if (_down["17"]) {
      if (namePlate.hasClass("card-selected")) {
        namePlate.removeClass("card-selected");
        util.untarget(obj.id());
      }
      else {
        namePlate.addClass("card-selected");
        util.target(obj.id());
      }
      ev.stopPropagation();
      ev.preventDefault();
    }
  });

  var namePlate = $("<div>").appendTo(div);
  namePlate.addClass("flexbetween");
  namePlate.attr("index", obj.id());
  namePlate.css("cursor", "pointer");
  namePlate.click(function(ev) {
    var charDivRef = $(this);
    var index = $(this).attr("index");
    if (_down["16"]) {
      if (hasSecurity(getCookie("UserID"), "Visible", obj.data)) {
        assetTypes["c"].preview(obj, charDivRef);
      }
      else {
        sendAlert({text : "No Access"});
      }
    }
    else if (!scope.local) {
      if ($(this).hasClass("card-selected")) {
        $(this).removeClass("card-selected");
        util.untarget(obj.id());
      }
      else {
        $(this).addClass("card-selected");
        util.target(obj.id());
      }
    }
    ev.stopPropagation();
  });

  if (!scope.local) {
    div.contextmenu(function(ev){
      assetTypes.contextmenu(ev, namePlate, obj, app, scope);
      return false;
    });
  }

  var imgWrap = $("<div>").appendTo(namePlate);
  imgWrap.addClass("flexmiddle");
  imgWrap.css("width", (scope.width || ((parseInt(scope.height) || 20) * 3)) + "px");
  imgWrap.css("height", scope.height || "auto");
  imgWrap.css("background-image", "url('"+(info.img.min || sync.rawVal(info.img) || "/content/icons/blankchar.png")+"')");
  imgWrap.css("background-size", "cover");
  imgWrap.css("background-repeat", "no-repeat");
  imgWrap.css("background-position", "center 25%");
  if (hasSecurity(getCookie("UserID"), "Assistant Master")) {
    imgWrap.addClass("hover2");
    imgWrap.click(function(ev){
      var applied = false;
      $(".application[ui-name='ui_display']").each(function(){
        if (!applied && $(this).attr("tabKey") != null) {
          util.slideshow(sync.rawVal(obj.data.info.img));
          ev.stopPropagation();
          ev.preventDefault();
        }
      });
    });
  }
  $("<div class='padding'>").appendTo(namePlate); // so you can access actions

  var nameWrap = $("<div>").appendTo(namePlate);
  nameWrap.addClass("spadding flexmiddle");

  var name = $("<b>").appendTo(nameWrap);
  name.addClass("flexmiddle");
  if (scope.name) {
    var context = sync.defaultContext();
    context["c"] = duplicate(obj.data);
    name.text(sync.eval(scope.name, context));
  }
  else {
    name.text(sync.rawVal(info.name));
  }

  if (scope.hide) {
    imgWrap.css("background-image" , "url('/content/icons/blankchar.png')");
    name.text("[Hidden]");
    if (hasSecurity(getCookie("UserID"), "Visible", obj.data)) {
      name.text(sync.rawVal(info.name)+" [Hidden]");
    }
    else {
      name.text("[Hidden]");
    }
  }
  if (app.width() && (name.text().length || "") * 12 > app.width()) {
    name.addClass("subtitle");
  }
  if (scope.minimized) {
    div.addClass("fit-xy flexcolumn");
    namePlate.addClass("flex");
    if (hasSecurity(getCookie("UserID"), "Visible", obj.data)) {
      name.css("text-decoration", "underline");
      name.click(function(ev){
        assetTypes["c"].preview(obj, $(this));
        ev.preventDefault();
        ev.stopPropagation();
      });
    }
    return div;
  }

  var optionsBack = $("<div>").appendTo(div);
  optionsBack.addClass("alttext background outline lrpadding flexbetween");

  if (scope.viewOnly) {
    var tags = genIcon("tags");
    tags.attr("title", "View the tags on this character");
    tags.appendTo(optionsBack);
    tags.click(function(){
      var content = sync.newApp("ui_tags");
      content.attr("viewOnly", scope.viewOnly);
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        align : "bottom",
        title : sync.rawVal(obj.data.info.name) + " - Tags",
        style : {"width" : "250px"}
      }, content);
      frame.resizable();
    });

    if (obj.id() && isNaN(obj.id()) && obj.id().match(getCookie("UserID"))) {
      // download asset
      var optionsBar = $("<div>").appendTo(optionsBack);
      optionsBar.addClass("flex flexaround flexwrap");

      var cloudWrap = genIcon("cloud-download", "Download Asset").appendTo(optionsBar);
      cloudWrap.attr("title", "Download Asset");

      cloudWrap.click(function(ev){
        if (game.locals["storage"]) {
          for (var i in game.locals["storage"].data.l) {
            var listEntry = game.locals["storage"].data.l[i];
            var split = obj.id().split("_");
            if (obj.data._c == getCookie("UserID") && listEntry._uid == split[1]) {
              listEntry.move = true;
              runCommand("moveAssets", {l : game.locals["storage"].data.l});
              delete listEntry.move;
              game.entities.listen[obj.id()] = function(src, update, target) {
                for (var key in src.data) {
                  var newEnt = src.data[key];
                  if (newEnt.data && newEnt.data._c == split[0] && newEnt.data._uid == split[1]) {
                    obj.removeApp(app);
                    newEnt.addApp(app);
                    return false;
                  }
                }
                return true;
              }
              break;
            }
          }
        }
        else {
          sendAlert({text : "Asset Storage hasn't loaded yet"});
        }
        ev.preventDefault();
        ev.stopPropagation();
      });
    }
  }
  else {
    var oBar = $("<div>").appendTo(optionsBack);

    var security = genIcon("lock");
    security.attr("title", "Edit who has access to this character");
    security.appendTo(oBar);
    security.click(function(){
      var content = sync.newApp("ui_rights");
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        prompt : true,
        align : "top",
        id : "ui-rights-dialog",
      }, content);
    });


    var tags = genIcon("tags");
    tags.addClass("lrpadding");
    tags.attr("title", "View the tags on this character");
    tags.appendTo(oBar);
    tags.click(function(){
      var content = sync.newApp("ui_tags");
      content.attr("viewOnly", scope.viewOnly);
      obj.addApp(content);

      var frame = ui_popOut({
        target : $(this),
        align : "bottom",
        title : sync.rawVal(obj.data.info.name) + " - Tags",
        style : {"width" : "250px"}
      }, content);
      frame.resizable();
    });


    if (hasSecurity(getCookie("UserID"), "Rights", data) || scope.markup) {
      var optionsBar = $("<div>").appendTo(optionsBack);
      optionsBar.addClass("lrpadding flexwrap");

      for (var i in sheet.summary) {
        var tabData = sheet.summary[i];
        var tab = genIcon(tabData.icon).appendTo(optionsBar);
        tab.addClass("lrpadding")
        tab.attr("title", tabData.name);
        tab.attr("index", i);
        tab.click(function(){
          app.attr("displayMode", $(this).attr("index"));
          obj.update();
        });
      }

      var expand = genIcon("new-window").appendTo(optionsBack);
      expand.css("margin-left", "8px");
      expand.attr("title", "hold shift to expand this menu");
      expand.click(function(){
        if (_down[16]) {
          app.attr("from", app.attr("ui-name"));
          app.attr("ui-name", "ui_characterSheet");
          var parent = app.parent();
          if (parent && parent.parent() && parent.parent().parent() && parent.parent().parent().hasClass("ui-popout")) {
            parent = parent.parent().parent();
            parent.css("width", assetTypes["c"].width);
            parent.css("height", assetTypes["c"].height);
            parent.resizable();
          }
          obj.update();
        }
        else {
          assetTypes[obj.data._t].preview(obj, $(this));
        }
      });
    }
  }

  var infoPanel = $("<div>").appendTo(div);
  infoPanel.addClass("flexcolumn");

  var ctx = sync.defaultContext();
  ctx[obj.data._t] = duplicate(obj.data);

  var newScope = duplicate(scope);
  newScope.display = sheet.summary[scope.displayMode].display;
  newScope.context = ctx;
  if (scope.markup) {
    newScope.markup = "summary"+scope.displayMode;
  }
  infoPanel.append(sync.render("ui_processUI")(obj, app, newScope));

  var parent = app.parent();
  if (parent && parent.parent() && parent.parent().parent() && parent.parent().parent().hasClass("ui-popout")) {
    parent = parent.parent().parent();
    if (!parent.css("width")) {
      parent.css("width", "300px");
      parent.css("height", "");
    }
    parent.resizable();
  }

  return div;
});
