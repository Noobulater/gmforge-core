sync.render('customApp', function(obj, app, scope) {
  //apps are powered by JQuery
  scope = scope || {viewOnly : app.attr('viewOnly') == 'true'};

  var div = $('<div>');
  div.addClass("flexcolumn fit-xy");

  var button = $("<button>").appendTo(div);
  button.append(obj.data);
  button.click(function(){
    obj.data = obj.data || 0;
    obj.data++;
    obj.update();
  });

  return div;
});

sync.render("ui_hotApps", function(obj, app, scope) {
  scope = scope || {vertical : (app.attr("vertical") == "true")};
  var div = $("<div>");
  if (!obj) {
    app.attr("vertical", scope.vertical);
    game.locals["hotApps"] = game.locals["hotApps"] || sync.obj();
    game.locals["hotApps"].data = game.locals["hotApps"].data || {apps : JSON.parse(getCookie("hot-apps") || '[]')};
    for (var key in game.locals["hotApps"].data.apps) {
      game.locals["hotApps"].data.apps[key].id = null;
    }
    game.locals["hotApps"].addApp(app);
    return div;
  }
  var optionsBar = $("<div>").appendTo(div);
  optionsBar.addClass("flexmiddle alttext");

  var vertical = scope.vertical;
  if (vertical) {
    optionsBar.addClass("flexcolumn");
    optionsBar.removeClass("alttext");
  }
  var hotApps = obj.data.apps;
  for (var i in hotApps) {
    var appName = hotApps[i];
    appName.icon = appName.icon || "unchecked";
    if (appName && appName.icon) {
      if (appName.ui) {
        var hotApp;
        if (!(vertical) && (obj.data.advanced || hotApps.length > 1)) {
          hotApp = genIcon(appName.icon).appendTo(optionsBar);
        }
        else {
          hotApp = genIcon(appName.icon, appName.name, vertical).appendTo(optionsBar);
        }
        console.log(vertical);
        hotApp.addClass("lrpadding");
        if (!vertical) {
          hotApp.addClass("alttext");
          hotApp.css("font-size", "2.0em");
        }
        hotApp.attr("title", appName.name);
        hotApp.attr("ui", appName.ui);
        hotApp.attr("key", i);
        hotApp.css("position", "relative");

        var remove = genIcon("remove").appendTo(hotApp);
        remove.addClass("hover3 smooth");
        remove.addClass("destroy");
        remove.attr("key", i);
        if (!vertical) {
          remove.css("font-size", "0.5em");
          remove.css("position", "absolute");
          remove.css("bottom", "0");
          remove.css("right", "0");
        }
        remove.click(function(ev){
          var app = obj.data.apps[$(this).attr("key")].id;
          $("#"+app).remove();
          obj.data.apps.splice($(this).attr("key"), 1);
          obj.update();
          ev.stopPropagation();
          ev.preventDefault();
          var copy = duplicate(obj.data.apps);
          for (var k in copy) {
            if (copy[k].id) {
              copy[k].id = null;
            }
          }
          setCookie("hot-apps", JSON.stringify(copy), 10000000);
          return false;
        });

        hotApp.click(function(ev) {
          var targ = $("#"+obj.data.apps[$(this).attr("key")].id);
          if (!targ.length) {
            function wrap(ui, key, target) {
              var appData = obj.data.apps[key];
              var newApp = sync.newApp(ui, null, {});
              newApp.addClass("white");
              var newAppID = newApp.attr("id");

              var style = {"min-width" : "100px", "min-height" : "30px"};
              if (appData.w) {
                style["width"] = appData.w+"%";
              }
              if (appData.h) {
                style["height"] = appData.h+"%";
              }
              var p = ui_popOut({
                target : target,
                id : "pop-"+(newAppID),
                align : "top",
                title : appData.name,
                dragThickness : "0.5em",
                minimize : true,
                maximize : true,
                moved : function(ev, ui) {
                  appData.x = Math.max(Math.floor(ui.offset().left/$(window).outerWidth()*100), 0);
                  appData.y = Math.max(Math.floor(ui.offset().top/$(window).outerHeight()*100), 0);
                  var copy = duplicate(obj.data.apps);
                  for (var k in copy) {
                    if (copy[k].id) {
                      copy[k].id = null;
                    }
                  }
                  setCookie("hot-apps", JSON.stringify(copy), 10000000);
                },
                close : function(ev, ui) {
                  $("#pop-"+newAppID).hide();
                  return false;
                },
                style : style
              }, newApp);
              if (appData.x) {
                p.css("left", appData.x+"%");
              }
              if (appData.y) {
                p.css("top", appData.y+"%");
              }
              p.resizable({
                stop : function(ev, ui){
                  appData.w = Math.floor(p.outerWidth()/$(window).outerWidth()*100);
                  appData.h = Math.floor(p.outerHeight()/$(window).outerHeight()*100);
                  var copy = duplicate(obj.data.apps);
                  for (var k in copy) {
                    if (copy[k].id) {
                      copy[k].id = null;
                    }
                  }
                  setCookie("hot-apps", JSON.stringify(copy), 10000000);
                }
              });
              p.show();
              var max = util.getMaxZ(".ui-popout");
              p.css("z-index", max+1);
              obj.data.apps[key].id = "pop-"+newApp.attr("id");
            }
            wrap($(this).attr("ui"), $(this).attr("key"), $(this));
            ev.preventDefault();
            ev.stopPropagation();
          }
          else {
            if (targ.is(":visible")) {
              targ.hide();
            }
            else {
              targ.show();
              var max = util.getMaxZ(".ui-popout");
              targ.css("z-index", max+1);
            }
          }
        });
      }
      else if (app.layout) {
        if (getCookie(app.layout) && getCookie(app.layout) != "") {
          var hotLayout = genIcon(appName.icon).appendTo(optionsBar);
          hotApp.attr("title", app.layout);
          hotApp.css("padding", "4px");
        }
      }
    }
    else if (!appName.icon) {
      hotApps.splice(i, 1);
      obj.update();
      break;
    }
  }

  var add = genIcon("flash", (vertical!=null)?("Add New Mod"):(""), vertical).appendTo(optionsBar);
  add.addClass("create lrmargin");
  add.attr("title", "Manage Mods and Extensions");
  if (!vertical) {
    add.css("font-size", "2.0em");
  }
  add.click(function(){
    if ($("#add-hot-app").length && !app.attr("shouldOpen")) {
      layout.coverlay("add-hot-app", 500);
      return;
    }
    var content = $("<div>");
    var icons = util.hotIcons
    if (obj.data.advanced) {
      content.addClass("flexcolumn");
      content.append("<b class='fit-x flexmiddle'><u>Apps</u></b>");
      var buildList = [];
      //options
      var appCategorys = {};

      var catWrap = $("<div>").appendTo(content);
      catWrap.addClass("flexrow");

      for (var cat in game.components) {
        var category = $("<div>").appendTo(catWrap);
        category.addClass("flexcolumn outline lrpadding");
        category.append("<b class='outlinebottom'>"+cat+"</b>");
        for (var index in game.components[cat]) {
          if (index == "_ui") {
            var dat = game.components[cat][index];
            for (var ind in dat) {
              var link = genIcon(icons[dat[ind].ui], dat[ind].name).appendTo(category);
              link.addClass("subtitle");
              link.attr("ui", dat[ind].ui);
              link.attr("title", dat[ind].basic);
              link.attr("icon", icons[dat[ind].ui]);
              link.attr("name", dat[ind].name);
              link.click(function(){
                var appData = {icon : $(this).attr("icon"), ui : $(this).attr("ui")};
                ui_prompt({
                  target : $(this),
                  id : "add-hot-app-name",
                  inputs : {
                    "App Name" : $(this).attr("name")
                  },
                  click : function(ev, inputs) {
                    appData.name = inputs["App Name"].val();
                    appData.w = 30;
                    appData.h = 50;
                    obj.data.apps.push(appData);
                    obj.update();
                    var copy = duplicate(obj.data.apps);
                    for (var k in copy) {
                      if (copy[k].id) {
                        copy[k].id = null;
                      }
                    }
                    setCookie("hot-apps", JSON.stringify(copy), 10000000);
                  }
                });

                layout.coverlay("add-hot-app");
              });
            }
          }
        }
      }
    }
    else {
      content.css("width", "400px");
      content.css("height", "90vh");

      content.addClass("flexcolumn flex");

      var modDiv = $("<div>").appendTo(content);
      modDiv.addClass("flexrow fit-x background");

      var installMods = $("<button>").appendTo(modDiv);
      installMods.addClass("flex background alttext");
      installMods.append("Verified Mods");
      installMods.click(function(){
        modDiv.children().removeClass("highlight").addClass("background");
        $(this).removeClass("background");
        $(this).addClass("highlight");
        modContent.empty();
        app.removeAttr("tab");

        for (var cat in game.components) {
          for (var index in game.components[cat]) {
            var dat = game.components[cat][index];
            for (var ind in dat) {
              if (dat[ind].basic) {
                var category = $("<div>").appendTo(modContent);
                category.addClass("flexcolumn lightoutline hover2 flex");
                category.css("padding-left", "1em");
                category.css("padding-right", "1em");
                category.css("position", "relative");
                category.attr("ui", dat[ind].ui);
                category.attr("title", "Creates app as a popup");
                category.attr("icon", icons[dat[ind].ui]);
                category.attr("name", dat[ind].name);
                category.attr("width", dat[ind].w);
                category.attr("height", dat[ind].h);
                category.click(function(ev){
                  var content = sync.newApp($(this).attr("ui"), null, {});

                  var popOut = ui_popOut({
                    target : $(this),
                    title : $(this).attr("name"),
                    minimize : true,
                    maximize : true,
                    dragThickness : "0.5em",
                    style : {"width" : ($(this).attr("width") || 30)+"vw", "height" : ($(this).attr("height") || 50)+"vh"}
                  }, content);
                  popOut.resizable();
                  popOut.addClass("floating-app");
                });

                var link = genIcon(icons[dat[ind].ui], dat[ind].name + "").appendTo(category);
                link.addClass("outlinebottom");
                link.css("font-size", "2.0em");

                var desc = $("<p>").appendTo(category);
                desc.addClass("padding");
                desc.css("min-height", "50px");
                desc.text(dat[ind].basic);

                var hotApp = genIcon("heart").appendTo(category);
                hotApp.addClass("lrmargin bold");
                hotApp.css("font-size", "2.0em");
                hotApp.css("position", "absolute");
                hotApp.css("top", "0");
                hotApp.css("right", "0");
                hotApp.attr("ui", dat[ind].ui);
                hotApp.attr("title", "Add app to hotbar");
                hotApp.attr("icon", icons[dat[ind].ui]);
                hotApp.attr("name", dat[ind].name);
                hotApp.attr("width", dat[ind].w);
                hotApp.attr("height", dat[ind].h);
                hotApp.click(function(ev){
                  var appData = {icon : $(this).attr("icon"), ui : $(this).attr("ui")};
                  appData.name = $(this).attr("name");
                  appData.w = $(this).attr("width") || 30;
                  appData.h = $(this).attr("height") || 50;
                  obj.data.apps.push(appData);
                  obj.update();
                  var copy = duplicate(obj.data.apps);
                  for (var k in copy) {
                    if (copy[k].id) {
                      copy[k].id = null;
                    }
                  }
                  setCookie("hot-apps", JSON.stringify(copy), 10000000);

                  layout.coverlay("add-hot-app");
                  ev.stopPropagation();
                });

                var author = $("<i>").appendTo(category);
                author.addClass("subtitle lrpadding");
                author.css("position", "absolute");
                author.css("bottom", "0");
                author.css("right", "0");
                author.append("Author : <b>" + (dat[ind].author || "GM Forge") + "</b>");
              }
            }
          }
        }
      });

      var customMods = $("<button>").appendTo(modDiv);
      customMods.addClass("flex background alttext");
      customMods.append("Custom Mods");
      customMods.click(function(){
        modDiv.children().removeClass("highlight").addClass("background");
        $(this).removeClass("background");
        $(this).addClass("highlight");
        modContent.empty();
        app.attr("tab", "mods");

        if (app.attr("accepted") == "true") {
          $("<div class='spadding'></div>").appendTo(modContent);

          var button = $("<button>").appendTo(modContent);
          button.addClass("fit-x lpadding flexmiddle alttext background");
          button.append("Load External Script");
          button.click(function(){
            var imgList = sync.render("ui_filePicker")(obj, app, {
              filter : "js",
              change : function(ev, ui, value){
                sendAlert({text : "Loading Script " + value});

                $.ajax({
                  url: value,
                  error : function (data) {
                    console.log(data);
                  },
                  dataType : "text",
                  success: function (data){
                    try {
                      eval(data);
                      sendAlert({text : "App Updated"});
                    }
                    catch (err) {
                      sendAlert({text : "Console Error " + err});
                    }
                  }
                });
                layout.coverlay("template-picker");
              }
            });

            var pop = ui_popOut({
              target : $(this),
              prompt : true,
              id : "template-picker",
              align : "top",
              style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
            }, imgList);
            pop.resizable();
          });
          $("<div class='spadding'></div>").appendTo(modContent);

          var button = $("<button>").appendTo(modContent);
          button.addClass("fit-x lpadding flexmiddle alttext highlight");
          button.append("Write Custom Script");
          button.click(function(){
            modContent.empty();

            var modWraper = $("<div>").appendTo(modContent);
            modWraper.addClass("fit-x padding");

            var textArea = $("<textarea>").appendTo(modWraper);
            textArea.addClass("subtitle fit-x");
            textArea.css("min-height", "50vh");
            obj.data.modStr = obj.data.modStr || String('sync.render("customApp", function(obj, app, scope){\n  //apps are powered by JQuery\n  scope = scope || {viewOnly : app.attr("true") == "true"};\n\n  var div = $("<div>");\n  div.addClass("flexcolumn fit-xy");\n\n  var button = $("<button>").appendTo(div);\n  button.append(obj.data);\n  button.click(function(){\n    obj.data = obj.data || 0;\n    obj.data++;\n    obj.update();\n  });\n\n  return div;\n});')

            modWraper.append("<b>App Preview</b>");

            var tempObj = sync.obj();
            tempObj.data = 0;

            var temp = sync.newApp("customApp").appendTo(modWraper);
            tempObj.addApp(temp);

            textArea.val(obj.data.modStr);
            textArea.change(function(){
              obj.data.modStr = $(this).val();
              try {
                eval($(this).val());
                sendAlert({text : "App Updated"});
              }
              catch (err) {
                sendAlert({text : "Console Error " + err});
              }

              tempObj.update();
            });
          });
        }
        else {
          var warning = $("<highlight>").appendTo(modContent);
          warning.addClass("flexmiddle");
          warning.text("Disclaimer!");

          var warning = $("<p>").appendTo(modContent);
          warning.addClass("lpadding");
          warning.text("Scripts loaded and created in this menu could potentially be harmful for your game, your players and in rare cases your computer! By continuing you acknowledge and accept responsiblity for the scripts you import and write and accept any responsibilities that come because of it.");

          var acceptWrap = $("<div>").appendTo(modContent);
          acceptWrap.addClass("flexmiddle fit-x subtitle");

          var check = genInput({
            classes : "margin",
            parent : acceptWrap,
            type : "checkbox",
            style : {"margin-top" : "0px"}
          });
          check.change(function(){
            accept.show();
            check.attr("disabled", true);
          });

          acceptWrap.append("<b class='margin'>I understand, and accept responsibility for scripts I make/import</b>");

          var accept = $("<button>").appendTo(modContent);
          accept.addClass("fit-x lpadding flexmiddle alttext highlight");
          accept.append("Proceed");
          accept.click(function(){
            app.attr("accepted", "true");
            app.attr("shouldOpen", "true");
            obj.update();
          });
          accept.hide();
        }
        //app.attr("accepted", true);
      });

      var modWrap = $("<div>").appendTo(content);
      modWrap.addClass("flexcolumn flex");
      modWrap.css("overflow", "auto");
      modWrap.css("position", "relative");

      var modContent = $("<div>").appendTo(modWrap);
      modContent.addClass("fit-x");
      modContent.css("position", "absolute");

      if (app.attr("tab") == "mods") {
        customMods.click();
      }
      else {
        installMods.click();
      }
    }

    var category = $("<div>").appendTo(content);
    category.addClass("flexcolumn flexmiddle lightoutline");
    category.css("width", "100%");
    category.css("padding-left", "1em");
    category.css("padding-right", "1em");

    if (!vertical) {
      var advanced;
      if (!obj.data.advanced) {
        advanced = genIcon("cog", "Show app catalog").appendTo(category);
      }
      else {
        advanced = genIcon("user", "Take me back to the basics!").appendTo(category);
      }
      advanced.click(function(){
        obj.data.advanced = !obj.data.advanced;
        app.attr("shouldOpen", true);
        obj.update();
      });
    }
    var target = $(this);
    if (app.attr("shouldOpen")) {
      target = app;
    }
    var popout = ui_popOut({
      target : target,
      title : "Mods and Extensions",
      id : "add-hot-app",
      align : "top"
    }, content);
    popout.resizable();
  });
  if (app.attr("shouldOpen")) {
    add.click();
    app.removeAttr("shouldOpen");
  }

  return div;
});
